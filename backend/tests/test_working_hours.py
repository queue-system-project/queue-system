import asyncio
from datetime import datetime, date, time, timedelta
from uuid import UUID

from sqlalchemy import select
from app.calendar import Calendar
from app.business_time import business_date, local_boundary
from app.models.day_closure import DayClosure
from app.models.queue import QueueEntry
from app.models.catalog import Service
from app.models.visit import Visit
from app.timer_worker import tick
from test_calendar_booking import create_slot, book


def hours(env, day, intervals, holidays=None, who="admin"):
    return env.client.put(f"/api/institutions/{env.ids['institution']}/working-hours",
        headers=env.headers(who), json={"enabled": True,
        "intervals": [{"day_of_week": day.weekday(), "start_time": a, "end_time": b} for a, b in intervals],
        "holidays": holidays or []})


def test_interval_intersection_break_and_end_boundary():
    day = date(2026, 9, 28)
    calendar = Calendar(True, [(0, time(9), time(12)), (0, time(13), time(17))], set(),
                        {"employee": [(0, time(10), time(16))]})
    assert calendar.earliest(day, local_boundary(day, time(11, 50)), timedelta(minutes=20), "employee") == local_boundary(day, time(13, 0))
    assert not calendar.fits(local_boundary(day, time(9, 0)), local_boundary(day, time(10, 0)), "employee")
    assert calendar.fits(local_boundary(day, time(15, 45)), local_boundary(day, time(16, 0)), "employee")
    assert calendar.earliest(day, local_boundary(day, time(16, 0)), timedelta(minutes=15), "employee") is None
    calendar.holidays.add(day)
    assert calendar.intervals(day, "employee") == []


def test_schedule_validates_permissions_overlaps_and_holidays(env):
    day = business_date() + timedelta(days=1)
    assert hours(env, day, [("09:00", "17:00")], who="alice").status_code == 403
    assert hours(env, day, [("09:00", "17:00")], who="outsider").status_code == 403
    assert hours(env, day, [("09:00", "12:00"), ("11:00", "17:00")]).status_code == 422
    assert hours(env, day, [("09:00", "17:00")], [{"holiday_date": day.isoformat()}]).status_code == 200
    start = local_boundary(day, time(10))
    r = env.client.post("/api/slots", headers=env.headers("admin"), json={
        "service_id": str(env.ids["service"]), "employee_id": str(env.ids["employee"]),
        "slot_start": start.isoformat()+"Z", "slot_end": (start+timedelta(minutes=15)).isoformat()+"Z",
        "is_available": True})
    assert r.status_code == 409


def test_schedule_change_cannot_invalidate_booking(env):
    slot, _ = create_slot(env)
    assert book(env, slot).status_code == 201
    day = datetime.fromisoformat(slot["slot_start"].replace("Z", "+00:00")).date()
    r = hours(env, day, [("11:00", "17:00")])
    assert r.status_code == 409
    r = env.client.get(f"/api/institutions/{env.ids['institution']}/working-hours")
    assert r.json()["enabled"] is False
    assert hours(env, day, [("09:00", "17:00")]).status_code == 200


def test_employee_schedule_filters_unbooked_slots_and_blocks_booking(env):
    slot, _ = create_slot(env)
    day = datetime.fromisoformat(slot["slot_start"].replace("Z", "+00:00")).date()
    r = env.client.put(f"/api/employees/{env.ids['employee']}/working-hours", headers=env.headers("admin"),
        json={"intervals": [{"day_of_week": day.weekday(), "start_time": "11:00", "end_time": "17:00"}]})
    assert r.status_code == 200
    assert env.client.get(f"/api/services/{env.ids['service']}/slots").json() == []
    assert book(env, slot).status_code == 409


def test_timer_keeps_queue_during_break_and_closes_at_last_interval(env):
    slot, _ = create_slot(env)
    entry = book(env, slot).json()
    day = datetime.fromisoformat(slot["slot_start"].replace("Z", "+00:00")).date()
    assert hours(env, day, [("09:00", "11:00"), ("13:00", "17:00")]).status_code == 200
    async def check():
        await tick(env.sessions, local_boundary(day, time(12)))
        async with env.sessions() as db:
            row = await db.get(QueueEntry, UUID(entry["id"]))
            assert row.status == "waiting" and row.estimated_start_at == local_boundary(day, time(13))
            assert await db.get(DayClosure, (env.ids["institution"], day)) is None
        await tick(env.sessions, local_boundary(day, time(17)))
        await tick(env.sessions, local_boundary(day, time(17, 1)))
        async with env.sessions() as db:
            row = await db.get(QueueEntry, UUID(entry["id"]))
            assert row.status == "cancelled" and row.cancellation_reason == "institution_closed"
            closed = await db.get(DayClosure, (env.ids["institution"], day))
            assert closed.closed_by is None and closed.cancelled_count == 1
    asyncio.run(check())


def test_restart_closes_previous_day_but_preserves_future_booking(env):
    slot, _ = create_slot(env)
    future, _ = create_slot(env, days=3)
    old, later = book(env, slot).json(), book(env, future).json()
    day = datetime.fromisoformat(slot["slot_start"].replace("Z", "+00:00")).date()
    # Włącz wszystkie dni, aby przyszła rezerwacja pozostała prawidłowa.
    r = env.client.put(f"/api/institutions/{env.ids['institution']}/working-hours", headers=env.headers("admin"),
        json={"intervals": [{"day_of_week": d, "start_time": "09:00", "end_time": "17:00"} for d in range(7)]})
    assert r.status_code == 200
    async def check():
        await tick(env.sessions, local_boundary(day + timedelta(days=1), time(8)))
        async with env.sessions() as db:
            assert (await db.get(QueueEntry, UUID(old["id"]))).status == "cancelled"
            assert (await db.get(QueueEntry, UUID(later["id"]))).status == "waiting"
            assert await db.get(DayClosure, (env.ids["institution"], day)) is not None
    asyncio.run(check())


def test_automatic_close_does_not_end_ongoing_visit(env):
    entry = book(env).json()
    r = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"])})
    assert r.status_code == 201
    visit_id = r.json()["id"]
    assert hours(env, business_date(), []).status_code == 200
    asyncio.run(tick(env.sessions))
    async def check():
        async with env.sessions() as db:
            row = await db.get(Visit, UUID(visit_id))
            assert row.status == "in_service" and row.actual_end is None
    asyncio.run(check())
    r = env.client.post("/api/visit/end", headers=env.headers("staff"), json={
        "visit_id": visit_id, "employee_id": str(env.ids["employee"])})
    assert r.status_code == 200
