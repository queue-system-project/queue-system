"""Łączenie sygnałów odświeżenia w jednym procesie po zatwierdzeniu transakcji.

Uruchamiaj jeden proces ASGI. To nie jest trwały dziennik zdarzeń: połączenia
pobierają nową migawkę przy starcie i okresowo uzgadniają stan z bazą.
"""
import asyncio
from collections import defaultdict
from contextlib import contextmanager

from sqlalchemy import event
from sqlalchemy.orm import Session


class Hub:
    def __init__(self):
        self.listeners = defaultdict(set)

    @contextmanager
    def subscribe(self, *channels):
        signal = asyncio.Event()
        for channel in channels:
            self.listeners[channel].add(signal)
        try:
            yield signal
        finally:
            for channel in channels:
                self.listeners[channel].discard(signal)
                if not self.listeners[channel]:
                    del self.listeners[channel]

    def publish(self, channels):
        for channel in channels:
            for signal in tuple(self.listeners.get(channel, ())):
                signal.set()


hub = Hub()


def changed(db, *channels):
    db.info.setdefault("realtime_channels", set()).update(channels)


@event.listens_for(Session, "after_commit")
def committed(session):
    # Zwolnienie punktu zapisu nie oznacza trwałego zatwierdzenia transakcji.
    if not session.in_nested_transaction():
        hub.publish(session.info.pop("realtime_channels", set()))


@event.listens_for(Session, "after_rollback")
def rolled_back(session):
    session.info.pop("realtime_channels", None)
