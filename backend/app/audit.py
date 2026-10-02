"""Dziennik konfiguracji zapisuje się razem ze zmianą, bez haseł i tokenów."""
from datetime import datetime
from uuid import uuid4
from fastapi.encoders import jsonable_encoder
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    admin_id = Column(UUID(as_uuid=True))
    action = Column(String(255))
    entity_type = Column(String(100))
    entity_id = Column(UUID(as_uuid=True))
    old_data = Column(JSON)
    new_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


def record(db, user, action, entity_type, entity_id, new_data=None, old_data=None):
    db.add(AuditLog(admin_id=user.id, action=action, entity_type=entity_type, entity_id=entity_id,
                   new_data=jsonable_encoder(new_data), old_data=jsonable_encoder(old_data)))
