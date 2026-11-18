"""Kody związane z kanałem, odbiorcą i celem; operacje wymagają blokady użytkownika."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy import select, or_, text, bindparam, Uuid
from app.models.users import User
from app.models.auth_challenges import AuthChallenge
from app.core.security import JWT_SECRET
from app.core.passwords import hash_password
from app.core import mail, sms


def digest(user_id, purpose, code):
    return hmac.new(JWT_SECRET.encode(), f"{user_id}:{purpose}:{code}".encode(), hashlib.sha256).hexdigest()


def contact(user, channel=None, login=None):
    if login is not None:
        if login == user.email:
            channel = "email"
        elif login == user.phone:
            channel = "sms"
        else:
            raise HTTPException(422, "Contact is not attached to this account")
    if channel is None:
        if user.email and user.phone:
            raise HTTPException(422, "Choose email or sms verification")
        channel = "email" if user.email else "sms"
    recipient = user.email if channel == "email" else user.phone
    if not recipient:
        raise HTTPException(422, "Selected contact is missing")
    return channel, recipient


def contact_verified(user, channel):
    value = user.email_verified_at if channel == "email" else user.phone_verified_at
    # Zgodność ze starszymi kontami mającymi dokładnie jeden kontakt.
    sole = bool(user.email) != bool(user.phone)
    return value is not None or (user.is_verified and sole)


async def issue(db, user, purpose, *, channel=None, login=None):
    channel, recipient = contact(user, channel, login)
    now = datetime.utcnow()
    row = await db.get(AuthChallenge, (user.id, purpose))
    if row and row.sent_at > now - timedelta(seconds=60):
        raise HTTPException(429, "Wait before requesting another code")
    # Nie pozwalamy współdzielić weryfikacji SMS między różnymi celami.
    # Twilio może ponownie zwrócić aktywny kod dla tego samego numeru.
    pending = list((await db.scalars(select(AuthChallenge).where(
        AuthChallenge.user_id == user.id, AuthChallenge.channel == "sms"))).all())
    for previous in pending:
        if previous is row or channel == "sms":
            if previous.provider_sid:
                await sms.cancel_code(previous.provider_sid)
            if previous is not row:
                await db.delete(previous)
    if row is None:
        row = AuthChallenge(user_id=user.id, purpose=purpose)
        db.add(row)
    row.channel, row.recipient = channel, recipient
    row.provider_sid = None
    row.sent_at = now
    row.expires_at = now + timedelta(minutes=10)
    row.attempts = 0
    if channel == "email":
        code = f"{secrets.randbelow(10000):04d}"
        row.code_hash = digest(user.id, purpose, code)
        await mail.send_code(recipient, code, purpose, user.language)
    else:
        row.code_hash = "twilio_verify"
        row.provider_sid = await sms.send_code(recipient, None, purpose, user.language)
    await db.flush()


async def check(db, login, code, purpose, *, consume=False, new_password=None):
    async with db.begin():
        user = await db.scalar(select(User).where(or_(User.email == login, User.phone == login)).with_for_update())
        if not user or not user.is_active:
            return None
        row = await db.get(AuthChallenge, (user.id, purpose))
        if not row or row.expires_at <= datetime.utcnow() or row.attempts >= 5:
            return None
        channel, recipient = contact(user, login=login)
        # Kod z jednego kanału nie może potwierdzić drugiego kontaktu.
        if row.channel != channel or row.recipient != recipient:
            return None
        if purpose == "reset" and not contact_verified(user, channel):
            return None
        if channel == "sms" and row.code_hash == "twilio_verify":
            if not row.provider_sid:
                return None
            valid = await sms.check_code(row.provider_sid, code)
            if valid:
                # Twilio zużywa weryfikację już przy pierwszym approved.
                # Lokalny skrót pozwala dokończyć reset bez drugiej kontroli dostawcy.
                row.code_hash = digest(user.id, purpose, code)
        else:
            valid = hmac.compare_digest(row.code_hash, digest(user.id, purpose, code))
        if not valid:
            row.attempts += 1
            return None
        if consume:
            await db.delete(row)
            user.verification_code = None
            if purpose == "verify":
                user.is_verified = True
                if channel == "email":
                    user.email_verified_at = datetime.utcnow()
                else:
                    user.phone_verified_at = datetime.utcnow()
            if new_password is not None:
                user.password_hash = hash_password(new_password)
                await db.execute(text("DELETE FROM refresh_tokens WHERE user_id=:uid").bindparams(
                    bindparam("uid", type_=Uuid)), {"uid": user.id})
        return user.id
