import asyncio
import hashlib
import pytest
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from sqlalchemy import select
from app import mail
from app.models.users import User
from app.models.auth_challenges import AuthChallenge
from app.passwords import verify_password


def capture_mail(monkeypatch):
    messages = []
    monkeypatch.setattr(mail, "smtp_config", lambda: {})
    async def send(recipient, code, purpose, language):
        messages.append((recipient, code, purpose))
    monkeypatch.setattr(mail, "send_code", send)
    return messages


def test_registration_verifies_email_without_exposing_code(env, monkeypatch):
    messages = capture_mail(monkeypatch)
    r = env.client.post("/api/auth/register", json={"email": "new@example.com", "password": "Test-password-123", "accept_terms": True})
    assert r.status_code == 200, r.text
    assert "verification_code" not in r.json()
    credentials = {"login": "new@example.com", "password": "Test-password-123"}
    assert env.client.post("/api/auth/login", json=credentials).status_code == 403
    code = messages[-1][1]
    assert len(code) == 4 and code.isascii() and code.isdigit()
    assert env.client.post("/api/auth/verify", json={"login": "new@example.com", "code": code}).status_code == 200
    assert env.client.post("/api/auth/verify", json={"login": "new@example.com", "code": code}).status_code == 400
    assert env.client.post("/api/auth/login", json=credentials).status_code == 200


def test_reset_revokes_sessions_and_cannot_reuse_code(env, monkeypatch):
    messages = capture_mail(monkeypatch)
    r = env.client.post("/api/auth/forgot-password", json={"login": "alice@example.com"})
    assert r.status_code == 200 and "verification_code" not in r.json()
    code = messages[-1][1]
    assert len(code) == 4 and code.isascii() and code.isdigit()
    data = {"login": "alice@example.com", "verification_code": code, "new_password": "New-password-123"}
    assert env.client.post("/api/auth/reset-password", json=data).status_code == 200
    assert env.client.get(f"/api/users/{env.ids['alice']}", headers=env.headers("alice")).status_code == 401
    assert env.client.post("/api/auth/reset-password", json=data).status_code == 400
    async def check():
        async with env.sessions() as db:
            user = await db.get(User, env.ids["alice"])
            assert user.password_hash.startswith("pbkdf2_sha256$")
            assert verify_password("New-password-123", user.password_hash)
    asyncio.run(check())


def test_code_attempt_limit_expiry_and_purpose_separation(env, monkeypatch):
    messages = capture_mail(monkeypatch)
    env.client.post("/api/auth/forgot-password", json={"login": "alice@example.com"})
    code = messages[-1][1]
    assert len(code) == 4 and code.isascii() and code.isdigit()
    assert env.client.post("/api/auth/verify", json={"login": "alice@example.com", "code": code}).status_code == 400
    wrong = "0000" if code != "0000" else "1111"
    for _ in range(5):
        assert env.client.post("/api/auth/verify-reset-code", json={"login": "alice@example.com", "code": wrong}).status_code == 400
    assert env.client.post("/api/auth/verify-reset-code", json={"login": "alice@example.com", "code": code}).status_code == 400
    assert env.client.post("/api/auth/forgot-password", json={"login": "alice@example.com"}).status_code == 429
    async def expire():
        async with env.sessions.begin() as db:
            row = await db.get(AuthChallenge, (env.ids["alice"], "reset"))
            row.attempts = 0
            row.expires_at = datetime.utcnow() - timedelta(seconds=1)
    asyncio.run(expire())
    assert env.client.post("/api/auth/verify-reset-code", json={"login": "alice@example.com", "code": code}).status_code == 400


def test_mail_missing_or_failure_does_not_claim_success(env, monkeypatch):
    for key in ("SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"):
        monkeypatch.delenv(key, raising=False)
    assert env.client.post("/api/auth/forgot-password", json={"login": "alice@example.com"}).status_code == 503


def test_legacy_password_upgrades_on_login(env):
    async def seed():
        async with env.sessions.begin() as db:
            user = await db.get(User, env.ids["alice"])
            user.password_hash = hashlib.sha256(b"Legacy-password-123").hexdigest()
    asyncio.run(seed())
    r = env.client.post("/api/auth/login", json={"login": "alice@example.com", "password": "Legacy-password-123"})
    assert r.status_code == 200, r.text
    async def check():
        async with env.sessions() as db:
            assert (await db.get(User, env.ids["alice"])).password_hash.startswith("pbkdf2_sha256$")
    asyncio.run(check())


def test_smtp_uses_tls_before_authentication(monkeypatch):
    events = []
    for key, value in {"HOST": "smtp.example.com", "USER": "test", "PASSWORD": "test-only-password",
                       "FROM": "queue@example.com", "SECURITY": "starttls", "PORT": "587"}.items():
        monkeypatch.setenv("SMTP_" + key, value)
    class FakeSMTP:
        def __init__(self, *args, **kwargs):
            events.append("connect")
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def starttls(self, **kwargs):
            events.append("tls")
        def login(self, *args):
            events.append("login")
        def send_message(self, message):
            events.append("send")
            assert "1234" in message.get_content()
    monkeypatch.setattr(mail.smtplib, "SMTP", FakeSMTP)
    asyncio.run(mail.send_code("recipient@example.com", "1234", "reset", "pl"))
    assert events == ["connect", "tls", "login", "send"]


def test_postgres_reset_code_is_consumed_once_under_race(env, monkeypatch):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Wymaga blokad PostgreSQL")
    messages = capture_mail(monkeypatch)
    assert env.client.post("/api/auth/forgot-password", json={"login": "alice@example.com"}).status_code == 200
    code = messages[-1][1]
    assert len(code) == 4 and code.isascii() and code.isdigit()
    def reset(number):
        return env.client.post("/api/auth/reset-password", json={"login": "alice@example.com",
            "verification_code": code, "new_password": f"New-password-{number}"}).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        statuses = list(pool.map(reset, (1, 2)))
    assert sorted(statuses) == [200, 400]
