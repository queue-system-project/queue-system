"""Raport dnia pozostaje w bazie i jest aktualizowany po zakończeniu opóźnionej wizyty."""
from uuid import uuid4
from sqlalchemy import Column, Date, DateTime, Integer, Boolean, JSON, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class DailyReport(Base):
    __tablename__ = "daily_reports"
    __table_args__ = (UniqueConstraint("institution_id", "report_date", name="uq_daily_report_institution_day"),)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    institution_id = Column(UUID(as_uuid=True))
    report_date = Column(Date, nullable=False)
    total_visits = Column(Integer, default=0)
    done_visits = Column(Integer, default=0)
    cancelled_visits = Column(Integer, default=0)
    missed_visits = Column(Integer, default=0)
    skipped_visits = Column(Integer, default=0)
    average_visit_time = Column(Integer, default=0)
    average_delay = Column(Integer, default=0)
    total_idle_time = Column(Integer, nullable=True)
    created_at = Column(DateTime)
    updated_at = Column(DateTime)
    finalized = Column(Boolean, nullable=False, default=False)
    payload = Column(JSON)
