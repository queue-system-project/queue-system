import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from uuid import UUID

import pytest
from sqlalchemy import select, func
from app.models.queue import QueueEntry
from app.models.slots import ServiceSlot
from app.models.catalog import Service
from app.models.offers import OfferWindow, QueueOffer
from app.timer_worker import tick
from app.business_time import business_date, local_boundary


def create_slot(env, days=1, hour=10):
    start = local_boundary(business_date() + timedelta(days=days), datetime.min.time().replace(hour=hour))
    body = {"service_id": str(env.ids["service"]), "employee_id": str(env.ids["employee"]),
            "slot_start": start.isoformat() + "Z", "slot_end": (start + timedelta(minutes=15)).isoformat() + "Z",
            "is_available": True}
    r = env.client.post("/api/slots", headers=env.headers("admin"), json=body)
    assert r.status_code == 201, r.text
    return r.json(), body


def book(env, slot=None, who="alice"):
    return env.client.post("/api/queue/join", headers=env.headers(who), json={
        "user_id": str(env.ids[who]), "service_id": str(env.ids["service"]),
        "slot_id": slot["id"] if slot else None})


def test_slot_mutations_require_institution_membership(env):
    slot, body = create_slot(env)
    for who in (None, "alice", "staff", "outsider"):
        headers = env.headers(who) if who else {}
        for method, path in (("post", "/api/slots"), ("put", f"/api/slots/{slot['id']}"),
                             ("delete", f"/api/slots/{slot['id']}")):
            args = {"headers": headers}
            if method != "delete":
                args["json"] = body
            r = getattr(env.client, method)(path, **args)
            assert r.status_code in (401, 403), r.text


def test_booking_partitions_capacity_positions_and_duplicates_by_day(env):
    tomorrow, _ = create_slot(env)
    next_day, _ = create_slot(env, days=2)
    async def limit():
        async with env.sessions.begin() as db:
            (await db.get(Service, env.ids["service"])).max_queue_length = 1
    asyncio.run(limit())
    today = book(env)
    future = book(env, tomorrow)
    later = book(env, next_day)
    assert [r.status_code for r in (today, future, later)] == [201, 201, 201]
    assert book(env, tomorrow).status_code == 409
    assert book(env, tomorrow, "bob").status_code == 409
    rows = env.client.get(f"/api/queue/status/{env.ids['alice']}", headers=env.headers("alice")).json()
    assert len(rows) == 3 and all(row["queue_position"] == 1 for row in rows)
    assert len({row["queue_date"] for row in rows}) == 3
    with env.client.websocket_connect(f"/ws/user/{env.ids['alice']}", headers=env.headers("alice")) as ws:
        snapshot = ws.receive_json()["data"]["queue"]
        assert {row["queue_date"] for row in snapshot} == {row["queue_date"] for row in rows}
        assert all(row["queue_position"] == 1 for row in snapshot)
    assert future.json()["scheduled_at"] == tomorrow["slot_start"]
    assert future.json()["estimated_start_at"] == tomorrow["slot_start"]
    assert future.json()["employee_id"] == str(env.ids["employee"])
    assert env.client.post("/api/queue/confirm", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": future.json()["id"]}).status_code == 409


def test_cancel_releases_future_slot_without_opening_todays_offers(env, monkeypatch):
    monkeypatch.setenv("QUEUE_OFFERS_ENABLED", "1")
    slot, _ = create_slot(env)
    first = book(env, slot).json()
    r = env.client.post("/api/queue/cancel", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": first["id"]})
    assert r.status_code == 200
    available = env.client.get(f"/api/services/{env.ids['service']}/slots").json()
    assert slot["id"] in [row["id"] for row in available]
    assert book(env, slot, "bob").status_code == 201
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(OfferWindow)) == 0
    asyncio.run(check())


def test_future_booking_gets_no_confirmation_or_urgent_offer_today(env, monkeypatch):
    monkeypatch.setenv("QUEUE_OFFERS_ENABLED", "1")
    slot, _ = create_slot(env)
    future = book(env, slot, "bob").json()
    today = book(env).json()
    env.client.post("/api/queue/cancel", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": today["id"]})
    async def check():
        await tick(env.sessions)
        async with env.sessions() as db:
            entry = await db.get(QueueEntry, UUID(future["id"]))
            assert entry.confirmation_sent_at is None and entry.status == "waiting"
            assert await db.scalar(select(func.count()).select_from(QueueOffer).where(
                QueueOffer.queue_entry_id == entry.id)) == 0
    asyncio.run(check())


def test_closed_today_allows_future_booking_and_preserves_existing_future(env):
    tomorrow, _ = create_slot(env)
    next_day, _ = create_slot(env, days=2)
    first = book(env, tomorrow).json()
    r = env.client.post(f"/api/institutions/{env.ids['institution']}/close-day", headers=env.headers("staff"))
    assert r.status_code == 200 and r.json()["cancelled_count"] == 0
    assert book(env).status_code == 409
    assert book(env, next_day).status_code == 201
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(first["id"]))).status == "waiting"
    asyncio.run(check())


def test_postgres_only_one_client_can_book_slot(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga blokad PostgreSQL")
    slot, _ = create_slot(env)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda who: book(env, slot, who), ("alice", "bob")))
    assert sorted(r.status_code for r in results) == [201, 409]


def test_postgres_same_client_cannot_book_two_slots_on_same_day(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga blokad PostgreSQL")
    first, _ = create_slot(env)
    second, _ = create_slot(env, hour=11)
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(lambda slot: book(env, slot), (first, second)))
    assert sorted(r.status_code for r in results) == [201, 409]


def test_postgres_migration_backfills_future_slot_and_is_repeatable(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga migracji PostgreSQL")
    from pathlib import Path
    slot, _ = create_slot(env)
    entry = book(env, slot).json()
    async def migrate():
        engine = env.sessions.kw["bind"]
        async with engine.connect() as connection:
            raw = (await connection.get_raw_connection()).driver_connection
            assert (await raw.fetchval("SELECT current_schema()")).startswith("test_queue_")
            await raw.execute("ALTER TABLE queue_entries DROP COLUMN queue_date CASCADE, DROP COLUMN scheduled_at")
            sql = (Path(__file__).parents[1] / "migrations/007_calendar_booking.sql").read_text(encoding="utf-8")
            await raw.execute(sql)
            await raw.execute(sql)
            row = await raw.fetchrow("SELECT queue_date, scheduled_at FROM queue_entries WHERE id=$1", UUID(entry["id"]))
            start = datetime.fromisoformat(slot["slot_start"].replace("Z", "+00:00")).replace(tzinfo=None)
            assert row["queue_date"] == start.date() and row["scheduled_at"] == start
    asyncio.run(migrate())
