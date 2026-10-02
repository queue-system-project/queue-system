from app.business_time import business_date, day_bounds, local_boundary
"""Oferty szereguje ta sama blokada usługi co zwykłe operacje kolejki."""
from datetime import datetime, timedelta
from sqlalchemy import select, exists
from app.models.offers import OfferWindow, QueueOffer
from app.models.queue import QueueEntry, queue_order
from app.models.visit import Visit
from app.models.employees import Employee, EmployeeService
from app.models.settings import SystemSettings
from app.models.users import User
from app.models.catalog import Service
from app.realtime import changed


async def settings_for(db, service):
    return await db.scalar(select(SystemSettings).where(SystemSettings.institution_id == service.institution_id))


def response_minutes(settings):
    return max(1, settings.client_response_minutes if settings and settings.client_response_minutes is not None else 2)


async def idle_employee(db, service, now, lock=False):
    from app.calendar import load_calendar
    calendar = await load_calendar(db, service.institution_id)
    query = select(Employee).where(Employee.institution_id == service.institution_id,
        Employee.employee_status == "active", exists(select(EmployeeService.id).where(
            EmployeeService.employee_id == Employee.id, EmployeeService.service_id == service.id)),
    ).order_by(Employee.id)
    if lock:
        query = query.with_for_update()
    for employee in (await db.scalars(query)).all():
        if not calendar.fits(now, now + timedelta(minutes=max(1, service.standard_duration or 15)), employee.id):
            continue
        busy = await db.scalar(select(Visit.id).where(Visit.employee_id == employee.id,
                                                     Visit.status == "in_service").limit(1))
        reserved = await db.scalar(select(QueueEntry.id).where(
            QueueEntry.employee_id == employee.id,
            QueueEntry.queue_date == business_date(now),
            QueueEntry.status.in_(("confirmed", "in_service"))).limit(1))
        if not busy and not reserved:
            return employee
    return None


async def signal_window(db, window):
    clients = (await db.scalars(select(QueueEntry.client_id).where(
        QueueEntry.service_id == window.service_id,
        QueueEntry.status.in_(("waiting", "confirmed", "in_service"))))).all()
    changed(db, f"service:{window.service_id}", *(f"user:{user}" for user in clients))


async def advance(db, service, now=None):
    from app.notifications import create_notification
    now = now or datetime.utcnow()
    window = await db.scalar(select(OfferWindow).where(
        OfferWindow.service_id == service.id, OfferWindow.status == "active"))
    if window is None:
        return
    settings = await settings_for(db, service)
    if not service.is_active or await idle_employee(db, service, now) is None:
        window.status = "expired"
    if window.expires_at <= now or business_date(window.created_at) != business_date(now):
        window.status = "expired"
    pending = await db.scalar(select(QueueOffer).where(
        QueueOffer.window_id == window.id, QueueOffer.status == "pending"))
    if pending:
        entry = await db.get(QueueEntry, pending.queue_entry_id)
        if (window.status != "active" or pending.expires_at <= now or entry.status != "waiting"
                or (entry.confirmation_expires_at and entry.confirmation_expires_at <= now)):
            pending.status = "expired"
        else:
            return
    if window.status != "active" or window.phase == "last_minute":
        await signal_window(db, window)
        return
    attempted = select(QueueOffer.queue_entry_id).where(QueueOffer.window_id == window.id)
    candidates = (await db.scalars(select(QueueEntry).join(User, User.id == QueueEntry.client_id).where(
        QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "waiting",
        User.role == "client", User.is_active.is_(True),
        QueueEntry.id.not_in(attempted),
    ).order_by(*queue_order()))).all()
    entry = next((row for row in candidates if row.confirmation_expires_at is None
                  or row.confirmation_expires_at > now), None)
    if entry:
        deadline = min(window.expires_at, now + timedelta(minutes=response_minutes(settings)))
        if entry.confirmation_expires_at:
            deadline = min(deadline, entry.confirmation_expires_at)
        offer = QueueOffer(window_id=window.id, queue_entry_id=entry.id, expires_at=deadline)
        db.add(offer)
        await db.flush()
        user = await db.get(User, entry.client_id)
        title = "Oferta pilna" if user.language == "pl" else "Earlier appointment available"
        await create_notification(db, user.id, title, title, f"urgent:{offer.id}")
    else:
        window.phase = "last_minute"
        window.expires_at = now + timedelta(minutes=response_minutes(settings))
        # Powiadamiaj tylko klientów tej usługi, nigdy wszystkich użytkowników systemu.
        recipients = (await db.scalars(select(QueueEntry.client_id).where(
            QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "waiting").distinct())).all()
        for user_id in recipients:
            user = await db.get(User, user_id)
            title = "Okno last minute" if user.language == "pl" else "Last-minute appointment available"
            await create_notification(db, user_id, title, title, f"last-minute:{window.id}:{user_id}")
    await signal_window(db, window)


async def open_for_transition(db, entry, now=None):
    from app.models.catalog import Service
    now = now or datetime.utcnow()
    if entry.queue_date != business_date(now) or entry.status not in ("done", "cancelled", "skipped", "missed"):
        return
    service = await db.get(Service, entry.service_id)
    from app.day_closure import is_closed
    if await is_closed(db, service.institution_id, now):
        return
    if not service.is_active:
        return
    if entry.status == "done":
        visit = await db.scalar(select(Visit).where(Visit.queue_entry_id == entry.id))
        if not visit or visit.actual_duration is None or visit.actual_duration >= (visit.standard_duration or 0):
            return
    if await db.scalar(select(OfferWindow.id).where(
        OfferWindow.service_id == service.id, OfferWindow.status == "active")):
        return
    event = f"{entry.id}:{entry.status}"
    if await db.scalar(select(OfferWindow.id).where(OfferWindow.source_event == event)):
        return
    if await idle_employee(db, service, now) is None:
        return
    # Nie wstawiaj wcześniejszej wizyty kolidującej z obiecanym czasem przybycia.
    confirmed = await db.scalar(select(QueueEntry.id).where(
        QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "confirmed",
        QueueEntry.arrival_time < now + timedelta(minutes=max(1, service.standard_duration or 15)),
    ).limit(1))
    if confirmed:
        return
    candidates = (await db.scalars(select(QueueEntry.id).where(
        QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "waiting"))).all()
    settings = await settings_for(db, service)
    window = OfferWindow(service_id=service.id, source_entry_id=entry.id, source_event=event,
        created_at=now, expires_at=now + timedelta(minutes=response_minutes(settings) * (len(candidates) + 1)))
    db.add(window)
    await db.flush()
    await advance(db, service, now)


async def visible_offers(db, user_id=None, service_id=None):
    now = datetime.utcnow()
    query = select(QueueOffer, QueueEntry, Service, SystemSettings).join(
        QueueEntry, QueueEntry.id == QueueOffer.queue_entry_id).join(
        OfferWindow, OfferWindow.id == QueueOffer.window_id).join(
        Service, Service.id == QueueEntry.service_id).outerjoin(
        SystemSettings, SystemSettings.institution_id == Service.institution_id).where(
        QueueOffer.status == "pending", QueueOffer.expires_at > now, OfferWindow.status == "active",
        Service.is_active.is_(True), QueueEntry.queue_date == business_date(now), QueueEntry.status == "waiting")
    query = query.where(QueueEntry.client_id == user_id) if user_id else query.where(QueueEntry.service_id == service_id)
    urgent = []
    for offer, entry, service, settings in (await db.execute(query)).all():
        options = [0] + [minutes for minutes in (5, 10, 15) if settings is None
                        or getattr(settings, f"urgent_offer_{minutes}_enabled") is not False]
        urgent.append({"id": offer.id, "window_id": offer.window_id, "queue_entry_id": entry.id,
                       "service_id": entry.service_id, "options": options,
                       "expires_at": offer.expires_at.isoformat()+"Z"})
    windows = select(OfferWindow).join(Service, Service.id == OfferWindow.service_id).where(
        Service.is_active.is_(True), OfferWindow.status == "active",
        OfferWindow.phase == "last_minute", OfferWindow.expires_at > now,
        OfferWindow.created_at >= day_bounds(business_date(now))[0])
    if service_id:
        windows = windows.where(OfferWindow.service_id == service_id)
    elif user_id:
        windows = windows.where(OfferWindow.service_id.in_(select(QueueEntry.service_id).where(
            QueueEntry.client_id == user_id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "waiting")))
    last = [{"id": row.id, "service_id": row.service_id, "expires_at": row.expires_at.isoformat()+"Z"}
            for row in (await db.scalars(windows)).all()]
    return {"urgent": urgent, "last_minute": last}
