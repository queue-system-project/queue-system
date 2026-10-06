from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.business_time import business_date, day_bounds
from app.models.catalog import (
    Institution,
    Service,
    InstitutionCategory,
)
from app.models.calendar import InstitutionHours
from app.models.queue import QueueEntry
from app.models.employees import Employee, EmployeeService
from app.models.review import InstitutionReview
from app.routes.users import get_db
from app.schemas.catalog import ( InstitutionResponse, ServiceResponse,)
from app.core.security import get_current_user
from app.services.calendar import load_calendar


router = APIRouter(
    prefix="/api",
    tags=["Catalog"],
)


class CreateInstitutionReviewRequest(BaseModel):
    queue_entry_id: UUID
    rating: int = Field(ge=1, le=5)


@router.get("/categories")
@router.get("/institution-categories")
async def get_categories(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InstitutionCategory)
        .order_by(InstitutionCategory.name)
    )

    categories = result.scalars().all()

    return [
        {
            "id": category.id,
            "name": category.name,
            "key": category.key,
            "logo_url": category.logo_url,
        }
        for category in categories
    ]


@router.get("/categories/{category_id}")
@router.get("/institution-categories/{category_id}")
async def get_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    category = await db.get(
        InstitutionCategory,
        category_id,
    )

    if category is None:
        raise HTTPException(
            status_code=404,
            detail="Institution category not found",
        )

    return {
        "id": category.id,
        "name": category.name,
        "key": category.key,
        "logo_url": category.logo_url,
    }

@router.get("/institutions")
async def get_institutions(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(
            Institution,
            InstitutionCategory.name.label(
                "category_name"
            ),
            func.avg(
                InstitutionReview.rating
            ).label("rating"),
            func.count(
                InstitutionReview.id
            ).label("reviews_count"),
        )
        .outerjoin(
            InstitutionCategory,
            Institution.category_id
            == InstitutionCategory.id,
        )
        .outerjoin(
            InstitutionReview,
            Institution.id
            == InstitutionReview.institution_id,
        )
        .group_by(
            Institution.id,
            InstitutionCategory.name,
        )
        .order_by(Institution.name)
    )

    rows = result.all()

    return [
        {
            "id": institution.id,
            "name": institution.name,
            "description":
                institution.description,
            "address": institution.address,
            "phone": institution.phone,
            "email": institution.email,

            "category_id":
                institution.category_id,
            "category_name":
                category_name,

            "photo_url":
                institution.photo_url,
            "latitude":
                institution.latitude,
            "longitude":
                institution.longitude,

            "calendar_enabled":
                institution.calendar_enabled,

            "rating": (
                round(float(rating), 1)
                if rating is not None
                else None
            ),

            "reviews_count":
                reviews_count,
        }
        for (
            institution,
            category_name,
            rating,
            reviews_count,
        ) in rows
    ]
@router.get(
    "/institutions/{institution_id}",
    response_model=InstitutionResponse,
)
async def get_institution(
    institution_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    institution = await db.get(
        Institution,
        institution_id,
    )

    if institution is None:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    return institution

@router.get(
    "/institutions/{institution_id}/working-hours"
)
async def get_institution_working_hours(
    institution_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    institution = await db.get(
        Institution,
        institution_id,
    )

    if institution is None:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    result = await db.execute(
        select(InstitutionHours)
        .where(
            InstitutionHours.institution_id
            == institution_id
        )
        .order_by(
            InstitutionHours.day_of_week
        )
    )

    working_hours = result.scalars().all()

    return [
        {
            "id": item.id,
            "institution_id":
                item.institution_id,
            "day_of_week":
                item.day_of_week,
            "start_time":
                item.start_time.strftime("%H:%M"),
            "end_time":
                item.end_time.strftime("%H:%M"),
        }
        for item in working_hours
    ]


@router.post(
    "/institutions/{institution_id}/reviews",
    status_code=201,
)
async def create_institution_review(
    institution_id: UUID,
    data: CreateInstitutionReviewRequest,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    async with db.begin():
        institution = await db.get(
            Institution,
            institution_id,
        )

        if institution is None:
            raise HTTPException(
                status_code=404,
                detail="Institution not found",
            )

        result = await db.execute(
            select(QueueEntry)
            .where(
                QueueEntry.id
                == data.queue_entry_id,
                QueueEntry.client_id
                == current_user.id,
            )
            .with_for_update()
        )

        queue_entry = (
            result.scalar_one_or_none()
        )

        if queue_entry is None:
            raise HTTPException(
                status_code=404,
                detail="Queue entry not found",
            )

        if (
            queue_entry.institution_id
            != institution_id
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Queue entry belongs "
                    "to another institution"
                ),
            )

        if queue_entry.status != "done":
            raise HTTPException(
                status_code=409,
                detail=(
                    "Only completed visits "
                    "can be reviewed"
                ),
            )

        existing_review = await db.scalar(
            select(InstitutionReview)
            .where(
                InstitutionReview.queue_entry_id
                == data.queue_entry_id
            )
        )

        if existing_review is not None:
            raise HTTPException(
                status_code=409,
                detail=(
                    "This visit has already "
                    "been reviewed"
                ),
            )

        review = InstitutionReview(
            queue_entry_id=queue_entry.id,
            institution_id=institution_id,
            client_id=current_user.id,
            rating=data.rating,
        )

        db.add(review)

        await db.flush()
        await db.refresh(review)

        review_id = review.id
        review_rating = review.rating
        review_created_at = review.created_at

    return {
        "id": review_id,
        "queue_entry_id":
            data.queue_entry_id,
        "institution_id":
            institution_id,
        "client_id":
            current_user.id,
        "rating":
            review_rating,
        "created_at":
            review_created_at,
    }


@router.get(
    "/services",
    response_model=list[ServiceResponse],
)
async def get_services(
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Service).order_by(
            Service.name,
            Service.id,
        )
    )

    services = result.scalars().all()

    return [
        {
            "id": service.id,
            "institution_id":
                service.institution_id,
            "name": service.name,
            "description":
                service.description,
            "standard_duration":
                service.standard_duration,
            "max_queue_length":
                service.max_queue_length,
            "is_active":
                service.is_active,
            "queue": 0,
            "spots": (
                service.max_queue_length
                if service.max_queue_length is not None
                else 0
            ),
        }
        for service in services
    ]

@router.get("/services/{service_id}/month-availability")
async def get_service_month_availability(
    service_id: UUID,
    year: int,
    month: int,
    employee_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    from calendar import monthrange
    from datetime import date, timedelta

    if month < 1 or month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12",
        )

    service = await db.get(
        Service,
        service_id,
    )

    if service is None:
        raise HTTPException(
            status_code=404,
            detail="Service not found",
        )

    if not service.is_active:
        return []

    calendar = await load_calendar(
        db,
        service.institution_id,
    )

    employee_result = await db.execute(
        select(Employee.id)
        .join(
            EmployeeService,
            EmployeeService.employee_id == Employee.id,
        )
        .where(
            EmployeeService.service_id == service.id,
            Employee.institution_id == service.institution_id,
            Employee.employee_status == "active",
        )
        .distinct()
        .order_by(Employee.id)
    )

    employee_ids = list(
        employee_result.scalars().all()
    )

    if employee_id is not None:
        if employee_id not in employee_ids:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Selected employee is not assigned "
                    "to this service"
                ),
            )

        employee_ids = [employee_id]

    entries_result = await db.execute(
        select(QueueEntry)
        .where(
            QueueEntry.service_id == service_id,
            QueueEntry.status.in_(
                (
                    "waiting",
                    "confirmed",
                    "in_service",
                )
            ),
            func.extract(
                "year",
                QueueEntry.queue_date,
            ) == year,
            func.extract(
                "month",
                QueueEntry.queue_date,
            ) == month,
        )
        .order_by(
            QueueEntry.queue_date,
            QueueEntry.created_at,
            QueueEntry.id,
        )
    )

    active_entries = list(
        entries_result.scalars().all()
    )

    entries_by_date = {}

    for entry in active_entries:
        entries_by_date.setdefault(
            entry.queue_date,
            [],
        ).append(entry)

    max_queue_length = (
        service.max_queue_length
        if service.max_queue_length is not None
        else 0
    )

    duration_minutes = max(
        int(service.standard_duration or 15),
        1,
    )

    duration = timedelta(
        minutes=duration_minutes
    )

    number_of_days = monthrange(
        year,
        month,
    )[1]

    availability = []

    for day in range(
        1,
        number_of_days + 1,
    ):
        current_date = date(
            year,
            month,
            day,
        )

        day_entries = entries_by_date.get(
            current_date,
            [],
        )

        queue_count = len(day_entries)

        spots = max(
            max_queue_length - queue_count,
            0,
        )

        if max_queue_length <= 0:
            load_percent = 100
            status = "red"
        else:
            load_percent = (
                queue_count
                / max_queue_length
            ) * 100

            if load_percent <= 50:
                status = "green"
            elif load_percent <= 80:
                status = "yellow"
            else:
                status = "red"

        estimated_start_at = None

        if employee_ids:
            day_start = day_bounds(
                current_date
            )[0]

            possible_times = []

            for current_employee_id in employee_ids:
                candidate = calendar.earliest(
                    current_date,
                    day_start,
                    duration,
                    current_employee_id,
                )

                if candidate is None:
                    continue

                employee_entries = [
                    entry
                    for entry in day_entries
                    if entry.employee_id
                    in (
                        None,
                        current_employee_id,
                    )
                ]

                existing_etas = [
                    entry.estimated_start_at
                    for entry in employee_entries
                    if entry.estimated_start_at
                    is not None
                ]

                if existing_etas:
                    last_finish = (
                        max(existing_etas)
                        + duration
                    )

                    candidate = calendar.earliest(
                        current_date,
                        max(
                            day_start,
                            last_finish,
                        ),
                        duration,
                        current_employee_id,
                    )

                if candidate is not None:
                    possible_times.append(
                        candidate
                    )

            if possible_times:
                estimated_start_at = min(
                    possible_times
                )

        no_available_time = (
            estimated_start_at is None
        )

        is_full = (
            no_available_time
            or (
                max_queue_length > 0
                and queue_count
                >= max_queue_length
            )
        )

        if no_available_time:
            status = "red"

        availability.append(
            {
                "date":
                    current_date.isoformat(),

                "queue":
                    queue_count,

                "spots":
                    spots,

                "max_queue_length":
                    max_queue_length,

                "load_percent":
                    round(
                        load_percent,
                        1,
                    ),

                "status":
                    status,

                "is_full":
                    is_full,

                "estimated_start_at": (
                    estimated_start_at.isoformat()
                    if estimated_start_at is not None
                    else None
                ),
            }
        )

    return availability

@router.get(
    "/institutions/{institution_id}/services",
    response_model=list[ServiceResponse],
)
async def get_institution_services(
    institution_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    institution = await db.get(
        Institution,
        institution_id,
    )

    if institution is None:
        raise HTTPException(
            status_code=404,
            detail="Institution not found",
        )

    current_date = business_date()

    result = await db.execute(
        select(
            Service,
            func.count(
                QueueEntry.id
            ).label("queue_count"),
            func.coalesce(
                func.max(QueueEntry.delay_time),
                0,
            ).label("delay"),
        )
        .outerjoin(
            QueueEntry,
            (
                (
                    QueueEntry.service_id
                    == Service.id
                )
                & QueueEntry.status.in_(
                    (
                        "waiting",
                        "confirmed",
                        "in_service",
                    )
                )
                & (
                    QueueEntry.queue_date
                    == current_date
                )
            ),
        )
        .where(
            Service.institution_id
            == institution_id
        )
        .group_by(Service.id)
        .order_by(
            Service.name,
            Service.id,
        )
    )

    rows = result.all()

    services = []

    for service, queue_count, delay in rows:
        queue_count = int(queue_count or 0)
        delay = max(int(delay or 0), 0)

        if service.max_queue_length is None:
            spots = 0
        else:
            spots = max(
                service.max_queue_length
                - queue_count,
                0,
            )

        services.append(
            {
                "id": service.id,
                "institution_id":
                    service.institution_id,
                "name":
                    service.name,
                "description":
                    service.description,
                "standard_duration":
                    service.standard_duration,
                "max_queue_length":
                    service.max_queue_length,
                "is_active":
                    service.is_active,
                "queue":
                    queue_count,
                "spots":
                    spots,
                "delay":
                    delay,
            }
        )

    return services