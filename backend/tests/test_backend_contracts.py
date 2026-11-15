"""Kontrakty grafiku, preferencji pracownika i wstępnej kontroli kodu resetu."""
import asyncio
from datetime import timedelta
from uuid import UUID, uuid4

from app.core.business_time import business_date
from app.models.catalog import Service
from app.models.employees import Employee, EmployeeService
from app.models.queue import QueueEntry
from app.models.auth_challenges import AuthChallenge
from app.services.queue_timing import recalculate
from test_email_auth import capture_mail
from test_calendar_booking import create_slot, book


def test_schedule_and_legacy_hours_have_stable_shapes(env):
    base = f"/api/institutions/{env.ids['institution']}"
    assert env.client.get(base + "/working-hours").json() == []
    assert env.client.get(base + "/schedule").json() == {
        "enabled": False, "timezone": "Europe/Warsaw", "intervals": [], "holidays": []}
    day = business_date() + timedelta(days=1)
    body = {"enabled": True, "intervals": [{"day_of_week": day.weekday(),
        "start_time": "09:00", "end_time": "17:00"}],
        "holidays": [{"holiday_date": day.isoformat(), "description": "Przerwa"}]}
    assert env.client.put(base + "/working-hours", headers=env.headers("admin"), json=body).status_code == 200
    schedule = env.client.get(base + "/schedule").json()
    assert schedule["enabled"] and schedule["timezone"] == "Europe/Warsaw"
    assert schedule["holidays"] == body["holidays"]
    assert schedule["intervals"][0]["start_time"] == "09:00:00"
    hours = env.client.get(base + "/working-hours").json()
    assert isinstance(hours, list) and len(hours) == 1
    assert hours[0]["start_time"] == "09:00" and hours[0]["end_time"] == "17:00"
    assert env.client.get(f"/api/institutions/{uuid4()}/schedule").status_code == 404


def test_explicit_employee_and_slot_survive_recalculation(env):
    body = {"user_id": str(env.ids["alice"]), "service_id": str(env.ids["service"]),
            "employee_id": str(env.ids["employee"])}
    first = env.client.post("/api/queue/join", headers=env.headers("alice"), json=body)
    assert first.status_code == 201
    body["user_id"] = str(env.ids["bob"])
    second = env.client.post("/api/queue/join", headers=env.headers("bob"), json=body)
    assert second.status_code == 201
    slot, _ = create_slot(env)
    future = book(env, slot).json()
    async def check():
        async with env.sessions.begin() as db:
            db.add(EmployeeService(employee_id=env.ids["admin_employee"], service_id=env.ids["service"]))
            await recalculate(db, await db.get(Service, env.ids["service"]))
            row = await db.get(QueueEntry, UUID(second.json()["id"]))
            assert row.employee_id == env.ids["employee"] and row.estimated_wait_time == 15
            scheduled = await db.get(QueueEntry, UUID(future["id"]))
            assert scheduled.employee_id == env.ids["employee"] and str(scheduled.slot_id) == slot["id"]
            (await db.get(Employee, env.ids["employee"])).employee_status = "inactive"
            await recalculate(db, await db.get(Service, env.ids["service"]))
            assert row.employee_id == env.ids["employee"] and row.estimated_wait_time is None
    asyncio.run(check())


def test_reset_precheck_preserves_code_until_password_change(env, monkeypatch):
    messages = capture_mail(monkeypatch)
    login = "alice@example.com"
    assert env.client.post("/api/auth/forgot-password", json={"login": login}).status_code == 200
    code = messages[-1][1]
    for _ in range(2):
        assert env.client.post("/api/auth/verify-reset-code", json={"login": login, "code": code}).status_code == 200
    async def check():
        async with env.sessions() as db:
            row = await db.get(AuthChallenge, (env.ids["alice"], "reset"))
            assert row is not None and row.attempts == 0
    asyncio.run(check())
    assert env.client.post("/api/auth/reset-password", json={"login": login,
        "verification_code": code, "new_password": "New-password-123"}).status_code == 200
    assert env.client.post("/api/auth/verify-reset-code", json={"login": login, "code": code}).status_code == 400


def test_registration_code_cannot_precheck_password_reset(env, monkeypatch):
    messages = capture_mail(monkeypatch)
    login = "new-user@example.com"
    assert env.client.post("/api/auth/register", json={"email": login,
        "password": "Test-password-123", "accept_terms": True}).status_code == 200
    code = messages[-1][1]
    assert env.client.post("/api/auth/verify-reset-code", json={"login": login, "code": code}).status_code == 400
    assert env.client.post("/api/auth/verify", json={"login": login, "code": code}).status_code == 200
