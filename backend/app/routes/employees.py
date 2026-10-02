from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User
from app.models.catalog import Institution, Service
from app.models.visit import Visit
from app.models.queue import QueueEntry
from app.models.employees import Employee, EmployeeService
from app.routes.users import get_db
from app.security import get_current_user
from app.access import require_admin
from app.audit import record
from app.schemas.employees import (
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    EmployeeResponse,
)


router = APIRouter(prefix="/api", tags=["Employees"])


async def find_employee(db, employee_id, lock=False):
    query = select(Employee).where(Employee.id == employee_id)

    if lock:
        query = query.with_for_update()

    result = await db.execute(query)
    employee = result.scalar_one_or_none()

    if employee is None:
        raise HTTPException(404, "Employee not found")

    return employee


async def employee_response(db, employee):
    user = (
        await db.get(User, employee.user_id)
        if employee.user_id is not None
        else None
    )

    result = await db.execute(
        select(EmployeeService.service_id)
        .where(EmployeeService.employee_id == employee.id)
        .order_by(EmployeeService.service_id)
    )
    service_ids = [
        service_id
        for service_id in result.scalars().all()
        if service_id is not None
    ]

    return EmployeeResponse(
        id=employee.id,
        user_id=employee.user_id,
        institution_id=employee.institution_id,
        first_name=user.first_name if user else None,
        last_name=user.last_name if user else None,
        employee_status=employee.employee_status,
        service_ids=service_ids,
    )


async def validate_services(db, institution_id, service_ids):
    unique_ids = set(service_ids)

    if not unique_ids:
        return []

    result = await db.execute(
        select(Service).where(Service.id.in_(unique_ids))
    )
    services = list(result.scalars().all())

    if len(services) != len(unique_ids):
        raise HTTPException(404, "One or more services not found")

    if any(
        service.institution_id != institution_id
        for service in services
    ):
        raise HTTPException(
            400, "All services must belong to this institution"
        )

    return sorted(unique_ids, key=str)


async def ensure_no_active_visit(db, employee_id):
    # Zmiana przypisania nie może pozostawić aktywnych rezerwacji bez właściwego pracownika.
    assigned = await db.scalar(select(QueueEntry.id).where(QueueEntry.employee_id == employee_id,
        QueueEntry.status.in_(("waiting", "confirmed"))).limit(1))
    if assigned:
        raise HTTPException(409, "Resolve assigned bookings before changing the employee")
    visit_id = await db.scalar(
        select(Visit.id)
        .where(
            Visit.employee_id == employee_id,
            Visit.status == "in_service",
        )
        .limit(1)
    )

    if visit_id is not None:
        raise HTTPException(
            409, "Finish or cancel the active visit first"
        )


async def lock_management(db, institution_id, actor):
    # Wspólna kolejność blokad chroni przypisania podczas zapisu lub rozpoczęcia wizyty.
    institution = await db.scalar(select(Institution).where(Institution.id == institution_id).with_for_update())
    if institution is None:
        raise HTTPException(404, "Institution not found")
    # Zapis dostępny tylko administratorowi tej instytucji, zamiast anonimowej zmiany personelu.
    await require_admin(db, actor, institution_id)


async def lock_managed_employee(db, employee_id, actor):
    institution_id = await db.scalar(select(Employee.institution_id).where(Employee.id == employee_id))
    if institution_id is None:
        raise HTTPException(404, "Employee not found")
    await lock_management(db, institution_id, actor)
    return await find_employee(db, employee_id, lock=True)


@router.get(
    "/employees",
    response_model=list[EmployeeResponse],
)
async def get_employees(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    query = select(Employee).order_by(Employee.id)

    if active_only:
        query = query.where(Employee.employee_status == "active")

    result = await db.execute(query)

    return [
        await employee_response(db, employee)
        for employee in result.scalars().all()
    ]


@router.get(
    "/employees/{employee_id}",
    response_model=EmployeeResponse,
)
async def get_employee(
    employee_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    employee = await find_employee(db, employee_id)
    return await employee_response(db, employee)


@router.get(
    "/institutions/{institution_id}/employees",
    response_model=list[EmployeeResponse],
)
async def get_institution_employees(
    institution_id: UUID,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    institution = await db.get(Institution, institution_id)

    if institution is None:
        raise HTTPException(404, "Institution not found")

    query = (
        select(Employee)
        .where(Employee.institution_id == institution_id)
        .order_by(Employee.id)
    )

    if active_only:
        query = query.where(Employee.employee_status == "active")

    result = await db.execute(query)

    return [
        await employee_response(db, employee)
        for employee in result.scalars().all()
    ]


@router.post(
    "/employees",
    response_model=EmployeeResponse,
    status_code=201,
)
async def create_employee(
    data: CreateEmployeeRequest,
    actor=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        await lock_management(db, data.institution_id, actor)
        # Блокування користувача захищає від одночасного
        # створення дублікатів через цей endpoint.
        result = await db.execute(
            select(User)
            .where(User.id == data.user_id)
            .with_for_update()
        )
        user = result.scalar_one_or_none()

        if user is None:
            raise HTTPException(404, "User not found")

        if not user.is_active:
            raise HTTPException(409, "User is inactive")

        institution = await db.get(
            Institution, data.institution_id
        )

        if institution is None:
            raise HTTPException(404, "Institution not found")

        existing_id = await db.scalar(
            select(Employee.id)
            .where(
                Employee.user_id == data.user_id,
                Employee.institution_id == data.institution_id,
            )
            .limit(1)
        )

        if existing_id is not None:
            raise HTTPException(
                409,
                "Employee already exists; use PUT to update",
            )

        service_ids = await validate_services(
            db, data.institution_id, data.service_ids
        )

        employee = Employee(
            user_id=data.user_id,
            institution_id=data.institution_id,
            employee_status="active",
        )
        db.add(employee)
        await db.flush()

        for service_id in service_ids:
            db.add(
                EmployeeService(
                    employee_id=employee.id,
                    service_id=service_id,
                )
            )

        # Адміністратора не понижуємо до employee.
        if user.role == "client":
            user.role = "employee"

        await db.flush()
        response = await employee_response(db, employee)
        # Audyt zatwierdzany razem ze zmianą pozwala wskazać jej autora.
        record(db, actor, "save_employee", "employee", employee.id, response.model_dump())

    return response


@router.put(
    "/employees/{employee_id}",
    response_model=EmployeeResponse,
)
async def update_employee(
    employee_id: UUID,
    data: UpdateEmployeeRequest,
    actor=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        employee = await lock_managed_employee(db, employee_id, actor)

        await ensure_no_active_visit(db, employee.id)

        if data.employee_status == "active":
            user = (
                await db.get(User, employee.user_id)
                if employee.user_id is not None
                else None
            )

            if user is None or not user.is_active:
                raise HTTPException(
                    409, "Employee needs an active user"
                )

        service_ids = await validate_services(
            db, employee.institution_id, data.service_ids
        )

        employee.employee_status = data.employee_status

        # PUT замінює весь список призначених послуг.
        await db.execute(
            delete(EmployeeService).where(
                EmployeeService.employee_id == employee.id
            )
        )

        for service_id in service_ids:
            db.add(
                EmployeeService(
                    employee_id=employee.id,
                    service_id=service_id,
                )
            )

        await db.flush()
        response = await employee_response(db, employee)
        # Audyt zatwierdzany razem ze zmianą pozwala wskazać jej autora.
        record(db, actor, "save_employee", "employee", employee.id, response.model_dump())

    return response


@router.delete(
    "/employees/{employee_id}",
    status_code=204,
)
async def delete_employee(
    employee_id: UUID,
    actor=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        employee = await lock_managed_employee(db, employee_id, actor)

        await ensure_no_active_visit(db, employee.id)
        employee.employee_status = "inactive"
        # Wyłączenie zachowuje historię pracownika; audyt zapisuje wykonawcę.
        record(db, actor, "disable", "employee", employee.id)

    return Response(status_code=204)
