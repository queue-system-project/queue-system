"""Grafik zastępuje się w całości, pod tą samą blokadą co rezerwacje."""
from datetime import date, datetime, time
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, model_validator
from sqlalchemy import select, delete
from app.routes.users import get_db
from app.security import get_current_user
from app.access import require_institution, require_admin
from app.models.catalog import Institution, Service
from app.models.employees import Employee
from app.models.calendar import InstitutionHours, EmployeeHours, InstitutionHoliday
from app.models.slots import ServiceSlot
from app.models.queue import QueueEntry
from app.calendar import load_calendar
from app.audit import record

router = APIRouter(prefix="/api", tags=["Calendar"])


class Interval(BaseModel):
    day_of_week: int = Field(ge=0, le=6)
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def ordered(self):
        if self.start_time.tzinfo or self.end_time.tzinfo or self.start_time >= self.end_time:
            raise ValueError("Use Europe/Warsaw local times with start_time < end_time, without a timezone suffix")
        return self


class Holiday(BaseModel):
    holiday_date: date
    description: str = Field(default="", max_length=500)


class EmployeeSchedule(BaseModel):
    intervals: list[Interval] = Field(max_length=70)

    @model_validator(mode="after")
    def disjoint(self):
        rows = sorted(self.intervals, key=lambda r: (r.day_of_week, r.start_time))
        for a, b in zip(rows, rows[1:]):
            if a.day_of_week == b.day_of_week and a.end_time > b.start_time:
                raise ValueError("Working intervals must not overlap")
        return self


class InstitutionSchedule(EmployeeSchedule):
    enabled: bool = True
    holidays: list[Holiday] = Field(default_factory=list, max_length=730)

    @model_validator(mode="after")
    def unique_dates(self):
        if len({h.holiday_date for h in self.holidays}) != len(self.holidays):
            raise ValueError("Holiday dates must be unique")
        return self


async def lock_institution(db, institution_id, user):
    institution = await db.scalar(select(Institution).where(Institution.id == institution_id).with_for_update())
    if institution is None:
        raise HTTPException(404, "Institution not found")
    await require_admin(db, user, institution_id)
    return institution


async def validate_bookings(db, institution_id):
    await db.flush()
    calendar = await load_calendar(db, institution_id)
    slots = (await db.scalars(select(ServiceSlot).join(QueueEntry, QueueEntry.slot_id == ServiceSlot.id).where(
        QueueEntry.institution_id == institution_id, QueueEntry.status.in_(("waiting", "confirmed")),
        ServiceSlot.slot_end > datetime.utcnow()))).all()
    if any(not calendar.fits(s.slot_start, s.slot_end, s.employee_id) for s in slots):
        raise HTTPException(409, "Schedule conflicts with an active booking; resolve the booking first")


@router.get("/institutions/{institution_id}/working-hours")
async def institution_schedule(institution_id: UUID, db=Depends(get_db)):
    if await db.get(Institution, institution_id) is None:
        raise HTTPException(404, "Institution not found")
    calendar = await load_calendar(db, institution_id)
    holidays = (await db.scalars(select(InstitutionHoliday).where(
        InstitutionHoliday.institution_id == institution_id).order_by(InstitutionHoliday.holiday_date))).all()
    return {"timezone": "Europe/Warsaw", "enabled": calendar.enabled,
            "intervals": [{"day_of_week": d, "start_time": a, "end_time": b} for d, a, b in sorted(calendar.hours)],
            "holidays": [{"holiday_date": row.holiday_date, "description": row.description or ""} for row in holidays]}


@router.put("/institutions/{institution_id}/working-hours")
async def set_institution_schedule(institution_id: UUID, data: InstitutionSchedule,
                                   user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        institution = await lock_institution(db, institution_id, user)
        institution.calendar_enabled = data.enabled
        await db.execute(delete(InstitutionHours).where(InstitutionHours.institution_id == institution_id))
        await db.execute(delete(InstitutionHoliday).where(InstitutionHoliday.institution_id == institution_id))
        db.add_all(InstitutionHours(institution_id=institution_id, **row.model_dump()) for row in data.intervals)
        db.add_all(InstitutionHoliday(institution_id=institution_id, **row.model_dump()) for row in data.holidays)
        await validate_bookings(db, institution_id)
        record(db, user, "save_schedule", "institution", institution_id, data.model_dump())
    return {"timezone": "Europe/Warsaw", **data.model_dump()}


@router.put("/employees/{employee_id}/working-hours")
async def set_employee_schedule(employee_id: UUID, data: EmployeeSchedule,
                                user=Depends(get_current_user), db=Depends(get_db)):
    async with db.begin():
        institution_id = await db.scalar(select(Employee.institution_id).where(Employee.id == employee_id))
        if institution_id is None:
            raise HTTPException(404, "Employee not found")
        await lock_institution(db, institution_id, user)
        await db.execute(delete(EmployeeHours).where(EmployeeHours.employee_id == employee_id))
        db.add_all(EmployeeHours(employee_id=employee_id, **row.model_dump()) for row in data.intervals)
        await validate_bookings(db, institution_id)
        record(db, user, "save_schedule", "employee", employee_id, data.model_dump())
    return {"timezone": "Europe/Warsaw", **data.model_dump()}


@router.get("/employees/{employee_id}/working-hours")
async def employee_schedule(employee_id: UUID, user=Depends(get_current_user), db=Depends(get_db)):
    employee = await db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(404, "Employee not found")
    await require_institution(db, user, employee.institution_id)
    rows = (await db.scalars(select(EmployeeHours).where(EmployeeHours.employee_id == employee_id)
                            .order_by(EmployeeHours.day_of_week, EmployeeHours.start_time))).all()
    return {"timezone": "Europe/Warsaw", "inherits_institution": not bool(rows),
            "intervals": [{"day_of_week": r.day_of_week, "start_time": r.start_time,
                           "end_time": r.end_time} for r in rows]}
