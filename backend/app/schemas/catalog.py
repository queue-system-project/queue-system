from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class InstitutionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    category_id: Optional[UUID] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    photo_url: Optional[str] = None

    calendar_enabled: bool = False

class InstitutionCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    logo_url: Optional[str] = None
    key: str

class ServiceResponse(BaseModel):
    id: UUID
    institution_id: UUID
    name: str
    description: str | None = None
    standard_duration: int
    max_queue_length: int | None = None
    is_active: bool

    queue: int = 0
    spots: int = 0
    delay: int = 0

    model_config = ConfigDict(from_attributes=True)