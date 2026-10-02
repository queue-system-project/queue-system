import asyncio
from datetime import datetime, timedelta
from uuid import UUID, uuid4
import pytest
from sqlalchemy import select, func
from app.models.queue import QueueEntry
from app.models.catalog import Service
from app.models.visit import Visit
from app.models.employees import Employee, EmployeeService
from app.models.settings import SystemSettings
from app.models.notifications import Notification
from app.queue_timing import recalculate, process_service
from app.timer_worker import tick


def join(env, who="alice"):
    result = env.client.post("/api/queue/join", headers=env.headers(who), json={
        "user_id": str(env.ids[who]), "service_id": str(env.ids["service"]),
    })
    assert result.status_code == 201, result.text
    return result.json()


def test_eta_tracks_remaining_visit_time_and_overrun(env):
    first = join(env)
    second = join(env, "bob")
    assert first["estimated_wait_time"] == 0
    assert second["estimated_wait_time"] == 15
    response = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": first["id"], "employee_id": str(env.ids["employee"]),
    })
    assert response.status_code == 201
    async def check():
        now = datetime.utcnow()
        async with env.sessions.begin() as db:
            visit = await db.get(Visit, UUID(response.json()["id"]))
            visit.actual_start = now - timedelta(minutes=10)
            service = await db.get(Service, env.ids["service"])
            await recalculate(db, service, now)
            bob = await db.get(QueueEntry, UUID(second["id"]))
            assert bob.estimated_wait_time == 5
            visit.actual_start = now - timedelta(minutes=20)
            await recalculate(db, service, now)
            assert bob.estimated_wait_time == 1
    asyncio.run(check())
    result = env.client.post("/api/visit/end", headers=env.headers("staff"), json={
        "visit_id": response.json()["id"], "employee_id": str(env.ids["employee"]),
    })
    assert result.status_code == 200
    rows = env.client.get(f"/api/queue/status/{env.ids['bob']}", headers=env.headers("bob")).json()
    assert rows[0]["estimated_wait_time"] == 0
    assert rows[0]["eta_updated_at"].endswith("Z")


def test_parallel_employees_and_unavailable_staff(env):
    join(env)
    second = join(env, "bob")
    async def check():
        async with env.sessions.begin() as db:
            employee = Employee(id=uuid4(), institution_id=env.ids["institution"],
                                user_id=env.ids["bob"], employee_status="active")
            db.add(employee)
            await db.flush()
            db.add(EmployeeService(employee_id=employee.id, service_id=env.ids["service"]))
            service = await db.get(Service, env.ids["service"])
            await recalculate(db, service)
            bob = await db.get(QueueEntry, UUID(second["id"]))
            assert bob.estimated_wait_time == 0
            for worker in (await db.scalars(select(Employee))).all():
                worker.employee_status = "inactive"
            await process_service(db, service)
            assert bob.estimated_wait_time is None
            assert bob.confirmation_sent_at is None
    asyncio.run(check())


def test_confirmation_deadline_survives_ticks_and_expires_once(env):
    entry = join(env)
    async def check():
        now = datetime.utcnow()
        await tick(env.sessions, now)
        await tick(env.sessions, now + timedelta(seconds=30))
        async with env.sessions() as db:
            row = await db.get(QueueEntry, UUID(entry["id"]))
            assert row.confirmation_expires_at == now + timedelta(minutes=2)
            assert await db.scalar(select(func.count()).select_from(Notification)) == 2
        await tick(env.sessions, now + timedelta(minutes=2))
        await tick(env.sessions, now + timedelta(minutes=3))
        async with env.sessions() as db:
            row = await db.get(QueueEntry, UUID(entry["id"]))
            assert row.status == "skipped" and row.queue_position is None
            assert await db.scalar(select(func.count()).select_from(Notification)) == 3
    asyncio.run(check())


def test_configured_threshold_and_response_time(env):
    first, second = join(env), join(env, "bob")
    async def check():
        async with env.sessions.begin() as db:
            db.add(SystemSettings(institution_id=env.ids["institution"],
                                  confirmation_time_minutes=0, client_response_minutes=7))
        now = datetime.utcnow()
        await tick(env.sessions, now)
        async with env.sessions() as db:
            alice = await db.get(QueueEntry, UUID(first["id"]))
            bob = await db.get(QueueEntry, UUID(second["id"]))
            assert alice.confirmation_expires_at == now + timedelta(minutes=7)
            assert bob.confirmation_sent_at is None
    asyncio.run(check())


def test_confirmed_arrival_is_not_brought_forward(env):
    first, second = join(env), join(env, "bob")
    confirmed = env.client.post("/api/queue/confirm", headers=env.headers("bob"), json={
        "user_id": str(env.ids["bob"]), "queue_entry_id": second["id"],
    })
    assert confirmed.status_code == 200
    env.client.post("/api/queue/cancel", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": first["id"],
    })
    row = env.client.get(f"/api/queue/status/{env.ids['bob']}", headers=env.headers("bob")).json()[0]
    assert row["estimated_start_at"] == confirmed.json()["arrival_time"]
    start = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": second["id"], "employee_id": str(env.ids["employee"]),
    })
    assert start.status_code == 409


def test_expired_confirmation_cannot_be_accepted_or_started(env):
    entry = join(env)
    asyncio.run(tick(env.sessions, datetime.utcnow() - timedelta(minutes=3)))
    result = env.client.post("/api/queue/confirm", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": entry["id"],
    })
    assert result.status_code == 409
    result = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"]),
    })
    assert result.status_code == 409


def test_timer_rollback_does_not_save_deadline_or_notification(env):
    entry = join(env)
    async def check():
        with pytest.raises(RuntimeError):
            async with env.sessions.begin() as db:
                await process_service(db, await db.get(Service, env.ids["service"]))
                raise RuntimeError("rollback")
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).confirmation_sent_at is None
            assert await db.scalar(select(func.count()).select_from(Notification)) == 1
    asyncio.run(check())


def test_decline_cancels_and_timer_does_not_skip_cancelled_entry(env):
    entry = join(env)
    now = datetime.utcnow()
    asyncio.run(tick(env.sessions, now))
    result = env.client.post("/api/queue/cancel", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": entry["id"],
    })
    assert result.status_code == 200
    asyncio.run(tick(env.sessions, now + timedelta(minutes=3)))
    async def check():
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == "cancelled"
    asyncio.run(check())


def test_postgres_overlapping_timer_ticks_do_not_duplicate_notifications(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Requires PostgreSQL row locks")
    entry = join(env)
    async def check():
        now = datetime.utcnow()
        await asyncio.gather(tick(env.sessions, now), tick(env.sessions, now))
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.event_key == f"confirmation:{entry['id']}")) == 1
        await asyncio.gather(tick(env.sessions, now + timedelta(minutes=2)),
                             tick(env.sessions, now + timedelta(minutes=2)))
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == "skipped"
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.event_key == f"queue:{entry['id']}:skipped")) == 1
    asyncio.run(check())


def test_postgres_expiry_racing_confirmation_cannot_resurrect_entry(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Requires PostgreSQL row locks")
    from app.routes.queue import confirm_queue
    from app.schemas.queue import ConfirmQueueRequest
    from app.models.users import User
    from fastapi import HTTPException
    entry = join(env)
    async def check():
        await tick(env.sessions, datetime.utcnow() - timedelta(minutes=3))
        async def confirm():
            async with env.sessions() as lookup:
                user = await lookup.get(User, env.ids["alice"])
            async with env.sessions() as db:
                with pytest.raises(HTTPException) as error:
                    await confirm_queue(ConfirmQueueRequest(user_id=user.id,
                        queue_entry_id=entry["id"]), current_user=user, db=db)
                assert error.value.status_code == 409
        await asyncio.gather(tick(env.sessions), confirm())
        # SKIP LOCKED może odroczyć usługę, gdy odrzucane potwierdzenie nadal
        # utrzymuje jej blokadę. Nie może jej potwierdzić; kolejny cykl wygasza wpis.
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status in ("waiting", "skipped")
        await tick(env.sessions)
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(entry["id"]))).status == "skipped"
    asyncio.run(check())
