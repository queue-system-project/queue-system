import pytest
from test_email_auth import capture_mail


def test_postgres_registration_to_saved_report(env, monkeypatch):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Pełny przepływ na PostgreSQL")
    messages = capture_mail(monkeypatch)
    credentials = {"login": "flow@example.com", "password": "Flow-password-123"}
    r = env.client.post("/api/auth/register", json={"email": credentials["login"],
        "password": credentials["password"], "accept_terms": True})
    assert r.status_code == 200
    user_id = r.json()["user_id"]
    assert env.client.post("/api/auth/verify", json={"login": credentials["login"], "code": messages[-1][1]}).status_code == 200
    login = env.client.post("/api/auth/login", json=credentials)
    assert login.status_code == 200
    headers = {"Authorization": "Bearer " + login.json()["access_token"]}
    r = env.client.post("/api/queue/join", headers=headers, json={"user_id": user_id, "service_id": str(env.ids["service"])})
    assert r.status_code == 201
    entry_id = r.json()["id"]
    with env.client.websocket_connect(f"/ws/user/{user_id}", headers=headers) as ws:
        assert ws.receive_json()["data"]["queue"][0]["id"] == entry_id
    r = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
        "queue_entry_id": entry_id, "employee_id": str(env.ids["employee"])})
    assert r.status_code == 201
    assert env.client.post("/api/visit/end", headers=env.headers("staff"), json={
        "visit_id": r.json()["id"], "employee_id": str(env.ids["employee"])}).status_code == 200
    assert env.client.post(f"/api/institutions/{env.ids['institution']}/close-day", headers=env.headers("staff")).status_code == 200
    report = env.client.get(f"/api/reports/daily?institution_id={env.ids['institution']}", headers=env.headers("admin")).json()["archive"]
    assert report["finalized"] and report["summary"]["status_counts"] == {"done": 1}
    assert env.client.post("/api/auth/logout", headers=headers).status_code == 200
    assert env.client.get(f"/api/users/{user_id}", headers=headers).status_code == 401
