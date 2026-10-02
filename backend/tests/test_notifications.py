import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
import pytest
from sqlalchemy import delete, select, func
from starlette.websockets import WebSocketDisconnect

from app import security
from app.models.notifications import Notification
from app.notifications import create_notification
from app.realtime import hub
from conftest import sessions_table


def join(env, who="alice"):
    response = env.client.post("/api/queue/join", headers=env.headers(who), json={
        "user_id": str(env.ids[who]), "service_id": str(env.ids["service"]),
    })
    assert response.status_code == 201, response.text
    return response.json()


@pytest.mark.parametrize("path", ["/api/notifications", "/api/notifications/send", "/api/queue/join", "/api/visit/start"])
def test_requires_auth(env, path):
    response = env.client.get(path) if path == "/api/notifications" else env.client.post(path, json={})
    assert response.status_code == 401


def test_history_is_private_and_read_is_idempotent(env):
    join(env)
    rows = env.client.get("/api/notifications", headers=env.headers("alice")).json()
    assert len(rows) == 1
    assert rows[0]["created_at"].endswith("Z")
    assert env.client.get("/api/notifications", headers=env.headers("bob")).json() == []
    assert env.client.get(f"/api/notifications/{env.ids['alice']}", headers=env.headers("bob")).status_code == 403
    path = f"/api/notifications/{rows[0]['id']}/read"
    assert env.client.patch(path, headers=env.headers("bob")).status_code == 404
    for _ in range(2):
        result = env.client.patch(path, headers=env.headers("alice"))
        assert result.status_code == 200
        assert result.json()["is_read"] is True
    assert env.client.get("/api/notifications?is_read=false", headers=env.headers("alice")).json() == []


def test_manual_send_scope_dedup_and_validation(env):
    join(env)
    body = dict(user_id=str(env.ids["alice"]), institution_id=str(env.ids["institution"]),
        source_event_id=str(uuid4()), title="Notice", message="Hello")
    for who in ("alice", "outsider"):
        assert env.client.post("/api/notifications/send", headers=env.headers(who), json=body).status_code == 403
    first = env.client.post("/api/notifications/send", headers=env.headers("staff"), json=body)
    assert first.status_code == 201, first.text
    second = env.client.post("/api/notifications/send", headers=env.headers("staff"), json=body)
    assert second.status_code == 200
    assert first.json()["id"] == second.json()["id"]
    assert env.client.post("/api/notifications/send", headers=env.headers("staff"), json={**body, "message": "Other"}).status_code == 409
    assert env.client.post("/api/notifications/send", headers=env.headers("staff"), json={**body, "title": "  "}).status_code == 422
    assert env.client.post("/api/notifications/send", headers=env.headers("staff"), json={**body, "user_id": str(env.ids['bob'])}).status_code == 403


def test_pagination_equal_timestamps(env):
    async def seed():
        async with env.sessions.begin() as db:
            for i in range(5):
                db.add(Notification(user_id=env.ids["alice"], title=str(i), message="test",
                    created_at=datetime(2026, 1, 1)))
    asyncio.run(seed())
    ids = []
    for offset in (0, 2, 4):
        response = env.client.get(f"/api/notifications?limit=2&offset={offset}", headers=env.headers("alice"))
        ids.extend(row["id"] for row in response.json())
    assert len(ids) == len(set(ids)) == 5
    assert env.client.get("/api/notifications?limit=101", headers=env.headers("alice")).status_code == 422


def test_no_notification_or_signal_on_rollback(env):
    async def check():
        with hub.subscribe(f"user:{env.ids['alice']}") as signal:
            async with env.sessions() as db:
                await create_notification(db, env.ids["alice"], "Rollback", "test")
                assert not signal.is_set()
                await db.rollback()
                assert not signal.is_set()
            async with env.sessions() as db:
                assert await db.scalar(select(func.count()).select_from(Notification)) == 0
            async with env.sessions.begin() as db:
                await create_notification(db, env.ids["alice"], "Commit", "test")
                assert not signal.is_set()
            assert signal.is_set()
    asyncio.run(check())


def test_cannot_impersonate_client_or_employee(env):
    result = env.client.post("/api/queue/join", headers=env.headers("bob"), json={
        "user_id": str(env.ids["alice"]), "service_id": str(env.ids["service"]),
    })
    assert result.status_code == 403
    entry = join(env)
    result = env.client.post("/api/visit/start", headers=env.headers("outsider"), json={
        "queue_entry_id": entry["id"], "employee_id": str(env.ids["employee"]),
    })
    assert result.status_code == 403


@pytest.mark.parametrize("kind", ["no-token", "invalid", "foreign-user", "foreign-queue"])
def test_websocket_rejects_unauthorized(env, kind):
    path = f"/ws/user/{env.ids['alice']}"
    headers = env.headers("bob") if kind == "foreign-user" else {}
    if kind == "invalid":
        headers = {"Authorization": "Bearer invalid"}
    if kind == "foreign-queue":
        path = f"/ws/queue/{env.ids['service']}"
        headers = env.headers("outsider")
    with pytest.raises(WebSocketDisconnect) as exc:
        with env.client.websocket_connect(path, headers=headers) as ws:
            if kind == "no-token":
                ws.send_json({"type": "hello"})
            ws.receive_json()
    assert exc.value.code == 1008


def test_full_visit_updates_both_devices_and_reconnect(env):
    first = join(env)
    join(env, "bob")
    path = f"/ws/user/{env.ids['bob']}"
    with env.client.websocket_connect(path, headers=env.headers("bob")) as ws1:
        with env.client.websocket_connect(path) as ws2:
            ws2.send_json({"type": "authenticate", "access_token": env.tokens["bob"]})
            for ws in (ws1, ws2):
                assert ws.receive_json()["data"]["queue"][0]["queue_position"] == 2
            result = env.client.post("/api/visit/start", headers=env.headers("staff"), json={
                "queue_entry_id": first["id"], "employee_id": str(env.ids["employee"]),
            })
            assert result.status_code == 201, result.text
            visit = result.json()
            # Rozpoczęcie obsługi zmienia ETA, nawet gdy pozycja nadal wynosi 2.
            for ws in (ws1, ws2):
                update = ws.receive_json()["data"]["queue"][0]
                assert update["queue_position"] == 2
                assert update["estimated_wait_time"] == 15
            body = {"visit_id": visit["id"], "employee_id": str(env.ids["employee"])}
            for _ in range(2):
                result = env.client.post("/api/visit/end", headers=env.headers("staff"), json=body)
                assert result.status_code == 200, result.text
            for ws in (ws1, ws2):
                assert ws.receive_json()["data"]["queue"][0]["queue_position"] == 1
    with env.client.websocket_connect(path, headers=env.headers("bob")) as ws:
        assert ws.receive_json()["data"]["queue"][0]["queue_position"] == 1
    notices = env.client.get("/api/notifications", headers=env.headers("alice")).json()
    assert len(notices) == 3  # Zapis, rozpoczęcie i zakończenie wizyty; ponowne zakończenie niczego nie dodaje


def test_logout_revokes_existing_socket(env):
    with env.client.websocket_connect(f"/ws/user/{env.ids['alice']}", headers=env.headers("alice")) as ws:
        ws.receive_json()
        async def revoke():
            async with env.sessions.begin() as db:
                await db.execute(delete(sessions_table).where(sessions_table.c.id == env.session_ids["alice"]))
        env.client.portal.call(revoke)
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_json()
        assert exc.value.code == 1008


def test_expired_access_token_is_rejected(env):
    token = jwt.encode(dict(sub=str(env.ids["alice"]), sid=str(env.session_ids["alice"]), type="access",
        iat=datetime.now(timezone.utc)-timedelta(hours=1), exp=datetime.now(timezone.utc)-timedelta(minutes=1)),
        security.JWT_SECRET, algorithm="HS256")
    assert env.client.get("/api/notifications", headers={"Authorization": f"Bearer {token}"}).status_code == 401


@pytest.mark.parametrize("transition", ["cancel", "confirm", "skip"])
def test_queue_transitions_are_private_and_idempotent(env, transition):
    entry = join(env)
    body = {"queue_entry_id": entry["id"]}
    actor = "staff" if transition == "skip" else "alice"
    body["employee_id" if transition == "skip" else "user_id"] = str(
        env.ids["employee" if transition == "skip" else "alice"]
    )
    for _ in range(2):
        response = env.client.post(f"/api/queue/{transition}", headers=env.headers(actor), json=body)
        assert response.status_code == 200, response.text
    rows = env.client.get("/api/notifications", headers=env.headers("alice")).json()
    assert len(rows) == 2
    assert env.client.get("/api/notifications", headers=env.headers("bob")).json() == []


def test_staff_queue_and_reports(env):
    join(env)
    with env.client.websocket_connect(f"/ws/queue/{env.ids['service']}", headers=env.headers("staff")) as ws:
        snapshot = ws.receive_json()
        assert snapshot["type"] == "queue_snapshot"
        assert snapshot["data"][0]["client_id"] == str(env.ids["alice"])
    paths = [f"/api/reports/daily?institution_id={env.ids['institution']}",
             f"/api/statistics/employee/{env.ids['employee']}"]
    for path in paths:
        response = env.client.get(path, headers=env.headers("admin" if "/reports/" in path else "staff"))
        assert response.status_code == 200, response.text
        assert response.json()["total_visits"] == 0
        assert env.client.get(path, headers=env.headers("outsider")).status_code == 403


def test_notification_failure_rolls_back_queue(env, monkeypatch):
    from app.routes import queue
    original = queue.queue_changed

    async def fail(db, entry):
        await original(db, entry)
        raise RuntimeError("Simulated failure before commit")

    monkeypatch.setattr(queue, "queue_changed", fail)
    with pytest.raises(RuntimeError, match="Simulated failure"):
        join(env)
    assert env.client.get("/api/notifications", headers=env.headers("alice")).json() == []
    response = env.client.get(f"/api/queue/status/{env.ids['alice']}", headers=env.headers("alice"))
    assert response.json() == []


def test_hub_coalesces_and_removes_disconnected_listeners():
    from app.realtime import Hub
    async def check():
        local = Hub()
        with local.subscribe("alice") as a, local.subscribe("bob") as b:
            for _ in range(1000):
                local.publish(["alice"])
            assert a.is_set() and not b.is_set()
            assert len(local.listeners["alice"]) == 1
        assert not local.listeners
    asyncio.run(check())


def test_slow_socket_times_out_and_cleans_up(env, monkeypatch):
    from app.routes import realtime
    monkeypatch.setattr(realtime, "SEND_TIMEOUT", 0.01)

    class SlowSocket:
        headers = {"authorization": f"Bearer {env.tokens['alice']}"}
        code = None

        async def accept(self):
            pass

        async def send_json(self, data):
            await asyncio.Event().wait()

        async def receive_text(self):
            await asyncio.Event().wait()

        async def close(self, code):
            self.code = code

    socket = SlowSocket()
    asyncio.run(realtime.stream(socket, env.ids["alice"], True))
    assert socket.code == 1008
    assert f"user:{env.ids['alice']}" not in hub.listeners
