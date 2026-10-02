import asyncio
from datetime import date, datetime, time, timedelta
from sqlalchemy import select, func
from app.business_time import business_date, day_bounds, local_boundary
from app.models.reports import DailyReport
from app.models.notifications import Notification
from test_calendar_booking import book


def test_warsaw_days_and_dst_boundaries():
    start, end = day_bounds(date(2026, 3, 29))
    assert end - start == timedelta(hours=23)
    start, end = day_bounds(date(2026, 10, 25))
    assert end - start == timedelta(hours=25)
    assert business_date(datetime(2026, 7, 1, 22, 30)) == date(2026, 7, 2)
    assert local_boundary(date(2026, 3, 29), time(2, 30)) == datetime(2026, 3, 29, 1)
    early = local_boundary(date(2026, 10, 25), time(2, 30))
    late = local_boundary(date(2026, 10, 25), time(2, 30), closing=True)
    assert late - early == timedelta(hours=1)


def test_saved_report_finalizes_after_late_visit_and_notifies_once(env):
    first = book(env).json()
    second = book(env, who="bob").json()
    r = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": first["id"], "employee_id": str(env.ids["employee"])})
    assert r.status_code == 201
    visit_id = r.json()["id"]
    closure = f"/api/institutions/{env.ids['institution']}/close-day"
    assert env.client.post(closure, headers=env.headers("staff")).status_code == 200
    path = f"/api/reports/daily?institution_id={env.ids['institution']}"
    assert env.client.get(path, headers=env.headers("staff")).status_code == 403
    assert env.client.get(path, headers=env.headers("outsider")).status_code == 403
    archive = env.client.get(path, headers=env.headers("admin")).json()["archive"]
    assert not archive["finalized"]
    assert archive["summary"]["status_counts"] == {"cancelled": 1, "in_service": 1}
    end = {"visit_id": visit_id, "employee_id": str(env.ids["employee"])}
    assert env.client.post("/api/visit/end", headers=env.headers("staff"), json=end).status_code == 200
    assert env.client.post("/api/visit/end", headers=env.headers("staff"), json=end).status_code == 200
    env.client.post(closure, headers=env.headers("staff"))
    final = env.client.get(path, headers=env.headers("admin")).json()["archive"]
    assert final["id"] == archive["id"] and final["finalized"]
    assert final["summary"]["status_counts"] == {"cancelled": 1, "done": 1}
    own = env.client.get(f"/api/statistics/employee/{env.ids['employee']}", headers=env.headers("staff")).json()["archive"]
    assert own["summary"]["clients_served"] == 1
    assert "employees" not in own["summary"]
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(DailyReport)) == 1
            assert await db.scalar(select(func.count()).select_from(Notification).where(
                Notification.user_id == env.ids["staff"], Notification.event_key.like("daily-report:%"))) == 2
    asyncio.run(check())


def test_employee_management_requires_local_admin(env):
    payload = {"user_id": str(env.ids["alice"]), "institution_id": str(env.ids["institution"]),
               "service_ids": [str(env.ids["service"])]}
    for who in (None, "alice", "staff", "outsider"):
        r = env.client.post("/api/employees", headers=env.headers(who) if who else {}, json=payload)
        assert r.status_code in (401, 403)
    r = env.client.post("/api/employees", headers=env.headers("admin"), json=payload)
    assert r.status_code == 201, r.text
    other = env.client.delete(f"/api/employees/{env.ids['other_employee']}", headers=env.headers("admin"))
    assert other.status_code == 403
    assert env.client.delete(f"/api/employees/{r.json()['id']}", headers=env.headers("staff")).status_code == 403


def test_profile_mutation_and_view_are_scoped(env):
    for path, extra in (("/api/users/language", {"language": "pl"}),
                        ("/api/users/complete-profile", {"first_name": "A", "last_name": "B"})):
        payload = {"user_id": str(env.ids["alice"]), **extra}
        assert env.client.put(path, json=payload).status_code == 401
        assert env.client.put(path, headers=env.headers("bob"), json=payload).status_code == 403
        assert env.client.put(path, headers=env.headers("alice"), json=payload).status_code == 200
    assert env.client.get(f"/api/users/{env.ids['outsider']}", headers=env.headers("admin")).status_code == 403
    assert env.client.get(f"/api/users/{env.ids['staff']}", headers=env.headers("admin")).status_code == 200
