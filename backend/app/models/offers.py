import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, String, ForeignKey, UniqueConstraint, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class OfferWindow(Base):
    __tablename__ = "queue_offer_windows"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    source_entry_id = Column(UUID(as_uuid=True), ForeignKey("queue_entries.id"), nullable=False)
    source_event = Column(String(150), unique=True, nullable=False)
    phase = Column(String(20), default="urgent", nullable=False)
    status = Column(String(20), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    taken_by = Column(UUID(as_uuid=True))
    accepted_entry_id = Column(UUID(as_uuid=True))


class QueueOffer(Base):
    __tablename__ = "queue_offers"
    __table_args__ = (UniqueConstraint("window_id", "queue_entry_id"),)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    window_id = Column(UUID(as_uuid=True), ForeignKey("queue_offer_windows.id"), nullable=False)
    queue_entry_id = Column(UUID(as_uuid=True), ForeignKey("queue_entries.id"), nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    expires_at = Column(DateTime, nullable=False)
    selected_minutes = Column(Integer)
