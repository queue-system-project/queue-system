import hashlib
import os
import secrets

from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

import jwt

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text, bindparam, Uuid, DateTime, select

from app.database.connection import SessionLocal
from app.models.users import User


load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET or len(JWT_SECRET) < 32:
    raise RuntimeError("Set a long random JWT_SECRET in backend/.env")

JWT_ALGORITHM = "HS256"
ACCESS_MINUTES = 15
REFRESH_DAYS = 7

bearer = HTTPBearer(auto_error=False)


def unauthorized():
    return HTTPException(
        status_code=401,
        detail="Authentication required or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )


def hash_token(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


def build_tokens(user, session_id, refresh_token):
    now = datetime.now(timezone.utc)

    access_token = jwt.encode(
        {
            "sub": str(user.id),
            "sid": str(session_id),
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=ACCESS_MINUTES),
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )

    return {
        "message": "Authentication successful",
        "user_id": str(user.id),
        "role": user.role,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_MINUTES * 60,
    }


async def create_session(db, user):
    session_id = uuid4()
    refresh_token = secrets.token_urlsafe(48)
    now = datetime.utcnow()

    # Jawne typy parametrów zachowują UUID i daty przy zapisie sesji w obu silnikach testowych.
    await db.execute(
        text("""
            INSERT INTO refresh_tokens (
                id, user_id, token, expires_at, created_at
            )
            VALUES (
                :id, :user_id, :token, :expires_at, :created_at
            )
        """).bindparams(bindparam("id", type_=Uuid), bindparam("user_id", type_=Uuid),
                         bindparam("expires_at", type_=DateTime), bindparam("created_at", type_=DateTime)),
        {
            "id": session_id,
            "user_id": user.id,
            "token": hash_token(refresh_token),
            "expires_at": now + timedelta(days=REFRESH_DAYS),
            "created_at": now,
        },
    )

    return build_tokens(user, session_id, refresh_token)


async def get_current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
):
    if credentials is None:
        raise unauthorized()

    return await authenticate_access_token(credentials.credentials)


async def authenticate_access_token(token: str):
    """Wspólna weryfikacja sesji dla HTTP i WebSocket."""

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={
                "require": ["sub", "sid", "type", "iat", "exp"],
            },
        )

        if payload["type"] != "access":
            raise unauthorized()

        user_id = UUID(payload["sub"])
        session_id = UUID(payload["sid"])

    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise unauthorized()

    # Окрема сесія БД, щоб не заважати db.begin()
    # у наявних маршрутах черги та візитів.
    async with SessionLocal() as db:
        # Jedno zapytanie zastępuje osobne odczyty sesji i użytkownika;
        # nadal sprawdza wylogowanie, wygaśnięcie i aktywność konta przy każdym użyciu.
        active_session = text("""
                EXISTS (SELECT 1
                FROM refresh_tokens
                WHERE id = :session_id
                  AND user_id = :user_id
                  AND expires_at > :now)
            """).bindparams(
                bindparam("session_id", type_=Uuid),
                bindparam("user_id", type_=Uuid),
                bindparam("now", type_=DateTime),
            )
        user = await db.scalar(
            select(User).where(User.id == user_id, User.is_active.is_(True), active_session),
            {
                "session_id": session_id,
                "user_id": user_id,
                "now": datetime.utcnow(),
            },
        )

        if user is None:
            raise unauthorized()

    return {
        "session_id": session_id,
        "user": user,
    }


async def get_current_user(
    session=Depends(get_current_session),
):
    return session["user"]


def require_roles(*allowed_roles):
    async def check_role(user=Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Insufficient permissions",
            )

        return user

    return check_role
