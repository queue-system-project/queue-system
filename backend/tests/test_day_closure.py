import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from uuid import UUID, uuid4

import pytest
from sqlalchemy import select, func
from app.models.queue import QueueEntry
from app.models.visit import Visit
from app.models.notifications import Notification
from app.models.day_closure import DayClosure
from app.models.offers import OfferWindow, QueueOffer
from app.models.slots import ServiceSlot
from app.timer_worker import tick
from app.business_time import business_date


def join(env, who="alice"):
    r = env.client.post("/api/queue/join", headers=env.headers(who), json={
        "user_id": str(env.ids[who]), "service_id": str(env.ids["service"])})
    assert r.status_code == 201, r.text
    return r.json()


def close(env, who="staff"):
    return env.client.post(f"/api/institutions/{env.ids['institution']}/close-day",
                           headers=env.headers(who))


def missed(env, entry, who="staff", employee="employee"):
    return env.client.post("/api/queue/missed", headers=env.headers(who), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids[employee])})


def test_missed_is_manual_scoped_and_idempotent(env):
    first = join(env)
    join(env, "bob")
    assert missed(env, first, "alice").status_code == 403
    assert missed(env, first, "outsider", "other_employee").status_code == 403
    r = missed(env, first)
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "missed"
    assert r.json()["missed_by"] == str(env.ids["staff"])
    assert r.json()["missed_at"].endswith("Z")
    assert missed(env, first).json() == r.json()
    assert env.client.get(f"/api/queue/status/{env.ids['bob']}",
                          headers=env.headers("bob")).json()[0]["queue_position"] == 1
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.event_key == f"queue:{first['id']}:missed")) == 1
    asyncio.run(check())


def test_missed_cannot_end_a_started_visit_or_precede_arrival(env):
    first = join(env)
    async def future():
        async with env.sessions.begin() as db:
            row = await db.get(QueueEntry, UUID(first["id"]))
            row.status = "confirmed"
            row.arrival_time = datetime.utcnow() + timedelta(minutes=10)
    asyncio.run(future())
    assert missed(env, first).status_code == 409
    async def now():
        async with env.sessions.begin() as db:
            (await db.get(QueueEntry, UUID(first["id"]))).arrival_time = datetime.utcnow()
    asyncio.run(now())
    r = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": first["id"], "employee_id": str(env.ids["employee"])})
    assert r.status_code == 201
    assert missed(env, first).status_code == 409


def test_close_cancels_waiting_and_confirmed_once_and_blocks_new_join(env, monkeypatch):
    a, b = join(env), join(env, "bob")
    r = env.client.post("/api/queue/confirm", headers=env.headers("bob"), json={
        "user_id": str(env.ids["bob"]), "queue_entry_id": b["id"]})
    assert r.status_code == 200
    assert close(env, "alice").status_code == 403
    assert close(env, "outsider").status_code == 403
    monkeypatch.setenv("QUEUE_OFFERS_ENABLED", "1")
    r = close(env)
    assert r.status_code == 200, r.text
    assert r.json()["cancelled_count"] == 2
    assert close(env).json() == r.json()
    assert missed(env, a).status_code == 409
    assert env.client.post("/api/queue/join", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "service_id": str(env.ids["service"])}).status_code == 409
    async def check():
        await tick(env.sessions)
        async with env.sessions() as db:
            for item in (a, b):
                row = await db.get(QueueEntry, UUID(item["id"]))
                assert row.status == "cancelled" and row.cancellation_reason == "institution_closed"
                assert row.queue_position is None and row.estimated_wait_time is None
                note = await db.scalar(select(Notification).where(
                    Notification.event_key == f"queue:{row.id}:cancelled"))
                assert "institution has closed" in note.message
            assert await db.scalar(select(func.count()).select_from(OfferWindow)) == 0
            assert await db.scalar(select(func.count()).select_from(DayClosure)) == 1
    asyncio.run(check())


def test_close_preserves_in_service_and_allows_manual_finish(env):
    a = join(env)
    r = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": a["id"], "employee_id": str(env.ids["employee"])})
    assert r.status_code == 201
    visit_id = r.json()["id"]
    join(env, "bob")
    assert close(env).json()["cancelled_count"] == 1
    async def check():
        async with env.sessions() as db:
            row = await db.get(Visit, UUID(visit_id))
            assert row.status == "in_service" and row.actual_end is None
    asyncio.run(check())
    r = env.client.post("/api/visit/end", headers=env.headers("staff"), json={
        "visit_id": visit_id, "employee_id": str(env.ids["employee"])})
    assert r.status_code == 200 and r.json()["status"] == "done"


def test_close_preserves_future_slots_and_expires_offers(env):
    first = join(env)
    future_id, window_id = uuid4(), uuid4()
    async def seed():
        async with env.sessions.begin() as db:
            tomorrow = datetime.utcnow() + timedelta(days=1)
            slot = ServiceSlot(service_id=env.ids["service"], employee_id=env.ids["employee"],
                               slot_start=tomorrow, slot_end=tomorrow + timedelta(minutes=15))
            db.add(slot)
            await db.flush()
            db.add(QueueEntry(id=future_id, service_id=env.ids["service"],
                institution_id=env.ids["institution"], client_id=env.ids["bob"], slot_id=slot.id,
                queue_date=business_date(tomorrow), scheduled_at=tomorrow))
            db.add(OfferWindow(id=window_id, service_id=env.ids["service"],
                source_entry_id=UUID(first["id"]), source_event="test-close", expires_at=tomorrow))
            await db.flush()
            db.add(QueueOffer(window_id=window_id, queue_entry_id=UUID(first["id"]), expires_at=tomorrow))
    asyncio.run(seed())
    assert missed(env, {"id": str(future_id)}).status_code == 409
    # Otwarta instytucja także nie może rozpocząć jutrzejszej rezerwacji.
    assert env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": str(future_id), "employee_id": str(env.ids["employee"])}).status_code == 409
    assert close(env).json()["cancelled_count"] == 1
    assert env.client.post("/api/queue/confirm", headers=env.headers("bob"), json={
        "user_id": str(env.ids["bob"]), "queue_entry_id": str(future_id)}).status_code == 409
    assert env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": str(future_id), "employee_id": str(env.ids["employee"])}).status_code == 409
    async def check():
        async with env.sessions() as db:
            future = await db.get(QueueEntry, future_id)
            assert future.status == "waiting" and future.estimated_wait_time is None
            assert (await db.get(OfferWindow, window_id)).status == "expired"
            assert (await db.scalar(select(QueueOffer))).status == "expired"
    asyncio.run(check())
    assert env.client.get(f"/api/offers/last-minute/{env.ids['service']}",
                          headers=env.headers("bob")).json() == []


def test_failed_close_rolls_back_closure_entries_and_notifications(env, monkeypatch):
    import app.day_closure as module
    a = join(env)
    original = module.queue_changed
    async def fail(*args, **kwargs):
        await original(*args, **kwargs)
        raise RuntimeError("rollback test")
    monkeypatch.setattr(module, "queue_changed", fail)
    with pytest.raises(RuntimeError):
        close(env)
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(a["id"]))).status == "waiting"
            assert await db.scalar(select(func.count()).select_from(DayClosure)) == 0
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.event_key == f"queue:{a['id']}:cancelled")) == 0
    asyncio.run(check())


def test_postgres_close_racing_join_leaves_no_waiting_entry(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Requires PostgreSQL row locks")
    def attempt_join():
        return env.client.post("/api/queue/join", headers=env.headers("alice"), json={
            "user_id": str(env.ids["alice"]), "service_id": str(env.ids["service"])}).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        jobs = [pool.submit(attempt_join), pool.submit(close, env)]
        assert jobs[0].result() in (201, 409)
        assert jobs[1].result().status_code == 200
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(QueueEntry).where(
                QueueEntry.status.in_(("waiting", "confirmed")))) == 0
    asyncio.run(check())


def test_postgres_parallel_close_is_idempotent(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Requires PostgreSQL row locks")
    join(env)
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(lambda _: close(env), range(2)))
    assert all(r.status_code == 200 for r in responses)
    assert responses[0].json() == responses[1].json()
