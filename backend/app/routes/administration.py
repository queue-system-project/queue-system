"""Administracja istniejącą instytucją; rola admin nie zastępuje przynależności."""
from datetime import date
from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field, ConfigDict
from sqlalchemy import select, func
from app.routes.users import get_db
from app.core.security import get_current_user
from app.core.access import require_admin, require_self, require_institution
from app.routes.queue import lock_service
from app.routes.employees import lock_management
from app.models.catalog import Institution, Service
from app.models.queue import QueueEntry
from app.models.settings import SystemSettings
from app.models.employees import Employee
from app.schemas.catalog import ServiceResponse, InstitutionResponse
from app.schemas.queue import QueueResponse
from app.core.audit import record, AuditLog
from app.models.users import User
router = APIRouter(prefix="/api", tags=["Administration"])

class AdminAddRequest(BaseModel):
    user_id: UUID

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

@router.get("/audit-logs")
async def get_audit_logs(
    institution_id: UUID | None = None,
    admin_id: UUID | None = None,
    action: str | None = None,
    entity_type: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    query = select(AuditLog)

    if admin_id is not None:
        query = query.where(AuditLog.admin_id == admin_id)

    if action is not None:
        query = query.where(AuditLog.action == action)

    if entity_type is not None:
        query = query.where(
            AuditLog.entity_type == entity_type
        )

    if institution_id is not None:
        await require_admin(
            db,
            user,
            institution_id,
        )

    query = (
        query
        .order_by(
            AuditLog.created_at.desc(),
            AuditLog.id.desc(),
        )
        .limit(limit)
        .offset(offset)
    )

    rows = (await db.scalars(query)).all()

    return [
        {
            "id": row.id,
            "admin_id": row.admin_id,
            "action": row.action,
            "entity_type": row.entity_type,
            "entity_id": row.entity_id,
            "old_data": row.old_data,
            "new_data": row.new_data,
            "created_at": row.created_at,
        }
        for row in rows
    ]


@router.get("/audit-logs/{log_id}")
async def get_audit_log(
    log_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    if user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required",
        )

    row = await db.get(
        AuditLog,
        log_id,
    )

    if row is None:
        raise HTTPException(
            status_code=404,
            detail="Audit log not found",
        )

    return {
        "id": row.id,
        "admin_id": row.admin_id,
        "action": row.action,
        "entity_type": row.entity_type,
        "entity_id": row.entity_id,
        "old_data": row.old_data,
        "new_data": row.new_data,
        "created_at": row.created_at,
    }

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
@router.get("/institutions/{institution_id}/dashboard")
async def admin_dashboard(
    institution_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    await require_admin(db, user, institution_id)

    services_count = await db.scalar(
        select(func.count(Service.id)).where(
            Service.institution_id == institution_id,
            Service.is_active.is_(True),
        )
    )

    employees_count = await db.scalar(
        select(func.count(Employee.id)).where(
            Employee.institution_id == institution_id,
            Employee.employee_status == "active",
        )
    )

    queue_count = await db.scalar(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.institution_id == institution_id,
            QueueEntry.status.in_(("waiting", "confirmed", "in_service")),
        )
    )

    waiting_count = await db.scalar(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.institution_id == institution_id,
            QueueEntry.status == "waiting",
        )
    )

    in_service_count = await db.scalar(
        select(func.count(QueueEntry.id)).where(
            QueueEntry.institution_id == institution_id,
            QueueEntry.status == "in_service",
        )
    )

    return {
        "services": services_count or 0,
        "employees": employees_count or 0,
        "active_queue": queue_count or 0,
        "waiting": waiting_count or 0,
        "in_service": in_service_count or 0,
    }
@router.get("/institutions/{institution_id}/admins")
async def get_institution_admins(
    institution_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    await require_admin(
        db,
        user,
        institution_id,
    )

    rows = (
        await db.execute(
            select(Employee, User)
            .join(
                User,
                User.id == Employee.user_id,
            )
            .where(
                Employee.institution_id == institution_id,
                Employee.employee_status == "active",
                User.role == "admin",
            )
            .order_by(
                User.last_name,
                User.first_name,
                User.id,
            )
        )
    ).all()

    return [
        {
            "employee_id": employee.id,
            "user_id": account.id,
            "email": account.email,
            "phone": account.phone,
            "first_name": account.first_name,
            "last_name": account.last_name,
            "role": account.role,
            "is_active": account.is_active,
        }
        for employee, account in rows
    ]
@router.post(
    "/institutions/{institution_id}/admins",
    status_code=201,
)
async def add_institution_admin(
    institution_id: UUID,
    data: AdminAddRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    async with db.begin():
        await require_admin(
            db,
            user,
            institution_id,
        )

        account = await db.get(
            User,
            data.user_id,
        )

        if account is None:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        if not account.is_active:
            raise HTTPException(
                status_code=409,
                detail="User is inactive",
            )

        institution = await db.get(
            Institution,
            institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=404,
                detail="Institution not found",
            )

        membership = await db.scalar(
            select(Employee).where(
                Employee.user_id == data.user_id,
                Employee.institution_id == institution_id,
            )
        )

        if membership is None:
            membership = Employee(
                user_id=data.user_id,
                institution_id=institution_id,
                employee_status="active",
            )
            db.add(membership)
            await db.flush()
        else:
            membership.employee_status = "active"

        old_role = account.role

        account.role = "admin"

        record(
            db,
            user,
            "add_admin",
            "user",
            account.id,
            {
                "institution_id": str(institution_id),
                "role": "admin",
            },
            {
                "role": old_role,
            },
        )

    return {
        "user_id": account.id,
        "institution_id": institution_id,
        "role": account.role,
        "employee_id": membership.id,
    }
@router.delete(
    "/institutions/{institution_id}/admins/{user_id}",
    status_code=204,
)
async def remove_institution_admin(
    institution_id: UUID,
    user_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    async with db.begin():
        await require_admin(
            db,
            user,
            institution_id,
        )

        if user.id == user_id:
            raise HTTPException(
                status_code=409,
                detail="You cannot remove your own admin access",
            )

        account = await db.get(User, user_id)

        if account is None:
            raise HTTPException(
                status_code=404,
                detail="User not found",
            )

        membership = await db.scalar(
            select(Employee)
            .where(
                Employee.user_id == user_id,
                Employee.institution_id == institution_id,
            )
            .with_for_update()
        )

        if membership is None:
            raise HTTPException(
                status_code=404,
                detail="Admin membership not found",
            )

        if account.role != "admin":
            raise HTTPException(
                status_code=409,
                detail="User is not an admin",
            )

        old_role = account.role
        old_status = membership.employee_status

        membership.employee_status = "inactive"

        other_active_membership = await db.scalar(
            select(Employee.id)
            .where(
                Employee.user_id == user_id,
                Employee.institution_id != institution_id,
                Employee.employee_status == "active",
            )
            .limit(1)
        )

        if other_active_membership is None:
            account.role = "client"

        record(
            db,
            user,
            "remove_admin",
            "user",
            account.id,
            {
                "institution_id": str(institution_id),
                "role": account.role,
                "membership_status": membership.employee_status,
            },
            {
                "role": old_role,
                "membership_status": old_status,
            },
        )

    return Response(status_code=204)