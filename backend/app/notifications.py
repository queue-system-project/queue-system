"""Zapis powiadomienia i stanu kolejki w tej samej transakcji."""
from sqlalchemy import select

from app.models.notifications import Notification
from app.models.push import PushJob
from app.models.queue import QueueEntry
from app.models.users import User
from app.realtime import changed


def as_dict(row):
    return {
        "id": row.id, "user_id": row.user_id, "title": row.title,
        "message": row.message, "is_read": row.is_read,
        "created_at": row.created_at.isoformat() + "Z" if row.created_at else None,
    }


async def notification_list(db, user_id, limit=50, offset=0, is_read=None):
    query = select(Notification).where(Notification.user_id == user_id)
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    query = query.order_by(
        Notification.created_at.desc().nullslast(), Notification.id.desc()
    ).limit(limit).offset(offset)
    return [as_dict(row) for row in (await db.scalars(query)).all()]


async def create_notification(db, user_id, title, message, event_key=None):
    row = Notification(
        user_id=user_id, title=title, message=message, event_key=event_key,
    )
    db.add(row)
    await db.flush()
    db.add(PushJob(notification_id=row.id))
    changed(db, f"user:{user_id}")
    return row


MESSAGES = {
    "waiting": ("Jesteś w kolejce", "You are in the queue"),
    "confirmed": ("Wizyta potwierdzona", "Visit confirmed"),
    "in_service": ("Rozpoczęto wizytę", "Visit started"),
    "done": ("Wizyta zakończona", "Visit completed"),
    "cancelled": ("Wizyta anulowana", "Visit cancelled"),
    "skipped": ("Wizyta pominięta", "Visit skipped"),
    "missed": ("Nieobecność na wizycie", "Appointment missed"),
}


async def queue_changed(db, entry, update_eta=True):
    """Wywołuj raz na rzeczywistą zmianę stanu, przy utrzymanej blokadzie usługi.

    Istniejące procedury szeregują zmiany dla usługi, także ten zapis.
    Stały klucz zdarzenia chroni też przed przypadkowym ponowieniem wywołania.
    """
    event_key = f"queue:{entry.id}:{entry.status}"
    exists = await db.scalar(select(Notification.id).where(
        Notification.event_key == event_key,
    ))
    if exists is None:
        user = await db.get(User, entry.client_id)
        titles = MESSAGES[entry.status]
        title = titles[0 if user.language == "pl" else 1]
        if entry.status == "cancelled" and entry.cancellation_reason == "institution_closed":
            title = ("Wizyta anulowana z powodu zamknięcia instytucji" if user.language == "pl"
                     else "Visit cancelled because the institution has closed")
        await create_notification(db, entry.client_id, title, title, event_key)
    # Powiadom także pozostałych klientów: ich pozycja mogła się zmienić.
    clients = (await db.scalars(select(QueueEntry.client_id).where(
        QueueEntry.service_id == entry.service_id,
        QueueEntry.status.in_(("waiting", "confirmed", "in_service")),
    ))).all()
    changed(db, f"service:{entry.service_id}", f"user:{entry.client_id}",
            *(f"user:{client_id}" for client_id in clients))
    if entry.status not in ("waiting", "confirmed", "in_service"):
        entry.estimated_wait_time = None
        entry.estimated_start_at = None
    if update_eta:
        from app.models.catalog import Service
        from app.queue_timing import recalculate
        await recalculate(db, await db.get(Service, entry.service_id))
    import os
    if os.getenv("QUEUE_OFFERS_ENABLED") == "1":
        from app.queue_offers import open_for_transition
        await open_for_transition(db, entry)
