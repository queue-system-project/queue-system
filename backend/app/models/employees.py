import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ENUM

from app.database.connection import Base


class Employee(Base):
    __tablename__ = "institution_employees"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    institution_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
    )
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
    )
    employee_status = Column(
        ENUM(
            "active",
            "inactive",
            name="employee_status",
            create_type=False,
        ),
        default="active",
    )
    room = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)


class EmployeeService(Base):
    __tablename__ = "employee_services"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    employee_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("institution_employees.id", ondelete="CASCADE"),
    )
    service_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("services.id", ondelete="CASCADE"),
    )