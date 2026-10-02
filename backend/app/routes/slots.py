from app.business_time import business_date, day_bounds, local_boundary
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.catalog import Service
from app.models.employees import Employee, EmployeeService
from app.models.queue import QueueEntry
from app.models.slots import ServiceSlot
from app.routes.users import get_db
from app.routes.queue import lock_service
from app.routes.employees import find_employee
from app.security import get_current_user
from app.access import require_admin
from app.audit import record
from app.schemas.slots import (
    CreateSlotRequest,
    UpdateSlotRequest,
    SlotResponse,
)


router = APIRouter(prefix="/api", tags=["Slots"])


async def lock_context(db, service_id, employee_id):
    # Однаковий порядок блокувань із маршрутами візитів.
    service = await lock_service(db, service_id)
    employee = await find_employee(db, employee_id, lock=True)
    return service, employee


async def validate_assignment(db, service, employee):
    if not service.is_active:
        raise HTTPException(409, "Service is inactive")

    if employee.employee_status != "active":
        raise HTTPException(409, "Employee is inactive")

    if (
        service.institution_id is None
        or employee.institution_id != service.institution_id
    ):
        raise HTTPException(
            400, "Employee and service must belong to one institution"
        )

    assignment_id = await db.scalar(
        select(EmployeeService.id)
        .where(
            EmployeeService.employee_id == employee.id,
            EmployeeService.service_id == service.id,
        )
        .limit(1)
    )

    if assignment_id is None:
        raise HTTPException(
            400, "Employee is not assigned to this service"
        )


async def ensure_no_overlap(
    db, employee_id, slot_start, slot_end, exclude_id=None
):
    query = select(ServiceSlot.id).where(
        ServiceSlot.employee_id == employee_id,
        ServiceSlot.slot_start < slot_end,
        ServiceSlot.slot_end > slot_start,
    )

    if exclude_id is not None:
        query = query.where(ServiceSlot.id != exclude_id)

    conflict_id = await db.scalar(query.limit(1))

    if conflict_id is not None:
        raise HTTPException(
            409, "This employee already has an overlapping slot"
        )


async def lock_existing_slot(db, slot_id):
    result = await db.execute(
        select(ServiceSlot.service_id, ServiceSlot.employee_id)
        .where(ServiceSlot.id == slot_id)
    )
    ids = result.first()

    if ids is None:
        raise HTTPException(404, "Slot not found")

    if ids.service_id is None or ids.employee_id is None:
        raise HTTPException(409, "Slot has incomplete links")

    service, employee = await lock_context(
        db, ids.service_id, ids.employee_id
    )

    result = await db.execute(
        select(ServiceSlot)
        .where(ServiceSlot.id == slot_id)
        .with_for_update()
    )
    slot = result.scalar_one_or_none()

    if slot is None:
        raise HTTPException(404, "Slot not found")

    return slot, service, employee


async def ensure_not_linked(db, slot_id):
    entry_id = await db.scalar(
        select(QueueEntry.id)
        .where(QueueEntry.slot_id == slot_id)
        .limit(1)
    )

    if entry_id is not None:
        raise HTTPException(
            409, "Slot is linked to a queue entry and cannot be changed"
        )


@router.get(
    "/services/{service_id}/slots",
    response_model=list[SlotResponse],
)
async def get_service_slots(
    service_id: UUID,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    service = await db.get(Service, service_id)

    if service is None:
        raise HTTPException(404, "Service not found")

    query = (
        select(ServiceSlot)
        .where(ServiceSlot.service_id == service_id)
        .order_by(ServiceSlot.slot_start, ServiceSlot.id)
    )

    # Dostępność uwzględnia aktywną usługę, pracownika i tylko nadal aktywne rezerwacje.
    if available_only:
        if not service.is_active:
            return []
        query = query.where(
            select(Employee.id).join(EmployeeService, EmployeeService.employee_id == Employee.id).where(
                Employee.id == ServiceSlot.employee_id, Employee.institution_id == service.institution_id,
                Employee.employee_status == "active", EmployeeService.service_id == service_id).exists(),
            ServiceSlot.is_available.is_(True),
            ServiceSlot.slot_start > datetime.utcnow(),
            ~select(QueueEntry.id)
            .where(QueueEntry.slot_id == ServiceSlot.id,
                   QueueEntry.status.in_(("waiting", "confirmed", "in_service")))
            .exists(),
        )

    result = await db.execute(query)
    slots = result.scalars().all()
    if available_only:
        # Slot poza grafikiem lub w zamkniętym dniu nie jest oferowany klientowi.
        from app.calendar import load_calendar
        from app.models.day_closure import DayClosure
        calendar = await load_calendar(db, service.institution_id)
        closed_days = set((await db.scalars(select(DayClosure.day).where(
            DayClosure.institution_id == service.institution_id))).all())
        slots = [s for s in slots if business_date(s.slot_start) not in closed_days
                 and calendar.fits(s.slot_start, s.slot_end, s.employee_id)]
    return slots


@router.post(
    "/slots",
    response_model=SlotResponse,
    status_code=201,
)
async def create_slot(
    data: CreateSlotRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        service, employee = await lock_context(
            db, data.service_id, data.employee_id
        )
        # Zmiana kalendarza wymaga roli administratora i aktywnej przynależności do instytucji.
        # Sam identyfikator slotu nie uprawnia do zmiany kalendarza instytucji.
        await require_admin(db, user, service.institution_id)

        await validate_assignment(db, service, employee)

        # Odrzucamy termin poza grafikiem instytucji lub przypisanego pracownika.
        from app.calendar import require_interval
        await require_interval(db, service, data.slot_start, data.slot_end, employee.id)

        await ensure_no_overlap(
            db,
            employee.id,
            data.slot_start,
            data.slot_end,
        )

        slot = ServiceSlot(
            service_id=service.id,
            employee_id=employee.id,
            slot_start=data.slot_start,
            slot_end=data.slot_end,
            is_available=data.is_available,
        )
        db.add(slot)
        await db.flush()

        response = SlotResponse.model_validate(slot)
        # Audyt i slot zapisują się w tej samej transakcji.
        record(db, user, "save_slot", "slot", slot.id, response.model_dump())

    return response


@router.put(
    "/slots/{slot_id}",
    response_model=SlotResponse,
)
async def update_slot(
    slot_id: UUID,
    data: UpdateSlotRequest,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        slot, service, employee = await lock_existing_slot(
            db, slot_id
        )
        # Sam identyfikator slotu nie uprawnia do zmiany kalendarza instytucji.
        await require_admin(db, user, service.institution_id)

        await ensure_not_linked(db, slot.id)

        if slot.slot_start <= datetime.utcnow():
            raise HTTPException(409, "Past slots cannot be edited")

        await validate_assignment(db, service, employee)

        # Odrzucamy termin poza grafikiem instytucji lub przypisanego pracownika.
        from app.calendar import require_interval
        await require_interval(db, service, data.slot_start, data.slot_end, employee.id)

        await ensure_no_overlap(
            db,
            employee.id,
            data.slot_start,
            data.slot_end,
            exclude_id=slot.id,
        )

        slot.slot_start = data.slot_start
        slot.slot_end = data.slot_end
        slot.is_available = data.is_available

        await db.flush()
        response = SlotResponse.model_validate(slot)
        # Audyt i slot zapisują się w tej samej transakcji.
        record(db, user, "save_slot", "slot", slot.id, response.model_dump())

    return response


@router.delete("/slots/{slot_id}", status_code=204)
async def delete_slot(
    slot_id: UUID,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        slot, service, _ = await lock_existing_slot(db, slot_id)
        # Sam identyfikator slotu nie uprawnia do zmiany kalendarza instytucji.
        await require_admin(db, user, service.institution_id)

        await ensure_not_linked(db, slot.id)
        # Zachowujemy dane usuwanego slotu w audycie.
        record(db, user, "delete", "slot", slot.id, old_data=SlotResponse.model_validate(slot).model_dump())
        await db.delete(slot)

    return Response(status_code=204)
