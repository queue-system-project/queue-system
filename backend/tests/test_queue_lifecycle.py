"""Regresje uzgodnionych przejść statusów i zakresu zamknięcia dnia."""
import asyncio
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import pytest
from sqlalchemy import func, select

from app.core.business_time import business_date
from app.models.notifications import Notification
from app.models.queue import QueueEntry
from app.models.visit import Visit
from app.services.day_closure import close_day
from app.workers.timer_worker import tick
from test_day_closure import join, close


@pytest.mark.parametrize("status", ["waiting", "skipped", "cancelled", "done", "in_service"])
def test_missed_requires_confirmed(env, status):
    entry = join(env)
    async def prepare():
        async with env.sessions.begin() as db:
            (await db.get(QueueEntry, UUID(entry["id"]))).status = status
            return await db.scalar(select(func.count()).select_from(Notification))
    count = asyncio.run(prepare())
    result = env.client.post("/api/queue/missed", headers=env.headers("staff"), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"])})
    assert result.status_code == 409
    async def check():
        async with env.sessions() as db:
            row = await db.get(QueueEntry, UUID(entry["id"]))
            assert row.status == status and row.missed_at is None and row.missed_by is None
            assert await db.scalar(select(func.count()).select_from(Notification)) == count
    asyncio.run(check())


def test_timer_does_not_skip_confirmed_client(env):
    entry = join(env)
    now = datetime.utcnow()
    asyncio.run(tick(env.sessions, now))
    assert env.client.post("/api/queue/confirm", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": entry["id"]}).status_code == 200
    async def check():
        await tick(env.sessions, now + timedelta(minutes=3))
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == "confirmed"
    asyncio.run(check())


@pytest.mark.parametrize("status", ["waiting", "skipped", "cancelled", "done", "missed"])
def test_start_requires_confirmed_without_side_effects(env, status):
    entry = join(env)
    async def prepare():
        async with env.sessions.begin() as db:
            (await db.get(QueueEntry, UUID(entry["id"]))).status = status
            return await db.scalar(select(func.count()).select_from(Notification))
    count = asyncio.run(prepare())
    result = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"])})
    assert result.status_code == 409
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == status
            assert await db.scalar(select(func.count()).select_from(Visit)) == 0
            assert await db.scalar(select(func.count()).select_from(Notification)) == count
    asyncio.run(check())


@pytest.mark.parametrize("status", ["waiting", "confirmed"])
def test_manual_skip_is_disabled(env, status):
    entry = join(env)
    async def prepare():
        async with env.sessions.begin() as db:
            (await db.get(QueueEntry, UUID(entry["id"]))).status = status
            return await db.scalar(select(func.count()).select_from(Notification))
    count = asyncio.run(prepare())
    body = {"queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"])}
    assert env.client.post("/api/queue/skip", headers=env.headers("staff"), json=body).status_code == 410
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == status
            assert await db.scalar(select(func.count()).select_from(Notification)) == count
    asyncio.run(check())


@pytest.mark.parametrize("status", ["waiting", "confirmed"])
def test_close_preserves_future_booking_without_slot(env, status):
    join(env)
    future_id = uuid4()
    async def prepare():
        async with env.sessions.begin() as db:
            db.add(QueueEntry(id=future_id, service_id=env.ids["service"],
                institution_id=env.ids["institution"], client_id=env.ids["bob"],
                queue_date=business_date() + timedelta(days=1), status=status,
                created_at=datetime.utcnow() - timedelta(days=7)))
    asyncio.run(prepare())
    body = {"queue_entry_id": str(future_id), "employee_id": str(env.ids["employee"])}
    for path in ("/api/visit/start", "/api/queue/missed"):
        assert env.client.post(path, headers=env.headers("staff"), json=body).status_code == 409
    result = close(env)
    assert result.status_code == 200, result.text
    assert result.json()["cancelled_count"] == 1
    assert close(env).json() == result.json()
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, future_id)).status == status
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.event_key == f"queue:{future_id}:cancelled")) == 0
    asyncio.run(check())


def test_catchup_closes_only_requested_day(env):
    current = join(env)
    past_id = uuid4()
    day = business_date() - timedelta(days=1)
    async def check():
        async with env.sessions.begin() as db:
            db.add(QueueEntry(id=past_id, service_id=env.ids["service"],
                institution_id=env.ids["institution"], client_id=env.ids["bob"],
                queue_date=day, status="waiting"))
        async with env.sessions.begin() as db:
            closure = await close_day(db, env.ids["institution"], None, day=day)
            assert closure.cancelled_count == 1
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, past_id)).status == "cancelled"
            assert (await db.get(QueueEntry, UUID(current["id"]))).status == "waiting"
    asyncio.run(check())
