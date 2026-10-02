from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.database.connection import Base


class PushToken(Base):
    __tablename__ = "push_tokens"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    session_id = Column(UUID(as_uuid=True))
    device_type = Column(String(20), nullable=False)
    token = Column(Text, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class PushJob(Base):
    __tablename__ = "notification_push_jobs"
    notification_id = Column(UUID(as_uuid=True), ForeignKey("notifications.id"), primary_key=True)
    status = Column(String(20), default="pending", nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    available_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    last_error = Column(String(100))
