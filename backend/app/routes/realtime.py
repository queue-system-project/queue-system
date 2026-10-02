import asyncio
import logging
from uuid import UUID

import anyio
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.encoders import jsonable_encoder
from sqlalchemy import func, select

from app.access import require_institution, require_self
from app.database.connection import SessionLocal
from app.models.catalog import Service
from app.models.queue import QueueEntry, queue_order
from app.notifications import notification_list
from app.queue_offers import visible_offers
from app.realtime import hub
from app.security import authenticate_access_token

router = APIRouter()
logger = logging.getLogger(__name__)
RECONCILE_SECONDS = 30
SEND_TIMEOUT = 5


async def queue_snapshot(db, target_id, for_user=False):
    from app.queue_queries import ranked_queue
    rows = await db.execute(ranked_queue(target_id, for_user=for_user))
    from datetime import datetime
    return [{key: value.isoformat() + "Z" if isinstance(value, datetime) else value
             for key, value in row.items()} for row in rows.mappings()]


async def receive_token(websocket):
    # Klient natywny może wysłać Authorization; przeglądarka używa pierwszej ramki.
    # Nie umieszczaj tokenów Bearer w parametrach URL (adresy często trafiają do dzienników).
    authorization = websocket.headers.get("authorization", "")
    if authorization:
        scheme, _, token = authorization.partition(" ")
        if scheme.lower() != "bearer" or not token:
            raise HTTPException(401, "Invalid authorization")
        return token
    message = await asyncio.wait_for(websocket.receive_json(), timeout=5)
    if not isinstance(message, dict) or message.get("type") != "authenticate":
        raise HTTPException(401, "Authentication frame required")
    token = message.get("access_token")
    if not isinstance(token, str) or not token or len(token) > 8192:
        raise HTTPException(401, "Invalid access token")
    return token


async def stream(websocket, target_id, for_user):
    await websocket.accept()
    tasks = []
    try:
        token = await receive_token(websocket)
        channel = f"{'user' if for_user else 'service'}:{target_id}"

        async def load():
            # Przed każdą migawką sprawdź wygaśnięcie, wylogowanie i przynależność.
            session = await authenticate_access_token(token)
            user = session["user"]
            async with SessionLocal() as db:
                if for_user:
                    require_self(user, target_id)
                    return {
                        "notifications": await notification_list(db, user.id),
                        "queue": await queue_snapshot(db, user.id, for_user=True),
                        "offers": await visible_offers(db, user_id=user.id),
                    }
                service = await db.get(Service, target_id)
                if service is None:
                    raise HTTPException(404, "Service not found")
                await require_institution(db, user, service.institution_id)
                return await queue_snapshot(db, target_id)

        async def receive():
            # Połączenie nie przyjmuje poleceń zapisu.
            while True:
                await websocket.receive_text()

        # Subskrybuj przed odczytem, aby zachować zmianę z czasu początkowego zapytania.
        with hub.subscribe(channel) as signal:
            async def updates():
                previous = None
                while True:
                    signal.clear()
                    data = jsonable_encoder(await load())
                    if data != previous:
                        await asyncio.wait_for(websocket.send_json({
                            "type": "user_snapshot" if for_user else "queue_snapshot",
                            "data": data,
                        }), timeout=SEND_TIMEOUT)
                        previous = data
                    try:
                        await asyncio.wait_for(signal.wait(), timeout=RECONCILE_SECONDS)
                    except TimeoutError:
                        pass

            tasks = [asyncio.create_task(updates()), asyncio.create_task(receive())]
            done, _ = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            for task in done:
                task.result()
    except (HTTPException, ValueError, TimeoutError):
        await websocket.close(code=1008)
    except (WebSocketDisconnect, OSError):
        pass
    except asyncio.CancelledError:
        # Serwer ASGI może anulować zerwane połączenie podczas odczytu bazy.
        pass
    except Exception:
        logger.exception("Realtime stream failed")
        try:
            await websocket.close(code=1011)
        except (RuntimeError, OSError):
            pass
    finally:
        with anyio.CancelScope(shield=True):
            for task in tasks:
                task.cancel()
            await asyncio.gather(*tasks, return_exceptions=True)


@router.websocket("/ws/user/{user_id}")
async def user_websocket(websocket: WebSocket, user_id: UUID):
    await stream(websocket, user_id, True)


@router.websocket("/ws/queue/{service_id}")
async def queue_websocket(websocket: WebSocket, service_id: UUID):
    await stream(websocket, service_id, False)
