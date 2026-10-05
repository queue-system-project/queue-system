import random
import hashlib

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.schemas.users import UserResponse
from app.database.connection import SessionLocal
from app.models.users import User
from app.schemas.users import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    VerifyRequest,
    VerifyResponse,
    VerifyResetCodeRequest,
    VerifyResetCodeResponse,
    ResetPasswordRequest,
    ResetPasswordResponse
)
from uuid import UUID
from app.schemas.users import (
    CompleteProfileRequest,
    UpdateLanguageRequest,
    UserUpdateResponse,
)
import secrets
from datetime import datetime

from app.schemas.users import RefreshTokenRequest
from app.security import (
    create_session,
    build_tokens,
    hash_token,
    get_current_session,
    get_current_user,
    unauthorized,
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])
users_router = APIRouter(prefix="/api/users", tags=["Users"])

# # Test endpoint for checking database connection
# @router.get("/create-user")
# async def create_user():
#     async with SessionLocal() as db:

#         new_user = User(
#             email=f"test{random.randint(1,99999)}@gmail.com",
#             first_name="Mariana",
#             last_name="Test",
#             password_hash="test123",
#             role="client",
#             language="en",
#             is_verified=False,
#             verification_code="1234",
#             is_active=True
#         )
# # Add user to the database
#         db.add(new_user)
#         await db.commit()

#         # Refresh object after saving
#         await db.refresh(new_user)

#         return {
#             "message": "User created",
#             "id": str(new_user.id),
#             "email": new_user.email
#         }

async def get_db():
    async with SessionLocal() as db:
        yield db


# Hash user password before storing it in the database
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# Generate a 4-digit verification code
def generate_verification_code() -> str:
    return str(random.randint(1000, 9999))


# Endpoint register
@router.post("/register", response_model=RegisterResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    conditions = []

    if data.email:
        conditions.append(User.email == data.email)

    if data.phone:
        conditions.append(User.phone == data.phone)

    result = await db.execute(select(User).where(or_(*conditions)))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    verification_code = generate_verification_code()
    # Create new user object
    new_user = User(
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="client",
        language="en",
        is_verified=False,
        verification_code=verification_code,
        is_active=True
    )
# Save&refresh
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(new_user.id),
        "verification_code": verification_code
    }
def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


#Endpoint Login
@router.post("/login", response_model=LoginResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(
            or_(
                User.email == data.login,
                User.phone == data.login,
            )
        )
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User is inactive"
        )

    tokens = await create_session(db, user)
    await db.commit()

    return tokens

@router.post("/verify", response_model=VerifyResponse)
async def verify(data: VerifyRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            or_(User.email == data.login, User.phone == data.login)
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user.is_verified = True
    user.verification_code = None

    await db.commit()
    await db.refresh(user)

    return {
        "message": "User verified successfully",
        "user_id": str(user.id)
    }

# Endpoint forgot-password
@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            or_(User.email == data.login, User.phone == data.login)
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    verification_code = generate_verification_code()

    user.verification_code = verification_code

    await db.commit()
    await db.refresh(user)

    return {
        "message": "Verification code generated successfully",
        "verification_code": verification_code
    }

# Endpoint verify-reset-code
@router.post("/verify-reset-code", response_model=VerifyResetCodeResponse)
async def verify_reset_code(data: VerifyResetCodeRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            or_(User.email == data.login, User.phone == data.login)
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.verification_code != data.code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    return {
        "message": "Verification code is correct"
    }

# Endpoint reset-password
@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).where(
            or_(User.email == data.login, User.phone == data.login)
        )
    )

    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.verification_code != data.verification_code:
        raise HTTPException(status_code=400, detail="Invalid verification code")

    user.password_hash = hash_password(data.new_password)
    user.verification_code = None

    await db.commit()
    await db.refresh(user)

    return {
        "message": "Password reset successfully"
    }
@users_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You cannot view this profile",
        )

    user = await db.get(User, user_id)

    if user is None:
        raise HTTPException(404, "User not found")

    return {
        "id": user.id,
        "email": user.email,
        "phone": user.phone,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "profile_image": user.profile_image,
        "role": user.role,
        "language": user.language,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
    }

@users_router.put(
    "/complete-profile",
    response_model=UserUpdateResponse,
)
async def complete_profile(
    data: CompleteProfileRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == data.user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.first_name = data.first_name
    user.last_name = data.last_name

    await db.commit()

    return {
        "message": "Profile updated successfully",
        "user_id": user.id,
    }


@users_router.put(
    "/language",
    response_model=UserUpdateResponse,
)
async def update_language(
    data: UpdateLanguageRequest,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User).where(User.id == data.user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    user.language = data.language

    await db.commit()

    return {
        "message": "Language updated successfully",
        "user_id": user.id,
    }


@router.post("/refresh", response_model=LoginResponse)
async def refresh_tokens(
    data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        result = await db.execute(
            text("""
                SELECT id, user_id, expires_at
                FROM refresh_tokens
                WHERE token = :token
                  AND expires_at > :now
                FOR UPDATE
            """),
            {
                "token": hash_token(data.refresh_token),
                "now": datetime.utcnow(),
            },
        )

        session = result.mappings().first()

        if session is None:
            raise unauthorized()

        user = await db.get(User, session["user_id"])

        if user is None or not user.is_active:
            raise unauthorized()

        new_refresh_token = secrets.token_urlsafe(48)

        await db.execute(
            text("""
                UPDATE refresh_tokens
                SET token = :token
                WHERE id = :session_id
            """),
            {
                "token": hash_token(new_refresh_token),
                "session_id": session["id"],
            },
        )

        tokens = build_tokens(
            user,
            session["id"],
            new_refresh_token,
        )

    return tokens


@router.post("/logout")
async def logout(
    session=Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        text("""
            DELETE FROM refresh_tokens
            WHERE id = :session_id
              AND user_id = :user_id
        """),
        {
            "session_id": session["session_id"],
            "user_id": session["user"].id,
        },
    )
    await db.commit()

    return {"message": "Logged out successfully"}