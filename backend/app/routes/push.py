from typing import Literal
from uuid import UUID, uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.push import PushToken
from app.routes.users import get_db
from app.security import get_current_user, get_current_session

router = APIRouter(prefix="/api/notifications/devices", tags=["Push devices"])


class DeviceRequest(BaseModel):
    token: str = Field(min_length=20, max_length=4096, pattern=r"^\S+$")
    device_type: Literal["android", "ios"]


@router.post("")
async def register_device(
    data: DeviceRequest, session=Depends(get_current_session),
    db: AsyncSession = Depends(get_db),
):
    user = session["user"]
    async with db.begin():
        insert = sqlite_insert if db.get_bind().dialect.name == "sqlite" else pg_insert
        statement = insert(PushToken).values(
            id=uuid4(), user_id=user.id, session_id=session["session_id"], token=data.token,
            device_type=data.device_type, created_at=datetime.utcnow(),
        ).on_conflict_do_update(index_elements=[PushToken.token], set_={
            "user_id": user.id, "session_id": session["session_id"], "device_type": data.device_type,
        }).returning(PushToken.id)
        device_id = await db.scalar(statement)
    # Nigdy nie umieszczaj tokenu rejestracji w odpowiedzi ani dziennikach.
    return {"id": device_id, "device_type": data.device_type}


@router.delete("/{device_id}", status_code=204)
async def remove_device(
    device_id: UUID, user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        removed = await db.scalar(delete(PushToken).where(
            PushToken.id == device_id, PushToken.user_id == user.id,
        ).returning(PushToken.id))
        if removed is None:
            raise HTTPException(404, "Device not found")
