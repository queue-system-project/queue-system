from app.business_time import business_date, day_bounds, local_boundary
"""Szacunki UTC i trwałe terminy; każdy zapis wymaga blokady wiersza usługi."""
from datetime import datetime, timedelta, time
from math import ceil

from sqlalchemy import select

from app.models.queue import QueueEntry, queue_order
from app.models.visit import Visit
from app.models.employees import Employee, EmployeeService
from app.models.settings import SystemSettings
from app.models.users import User
from app.realtime import changed

ACTIVE = ("waiting", "confirmed", "in_service")


async def recalculate(db, service, now=None):
    now = now or datetime.utcnow()
    await db.flush()
    entries = list((await db.scalars(select(QueueEntry).where(
        QueueEntry.service_id == service.id, QueueEntry.status.in_(ACTIVE),
    ).order_by(QueueEntry.queue_date, *queue_order()))).all())
    employee_ids = list((await db.scalars(select(Employee.id).join(
        EmployeeService, EmployeeService.employee_id == Employee.id,
    ).where(EmployeeService.service_id == service.id,
            Employee.institution_id == service.institution_id,
            Employee.employee_status == "active").distinct())).all())
    available = {employee_id: now for employee_id in employee_ids}
    # Uwzględnij inne usługi: pracownik nie może obsługiwać dwóch klientów naraz.
    visits = list((await db.scalars(select(Visit).where(
        Visit.employee_id.in_(employee_ids), Visit.status == "in_service",
    ))).all()) if employee_ids else []
    for visit in visits:
        duration = max(1, visit.standard_duration or service.standard_duration or 15)
        finish = (visit.actual_start or now) + timedelta(minutes=duration)
        # Przedłużająca się wizyta nadal zajmuje pracownika. Nie obiecuj natychmiastowego startu.
        available[visit.employee_id] = max(available[visit.employee_id], finish,
            now + timedelta(minutes=1))
    duration = max(1, service.standard_duration or 15)
    from app.calendar import load_calendar
    calendar = await load_calendar(db, service.institution_id)
    current_day, position = None, 0
    today_available = available.copy()
    for entry in entries:
        if entry.queue_date != current_day:
            current_day, position = entry.queue_date, 0
            available = today_available.copy() if current_day <= business_date(now) else {
                employee_id: day_bounds(current_day)[0] for employee_id in employee_ids}
        position += 1
        old = (entry.queue_position, entry.estimated_wait_time, entry.delay_time, entry.estimated_start_at)
        entry.queue_position = position
        if entry.status == "in_service":
            entry.estimated_wait_time = 0
            current = next((visit for visit in visits if visit.queue_entry_id == entry.id), None)
            if current and current.actual_start:
                entry.estimated_start_at = current.actual_start
                if entry.initial_estimated_start_at:
                    entry.delay_time = int((current.actual_start - entry.initial_estimated_start_at).total_seconds() / 60)
        else:
            eligible = [entry.employee_id] if entry.employee_id in available else (
                list(available) if entry.employee_id is None else [])
            # Przyjęta oferta pilna może przyspieszyć pierwotny termin tego samego dnia.
            planned = entry.scheduled_at if entry.priority_at is None else None
            candidates = {key: calendar.earliest(entry.queue_date,
                max(available[key], entry.arrival_time or now, planned or now, now),
                timedelta(minutes=duration), key) for key in eligible}
            candidates = {key: value for key, value in candidates.items() if value is not None}
            if candidates and service.is_active:
                chosen = min(candidates, key=lambda key: (candidates[key], str(key)))
                start = candidates[chosen]
                entry.estimated_start_at = start
                if entry.initial_estimated_start_at is None:
                    entry.initial_estimated_start_at = start
                entry.estimated_wait_time = max(0, ceil((start - now).total_seconds() / 60))
                entry.delay_time = int((start - entry.initial_estimated_start_at).total_seconds() / 60)
                available[chosen] = start + timedelta(minutes=duration)
            else:
                entry.estimated_start_at = None
                entry.estimated_wait_time = None
                entry.delay_time = None
        entry.eta_updated_at = now
        if old != (entry.queue_position, entry.estimated_wait_time, entry.delay_time, entry.estimated_start_at):
            changed(db, f"service:{service.id}", f"user:{entry.client_id}")
    await db.flush()
    return entries


async def process_service(db, service, now=None):
    """Najpierw wygaszaj, potem przeliczaj i proś o potwierdzenie tylko raz dla wpisu."""
    from app.notifications import create_notification, queue_changed
    now = now or datetime.utcnow()
    from app.day_closure import is_closed
    if await is_closed(db, service.institution_id, now):
        return
    settings = await db.scalar(select(SystemSettings).where(
        SystemSettings.institution_id == service.institution_id))
    threshold = max(0, settings.confirmation_time_minutes if settings and
                    settings.confirmation_time_minutes is not None else 20)
    response_minutes = max(1, settings.client_response_minutes if settings and
                           settings.client_response_minutes is not None else 2)
    expired = list((await db.scalars(select(QueueEntry).where(
        QueueEntry.service_id == service.id, QueueEntry.status == "waiting",
        QueueEntry.queue_date == business_date(now),
        QueueEntry.confirmation_expires_at <= now,
    ).order_by(QueueEntry.id).with_for_update())).all())
    for entry in expired:
        entry.status = "skipped"
        entry.queue_position = None
        await queue_changed(db, entry, update_eta=False)
    entries = await recalculate(db, service, now)
    if not service.is_active:
        import os
        if os.getenv("QUEUE_OFFERS_ENABLED") == "1":
            from app.queue_offers import advance
            await advance(db, service, now)
        return
    for entry in entries:
        if (entry.queue_date != business_date(now) or entry.status != "waiting" or entry.confirmation_sent_at is not None
                or entry.estimated_wait_time is None or entry.estimated_wait_time > threshold):
            continue
        entry.confirmation_sent_at = now
        entry.confirmation_expires_at = now + timedelta(minutes=response_minutes)
        user = await db.get(User, entry.client_id)
        polish = user.language == "pl"
        title = "Potwierdź przybycie" if polish else "Confirm your arrival"
        message = (f"Potwierdź przybycie w ciągu {response_minutes} min." if polish
                   else f"Confirm your arrival within {response_minutes} minutes.")
        await create_notification(db, entry.client_id, title, message,
                                  f"confirmation:{entry.id}")
        changed(db, f"service:{service.id}", f"user:{entry.client_id}")
    import os
    if os.getenv("QUEUE_OFFERS_ENABLED") == "1":
        from app.queue_offers import advance
        await advance(db, service, now)
