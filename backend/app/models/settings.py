import uuid
from sqlalchemy import Column, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class SystemSettings(Base):
    __tablename__ = "system_settings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), unique=True)
    confirmation_time_minutes = Column(Integer, default=20)
    client_response_minutes = Column(Integer, default=2)
    urgent_offer_5_enabled = Column(Boolean, default=True)
    urgent_offer_10_enabled = Column(Boolean, default=True)
    urgent_offer_15_enabled = Column(Boolean, default=True)
