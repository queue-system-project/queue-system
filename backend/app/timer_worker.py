from app.business_time import business_date, day_bounds, local_boundary
"""Trwałe terminy kolejki. Zalecane QUEUE_TIMERS_ENABLED=1 w jednym procesie API."""
import asyncio
import logging
from datetime import datetime, time
from sqlalchemy import select
from app.database.connection import SessionLocal
from app.models.catalog import Service, Institution
from app.models.queue import QueueEntry
from app.models.offers import OfferWindow
from app.queue_timing import ACTIVE, process_service

logger = logging.getLogger(__name__)


async def tick(sessions=SessionLocal, now=None):
    now = now or datetime.utcnow()
    from app.calendar import load_calendar
    from app.day_closure import close_day
    async with sessions() as db:
        institutions = list((await db.scalars(select(Institution.id).where(
            Institution.calendar_enabled.is_(True)))).all())
    for institution_id in institutions:
        async with sessions.begin() as db:
            institution = await db.scalar(select(Institution).where(Institution.id == institution_id)
                                          .with_for_update(skip_locked=True))
            if institution is None or not institution.calendar_enabled:
                continue
            calendar = await load_calendar(db, institution_id)
            days = set((await db.scalars(select(QueueEntry.queue_date).where(
                QueueEntry.institution_id == institution_id,
                QueueEntry.status.in_(("waiting", "confirmed")),
                QueueEntry.queue_date <= business_date(now)).distinct())).all())
            days.add(business_date(now))
            # Po przerwie w działaniu domknij również poprzednie nieobsłużone dni.
            for day in sorted(days):
                intervals = calendar.intervals(day)
                end = max((b for _, b in intervals), default=day_bounds(day)[0])
                if now >= end:
                    await close_day(db, institution_id, None, now, day)
    async with sessions() as db:
        ids = list((await db.scalars(select(QueueEntry.service_id).where(
            QueueEntry.status.in_(ACTIVE)).union(select(OfferWindow.service_id).where(
                OfferWindow.status == "active")))).all())
        ids.sort(key=str)
    for service_id in ids:
        async with sessions.begin() as db:
            # Kolejność zgodna z żądaniami HTTP i zamknięciem dnia: instytucja, usługa.
            institution_id = await db.scalar(select(Service.institution_id).where(Service.id == service_id))
            if institution_id is not None:
                institution = await db.scalar(select(Institution).where(
                    Institution.id == institution_id).with_for_update(skip_locked=True))
                if institution is None:
                    continue
            service = await db.scalar(select(Service).where(Service.id == service_id)
                                      .with_for_update(skip_locked=True))
            if service is not None:
                await process_service(db, service, now)


async def run():
    while True:
        try:
            await tick()
        except Exception as exc:
            # Ponów po wycofaniu transakcji; nie wypisuj danych logowania ani parametrów bazy.
            logger.error("Queue timer tick failed (%s)", type(exc).__name__)
        await asyncio.sleep(5)
