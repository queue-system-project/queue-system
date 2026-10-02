import asyncio
from sqlalchemy import select, func
from app.audit import AuditLog
from test_calendar_booking import book


def test_service_management_is_scoped_and_soft_delete_keeps_history(env):
    body = {"institution_id": str(env.ids["institution"]), "name": "New service", "standard_duration": 20}
    for who in (None, "alice", "staff", "outsider"):
        assert env.client.post("/api/services", headers=env.headers(who) if who else {}, json=body).status_code in (401, 403)
    r = env.client.post("/api/services", headers=env.headers("admin"), json=body)
    assert r.status_code == 201
    service_id = r.json()["id"]
    update = {"name": "Updated", "standard_duration": 25}
    assert env.client.put(f"/api/services/{service_id}", headers=env.headers("staff"), json=update).status_code == 403
    assert env.client.put(f"/api/services/{service_id}", headers=env.headers("admin"), json=update).status_code == 200
    assert env.client.delete(f"/api/services/{service_id}", headers=env.headers("admin")).status_code == 204
    rows = env.client.get("/api/services").json()
    assert next(r for r in rows if r["id"] == service_id)["is_active"] is False
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(func.count()).select_from(AuditLog)) == 3
    asyncio.run(check())


def test_active_service_cannot_be_disabled_and_settings_are_admin_only(env):
    book(env)
    assert env.client.delete(f"/api/services/{env.ids['service']}", headers=env.headers("admin")).status_code == 409
    path = f"/api/institutions/{env.ids['institution']}/settings"
    assert env.client.put(path, headers=env.headers("staff"), json={}).status_code == 403
    assert env.client.put(path, headers=env.headers("admin"), json={"client_response_minutes": 0}).status_code == 422
    assert env.client.put(path, headers=env.headers("admin"), json={"client_response_minutes": 5}).status_code == 200
    assert env.client.get(path, headers=env.headers("admin")).json()["client_response_minutes"] == 5


def test_history_preserves_cancelled_entries_and_checks_owner(env):
    entry = book(env).json()
    env.client.post("/api/queue/cancel", headers=env.headers("alice"), json={
        "user_id": str(env.ids["alice"]), "queue_entry_id": entry["id"]})
    path = f"/api/users/{env.ids['alice']}/queue-history"
    assert env.client.get(path, headers=env.headers("bob")).status_code == 403
    assert env.client.get(path, headers=env.headers("alice")).json()[0]["status"] == "cancelled"
    path = f"/api/institutions/{env.ids['institution']}/queue-history"
    assert env.client.get(path, headers=env.headers("outsider")).status_code == 403
    assert len(env.client.get(path, headers=env.headers("admin")).json()) == 1
    assert env.client.get(path, headers=env.headers("staff")).json() == []
