"""Ograniczony lokalny test obciążenia odczytem; nie zmienia kolejki ani nie wysyła push.

Uruchamiaj z demonstracyjnym API na porcie 8000. Wymaga httpx i websockets.
Tworzy jedną tymczasową sesję i unieważnia ją po zakończeniu.
"""
import asyncio
import json
import math
import time
from collections import Counter

import httpx
import websockets

BASE = "http://127.0.0.1:8000"


def summary(samples):
    ordered = sorted(samples)
    return {"count": len(ordered), "p50_ms": round(ordered[math.ceil(len(ordered)*.5)-1]*1000),
            "p95_ms": round(ordered[math.ceil(len(ordered)*.95)-1]*1000),
            "max_ms": round(ordered[-1]*1000)} if ordered else {"count": 0}


async def main():
    async with httpx.AsyncClient(base_url=BASE, timeout=30) as client:
        login = await client.post('/api/auth/login', json={
            'login': 'client1@example.com', 'password': 'Demo-Queue-2026'})
        login.raise_for_status()
        credentials = login.json()
        token = credentials['access_token']
        user_id = credentials['user_id']
        client.headers['Authorization'] = f'Bearer {token}'
        sockets, socket_times, request_times = [], [], []
        errors = Counter()
        try:
            async def connect():
                start = time.perf_counter()
                try:
                    socket = await websockets.connect(
                        f'{BASE.replace("http", "ws", 1)}/ws/user/{user_id}', open_timeout=30)
                    sockets.append(socket)
                    await socket.send(json.dumps({'type': 'authenticate', 'access_token': token}))
                    snapshot = json.loads(await asyncio.wait_for(socket.recv(), 30))
                    if snapshot.get('type') != 'user_snapshot':
                        raise ValueError('Unexpected snapshot')
                    socket_times.append(time.perf_counter()-start)
                except Exception as error:
                    errors['ws:'+type(error).__name__] += 1
            await asyncio.gather(*(connect() for _ in range(20)))
            gate = asyncio.Semaphore(20)
            paths = ['/api/notifications', f'/api/queue/status/{user_id}', '/api/offers']
            async def request(index):
                async with gate:
                    start = time.perf_counter()
                    try:
                        response = await client.get(paths[index % len(paths)])
                        response.raise_for_status()
                        response.json()
                        request_times.append(time.perf_counter()-start)
                    except Exception as error:
                        errors['http:'+type(error).__name__] += 1
            start = time.perf_counter()
            await asyncio.gather(*(request(i) for i in range(300)))
            duration = time.perf_counter()-start
            print(json.dumps({'http': summary(request_times), 'http_concurrency': 20,
                'http_seconds': round(duration, 2), 'http_requests_per_second': round(len(request_times)/duration, 2),
                'websocket_initial_snapshot': summary(socket_times), 'errors': dict(errors)}, indent=2))
        finally:
            await asyncio.gather(*(socket.close() for socket in sockets), return_exceptions=True)
            response = await client.post('/api/auth/logout')
            response.raise_for_status()


if __name__ == '__main__':
    asyncio.run(main())
