from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.access import require_institution, require_self
from app.models.employees import Employee
from app.models.notifications import Notification
from app.models.queue import QueueEntry
from app.models.users import User
from app.notifications import as_dict, create_notification, notification_list
from app.realtime import changed
from app.routes.users import get_db
from app.security import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


class SendNotificationRequest(BaseModel):
    user_id: UUID
    institution_id: UUID
    source_event_id: UUID
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("title", "message", mode="before")
    @classmethod
    def strip_text(cls, value):
        return value.strip() if isinstance(value, str) else value


@router.post("/send", status_code=201)
async def send_notification(
    data: SendNotificationRequest, response: Response,
    user=Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        await require_institution(db, user, data.institution_id)
        # Szereguj ręczne wysyłki do odbiorcy, aby obsłużyć ponowione żądania.
        recipient = await db.scalar(select(User).where(
            User.id == data.user_id,
        ).with_for_update())
        if recipient is None:
            raise HTTPException(404, "Recipient not found")
        staff = await db.scalar(select(Employee.id).where(
            Employee.user_id == data.user_id,
            Employee.institution_id == data.institution_id,
            Employee.employee_status == "active",
        ).limit(1))
        client = await db.scalar(select(QueueEntry.id).where(
            QueueEntry.client_id == data.user_id,
            QueueEntry.institution_id == data.institution_id,
        ).limit(1))
        if staff is None and client is None:
            raise HTTPException(403, "Recipient is outside your institution")
        key = f"manual:{user.id}:{data.institution_id}:{data.user_id}:{data.source_event_id}"
        existing = await db.scalar(select(Notification).where(Notification.event_key == key))
        if existing is not None:
            if (existing.title, existing.message) != (data.title, data.message):
                raise HTTPException(409, "Event key already used for another message")
            response.status_code = 200
            return as_dict(existing)
        row = await create_notification(db, data.user_id, data.title, data.message, key)
        result = as_dict(row)
    return result


@router.get("")
async def get_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0), is_read: bool | None = None,
    user=Depends(get_current_user), db: AsyncSession = Depends(get_db),
):
    return await notification_list(db, user.id, limit, offset, is_read)


@router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: UUID, user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        row = await db.scalar(update(Notification).where(
            Notification.id == notification_id, Notification.user_id == user.id,
        ).values(is_read=True).returning(Notification))
        if row is None:
            raise HTTPException(404, "Notification not found")
        changed(db, f"user:{user.id}")
        result = as_dict(row)
    return result


@router.get("/{user_id}", deprecated=True)
async def legacy_notifications(
    user_id: UUID, limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0), user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_self(user, user_id)
    return await notification_list(db, user.id, limit, offset)
