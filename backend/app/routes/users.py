from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from app.schemas.users import UserResponse
from app.database.connection import SessionLocal
from app.models.users import User
from app.access import require_self
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


# PBKDF2 zastępuje lokalne SHA-256, zachowując weryfikację i migrację starszych haseł.
# Kody z terminem ważności i limitem prób zastępują pole users.verification_code.
from app.passwords import hash_password, verify_password
from app.auth_codes import issue, check
from app import mail


# Endpoint register
@router.post("/register", response_model=RegisterResponse)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if not data.email or not data.accept_terms:
        raise HTTPException(422, "Email and accepted terms are required")
    # Rejestracja wymaga poczty; brak konfiguracji nie może tworzyć kont bez drogi potwierdzenia.
    mail.smtp_config()
    conditions = []

    if data.email:
        conditions.append(User.email == data.email)

    if data.phone:
        conditions.append(User.phone == data.phone)

    result = await db.execute(select(User).where(or_(*conditions)))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create new user object
    new_user = User(
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
        role="client",
        language="en",
        is_verified=False,
        verification_code=None,
        is_active=True
    )
# Save&refresh
    db.add(new_user)
    # Konto i skrót kodu zapisujemy razem; kod trafia tylko do emaila, nigdy do odpowiedzi API.
    try:
        await db.flush()
        await issue(db, new_user, "verify")
        await db.commit()
    # Równoczesne rejestracje tego samego kontaktu kończą się konfliktem zamiast błędem serwera.
    except IntegrityError:
        await db.rollback()
        raise HTTPException(409, "User already exists") from None
    await db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": str(new_user.id)
    }
#Endpoint Login
@router.post("/login", response_model=LoginResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    # Blokada użytkownika szereguje logowanie z resetem, aby reset unieważniał starsze sesje.
    result = await db.execute(
        select(User).where(
            or_(
                User.email == data.login,
                User.phone == data.login,
            )
        ).with_for_update()
    )

    user = result.scalar_one_or_none()

    if user is None:
        raise unauthorized()

    if not verify_password(data.password, user.password_hash):
        raise unauthorized()

    if not user.is_active:
        raise unauthorized()

    # Nowa sesja wymaga potwierdzonego emaila; starszy hash aktualizujemy po poprawnym haśle.
    if not user.is_verified:
        raise HTTPException(403, "Verify your email before signing in")
    if not user.password_hash.startswith("pbkdf2_sha256$"):
        user.password_hash = hash_password(data.password)
    tokens = await create_session(db, user)
    await db.commit()

    return tokens

@router.post("/verify", response_model=VerifyResponse)
async def verify(data: VerifyRequest, db: AsyncSession = Depends(get_db)):
    # Wspólny mechanizm zastępuje porównanie jawnego kodu i zużywa go tylko raz.
    user_id = await check(db, data.login, data.code, "verify", consume=True)
    if user_id is None:
        raise HTTPException(400, "Invalid or expired verification code")
    return {"message": "User verified successfully", "user_id": str(user_id)}


@router.post("/resend-verification", response_model=ForgotPasswordResponse)
async def resend_verification(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    mail.smtp_config()
    async with db.begin():
        user = await db.scalar(select(User).where(or_(User.email == data.login, User.phone == data.login)).with_for_update())
        if user and user.is_active and not user.is_verified and user.email:
            await issue(db, user, "verify")
    return {"message": "If an eligible account exists, a code has been sent"}


# Jednolita odpowiedź nie ujawnia istnienia konta; kod jest dostarczany przez SMTP.
@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    mail.smtp_config()
    async with db.begin():
        user = await db.scalar(select(User).where(or_(User.email == data.login, User.phone == data.login)).with_for_update())
        if user and user.is_active and user.email:
            await issue(db, user, "reset")
    return {"message": "If an eligible account exists, a code has been sent"}


@router.post("/verify-reset-code", response_model=VerifyResetCodeResponse)
async def verify_reset_code(data: VerifyResetCodeRequest, db: AsyncSession = Depends(get_db)):
    # Ten krok sprawdza kod, ale zużywa go dopiero zatwierdzenie nowego hasła.
    if await check(db, data.login, data.code, "reset") is None:
        raise HTTPException(400, "Invalid or expired verification code")
    return {"message": "Verification code is correct"}


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Zmiana hasła, zużycie kodu i unieważnienie wszystkich sesji są jedną transakcją.
    if await check(db, data.login, data.verification_code, "reset", consume=True, new_password=data.new_password) is None:
        raise HTTPException(400, "Invalid or expired verification code")
    return {"message": "Password reset successfully"}


@users_router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Rola administratora nie daje dostępu do wszystkich profili; wymagane jest powiązanie instytucji.
    # Pracownik widzi obcy profil tylko podczas obsługi przypisanego klienta.
    if current_user.id != user_id:
        from app.models.employees import Employee
        from app.models.queue import QueueEntry
        own_institutions = select(Employee.institution_id).where(
            Employee.user_id == current_user.id, Employee.employee_status == "active")
        allowed = None
        if current_user.role == "admin":
            allowed = await db.scalar(select(Employee.id).where(Employee.user_id == user_id,
                Employee.institution_id.in_(own_institutions)).limit(1))
            if not allowed:
                allowed = await db.scalar(select(QueueEntry.id).where(QueueEntry.client_id == user_id,
                    QueueEntry.institution_id.in_(own_institutions)).limit(1))
        elif current_user.role == "employee":
            own_ids = select(Employee.id).where(Employee.user_id == current_user.id,
                                                Employee.employee_status == "active")
            allowed = await db.scalar(select(QueueEntry.id).where(QueueEntry.client_id == user_id,
                QueueEntry.employee_id.in_(own_ids), QueueEntry.status == "in_service").limit(1))
        if not allowed:
            raise HTTPException(403, "You cannot view this profile")

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
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Identyfikator przesłany przez klienta nie zastępuje uwierzytelnienia właściciela.
    require_self(current_user, data.user_id)
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
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Zmiana dotyczy wyłącznie profilu właściciela uwierzytelnionej sesji.
    require_self(current_user, data.user_id)
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
