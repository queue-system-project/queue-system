import asyncio
from datetime import datetime, timedelta
from uuid import uuid4

import pytest
from sqlalchemy import select, delete

from app.models.push import PushJob, PushToken
from app.notifications import create_notification
from app.push_worker import process_one
from conftest import sessions_table


class Gateway:
    def __init__(self, outcome=True):
        self.calls = []
        self.outcome = outcome

    async def send(self, token, notification):
        self.calls.append((token, notification.id))
        if isinstance(self.outcome, Exception):
            raise self.outcome
        return self.outcome


def register(env, who="alice"):
    response = env.client.post("/api/notifications/devices", headers=env.headers(who),
        json={"device_type": "android", "token": "test-device-token-not-a-real-fcm-token"})
    assert response.status_code == 200, response.text
    assert "token" not in response.json()
    return response.json()["id"]


def test_device_ownership_and_transfer(env):
    device_id = register(env)
    assert register(env) == device_id
    assert env.client.delete(f"/api/notifications/devices/{device_id}", headers=env.headers("bob")).status_code == 404
    assert register(env, "bob") == device_id
    assert env.client.delete(f"/api/notifications/devices/{device_id}", headers=env.headers("alice")).status_code == 404
    assert env.client.delete(f"/api/notifications/devices/{device_id}", headers=env.headers("bob")).status_code == 204


@pytest.mark.parametrize("outcome,expected", [(True, "sent"), (False, "no_devices")])
def test_durable_push_success_and_invalid_token(env, outcome, expected):
    register(env)
    async def check():
        async with env.sessions.begin() as db:
            notification = await create_notification(db, env.ids["alice"], "Title", "Body")
        gateway = Gateway(outcome)
        assert await process_one(env.sessions, gateway)
        assert len(gateway.calls) == 1
        async with env.sessions() as db:
            job = await db.get(PushJob, notification.id)
            assert job.status == expected
            devices = (await db.scalars(select(PushToken))).all()
            assert len(devices) == (1 if outcome else 0)
        assert not await process_one(env.sessions, gateway)
    asyncio.run(check())


def test_push_retries_then_fails_without_losing_history(env):
    register(env)
    async def check():
        now = datetime.utcnow()
        async with env.sessions.begin() as db:
            notification = await create_notification(db, env.ids["alice"], "Title", "Body")
        gateway = Gateway(RuntimeError("do not persist sensitive cloud error"))
        for index in range(3):
            assert await process_one(env.sessions, gateway, now + timedelta(minutes=index + 1))
        async with env.sessions() as db:
            job = await db.get(PushJob, notification.id)
            assert job.status == "failed" and job.attempts == 3
            assert job.last_error == "RuntimeError"
        assert not await process_one(env.sessions, gateway, now + timedelta(hours=1))
    asyncio.run(check())
    assert len(env.client.get("/api/notifications", headers=env.headers("alice")).json()) == 1


def test_logged_out_device_receives_no_push(env):
    register(env)
    async def check():
        async with env.sessions.begin() as db:
            await create_notification(db, env.ids["alice"], "Title", "Body")
            await db.execute(delete(sessions_table).where(sessions_table.c.id == env.session_ids["alice"]))
        gateway = Gateway()
        await process_one(env.sessions, gateway)
        assert not gateway.calls
    asyncio.run(check())


def test_push_job_rolls_back_with_notification(env):
    async def check():
        async with env.sessions() as db:
            await create_notification(db, env.ids["alice"], "Title", "Body")
            await db.flush()
            await db.rollback()
        async with env.sessions() as db:
            assert not (await db.scalars(select(PushJob))).all()
    asyncio.run(check())


def test_firebase_gateway_builds_bounded_preview_without_network(monkeypatch):
    firebase = pytest.importorskip("firebase_admin")
    from firebase_admin import messaging
    from types import SimpleNamespace
    from app.push_worker import FirebaseGateway

    calls = []
    marker = object()
    monkeypatch.setattr(firebase, "initialize_app", lambda **kwargs: marker)
    monkeypatch.setattr(messaging, "send", lambda message, app: calls.append((message, app)))
    gateway = FirebaseGateway()
    notification = SimpleNamespace(id=uuid4(), title="T" * 255, message="M" * 5000)
    assert asyncio.run(gateway.send("test-token", notification)) is True
    message, app = calls[0]
    assert app is marker
    assert message.data["notification_id"] == str(notification.id)
    assert len(message.notification.title) == 100
    assert len(message.notification.body) == 500
