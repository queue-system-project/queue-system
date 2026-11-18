"""Przepływy email/SMS z jednorazowym dostawcą zastępczym, bez sieci."""
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from uuid import UUID
import pytest
from fastapi import HTTPException
from sqlalchemy import select, func
from app.core import sms
from app.models.users import User
from app.models.auth_challenges import AuthChallenge
from test_email_auth import capture_mail

PHONE = "+48500100200"
EMAIL = "sms-test@example.com"


@pytest.fixture
def provider(monkeypatch):
    calls, active = [], {}
    async def send(recipient, code, purpose, language):
        sid = "VE" + str(len(calls)).zfill(32)
        active[sid] = "1234"
        calls.append(("send", recipient, purpose, sid))
        return sid
    async def check(sid, code):
        calls.append(("check", sid))
        if active.get(sid) == code:
            del active[sid]
            return True
        return False
    async def cancel(sid):
        calls.append(("cancel", sid))
        active.pop(sid, None)
    monkeypatch.setattr(sms, "send_code", send)
    monkeypatch.setattr(sms, "check_code", check)
    monkeypatch.setattr(sms, "cancel_code", cancel)
    return calls, active


def register(env, channel="sms", both=False):
    body = {"phone": PHONE, "password": "Password-123", "accept_terms": True}
    if both:
        body["email"] = EMAIL
        body["verification_channel"] = channel
    return env.client.post("/api/auth/register", json=body)


def verify(env, login=PHONE, code="1234"):
    return env.client.post("/api/auth/verify", json={"login": login, "code": code})


def verified_phone(env, provider):
    result = register(env)
    assert result.status_code == 200, result.text
    assert verify(env).status_code == 200
    return UUID(result.json()["user_id"])


@pytest.mark.parametrize("channel", ["email", "sms"])
def test_registration_uses_selected_contact_only(env, monkeypatch, provider, channel):
    messages = capture_mail(monkeypatch)
    r = register(env, channel, both=True)
    assert r.status_code == 200, r.text
    login = EMAIL if channel == "email" else PHONE
    code = messages[-1][1] if messages else "1234"
    other = PHONE if channel == "email" else EMAIL
    assert verify(env, other, code).status_code == 400
    assert verify(env, login, code).status_code == 200
    assert bool(messages) == (channel == "email")
    assert bool(provider[0]) == (channel == "sms")
    async def check():
        async with env.sessions() as db:
            user = await db.get(User, UUID(r.json()["user_id"]))
            assert (user.email_verified_at is not None) == (channel == "email")
            assert (user.phone_verified_at is not None) == (channel == "sms")
    asyncio.run(check())
    before = (len(messages), len(provider[0]))
    assert env.client.post("/api/auth/forgot-password", json={"login": other}).status_code == 200
    assert before == (len(messages), len(provider[0]))


def test_both_contacts_require_explicit_choice(env, provider):
    assert register(env, None, both=True).status_code == 422
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(User).where(User.phone == PHONE)) is None
    asyncio.run(check())
    assert not provider[0]


def test_sms_precheck_then_reset_calls_provider_once_and_revokes_session(env, provider):
    verified_phone(env, provider)
    login = env.client.post("/api/auth/login", json={"login": PHONE, "password": "Password-123"})
    headers = {"Authorization": "Bearer " + login.json()["access_token"]}
    assert env.client.post("/api/auth/forgot-password", json={"login": PHONE}).status_code == 200
    before = len([c for c in provider[0] if c[0] == "check"])
    for _ in range(2):
        assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "1234"}).status_code == 200
    # Akceptacja dostawcy nie pozwala zastąpić zaakceptowanego kodu innym.
    assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "0000"}).status_code == 400
    body = {"login": PHONE, "verification_code": "1234", "new_password": "New-password-123"}
    assert env.client.post("/api/auth/reset-password", json=body).status_code == 200
    assert env.client.post("/api/auth/reset-password", json=body).status_code == 400
    assert len([c for c in provider[0] if c[0] == "check"]) == before + 1
    assert env.client.post("/api/auth/logout", headers=headers).status_code == 401
    assert env.client.post("/api/auth/login", json={"login": PHONE, "password": "New-password-123"}).status_code == 200


def test_sms_wrong_attempt_limit_and_expiry(env, provider):
    uid = verified_phone(env, provider)
    assert env.client.post("/api/auth/forgot-password", json={"login": PHONE}).status_code == 200
    for _ in range(5):
        assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "0000"}).status_code == 400
    count = len(provider[0])
    assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "1234"}).status_code == 400
    assert len(provider[0]) == count
    async def expire():
        async with env.sessions.begin() as db:
            row = await db.get(AuthChallenge, (uid, "reset"))
            row.attempts = 0
            row.expires_at = datetime.utcnow() - timedelta(seconds=1)
    asyncio.run(expire())
    assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "1234"}).status_code == 400
    assert len(provider[0]) == count


def test_provider_failure_preserves_attempts_and_account_state(env, monkeypatch, provider):
    uid = verified_phone(env, provider)
    assert env.client.post("/api/auth/forgot-password", json={"login": PHONE}).status_code == 200
    async def unavailable(*args):
        raise HTTPException(503, "SMS service unavailable")
    monkeypatch.setattr(sms, "check_code", unavailable)
    assert env.client.post("/api/auth/verify-reset-code", json={"login": PHONE, "code": "1234"}).status_code == 503
    async def check():
        async with env.sessions() as db:
            assert (await db.get(AuthChallenge, (uid, "reset"))).attempts == 0
    asyncio.run(check())


def test_resend_changes_channel_and_invalidates_previous_sms(env, monkeypatch, provider):
    messages = capture_mail(monkeypatch)
    r = register(env, "sms", both=True)
    uid = UUID(r.json()["user_id"])
    assert env.client.post("/api/auth/resend-verification", json={"login": EMAIL}).status_code == 429
    async def age():
        async with env.sessions.begin() as db:
            (await db.get(AuthChallenge, (uid, "verify"))).sent_at -= timedelta(seconds=61)
    asyncio.run(age())
    assert env.client.post("/api/auth/resend-verification", json={"login": EMAIL}).status_code == 200
    assert any(c[0] == "cancel" for c in provider[0])
    assert verify(env).status_code == 400
    assert verify(env, EMAIL, messages[-1][1]).status_code == 200


def test_second_contact_requires_owner_and_enables_sms_recovery(env, monkeypatch, provider):
    messages = capture_mail(monkeypatch)
    assert register(env, "email", both=True).status_code == 200
    assert verify(env, EMAIL, messages[-1][1]).status_code == 200
    r = env.client.post("/api/auth/login", json={"login": EMAIL, "password": "Password-123"})
    headers = {"Authorization": "Bearer " + r.json()["access_token"]}
    path = "/api/users/me/contact-verification"
    assert env.client.post(path, json={"channel": "sms"}).status_code == 401
    assert env.client.post(path, headers=headers, json={"channel": "sms"}).status_code == 200
    assert env.client.post(path + "/confirm", headers=env.headers("alice"), json={"login": PHONE, "code": "1234"}).status_code == 403
    assert env.client.post(path + "/confirm", headers=headers, json={"login": PHONE, "code": "1234"}).status_code == 200
    assert env.client.post("/api/auth/forgot-password", json={"login": PHONE}).status_code == 200
    assert provider[0][-1][0:3] == ("send", PHONE, "reset")
    assert env.client.post("/api/auth/forgot-password", json={"login": EMAIL}).status_code == 429


@pytest.mark.parametrize("phone", ["500100200", "+48abc", " ", "+48000100200x"])
def test_invalid_phone_cannot_trigger_sms(env, provider, phone):
    r = env.client.post("/api/auth/register", json={"phone": phone,
        "password": "Password-123", "accept_terms": True})
    assert r.status_code == 422
    assert not provider[0]


def test_sms_registration_failure_rolls_back_new_account(env, monkeypatch, provider):
    async def fail(*args):
        raise HTTPException(503, "SMS unavailable")
    monkeypatch.setattr(sms, "send_code", fail)
    assert register(env).status_code == 503
    async def check():
        async with env.sessions() as db:
            assert await db.scalar(select(User).where(User.phone == PHONE)) is None
    asyncio.run(check())


def test_postgres_sms_reset_is_consumed_once(env, provider):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga blokad PostgreSQL")
    verified_phone(env, provider)
    assert env.client.post("/api/auth/forgot-password", json={"login": PHONE}).status_code == 200
    def reset(i):
        return env.client.post("/api/auth/reset-password", json={"login": PHONE,
            "verification_code": "1234", "new_password": f"Password-new-{i}"}).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        assert sorted(pool.map(reset, [1, 2])) == [200, 400]


def test_postgres_channel_migration_is_repeatable(env):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga migracji PostgreSQL")
    from pathlib import Path
    async def migrate():
        async with env.sessions.kw["bind"].connect() as connection:
            raw = (await connection.get_raw_connection()).driver_connection
            assert (await raw.fetchval("SELECT current_schema()")).startswith("test_queue_")
            await raw.execute("UPDATE users SET phone='+48500100200' WHERE id=$1", env.ids["bob"])
            await raw.execute("ALTER TABLE users DROP COLUMN email_verified_at, DROP COLUMN phone_verified_at")
            await raw.execute("ALTER TABLE auth_challenges DROP COLUMN channel, DROP COLUMN recipient, DROP COLUMN provider_sid")
            sql = (Path(__file__).parents[1] / "migrations/013_auth_channels.sql").read_text(encoding="utf-8")
            await raw.execute(sql)
            await raw.execute(sql)
            assert await raw.fetchval("SELECT email_verified_at IS NOT NULL FROM users WHERE id=$1", env.ids["alice"])
            assert await raw.fetchval("SELECT email_verified_at IS NULL AND phone_verified_at IS NULL FROM users WHERE id=$1", env.ids["bob"])
    asyncio.run(migrate())
