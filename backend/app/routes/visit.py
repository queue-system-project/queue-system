from datetime import datetime
from math import ceil

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.queue import QueueEntry
from app.models.visit import Visit
from app.routes.users import get_db
from app.routes.queue import lock_service, get_active_entries
from app.security import get_current_user
from app.access import require_employee
from app.notifications import queue_changed
from app.models.employees import Employee, EmployeeService
from app.schemas.visit import (
    StartVisitRequest,
    FinishVisitRequest,
    VisitResponse,
)


router = APIRouter(prefix="/api/visit", tags=["Visit"])


async def lock_employee(db, employee_id):
    # Zapytanie ORM zachowuje blokadę FOR UPDATE i typowanie identyfikatora.
    result = await db.execute(select(
        Employee.id, Employee.institution_id, Employee.user_id, Employee.employee_status,
    ).where(Employee.id == employee_id).with_for_update())
    employee = result.mappings().first()

    if employee is None:
        raise HTTPException(404, "Employee not found")

    return employee


@router.post(
    "/start",
    response_model=VisitResponse,
    status_code=201,
)
async def start_visit(
    data: StartVisitRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        # Nie pozwala rozpocząć obsługi przez podanie identyfikatora innego pracownika.
        await require_employee(db, current_user, data.employee_id)
        service_id = await db.scalar(
            select(QueueEntry.service_id).where(
                QueueEntry.id == data.queue_entry_id
            )
        )

        if service_id is None:
            raise HTTPException(404, "Queue entry not found")

        # Усі зміни спочатку блокують послугу,
        # потім працівника та запис черги.
        service = await lock_service(db, service_id)
        employee = await lock_employee(db, data.employee_id)

        if not service.is_active:
            raise HTTPException(409, "Service is inactive")

        if employee["employee_status"] != "active":
            raise HTTPException(409, "Employee is inactive")

        if employee["institution_id"] != service.institution_id:
            raise HTTPException(
                409, "Employee belongs to another institution"
            )

        allowed = await db.scalar(select(EmployeeService.id).where(
            EmployeeService.employee_id == data.employee_id,
            EmployeeService.service_id == service_id,
        ).limit(1))

        if not allowed:
            raise HTTPException(
                409, "Employee is not assigned to this service"
            )

        result = await db.execute(
            select(QueueEntry)
            .where(QueueEntry.id == data.queue_entry_id)
            .with_for_update()
        )
        entry = result.scalar_one_or_none()

        if entry is None:
            raise HTTPException(404, "Queue entry not found")

        if entry.status not in ("waiting", "confirmed"):
            raise HTTPException(
                409, "Queue entry is not ready for a visit"
            )

        # Termin obowiązuje także przed następnym cyklem timera;
        # potwierdzone przybycie wyznacza najwcześniejszy początek wizyty.
        now = datetime.utcnow()
        # Początek obsługi respektuje zamknięcie dnia oraz grafik instytucji i pracownika.
        from app.day_closure import require_open
        await require_open(db, service, now)
        from app.calendar import require_interval
        from datetime import timedelta
        await require_interval(db, service, now, now + timedelta(microseconds=1), data.employee_id)
        if entry.status == "waiting" and entry.confirmation_expires_at is not None and entry.confirmation_expires_at <= now:
            raise HTTPException(409, "Confirmation deadline has expired")
        if entry.arrival_time is not None and entry.arrival_time > now:
            raise HTTPException(409, "Confirmed arrival time has not been reached")
        # Rezerwacja kalendarzowa nie może rozpocząć się przed swoim terminem.
        if entry.slot_id and entry.priority_at is None:
            from app.models.slots import ServiceSlot
            slot = await db.get(ServiceSlot, entry.slot_id)
            if slot is None or slot.service_id != service.id:
                raise HTTPException(409, "Invalid scheduled slot")
            if slot.slot_start > now:
                raise HTTPException(409, "Scheduled visit time has not been reached")
            if slot.employee_id not in (None, data.employee_id):
                raise HTTPException(409, "Scheduled slot belongs to another employee")

        if entry.employee_id not in (None, data.employee_id):
            raise HTTPException(
                409, "Queue entry belongs to another employee"
            )

        existing_visit = await db.scalar(
            select(Visit.id)
            .where(Visit.queue_entry_id == entry.id)
            .limit(1)
        )

        if existing_visit is not None:
            raise HTTPException(
                409, "Visit already exists for this queue entry"
            )

        busy = await db.scalar(
            select(Visit.id)
            .where(
                Visit.employee_id == data.employee_id,
                Visit.status == "in_service",
            )
            .limit(1)
        )

        if busy is not None:
            raise HTTPException(
                409, "Employee already has an active visit"
            )

        visit = Visit(
            queue_entry_id=entry.id,
            client_id=entry.client_id,
            employee_id=data.employee_id,
            service_id=service.id,
            actual_start=datetime.utcnow(),
            standard_duration=service.standard_duration,
            planned_start=entry.estimated_start_at,
            status="in_service",
        )

        entry.status = "in_service"
        entry.employee_id = data.employee_id

        db.add(visit)
        await db.flush()

        response = VisitResponse.model_validate(visit)
        await queue_changed(db, entry)

    return response


async def finish_visit(db, data, target_status, current_user):
    async with db.begin():
        await require_employee(db, current_user, data.employee_id)
        # Беремо тільки ідентифікатори, а актуальний
        # об'єкт візиту читаємо після блокувань.
        result = await db.execute(
            select(Visit.service_id, Visit.queue_entry_id)
            .where(Visit.id == data.visit_id)
        )
        ids = result.first()

        if ids is None:
            raise HTTPException(404, "Visit not found")

        if ids.service_id is None or ids.queue_entry_id is None:
            raise HTTPException(409, "Visit has incomplete links")

        await lock_service(db, ids.service_id)
        await lock_employee(db, data.employee_id)

        result = await db.execute(
            select(QueueEntry)
            .where(QueueEntry.id == ids.queue_entry_id)
            .with_for_update()
        )
        entry = result.scalar_one_or_none()

        result = await db.execute(
            select(Visit)
            .where(Visit.id == data.visit_id)
            .with_for_update()
        )
        visit = result.scalar_one_or_none()

        if visit is None:
            raise HTTPException(404, "Visit not found")

        if visit.employee_id != data.employee_id:
            raise HTTPException(
                403, "Visit belongs to another employee"
            )

        if entry is None:
            raise HTTPException(409, "Queue entry is missing")

        # Повторення тієї самої операції не змінює час.
        if visit.status == target_status:
            if entry.status != target_status:
                raise HTTPException(
                    409, "Visit and queue statuses do not match"
                )
            return VisitResponse.model_validate(visit)

        if visit.status != "in_service":
            raise HTTPException(409, "Visit is not in progress")

        if entry.status != "in_service":
            raise HTTPException(
                409, "Queue entry is not in service"
            )

        if visit.actual_start is None:
            raise HTTPException(409, "Visit start time is missing")

        now = datetime.utcnow()
        elapsed = (now - visit.actual_start).total_seconds()

        visit.actual_end = now
        visit.actual_duration = max(0, ceil(elapsed / 60))
        # Zapis odchylenia rzeczywistego czasu obsługi od czasu standardowego.
        visit.delay_duration = visit.actual_duration - (visit.standard_duration or 0)
        visit.status = target_status

        entry.status = target_status
        entry.queue_position = None

        await db.flush()

        entries = await get_active_entries(db, ids.service_id)

        for position, item in enumerate(entries, start=1):
            item.queue_position = position

        await db.flush()
        response = VisitResponse.model_validate(visit)
        await queue_changed(db, entry)
        # Zamknięty dzień może nadal zawierać trwającą wizytę; odśwież zapisany raport po jej końcu.
        from app.reports import refresh_daily_report
        from app.models.day_closure import DayClosure
        from app.business_time import business_date
        days = (await db.scalars(select(DayClosure.day).where(
            DayClosure.institution_id == entry.institution_id,
            DayClosure.day >= min(entry.queue_date, business_date(visit.actual_start)),
            DayClosure.day <= business_date(now)))).all()
        for day in days:
            await refresh_daily_report(db, entry.institution_id, day, now)

    return response


@router.post("/end", response_model=VisitResponse)
async def end_visit(
    data: FinishVisitRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await finish_visit(db, data, "done", current_user)


@router.post("/cancel", response_model=VisitResponse)
async def cancel_visit(
    data: FinishVisitRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await finish_visit(db, data, "cancelled", current_user)
