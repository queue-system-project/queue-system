import asyncio
import os
from datetime import datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

# W tym zestawie nie używaj bazy ani danych logowania aplikacji.
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-only-secret-with-at-least-32-characters"
os.environ["QUEUE_TIMERS_ENABLED"] = "0"
os.environ["QUEUE_OFFERS_ENABLED"] = "0"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import Column, DateTime, String, Table, Uuid, insert
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from sqlalchemy import text
from dotenv import dotenv_values
from pathlib import Path

from app.database.connection import Base
from app.main import app
from app.models.catalog import Institution, Service
from app.models.employees import Employee, EmployeeService
from app.models.users import User
from app.routes.users import get_db
from app.routes import realtime
from app import security

sessions_table = Table("refresh_tokens", Base.metadata,
    Column("id", Uuid, primary_key=True), Column("user_id", Uuid),
    Column("token", String), Column("expires_at", DateTime), Column("created_at", DateTime),
)


def pytest_configure(config):
    # Wspólny katalog Windows Temp/pytest-of-<user> może należeć do innego
    # konta wykonującego proces. Dla każdego uruchomienia twórz nowy katalog
    # w projekcie, także przy zwykłym uruchomieniu z PowerShell użytkownika.
    # Uwzględnij jawnie podany parametr --basetemp.
    if config.option.basetemp is None:
        config.option.basetemp = str(config.rootpath / f".pytest-tmp-{uuid4().hex}")


def pytest_addoption(parser):
    parser.addoption("--postgres", action="store_true", help="Use an isolated temporary schema in local PostgreSQL")


@pytest.fixture
def env(tmp_path, monkeypatch, request):
    schema = None
    if request.config.getoption("--postgres"):
        from sqlalchemy.engine import make_url
        url = make_url(os.getenv("QUEUE_TEST_POSTGRES_URL") or
                       dotenv_values(Path(__file__).parents[1] / ".env")["DATABASE_URL"])
        assert url.host in ("localhost", "127.0.0.1"), "PostgreSQL tests require a local server"
        assert url.database == "queue_system_local", "Only the local demo database is allowed"
        schema = "test_queue_" + uuid4().hex
        engine = create_async_engine(url, poolclass=NullPool,
            connect_args={"timeout": 5, "server_settings": {"search_path": schema}})
    else:
        engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}", poolclass=NullPool)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    ids = {key: uuid4() for key in (
        "alice", "bob", "staff", "outsider", "admin", "admin_employee", "institution", "other_institution",
        "service", "employee", "other_employee",
    )}
    tokens = {}
    session_ids = {}

    async def seed():
        async with engine.begin() as conn:
            if schema:
                await conn.execute(text(f'CREATE SCHEMA "{schema}"'))
                def create_enums(sync_conn):
                    from sqlalchemy.dialects.postgresql import ENUM
                    seen = set()
                    for table in Base.metadata.tables.values():
                        for column in table.columns:
                            if isinstance(column.type, ENUM) and column.type.name not in seen:
                                column.type.create(sync_conn, checkfirst=True)
                                seen.add(column.type.name)
                await conn.run_sync(create_enums)
            await conn.run_sync(Base.metadata.create_all)
        async with sessions.begin() as db:
            for key in ("alice", "bob", "staff", "outsider", "admin"):
                user = User(id=ids[key], role="admin" if key == "admin" else "employee" if key in ("staff", "outsider") else "client",
                    email=f"{key}@example.com", password_hash="unused", language="en",
                    is_verified=True, is_active=True)
                db.add(user)
                sid = uuid4()
                session_ids[key] = sid
                await db.execute(insert(sessions_table).values(
                    id=sid, user_id=user.id, token="unused", created_at=datetime.utcnow(),
                    expires_at=datetime.utcnow() + timedelta(days=1),
                ))
                tokens[key] = security.build_tokens(user, sid, "unused")["access_token"]
            await db.flush()
            db.add_all([
                Institution(id=ids["institution"], name="A"),
                Institution(id=ids["other_institution"], name="B"),
            ])
            await db.flush()
            db.add_all([
                Service(id=ids["service"], institution_id=ids["institution"], name="Service", standard_duration=15),
                Employee(id=ids["employee"], user_id=ids["staff"], institution_id=ids["institution"], employee_status="active"),
                Employee(id=ids["admin_employee"], user_id=ids["admin"], institution_id=ids["institution"], employee_status="active"),
                Employee(id=ids["other_employee"], user_id=ids["outsider"], institution_id=ids["other_institution"], employee_status="active"),
            ])
            await db.flush()
            db.add_all([
                EmployeeService(employee_id=ids["employee"], service_id=ids["service"]),
            ])
    asyncio.run(seed())
    monkeypatch.setattr(security, "SessionLocal", sessions)
    monkeypatch.setattr(realtime, "SessionLocal", sessions)
    monkeypatch.setattr(realtime, "RECONCILE_SECONDS", 0.2)

    async def db_override():
        async with sessions() as db:
            yield db
    app.dependency_overrides[get_db] = db_override
    with TestClient(app) as client:
        yield SimpleNamespace(client=client, ids=ids, tokens=tokens, sessions=sessions,
            session_ids=session_ids, headers=lambda who: {"Authorization": f"Bearer {tokens[who]}"})
    app.dependency_overrides.clear()
    async def cleanup():
        if schema:
            # Usuwany jest tylko losowy schemat utworzony przez tę funkcję testową, nigdy public.
            assert schema.startswith("test_queue_") and len(schema) == 43
            async with engine.begin() as conn:
                await conn.execute(text(f'DROP SCHEMA "{schema}" CASCADE'))
        await engine.dispose()
    asyncio.run(cleanup())
