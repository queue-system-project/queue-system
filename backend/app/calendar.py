"""Grafik Europe/Warsaw przeliczany na UTC, bez przenoszenia wizyty na następny dzień."""
from datetime import datetime, time, timedelta
from app.business_time import business_date, day_bounds, local_boundary
from fastapi import HTTPException
from sqlalchemy import select
from app.models.calendar import InstitutionHours, EmployeeHours, InstitutionHoliday
from app.models.catalog import Institution
from app.models.employees import Employee


class Calendar:
    def __init__(self, enabled, hours, holidays, employees):
        self.enabled, self.hours, self.holidays, self.employees = enabled, hours, holidays, employees

    def intervals(self, day, employee_id=None):
        if day in self.holidays:
            return []
        start, end = day_bounds(day)
        institution = [(local_boundary(day, a), local_boundary(day, b, closing=True))
                       for weekday, a, b in self.hours if weekday == day.weekday()] if self.enabled else [
                           (start, end)]
        roster = self.employees.get(employee_id)
        if not roster:
            return sorted(institution)
        own = [(local_boundary(day, a), local_boundary(day, b, closing=True))
               for weekday, a, b in roster if weekday == day.weekday()]
        return sorted((max(a, c), min(b, d)) for a, b in institution for c, d in own if max(a, c) < min(b, d))

    def earliest(self, day, start, duration, employee_id=None):
        for a, b in self.intervals(day, employee_id):
            candidate = max(a, start)
            if candidate + duration <= b and candidate < b:
                return candidate
        return None

    def fits(self, start, end, employee_id=None):
        return any(a <= start < end <= b for a, b in self.intervals(business_date(start), employee_id))


async def load_calendar(db, institution_id):
    institution = await db.get(Institution, institution_id)
    hours = (await db.execute(select(InstitutionHours.day_of_week, InstitutionHours.start_time,
        InstitutionHours.end_time).where(InstitutionHours.institution_id == institution_id))).all()
    holidays = set((await db.scalars(select(InstitutionHoliday.holiday_date).where(
        InstitutionHoliday.institution_id == institution_id))).all())
    rows = (await db.execute(select(EmployeeHours.employee_id, EmployeeHours.day_of_week,
        EmployeeHours.start_time, EmployeeHours.end_time).join(Employee, Employee.id == EmployeeHours.employee_id)
        .where(Employee.institution_id == institution_id))).all()
    employees = {}
    for employee_id, day, a, b in rows:
        if day is not None and a is not None and b is not None and a < b:
            employees.setdefault(employee_id, []).append((day, a, b))
    return Calendar(institution.calendar_enabled, hours, holidays, employees)


async def require_interval(db, service, start, end, employee_id=None):
    calendar = await load_calendar(db, service.institution_id)
    if not calendar.fits(start, end, employee_id):
        raise HTTPException(409, "Outside working hours, during a break or on a holiday")
