from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import select, delete, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User
from app.models.catalog import Institution, Service
from app.models.visit import Visit
from app.models.queue import QueueEntry
from app.models.employees import Employee, EmployeeService
from app.routes.users import get_db
from app.core.security import get_current_user
from app.core.access import require_admin, require_institution
from app.core.audit import record
from app.schemas.employees import (
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    EmployeeResponse,
)


router = APIRouter(prefix="/api", tags=["Employees"])

class EmployeeServicesWrite(BaseModel):
    service_ids: list[UUID]

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
    "/employees/{employee_id}/details"
)
async def get_employee_details(
    employee_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    employee = await find_employee(
        db,
        employee_id,
    )

    # =========================
    # USER
    # =========================

    user = None

    if employee.user_id is not None:
        user = await db.get(
            User,
            employee.user_id,
        )


    # =========================
    # SERVICES
    # =========================

    services_result = await db.execute(
        select(Service)
        .join(
            EmployeeService,
            EmployeeService.service_id
            == Service.id,
        )
        .where(
            EmployeeService.employee_id
            == employee.id
        )
        .order_by(Service.name)
    )

    services = (
        services_result
        .scalars()
        .all()
    )


    # =========================
    # WORKING HOURS
    # =========================

    hours_result = await db.execute(
        text(
            """
            SELECT
                id,
                day_of_week,
                to_char(
                    start_time,
                    'HH24:MI'
                ) AS start_time,
                to_char(
                    end_time,
                    'HH24:MI'
                ) AS end_time
            FROM employee_working_hours
            WHERE employee_id =
                CAST(:employee_id AS uuid)
            ORDER BY
                day_of_week,
                start_time
            """
        ),
        {
            "employee_id":
                str(employee.id),
        },
    )

    working_hours = (
        hours_result
        .mappings()
        .all()
    )


    # =========================
    # INSTITUTION
    # =========================

    institution_result = await db.execute(
        text(
            """
            SELECT
                i.id,
                i.name,
                i.description,
                i.address,
                i.phone,
                i.email,
                i.photo_url,
                i.latitude,
                i.longitude,

                c.id AS category_id,
                c.name AS category_name,
                c.key AS category_key,
                c.logo_url AS category_logo_url,

                AVG(r.rating)::float
                    AS rating,

                COUNT(r.id)
                    AS reviews_count

            FROM institutions i

            LEFT JOIN institution_categories c
                ON c.id = i.category_id

            LEFT JOIN institution_reviews r
                ON r.institution_id = i.id

            WHERE i.id =
                CAST(:institution_id AS uuid)

            GROUP BY
                i.id,
                i.name,
                i.description,
                i.address,
                i.phone,
                i.email,
                i.photo_url,
                i.latitude,
                i.longitude,

                c.id,
                c.name,
                c.key,
                c.logo_url
            """
        ),
        {
            "institution_id":
                str(
                    employee.institution_id
                ),
        },
    )

    institution_row = (
        institution_result
        .mappings()
        .first()
    )


    # =========================
    # RESPONSE
    # =========================

    return {
        "employee": {
            "id":
                employee.id,

            "user_id":
                employee.user_id,

            "institution_id":
                employee.institution_id,

            "employee_status":
                employee.employee_status,

            "room":
                employee.room,

            "first_name":
                user.first_name
                if user
                else None,

            "last_name":
                user.last_name
                if user
                else None,

            "phone":
                user.phone
                if user
                else None,

            "email":
                user.email
                if user
                else None,

            "profile_image":
                user.profile_image
                if user
                else None,
        },


        "working_hours": [
            {
                "id":
                    row["id"],

                "day_of_week":
                    row["day_of_week"],

                "start_time":
                    row["start_time"],

                "end_time":
                    row["end_time"],
            }
            for row in working_hours
        ],


        "services": [
            {
                "id":
                    service.id,

                "name":
                    service.name,

                "description":
                    service.description,

                "standard_duration":
                    service.standard_duration,
            }
            for service in services
        ],


        "institution": (
            {
                "id":
                    institution_row["id"],

                "name":
                    institution_row["name"],

                "description":
                    institution_row[
                        "description"
                    ],

                "address":
                    institution_row[
                        "address"
                    ],

                "phone":
                    institution_row[
                        "phone"
                    ],

                "email":
                    institution_row[
                        "email"
                    ],

                "photo_url":
                    institution_row[
                        "photo_url"
                    ],

                "latitude":
                    institution_row[
                        "latitude"
                    ],

                "longitude":
                    institution_row[
                        "longitude"
                    ],

                "rating": (
                    round(
                        float(
                            institution_row[
                                "rating"
                            ]
                        ),
                        1,
                    )
                    if institution_row[
                        "rating"
                    ] is not None
                    else None
                ),

                "reviews_count":
                    institution_row[
                        "reviews_count"
                    ],

                "category": (
                    {
                        "id":
                            institution_row[
                                "category_id"
                            ],

                        "name":
                            institution_row[
                                "category_name"
                            ],

                        "key":
                            institution_row[
                                "category_key"
                            ],

                        "logo_url":
                            institution_row[
                                "category_logo_url"
                            ],
                    }
                    if institution_row[
                        "category_id"
                    ]
                    else None
                ),
            }
            if institution_row
            else None
        ),
    }

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
@router.get("/employees/{employee_id}/services")
async def get_employee_services(
    employee_id: UUID,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    employee = await db.get(Employee, employee_id)

    if employee is None:
        raise HTTPException(
            status_code=404,
            detail="Employee not found",
        )

    await require_institution(
        db,
        user,
        employee.institution_id,
    )

    rows = (
        await db.scalars(
            select(Service)
            .join(
                EmployeeService,
                EmployeeService.service_id == Service.id,
            )
            .where(
                EmployeeService.employee_id == employee_id
            )
            .order_by(Service.name)
        )
    ).all()

    return [
        {
            "id": service.id,
            "institution_id": service.institution_id,
            "name": service.name,
            "description": service.description,
            "standard_duration": service.standard_duration,
            "max_queue_length": service.max_queue_length,
            "is_active": service.is_active,
        }
        for service in rows
    ]
@router.put("/employees/{employee_id}/services")
async def set_employee_services(
    employee_id: UUID,
    data: EmployeeServicesWrite,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    async with db.begin():
        employee = await db.get(Employee, employee_id)

        if employee is None:
            raise HTTPException(
                status_code=404,
                detail="Employee not found",
            )

        await require_admin(
            db,
            user,
            employee.institution_id,
        )

        service_ids = list(dict.fromkeys(data.service_ids))

        if service_ids:
            services = (
                await db.scalars(
                    select(Service).where(
                        Service.id.in_(service_ids)
                    )
                )
            ).all()

            found_ids = {service.id for service in services}

            missing = [
                service_id
                for service_id in service_ids
                if service_id not in found_ids
            ]

            if missing:
                raise HTTPException(
                    status_code=404,
                    detail="One or more services not found",
                )

            wrong_institution = [
                service.id
                for service in services
                if service.institution_id
                != employee.institution_id
            ]

            if wrong_institution:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Employee can only be assigned "
                        "to services from the same institution"
                    ),
                )

        await db.execute(
            delete(EmployeeService).where(
                EmployeeService.employee_id == employee_id
            )
        )

        for service_id in service_ids:
            db.add(
                EmployeeService(
                    employee_id=employee_id,
                    service_id=service_id,
                )
            )

    return {
        "employee_id": employee_id,
        "service_ids": service_ids,
    }