from typing import Optional
from typing import Literal
from pydantic import field_validator
from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

class RegisterRequest(BaseModel):
    # Obowiązkowy email zapewnia kanał potwierdzenia konta i odzyskiwania hasła.
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=6, max_length=60)
    accept_terms: bool


class RegisterResponse(BaseModel):
    # Kod usunięto z odpowiedzi: odbiorca otrzymuje go wyłącznie pocztą.
    message: str
    user_id: str


class LoginRequest(BaseModel):
    login: str
    password: str


class LoginResponse(BaseModel):
    message: str
    user_id: str
    role: str
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int


class ForgotPasswordRequest(BaseModel):
    login: str


class ForgotPasswordResponse(BaseModel):
    # Odpowiedź nie ujawnia kodu ani istnienia konta.
    message: str


class VerifyRequest(BaseModel):
    login: str
    # Cztery cyfry zgodnie z kontraktem; typ tekstowy zachowuje zera na początku.
    code: str = Field(pattern=r"^[0-9]{4}$")


class VerifyResponse(BaseModel):
    message: str
    user_id: str


class VerifyResetCodeRequest(BaseModel):
    login: str
    # Cztery cyfry zgodnie z kontraktem; typ tekstowy zachowuje zera na początku.
    code: str = Field(pattern=r"^[0-9]{4}$")


class VerifyResetCodeResponse(BaseModel):
    message: str


class ResetPasswordRequest(BaseModel):
    login: str
    # Taka sama walidacja kodu jak przy jego wcześniejszym sprawdzeniu.
    verification_code: str = Field(pattern=r"^[0-9]{4}$")
    new_password: str = Field(min_length=6, max_length=60)

class ResetPasswordResponse(BaseModel):
    message: str


class UserResponse(BaseModel):
    id: UUID
    email: Optional[str] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_image: Optional[str] = None
    role: str
    language: str
    is_verified: bool
    is_active: bool



class CompleteProfileRequest(BaseModel):
    user_id: UUID
    first_name: str = Field(min_length=1, max_length=40)
    last_name: str = Field(min_length=1, max_length=40)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def strip_names(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

class UpdateLanguageRequest(BaseModel):
    user_id: UUID
    language: Literal["pl", "en"]


class UserUpdateResponse(BaseModel):
    message: str
    user_id: UUID

class RefreshTokenRequest(BaseModel):
 refresh_token: str = Field(min_length=32, max_length=512)
