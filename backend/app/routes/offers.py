from app.business_time import business_date, day_bounds, local_boundary
from datetime import datetime, timedelta
from typing import Literal
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from app.routes.users import get_db
from app.routes.queue import lock_service, get_locked_entry
from app.models.offers import OfferWindow, QueueOffer
from app.models.queue import QueueEntry
from app.security import get_current_user
from app.schemas.queue import QueueResponse
from app.notifications import queue_changed
from app.queue_offers import advance, idle_employee, settings_for, visible_offers, signal_window

router = APIRouter(prefix="/api/offers", tags=["Queue offers"])


class OfferResponse(BaseModel):
    accept: bool
    minutes: Literal[0, 5, 10, 15] = 0


async def locked_window(db, window_id):
    service_id = await db.scalar(select(OfferWindow.service_id).where(OfferWindow.id == window_id))
    if not service_id:
        raise HTTPException(404, "Offer not found")
    service = await lock_service(db, service_id)
    window = await db.scalar(select(OfferWindow).where(OfferWindow.id == window_id).with_for_update())
    return service, window


async def claim(db, service, window, entry, user, minutes, now):
    from app.day_closure import require_open
    await require_open(db, service, now)
    if window.status != "active" or window.expires_at <= now or business_date(window.created_at) != business_date(now) or not service.is_active:
        raise HTTPException(409, "Offer is no longer available")
    if entry and (entry.queue_date != business_date(now) or entry.status != "waiting" or (entry.confirmation_expires_at and entry.confirmation_expires_at <= now)):
        raise HTTPException(409, "Queue entry is no longer eligible")
    settings = await settings_for(db, service)
    if minutes and settings and getattr(settings, f"urgent_offer_{minutes}_enabled") is False:
        raise HTTPException(409, "This arrival option is disabled")
    arrival = now + timedelta(minutes=minutes)
    promised = await db.scalar(select(QueueEntry.id).where(
        QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now), QueueEntry.status == "confirmed",
        QueueEntry.arrival_time < arrival + timedelta(minutes=max(1, service.standard_duration or 15)),
    ).limit(1))
    if promised:
        raise HTTPException(409, "Offer would conflict with a confirmed arrival")
    # Zablokuj pracownika przed rezerwacją miejsca, także między różnymi usługami.
    employee = await idle_employee(db, service, now, lock=True)
    if employee is None:
        raise HTTPException(409, "No employee is available")
    from app.calendar import require_interval
    await require_interval(db, service, arrival,
                           arrival + timedelta(minutes=max(1, service.standard_duration or 15)), employee.id)
    if entry is not None and entry.employee_id not in (None, employee.id):
        raise HTTPException(409, "Entry is assigned to another employee")
    if entry is None:
        count = len((await db.scalars(select(QueueEntry.id).where(
            QueueEntry.service_id == service.id, QueueEntry.queue_date == business_date(now),
            QueueEntry.status.in_(("waiting", "confirmed", "in_service"))))).all())
        if service.max_queue_length is not None and count >= service.max_queue_length:
            raise HTTPException(409, "Queue is full")
        entry = QueueEntry(service_id=service.id, institution_id=service.institution_id, client_id=user.id)
        db.add(entry)
        await db.flush()
    entry.status = "confirmed"
    entry.employee_id = employee.id
    entry.confirmed_at = now
    entry.arrival_time = arrival
    entry.priority_at = now
    window.status = "taken"
    window.taken_by = user.id
    window.accepted_entry_id = entry.id
    await queue_changed(db, entry)
    await signal_window(db, window)
    return entry


@router.get("")
async def my_offers(user=Depends(get_current_user), db=Depends(get_db)):
    return await visible_offers(db, user_id=user.id)


@router.get("/last-minute/{service_id}")
async def last_minute(service_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    return (await visible_offers(db, service_id=service_id))["last_minute"]


@router.post("/urgent/{offer_id}/respond")
async def respond(offer_id: UUID, data: OfferResponse, user=Depends(get_current_user), db=Depends(get_db)):
    if user.role != "client":
        raise HTTPException(403, "Client account required")
    async with db.begin():
        window_id = await db.scalar(select(QueueOffer.window_id).join(
            QueueEntry, QueueEntry.id == QueueOffer.queue_entry_id).where(
            QueueOffer.id == offer_id, QueueEntry.client_id == user.id))
        if not window_id:
            raise HTTPException(404, "Offer not found")
        service, window = await locked_window(db, window_id)
        offer = await db.scalar(select(QueueOffer).where(QueueOffer.id == offer_id).with_for_update())
        entry = await get_locked_entry(db, offer.queue_entry_id)
        if offer.status == "accepted" and data.accept and offer.selected_minutes == data.minutes:
            return QueueResponse.model_validate(entry)
        if offer.status == "declined" and not data.accept:
            return {"status": "declined"}
        now = datetime.utcnow()
        if offer.status != "pending" or offer.expires_at <= now or window.status != "active":
            raise HTTPException(409, "Offer is no longer available")
        if not data.accept:
            offer.status = "declined"
            await db.flush()
            await advance(db, service, now)
            return {"status": "declined"}
        entry = await claim(db, service, window, entry, user, data.minutes, now)
        offer.status = "accepted"
        offer.selected_minutes = data.minutes
        return QueueResponse.model_validate(entry)


@router.post("/last-minute/{window_id}/accept", response_model=QueueResponse)
async def accept_last_minute(window_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    if user.role != "client":
        raise HTTPException(403, "Client account required")
    async with db.begin():
        service, window = await locked_window(db, window_id)
        if window.phase != "last_minute":
            raise HTTPException(404, "Last-minute offer not found")
        if window.status == "taken" and window.taken_by == user.id:
            return QueueResponse.model_validate(await db.get(QueueEntry, window.accepted_entry_id))
        entry = await db.scalar(select(QueueEntry).where(
            QueueEntry.service_id == service.id, QueueEntry.client_id == user.id,
            QueueEntry.queue_date == business_date(),
            QueueEntry.status.in_(("waiting", "confirmed", "in_service"))).with_for_update())
        entry = await claim(db, service, window, entry, user, 0, datetime.utcnow())
        return QueueResponse.model_validate(entry)
