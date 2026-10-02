"""Utrwalone podsumowanie lokalnego dnia, bez usuwania historii kolejki."""
from collections import Counter
from datetime import datetime
from sqlalchemy import select
from app.business_time import day_bounds, ZONE_NAME
from app.calendar import load_calendar
from app.models.reports import DailyReport
from app.models.day_closure import DayClosure
from app.models.queue import QueueEntry
from app.models.visit import Visit
from app.models.employees import Employee, EmployeeService
from app.models.catalog import Service
from app.models.users import User
from app.models.notifications import Notification
from app.notifications import create_notification


def average(values):
    return round(sum(values) / len(values), 2) if values else None


def occupied_seconds(visits, start, end, now):
    spans = sorted((max(start, v.actual_start), min(end, v.actual_end or now))
                   for v in visits if v.actual_start and v.actual_start < end and (v.actual_end or now) > start)
    total, last = 0.0, start
    for a, b in spans:
        a = max(a, last)
        if b > a:
            total += (b - a).total_seconds()
            last = b
    return total


async def refresh_daily_report(db, institution_id, day, now=None):
    # Wywołujący utrzymuje blokadę instytucji; zapis i powiadomienia należą do tej samej transakcji.
    now = now or datetime.utcnow()
    await db.flush()
    closure = await db.get(DayClosure, (institution_id, day))
    if closure is None:
        return None
    report = await db.scalar(select(DailyReport).where(DailyReport.institution_id == institution_id,
                                                     DailyReport.report_date == day))
    if report is None:
        report = DailyReport(institution_id=institution_id, report_date=day, created_at=now)
        db.add(report)
    entries = list((await db.scalars(select(QueueEntry).where(
        QueueEntry.institution_id == institution_id, QueueEntry.queue_date == day))).all())
    visits = list((await db.scalars(select(Visit).join(QueueEntry, QueueEntry.id == Visit.queue_entry_id).where(
        QueueEntry.institution_id == institution_id, QueueEntry.queue_date == day))).all())
    employees = list((await db.scalars(select(Employee).where(Employee.institution_id == institution_id))).all())
    providers = set((await db.scalars(select(EmployeeService.employee_id).join(
        Service, Service.id == EmployeeService.service_id).where(Service.institution_id == institution_id))).all())
    start, end = day_bounds(day)
    occupancy = list((await db.scalars(select(Visit).join(Service, Service.id == Visit.service_id).where(
        Service.institution_id == institution_id, Visit.actual_start < end,
        (Visit.actual_end.is_(None) | (Visit.actual_end > start))))).all())
    calendar = await load_calendar(db, institution_id)
    previous = report.payload or {}
    planned = previous.get("working_intervals", {})
    if not previous:
        for employee in employees:
            if employee.id in providers and employee.employee_status == "active" and (calendar.enabled or employee.id in calendar.employees):
                planned[str(employee.id)] = [[a.isoformat(), b.isoformat()] for a, b in calendar.intervals(day, employee.id)]
    staff = {}
    for employee in employees:
        own = [v for v in visits if v.employee_id == employee.id]
        done = [v for v in own if v.status == "done"]
        idle = None
        if str(employee.id) in planned:
            seconds = 0.0
            for a, b in planned[str(employee.id)]:
                start, end = datetime.fromisoformat(a), min(datetime.fromisoformat(b), closure.closed_at)
                if end > start:
                    seconds += (end-start).total_seconds() - occupied_seconds(
                        [v for v in occupancy if v.employee_id == employee.id], start, end, now)
            idle = round(max(0, seconds) / 60, 2)
        staff[str(employee.id)] = {"clients_served": len(done),
            "average_visit_minutes": average([v.actual_duration for v in done if v.actual_duration is not None]),
            "idle_minutes": idle}
    counts = Counter(e.status for e in entries)
    done = [v for v in visits if v.status == "done"]
    payload = {"timezone": ZONE_NAME, "status_counts": dict(sorted(counts.items())),
        "total_entries": len(entries), "visits_started": len(visits),
        "average_visit_minutes": average([v.actual_duration for v in done if v.actual_duration is not None]),
        "average_delay_minutes": average([v.delay_duration for v in done if v.delay_duration is not None]),
        "employees": staff, "working_intervals": planned}
    report.total_visits = len(entries)
    for state in ("done", "cancelled", "missed", "skipped"):
        setattr(report, f"{state}_visits", counts[state])
    report.average_visit_time = round(payload["average_visit_minutes"] or 0)
    report.average_delay = round(payload["average_delay_minutes"] or 0)
    idle_values = [s["idle_minutes"] for s in staff.values() if s["idle_minutes"] is not None]
    report.total_idle_time = round(sum(idle_values)) if idle_values else None
    report.finalized = counts["in_service"] == 0 and not any(v.status == "in_service" for v in occupancy)
    if report.payload != payload:
        report.updated_at = now
        report.payload = payload
    await db.flush()
    phase = "final" if report.finalized else "preliminary"
    for employee in employees:
        if employee.employee_status != "active" or not employee.user_id:
            continue
        user = await db.get(User, employee.user_id)
        if not user or not user.is_active or user.role not in ("employee", "admin"):
            continue
        key = f"daily-report:{report.id}:{phase}:{user.id}"
        if await db.scalar(select(Notification.id).where(Notification.event_key == key)):
            continue
        title = "Raport dzienny" if user.language == "pl" else "Daily report"
        message = (f"Raport za {day} jest dostępny." if user.language == "pl" else f"Report for {day} is available.")
        if not report.finalized:
            message += " Trwa obsługa wizyt." if user.language == "pl" else "Some visits are still in progress."
        await create_notification(db, user.id, title, message, key)
    return report


def report_view(report, employee_id=None):
    if report is None:
        return None
    payload = dict(report.payload or {})
    payload.pop("working_intervals", None)
    if employee_id is not None:
        payload = {"timezone": ZONE_NAME, **payload.get("employees", {}).get(str(employee_id), {})}
    return {"id": report.id, "report_date": report.report_date, "finalized": report.finalized,
            "updated_at": report.updated_at.isoformat()+"Z" if report.updated_at else None, "summary": payload}
