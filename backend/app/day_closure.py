"""Zamknięcie dnia Europe/Warsaw bez kończenia trwających wizyt."""
from app.business_time import business_date, day_bounds, local_boundary
from datetime import datetime, time, timedelta
from fastapi import HTTPException
from sqlalchemy import select
from app.models.day_closure import DayClosure
from app.models.catalog import Institution, Service
from app.models.queue import QueueEntry
from app.models.slots import ServiceSlot
from app.models.offers import OfferWindow, QueueOffer
from app.notifications import queue_changed
from app.queue_offers import signal_window
from app.reports import refresh_daily_report


async def is_closed(db, institution_id, now=None):
    now = now or datetime.utcnow()
    return await db.get(DayClosure, (institution_id, business_date(now))) is not None


async def require_open(db, service, now=None):
    now = now or datetime.utcnow()
    if await is_closed(db, service.institution_id, now):
        raise HTTPException(409, "Institution is closed for this day")
    from app.calendar import require_interval
    await require_interval(db, service, now, now + timedelta(microseconds=1))


async def close_day(db, institution_id, user_id, now=None, day=None):
    now = now or datetime.utcnow()
    day = day or business_date(now)
    # Ten sam początek kolejności blokad co w lock_service zapobiega zapisowi
    # nowego klienta między anulowaniem kolejki a utrwaleniem zamknięcia.
    institution = await db.scalar(select(Institution).where(
        Institution.id == institution_id).with_for_update())
    if institution is None:
        raise HTTPException(404, "Institution not found")
    previous = await db.get(DayClosure, (institution_id, day))
    if previous is not None:
        return previous
    services = list((await db.scalars(select(Service).where(
        Service.institution_id == institution_id).order_by(Service.id).with_for_update())).all())
    closure = DayClosure(institution_id=institution_id, day=day, closed_at=now,
                         closed_by=user_id, cancelled_count=0)
    db.add(closure)
    await db.flush()
    tomorrow = day_bounds(day)[1]
    for service in services:
        # Rezerwacje przyszłych dni pozostają bez zmian; rozpoczęte wizyty także.
        entries = list((await db.scalars(select(QueueEntry).outerjoin(
            ServiceSlot, ServiceSlot.id == QueueEntry.slot_id).where(
                QueueEntry.service_id == service.id,
                QueueEntry.status.in_(("waiting", "confirmed")),
                ((QueueEntry.slot_id.is_(None) & (QueueEntry.created_at < tomorrow)) |
                 (ServiceSlot.slot_start < tomorrow)),
            ).order_by(QueueEntry.id).with_for_update(of=QueueEntry))).all())
        for entry in entries:
            entry.status = "cancelled"
            entry.cancellation_reason = "institution_closed"
            entry.queue_position = None
            await queue_changed(db, entry, update_eta=False)
        closure.cancelled_count += len(entries)
        windows = list((await db.scalars(select(OfferWindow).where(
            OfferWindow.service_id == service.id, OfferWindow.status == "active",
            OfferWindow.created_at < tomorrow))).all())
        for window in windows:
            window.status = "expired"
            for offer in (await db.scalars(select(QueueOffer).where(
                    QueueOffer.window_id == window.id, QueueOffer.status == "pending"))).all():
                offer.status = "expired"
            await signal_window(db, window)
        # Nie przeliczamy przyszłych rezerwacji przy zamykaniu bieżącego dnia.
    await db.flush()
    await refresh_daily_report(db, institution_id, day, now)
    return closure
