import asyncio
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from uuid import UUID
import pytest
from sqlalchemy import select
from app.models.offers import OfferWindow, QueueOffer
from app.models.queue import QueueEntry
from app.models.catalog import Service
from app.queue_offers import advance
from test_queue_timing import join


def cancel(env, entry, who="alice"):
    result = env.client.post("/api/queue/cancel", headers=env.headers(who), json={
        "user_id": str(env.ids[who]), "queue_entry_id": entry["id"]})
    assert result.status_code == 200, result.text


def prepare(env, monkeypatch, with_bob=True):
    monkeypatch.setenv("QUEUE_OFFERS_ENABLED", "1")
    first = join(env)
    second = join(env, "bob") if with_bob else None
    cancel(env, first)
    offers = env.client.get("/api/offers", headers=env.headers("bob")).json()
    return second, offers


def test_urgent_private_acceptance_and_retry(env, monkeypatch):
    second, offers = prepare(env, monkeypatch)
    offer = offers["urgent"][0]
    path = f"/api/offers/urgent/{offer['id']}/respond"
    assert env.client.post(path, headers=env.headers("alice"), json={"accept":True}).status_code == 404
    response = env.client.post(path, headers=env.headers("bob"), json={"accept":True,"minutes":5})
    assert response.status_code == 200, response.text
    assert response.json()["status"] == "confirmed"
    assert response.json()["estimated_wait_time"] == 5
    repeat = env.client.post(path, headers=env.headers("bob"), json={"accept":True,"minutes":5})
    assert repeat.json()["arrival_time"] == response.json()["arrival_time"]
    assert env.client.post(path, headers=env.headers("bob"), json={"accept":True,"minutes":10}).status_code == 409


def test_decline_opens_last_minute_and_claim_moves_ahead(env, monkeypatch):
    second, offers = prepare(env, monkeypatch)
    offer = offers["urgent"][0]
    decline = env.client.post(f"/api/offers/urgent/{offer['id']}/respond",
        headers=env.headers("bob"), json={"accept":False})
    assert decline.status_code == 200
    windows = env.client.get(f"/api/offers/last-minute/{env.ids['service']}", headers=env.headers("alice")).json()
    assert len(windows) == 1
    path = f"/api/offers/last-minute/{windows[0]['id']}/accept"
    response = env.client.post(path, headers=env.headers("alice"))
    assert response.status_code == 200, response.text
    assert response.json()["queue_position"] == 1
    repeat = env.client.post(path, headers=env.headers("alice"))
    assert repeat.json()["id"] == response.json()["id"]
    assert env.client.post(path, headers=env.headers("bob")).status_code == 409
    status = env.client.get(f"/api/queue/status/{env.ids['bob']}",headers=env.headers("bob")).json()[0]
    assert status["queue_position"] == 2


def test_expired_urgent_is_rejected_and_last_minute_expires(env, monkeypatch):
    second, offers = prepare(env, monkeypatch)
    offer = offers["urgent"][0]
    async def expire():
        async with env.sessions.begin() as db:
            row = await db.get(QueueOffer, UUID(offer["id"]))
            row.expires_at = datetime.utcnow() - timedelta(seconds=1)
    asyncio.run(expire())
    assert env.client.post(f"/api/offers/urgent/{offer['id']}/respond",headers=env.headers("bob"),
                           json={"accept":True}).status_code == 409
    async def check():
        async with env.sessions.begin() as db:
            service = await db.get(Service, env.ids["service"])
            await advance(db, service)
            row = await db.get(OfferWindow, UUID(offer["window_id"]))
            assert row.phase == "last_minute"
            row.expires_at = datetime.utcnow() - timedelta(seconds=1)
            await advance(db, service)
            assert row.status == "expired"
    asyncio.run(check())


def test_last_minute_requires_client_and_auth(env, monkeypatch):
    prepare(env, monkeypatch, with_bob=False)
    windows = env.client.get(f"/api/offers/last-minute/{env.ids['service']}",headers=env.headers("alice")).json()
    path = f"/api/offers/last-minute/{windows[0]['id']}/accept"
    assert env.client.post(path).status_code == 401
    assert env.client.post(path,headers=env.headers("staff")).status_code == 403


def test_offer_claim_rollback_leaves_window_available(env, monkeypatch):
    _, offers = prepare(env, monkeypatch)
    offer = offers["urgent"][0]
    from app.routes import offers as routes
    async def fail(*args, **kwargs):
        raise RuntimeError("notification failed")
    monkeypatch.setattr(routes, "queue_changed", fail)
    with pytest.raises(RuntimeError):
        env.client.post(f"/api/offers/urgent/{offer['id']}/respond",headers=env.headers("bob"),json={"accept":True})
    async def check():
        async with env.sessions() as db:
            assert (await db.get(OfferWindow,UUID(offer["window_id"]))).status == "active"
            assert (await db.get(QueueEntry,UUID(offer["queue_entry_id"]))).status == "waiting"
    asyncio.run(check())


def test_postgres_last_minute_has_exactly_one_winner(env, monkeypatch):
    if env.sessions.kw["bind"].dialect.name != "postgresql":
        pytest.skip("Requires PostgreSQL row locks")
    prepare(env, monkeypatch, with_bob=False)
    window = env.client.get(f"/api/offers/last-minute/{env.ids['service']}",headers=env.headers("alice")).json()[0]
    def claim(who):
        return env.client.post(f"/api/offers/last-minute/{window['id']}/accept",headers=env.headers(who)).status_code
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(claim, ["alice", "bob"]))
    assert sorted(results) == [200,409]


def test_decline_passes_to_next_waiting_client(env, monkeypatch):
    from app.models.users import User
    async def make_client():
        async with env.sessions.begin() as db:
            (await db.get(User, env.ids["outsider"])).role = "client"
    asyncio.run(make_client())
    monkeypatch.setenv("QUEUE_OFFERS_ENABLED", "1")
    first = join(env)
    join(env, "bob")
    third = join(env, "outsider")
    cancel(env, first)
    offer = env.client.get("/api/offers",headers=env.headers("bob")).json()["urgent"][0]
    result = env.client.post(f"/api/offers/urgent/{offer['id']}/respond",headers=env.headers("bob"),json={"accept":False})
    assert result.status_code == 200
    next_offer = env.client.get("/api/offers",headers=env.headers("outsider")).json()["urgent"][0]
    assert next_offer["queue_entry_id"] == third["id"]
    assert next_offer["window_id"] == offer["window_id"]


def test_disabled_arrival_option_and_empty_queue_window_expiry(env, monkeypatch):
    from app.models.settings import SystemSettings
    from app.timer_worker import tick
    _, offers = prepare(env, monkeypatch)
    async def settings():
        async with env.sessions.begin() as db:
            db.add(SystemSettings(institution_id=env.ids["institution"],urgent_offer_5_enabled=False))
    asyncio.run(settings())
    offer = offers["urgent"][0]
    result = env.client.post(f"/api/offers/urgent/{offer['id']}/respond",headers=env.headers("bob"),json={"accept":True,"minutes":5})
    assert result.status_code == 409
    updated = env.client.get("/api/offers",headers=env.headers("bob")).json()["urgent"][0]
    assert 5 not in updated["options"]
    cancel(env, {"id":offer["queue_entry_id"]}, "bob")
    async def expire():
        await tick(env.sessions,datetime.utcnow()+timedelta(hours=1))
        async with env.sessions() as db:
            assert (await db.get(OfferWindow,UUID(offer["window_id"]))).status == "expired"
    asyncio.run(expire())
