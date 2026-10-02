"""Trwały zapis zamknięcia dnia; closed_by=None oznacza timer."""
from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class DayClosure(Base):
    __tablename__ = "institution_day_closures"
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"), primary_key=True)
    day = Column(Date, primary_key=True)
    closed_at = Column(DateTime, nullable=False)
    closed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    cancelled_count = Column(Integer, nullable=False, default=0)
