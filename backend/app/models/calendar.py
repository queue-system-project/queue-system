"""Godziny Europe/Warsaw: wiele przedziałów jednego dnia opisuje przerwy."""
import uuid
from sqlalchemy import Column, Date, Integer, Time, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class InstitutionHours(Base):
    __tablename__ = "institution_working_hours"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)


class EmployeeHours(Base):
    __tablename__ = "employee_working_hours"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("institution_employees.id"))
    day_of_week = Column(Integer)
    start_time = Column(Time)
    end_time = Column(Time)


class InstitutionHoliday(Base):
    __tablename__ = "institution_holidays"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    institution_id = Column(UUID(as_uuid=True), ForeignKey("institutions.id"))
    holiday_date = Column(Date)
    description = Column(Text)
