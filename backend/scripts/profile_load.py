"""Uruchom tymczasowe lokalne API i zmierz ograniczone obciążenie bez zapisów timerów.

Uruchom z katalogu backend: python -m scripts.profile_load
Używa lokalnej bazy demonstracyjnej; load_check tworzy i unieważnia sesję testową.
Opcja --app-root pozwala porównać archiwalną implementację aplikacji.
"""
import argparse
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--app-root', type=Path)
    parser.add_argument('--rounds', type=int, default=2, choices=range(1, 6))
    args = parser.parse_args()
    load_dotenv(Path(__file__).resolve().parents[1] / '.env')
    os.environ['QUEUE_TIMERS_ENABLED'] = '0'
    os.environ['QUEUE_OFFERS_ENABLED'] = '0'
    from sqlalchemy.engine import make_url
    url = make_url(os.environ['DATABASE_URL'])
    if url.host not in ('127.0.0.1', 'localhost') or url.database != 'queue_system_local':
        raise SystemExit('Profiling is restricted to the local demo database')
    if args.app_root:
        sys.path.insert(0, str(args.app_root.resolve()))
    from app.database.connection import engine
    from app.main import app
    from scripts import load_check
    from sqlalchemy import event
    import uvicorn
    opened = 0
    statements = 0
    @event.listens_for(engine.sync_engine, 'connect')
    def connection_created(dbapi, record):
        nonlocal opened
        opened += 1
    @event.listens_for(engine.sync_engine, 'before_cursor_execute')
    def query_started(conn, cursor, statement, parameters, context, many):
        nonlocal statements
        statements += 1
    async def run():
        server = uvicorn.Server(uvicorn.Config(app, host='127.0.0.1', port=8001,
                                             access_log=False, log_level='error'))
        task = asyncio.create_task(server.serve())
        try:
            while not server.started:
                if task.done(): await task
                await asyncio.sleep(.1)
            load_check.BASE = 'http://127.0.0.1:8001'
            for round_number in range(args.rounds):
                before = statements
                print('Round:', round_number + 1, flush=True)
                await load_check.main()
                print('Physical DB connections:', opened, 'SQL statements:', statements-before, flush=True)
        finally:
            server.should_exit = True
            await task
            await engine.dispose()
    asyncio.run(run())


if __name__ == '__main__':
    main()
