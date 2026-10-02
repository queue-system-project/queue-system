"""Osobno uruchamiany proces Firebase. Start API nie wywołuje usług chmurowych.

    python -m app.push_worker --once
    python -m app.push_worker

Ustaw GOOGLE_APPLICATION_CREDENTIALS poza repozytorium. Dostarczanie może się
powtarzać: odbiorcy powinni usuwać duplikaty według notification_id.
"""
import argparse
import asyncio
import logging
from datetime import datetime, timedelta

from sqlalchemy import select, text, bindparam, Uuid, DateTime

from app.database.connection import SessionLocal
from app.models.users import User  # rejestracja metadanych kluczy obcych
from app.models.notifications import Notification
from app.models.push import PushJob, PushToken

logger = logging.getLogger(__name__)


class FirebaseGateway:
    def __init__(self):
        import firebase_admin
        from firebase_admin import messaging
        self.messaging = messaging
        self.app = firebase_admin.initialize_app(options={"httpTimeout": 10})

    async def send(self, token, notification):
        message = self.messaging.Message(
            token=token,
            notification=self.messaging.Notification(
                title=notification.title[:100], body=notification.message[:500],
            ),
            data={"notification_id": str(notification.id), "type": "notification.created"},
        )
        try:
            await asyncio.to_thread(self.messaging.send, message, app=self.app)
        except self.messaging.UnregisteredError:
            return False  # aplikacja została odinstalowana albo token wygasł
        return True


async def process_one(sessions, gateway, now=None):
    now = now or datetime.utcnow()
    async with sessions.begin() as db:
        job = await db.scalar(select(PushJob).where(
            PushJob.status == "pending", PushJob.available_at <= now,
        ).order_by(PushJob.available_at, PushJob.notification_id)
         .with_for_update(skip_locked=True).limit(1))
        if job is None:
            return False
        notification = await db.get(Notification, job.notification_id)
        user = await db.get(User, notification.user_id)
        if user is None or not user.is_active:
            job.status = "inactive_user"
            return True
        # Blokuj rejestracje na czas wysyłki, szeregując przeniesienie i usunięcie tokenu.
        tokens = (await db.scalars(select(PushToken).where(
            PushToken.user_id == notification.user_id,
        ).order_by(PushToken.id).with_for_update())).all()
        if not tokens:
            job.status = "no_devices"
            return True
        job.attempts += 1
        failures = []
        delivered = 0
        for device in tokens:
            active_session = await db.scalar(text("""
                SELECT id FROM refresh_tokens
                WHERE id = :session_id AND user_id = :user_id AND expires_at > :now
            """).bindparams(
                bindparam("session_id", type_=Uuid), bindparam("user_id", type_=Uuid),
                bindparam("now", type_=DateTime),
            ), {"session_id": device.session_id, "user_id": notification.user_id, "now": now})
            if active_session is None:
                await db.delete(device)
                continue
            try:
                valid = await gateway.send(device.token, notification)
                if not valid:
                    await db.delete(device)
                else:
                    delivered += 1
            except Exception as exc:
                # Zapisuj typ wyjątku, a nie odpowiedzi chmury zawierające tokeny.
                failures.append(type(exc).__name__)
        if failures:
            job.last_error = failures[0][:100]
            job.status = "failed" if job.attempts >= 3 else "pending"
            job.available_at = now + timedelta(seconds=30 * 2 ** (job.attempts - 1))
            logger.warning("Push job %s failed on attempt %s (%s)", job.notification_id,
                           job.attempts, job.last_error)
        else:
            job.status = "sent" if delivered else "no_devices"
            job.last_error = None
        return True


async def run(once=False):
    gateway = FirebaseGateway()
    while True:
        found = await process_one(SessionLocal, gateway)
        if once:
            return
        if not found:
            await asyncio.sleep(2)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--once", action="store_true", help="Process at most one due job")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run(args.once))
