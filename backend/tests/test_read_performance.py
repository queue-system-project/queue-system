import asyncio
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt
import pytest
from sqlalchemy import event, select, update

from app import security
from app.database.connection import pool_options
from app.models.catalog import Service
from app.models.queue import QueueEntry
from app.models.users import User
from app.models.offers import OfferWindow, QueueOffer
from app.models.settings import SystemSettings
from app.queue_offers import visible_offers
from app.queue_queries import ranked_queue
from conftest import sessions_table


def test_auth_checks_session_owner_expiry_and_current_user_activity(env):
    payload = jwt.decode(env.tokens['alice'], security.JWT_SECRET, algorithms=['HS256'])
    payload['sub'] = str(env.ids['bob'])
    wrong_owner = jwt.encode(payload, security.JWT_SECRET, algorithm='HS256')
    assert env.client.get('/api/notifications', headers={'Authorization': f'Bearer {wrong_owner}'}).status_code == 401

    async def active(value):
        async with env.sessions.begin() as db:
            await db.execute(update(User).where(User.id == env.ids['alice']).values(is_active=value))
    asyncio.run(active(False))
    assert env.client.get('/api/notifications', headers=env.headers('alice')).status_code == 401
    asyncio.run(active(True))
    assert env.client.get('/api/notifications', headers=env.headers('alice')).status_code == 200
    async def expire():
        async with env.sessions.begin() as db:
            await db.execute(update(sessions_table).where(sessions_table.c.id == env.session_ids['alice']).values(expires_at=datetime.utcnow()-timedelta(seconds=1)))
    asyncio.run(expire())
    assert env.client.get('/api/notifications', headers=env.headers('alice')).status_code == 401


def test_scoped_ranking_keeps_other_clients_ahead_and_excludes_other_services(env):
    async def scenario():
        now = datetime.utcnow()
        async with env.sessions.begin() as db:
            unrelated = Service(id=uuid4(), institution_id=env.ids['institution'], name='Other', standard_duration=15)
            db.add(unrelated)
            await db.flush()
            first = QueueEntry(id=uuid4(), client_id=env.ids['bob'], institution_id=env.ids['institution'], service_id=env.ids['service'], status='waiting', created_at=now-timedelta(minutes=2))
            mine = QueueEntry(id=uuid4(), client_id=env.ids['alice'], institution_id=env.ids['institution'], service_id=env.ids['service'], status='waiting', created_at=now)
            db.add_all([first, mine, QueueEntry(client_id=env.ids['bob'], institution_id=env.ids['institution'], service_id=unrelated.id, status='waiting', created_at=now-timedelta(minutes=5))])
        async with env.sessions() as db:
            own = (await db.execute(ranked_queue(env.ids['alice'], for_user=True))).mappings().all()
            staff = (await db.execute(ranked_queue(env.ids['service']))).mappings().all()
            assert len(own) == 1 and own[0]['queue_position'] == 2
            assert [row['id'] for row in staff] == [first.id, mine.id]
        response = env.client.get(f"/api/queue/status/{env.ids['alice']}", headers=env.headers('alice'))
        assert response.status_code == 200 and response.json()[0]['queue_position'] == 2
    asyncio.run(scenario())


def test_offer_list_query_count_does_not_grow_with_offers(env):
    async def scenario():
        now = datetime.utcnow()
        async with env.sessions.begin() as db:
            db.add(SystemSettings(institution_id=env.ids['institution'], urgent_offer_5_enabled=False))
            for i in range(4):
                service = Service(id=uuid4(), institution_id=env.ids['institution'], name=f'S{i}', standard_duration=15)
                db.add(service)
                await db.flush()
                entry = QueueEntry(id=uuid4(), client_id=env.ids['alice'], institution_id=env.ids['institution'], service_id=service.id, status='waiting')
                db.add(entry)
                await db.flush()
                window = OfferWindow(id=uuid4(), service_id=service.id, source_entry_id=entry.id, source_event=str(uuid4()), expires_at=now+timedelta(minutes=2))
                db.add(window)
                await db.flush()
                db.add(QueueOffer(window_id=window.id, queue_entry_id=entry.id, expires_at=window.expires_at))
        statements = []
        engine = env.sessions.kw['bind'].sync_engine
        def record(conn, cursor, statement, parameters, context, many):
            statements.append(statement)
        event.listen(engine, 'before_cursor_execute', record)
        try:
            async with env.sessions() as db:
                result = await visible_offers(db, user_id=env.ids['alice'])
            assert len(result['urgent']) == 4
            assert all(offer['options'] == [0, 10, 15] for offer in result['urgent'])
            assert len(statements) == 2
        finally:
            event.remove(engine, 'before_cursor_execute', record)
    asyncio.run(scenario())


def test_pool_configuration_cannot_accidentally_enable_unbounded_connections(monkeypatch):
    monkeypatch.setenv('DB_POOL_SIZE', '0')
    with pytest.raises(ValueError): pool_options('postgresql+asyncpg://localhost/test')
    monkeypatch.setenv('DB_POOL_SIZE', '5')
    monkeypatch.setenv('DB_MAX_OVERFLOW', '-1')
    with pytest.raises(ValueError): pool_options('postgresql+asyncpg://localhost/test')
    assert pool_options('sqlite+aiosqlite:///:memory:') == {}
