# Obsługę powiadomień i WebSocket wydzielono do routes/notifications.py
# i routes/realtime.py; main.py rejestruje je pod dotychczasowymi adresami.
# Tutaj pozostają raporty i statystyki, bez drugiej implementacji tych samych tras.
from datetime import date, datetime, time, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text, bindparam, Uuid, DateTime, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.catalog import Institution
from app.models.employees import Employee
from app.routes.users import get_db
from app.security import get_current_user
from app.access import require_admin, require_employee
from app.business_time import business_date, day_bounds, ZONE_NAME
from app.models.reports import DailyReport
from app.reports import report_view

router = APIRouter()

# Wspólne zapytanie jest dostępne dla obu raportów, poza procedurą WebSocket.
VISIT_STATISTICS_SQL = """
    SELECT
        COUNT(*) AS total_visits,

        COUNT(*) FILTER (
            WHERE v.status = 'done'
        ) AS done_visits,

        COUNT(*) FILTER (
            WHERE v.status = 'cancelled'
        ) AS cancelled_visits,

        COUNT(*) FILTER (
            WHERE v.status = 'in_service'
        ) AS in_service_visits,

        AVG(v.actual_duration) FILTER (
            WHERE v.status = 'done'
        ) AS average_visit_minutes,

        COALESCE(
            SUM(v.actual_duration) FILTER (
                WHERE v.status = 'done'
            ),
            0
        ) AS completed_duration_minutes

    FROM visits AS v
    LEFT JOIN services AS s ON s.id = v.service_id

    WHERE v.actual_start >= :day_start
      AND v.actual_start < :day_end
"""


async def visit_statistics(
    db,
    selected_date,
    target_id,
    for_employee=False,
):
    # Granice lokalnego dnia uwzględniają zmianę czasu; zapytanie nadal porównuje znaczniki UTC.
    day_start, day_end = day_bounds(selected_date)

    if for_employee:
        # Filtr uzupełnia pełne zapytanie zamiast zastępować je samym warunkiem AND.
        sql = VISIT_STATISTICS_SQL + """
            AND v.employee_id = :target_id
        """
    else:
        sql = VISIT_STATISTICS_SQL + """
            AND s.institution_id = :target_id
        """

    result = await db.execute(
        text(sql).bindparams(
            bindparam("target_id", type_=Uuid),
            bindparam("day_start", type_=DateTime),
            bindparam("day_end", type_=DateTime),
        ),
        {
            "day_start": day_start,
            "day_end": day_end,
            "target_id": target_id,
        },
    )
    stats = dict(result.mappings().one())

    if stats["average_visit_minutes"] is not None:
        stats["average_visit_minutes"] = round(
            float(stats["average_visit_minutes"]), 2
        )

    return stats


@router.get("/api/reports/daily", tags=["Reports"])
async def daily_report(
    institution_id: UUID,
    report_date: date | None = None,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await db.get(Institution, institution_id) is None:
        raise HTTPException(404, "Institution not found")

    # Sam identyfikator instytucji nie uprawnia do odczytu jej raportu.
    await require_admin(db, user, institution_id)
    selected_date = report_date or business_date()
    # Utrwalony raport uzupełnia bieżące statystyki i pozostaje dostępny po zamknięciu dnia.
    saved = await db.scalar(select(DailyReport).where(DailyReport.institution_id == institution_id,
                                                     DailyReport.report_date == selected_date))

    stats = await visit_statistics(
        db,
        selected_date,
        institution_id,
    )

    return {
        "institution_id": institution_id,
        "report_date": selected_date,
        "timezone": ZONE_NAME,
        "archive": report_view(saved),
        **stats,
    }


@router.get(
    "/api/statistics/employee/{employee_id}",
    tags=["Statistics"],
)
async def employee_statistics(
    employee_id: UUID,
    report_date: date | None = None,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if await db.get(Employee, employee_id) is None:
        raise HTTPException(404, "Employee not found")

    # Pracownik odczytuje wyłącznie własne statystyki.
    await require_employee(db, user, employee_id)
    selected_date = report_date or business_date()
    employee = await db.get(Employee, employee_id)
    # Utrwalony raport uzupełnia bieżące statystyki i pozostaje dostępny po zamknięciu dnia.
    saved = await db.scalar(select(DailyReport).where(DailyReport.institution_id == employee.institution_id,
                                                     DailyReport.report_date == selected_date))

    stats = await visit_statistics(
        db,
        selected_date,
        employee_id,
        for_employee=True,
    )

    return {
        "employee_id": employee_id,
        "report_date": selected_date,
        "timezone": ZONE_NAME,
        "archive": report_view(saved, employee_id),
        **stats,
    }
