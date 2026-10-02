"""Administracja istniejącą instytucją; rola admin nie zastępuje przynależności."""
from datetime import date
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select
from app.routes.users import get_db
from app.security import get_current_user
from app.access import require_admin, require_self, require_institution
from app.routes.queue import lock_service
from app.routes.employees import lock_management
from app.models.catalog import Institution, Service
from app.models.queue import QueueEntry
from app.models.settings import SystemSettings
from app.models.employees import Employee
from app.schemas.catalog import ServiceResponse, InstitutionResponse
from app.schemas.queue import QueueResponse
from app.audit import record

router = APIRouter(prefix="/api", tags=["Administration"])


class ServiceWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=5000)
    standard_duration: int = Field(ge=1, le=480)
    max_queue_length: int = Field(default=50, ge=1, le=10000)
    is_active: bool = True


class ServiceCreate(ServiceWrite):
    institution_id: UUID


class SettingsWrite(BaseModel):
    model_config = ConfigDict(extra="forbid")
    confirmation_time_minutes: int = Field(default=20, ge=0, le=1440)
    client_response_minutes: int = Field(default=2, ge=1, le=60)
    urgent_offer_5_enabled: bool = True
    urgent_offer_10_enabled: bool = True
    urgent_offer_15_enabled: bool = True


async def ensure_empty(db, service_id):
    if await db.scalar(select(QueueEntry.id).where(QueueEntry.service_id == service_id,
        QueueEntry.status.in_(("waiting", "confirmed", "in_service"))).limit(1)):
        raise HTTPException(409, "Resolve active entries before disabling the service or changing its duration")


@router.post("/services", response_model=ServiceResponse, status_code=201)
async def create_service(data: ServiceCreate, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        await lock_management(db, data.institution_id, user)
        row = Service(id=uuid4(), **data.model_dump())
        db.add(row)
        record(db, user, "create", "service", row.id, data.model_dump())
        await db.flush()
        return ServiceResponse.model_validate(row)


@router.put("/services/{service_id}", response_model=ServiceResponse)
async def update_service(service_id: UUID, data: ServiceWrite, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        row = await lock_service(db, service_id)
        await require_admin(db, user, row.institution_id)
        if not data.is_active or row.standard_duration != data.standard_duration:
            await ensure_empty(db, row.id)
        old = ServiceResponse.model_validate(row).model_dump()
        for key, value in data.model_dump().items():
            setattr(row, key, value)
        record(db, user, "update", "service", row.id, data.model_dump(), old)
        await db.flush()
        return ServiceResponse.model_validate(row)


@router.delete("/services/{service_id}", status_code=204)
async def disable_service(service_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        row = await lock_service(db, service_id)
        await require_admin(db, user, row.institution_id)
        await ensure_empty(db, row.id)
        row.is_active = False
        record(db, user, "disable", "service", row.id)
    return Response(status_code=204)


@router.get("/institutions/{institution_id}/settings")
async def get_settings(institution_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    await require_admin(db, user, institution_id)
    row = await db.scalar(select(SystemSettings).where(SystemSettings.institution_id == institution_id))
    return {key: getattr(row, key) for key in SettingsWrite.model_fields} if row else SettingsWrite().model_dump()


@router.put("/institutions/{institution_id}/settings")
async def set_settings(institution_id: UUID, data: SettingsWrite, user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        await lock_management(db, institution_id, user)
        row = await db.scalar(select(SystemSettings).where(SystemSettings.institution_id == institution_id))
        if row is None:
            row = SystemSettings(institution_id=institution_id)
            db.add(row)
        for key, value in data.model_dump().items():
            setattr(row, key, value)
        record(db, user, "update_settings", "institution", institution_id, data.model_dump())
    return data.model_dump()


@router.get("/users/{user_id}/queue-history", response_model=list[QueueResponse])
async def user_history(user_id: UUID, limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0),
                       user=Depends(get_current_user), db=Depends(get_db)):
    require_self(user, user_id)
    return (await db.scalars(select(QueueEntry).where(QueueEntry.client_id == user_id)
        .order_by(QueueEntry.queue_date.desc(), QueueEntry.created_at.desc(), QueueEntry.id)
        .limit(limit).offset(offset))).all()


@router.get("/institutions/{institution_id}/queue-history", response_model=list[QueueResponse])
async def institution_history(institution_id: UUID, day: date | None = None,
        limit: int = Query(50, ge=1, le=100), offset: int = Query(0, ge=0),
        user=Depends(get_current_user), db=Depends(get_db)):
    await require_institution(db, user, institution_id)
    query = select(QueueEntry).where(QueueEntry.institution_id == institution_id)
    if day:
        query = query.where(QueueEntry.queue_date == day)
    if user.role != "admin":
        own = select(Employee.id).where(Employee.user_id == user.id, Employee.employee_status == "active")
        query = query.where(QueueEntry.employee_id.in_(own) | (QueueEntry.missed_by == user.id))
    return (await db.scalars(query.order_by(QueueEntry.queue_date.desc(), QueueEntry.created_at.desc(), QueueEntry.id)
                             .limit(limit).offset(offset))).all()
