"""Oddzielne kody rejestracji i resetu, limit prób i jednorazowe wykorzystanie."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy import select, or_, text, bindparam, Uuid
from app.models.users import User
from app.models.auth_challenges import AuthChallenge
from app.security import JWT_SECRET
from app.passwords import hash_password
from app import mail


def digest(user_id, purpose, code):
    return hmac.new(JWT_SECRET.encode(), f"{user_id}:{purpose}:{code}".encode(), hashlib.sha256).hexdigest()


async def issue(db, user, purpose):
    if not user.email:
        raise HTTPException(422, "An email address is required for email verification")
    now = datetime.utcnow()
    row = await db.get(AuthChallenge, (user.id, purpose))
    if row and row.sent_at > now - timedelta(seconds=60):
        raise HTTPException(429, "Wait before requesting another code")
    code = f"{secrets.randbelow(10000):04d}"
    if row is None:
        row = AuthChallenge(user_id=user.id, purpose=purpose)
        db.add(row)
    row.code_hash, row.expires_at, row.sent_at, row.attempts = digest(user.id, purpose, code), now + timedelta(minutes=10), now, 0
    await mail.send_code(user.email, code, purpose, user.language)
    await db.flush()


async def check(db, login, code, purpose, *, consume=False, new_password=None):
    # Błędna próba jest zatwierdzana przed odpowiedzią HTTP, aby rollback jej nie usuwał.
    async with db.begin():
        user = await db.scalar(select(User).where(or_(User.email == login, User.phone == login)).with_for_update())
        if not user or not user.is_active:
            return None
        row = await db.get(AuthChallenge, (user.id, purpose))
        if not row or row.expires_at <= datetime.utcnow() or row.attempts >= 5:
            return None
        if not hmac.compare_digest(row.code_hash, digest(user.id, purpose, code)):
            row.attempts += 1
            return None
        if consume:
            await db.delete(row)
            user.verification_code = None
            user.is_verified = True
            if new_password is not None:
                user.password_hash = hash_password(new_password)
                await db.execute(text("DELETE FROM refresh_tokens WHERE user_id=:uid").bindparams(
                    bindparam("uid", type_=Uuid)), {"uid": user.id})
        return user.id
