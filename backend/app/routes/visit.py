from datetime import datetime
from math import ceil

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.queue import QueueEntry
from app.models.visit import Visit
from app.routes.users import get_db
from app.routes.queue import lock_service, get_active_entries
from app.core.security import get_current_user
from app.core.access import require_employee
from app.services.notifications import queue_changed
from app.models.users import User
from app.models.employees import Employee, EmployeeService
from app.schemas.visit import (
    StartVisitRequest,
    FinishVisitRequest,
    VisitResponse,
)
from app.models.catalog import (
    Service,
    Institution,
    InstitutionCategory,
)
from sqlalchemy import select, text, func
from sqlalchemy.orm import aliased
from app.models.review import InstitutionReview

from app.core.business_time import business_date
from app.models.catalog import (
    Service,
    Institution,
    InstitutionCategory,
)
from app.models.review import InstitutionReview


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
        from app.services.day_closure import require_open
        await require_open(db, service, now)
        from app.services.calendar import require_interval
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
        from app.services.reports import refresh_daily_report
        from app.models.day_closure import DayClosure
        from app.core.business_time import business_date
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

@router.get("/appointments")
async def get_client_appointments(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ClientUser = aliased(User)
    EmployeeUser = aliased(User)

    institution_rating = (
        select(
            func.avg(
                InstitutionReview.rating
            )
        )
        .where(
            InstitutionReview.institution_id
            == Institution.id
        )
        .correlate(Institution)
        .scalar_subquery()
    )

    result = await db.execute(
        select(
            # =========================
            # QUEUE ENTRY
            # =========================

            QueueEntry.id,
            QueueEntry.service_id,
            QueueEntry.employee_id,
            QueueEntry.client_id,
            QueueEntry.institution_id,

            QueueEntry.queue_position,
            QueueEntry.status,

            QueueEntry.queue_date,
            QueueEntry.scheduled_at,

            QueueEntry.estimated_start_at,
            QueueEntry.initial_estimated_start_at,
            QueueEntry.estimated_wait_time,
            QueueEntry.delay_time,
            QueueEntry.eta_updated_at,

            QueueEntry.confirmation_sent_at,
            QueueEntry.confirmation_expires_at,

            QueueEntry.client_note,

            # =========================
            # SERVICE
            # =========================

            Service.name.label(
                "service_name"
            ),

            Service.description.label(
                "service_description"
            ),

            Service.standard_duration.label(
                "standard_duration"
            ),

            # =========================
            # CLIENT
            # =========================

            ClientUser.id.label(
                "client_user_id"
            ),

            ClientUser.first_name.label(
                "client_first_name"
            ),

            ClientUser.last_name.label(
                "client_last_name"
            ),

            ClientUser.phone.label(
                "client_phone"
            ),

            ClientUser.email.label(
                "client_email"
            ),

            ClientUser.profile_image.label(
                "client_profile_image"
            ),

            # =========================
            # EMPLOYEE
            # =========================

            Employee.id.label(
                "employee_record_id"
            ),

            Employee.room.label(
                "employee_room"
            ),

            EmployeeUser.id.label(
                "employee_user_id"
            ),

            EmployeeUser.first_name.label(
                "employee_first_name"
            ),

            EmployeeUser.last_name.label(
                "employee_last_name"
            ),

            EmployeeUser.phone.label(
                "employee_phone"
            ),

            EmployeeUser.email.label(
                "employee_email"
            ),

            EmployeeUser.profile_image.label(
                "employee_profile_image"
            ),

            # =========================
            # INSTITUTION
            # =========================

            Institution.id.label(
                "institution_record_id"
            ),

            Institution.name.label(
                "institution_name"
            ),

            Institution.description.label(
                "institution_description"
            ),

            Institution.address.label(
                "institution_address"
            ),

            Institution.phone.label(
                "institution_phone"
            ),

            Institution.email.label(
                "institution_email"
            ),

            Institution.photo_url.label(
                "institution_photo_url"
            ),

            Institution.latitude.label(
                "institution_latitude"
            ),

            Institution.longitude.label(
                "institution_longitude"
            ),

            # =========================
            # CATEGORY
            # =========================

            InstitutionCategory.id.label(
                "category_id"
            ),

            InstitutionCategory.name.label(
                "category_name"
            ),

            InstitutionCategory.key.label(
                "category_key"
            ),

            InstitutionCategory.logo_url.label(
                "category_logo_url"
            ),

            # =========================
            # RATING
            # =========================

            institution_rating.label(
                "institution_rating"
            ),
        )

        # =========================
        # SERVICE
        # =========================

        .join(
            Service,
            QueueEntry.service_id
            == Service.id,
        )

        # =========================
        # INSTITUTION
        # =========================

        .join(
            Institution,
            QueueEntry.institution_id
            == Institution.id,
        )

        # =========================
        # CLIENT
        # =========================

        .join(
            ClientUser,
            QueueEntry.client_id
            == ClientUser.id,
        )

        # =========================
        # EMPLOYEE
        # =========================

        .outerjoin(
            Employee,
            QueueEntry.employee_id
            == Employee.id,
        )

        .outerjoin(
            EmployeeUser,
            Employee.user_id
            == EmployeeUser.id,
        )

        # =========================
        # CATEGORY
        # =========================

        .outerjoin(
            InstitutionCategory,
            Institution.category_id
            == InstitutionCategory.id,
        )

        .where(
            QueueEntry.client_id
            == current_user.id,

            QueueEntry.status.in_(
                (
                    "waiting",
                    "confirmed",
                    "in_service",
                )
            ),

            QueueEntry.queue_date
            >= business_date(),
        )

        .order_by(
            QueueEntry.queue_date.asc(),

            QueueEntry
            .estimated_start_at
            .asc()
            .nullslast(),

            QueueEntry.created_at.asc(),
        )
    )

    rows = result.mappings().all()

    return [
        {
            # =========================
            # APPOINTMENT
            # =========================

            "id":
                row["id"],

            "service_id":
                row["service_id"],

            "employee_id":
                row["employee_id"],

            "client_id":
                row["client_id"],

            "institution_id":
                row["institution_id"],

            "queue_position":
                row["queue_position"],

            "status":
                row["status"],

            "queue_date":
                row["queue_date"],

            "scheduled_at":
                row["scheduled_at"],

            "estimated_start_at":
                row["estimated_start_at"],

            "initial_estimated_start_at":
                row[
                    "initial_estimated_start_at"
                ],

            "estimated_wait_time":
                row["estimated_wait_time"],


            "delay_time":
                row["delay_time"] or 0,

            "eta_updated_at":
                row["eta_updated_at"],

            "confirmation_sent_at":
                row["confirmation_sent_at"],

            "confirmation_expires_at":
                row["confirmation_expires_at"],

            "client_note":
                row["client_note"],

            # =========================
            # SERVICE
            # =========================

            "service": {
                "id":
                    row["service_id"],

                "name":
                    row["service_name"],

                "description":
                    row[
                        "service_description"
                    ],

                "standard_duration":
                    row[
                        "standard_duration"
                    ],
            },

            # =========================
            # CLIENT
            # =========================

            "client": {
                "id":
                    row["client_user_id"],

                "first_name":
                    row["client_first_name"],

                "last_name":
                    row["client_last_name"],

                "phone":
                    row["client_phone"],

                "email":
                    row["client_email"],

                "profile_image":
                    row[
                        "client_profile_image"
                    ],
            },

            # =========================
            # EMPLOYEE
            # =========================

            "employee": (
                {
                    "id":
                        row[
                            "employee_record_id"
                        ],

                    "user_id":
                        row[
                            "employee_user_id"
                        ],

                    "first_name":
                        row[
                            "employee_first_name"
                        ],

                    "last_name":
                        row[
                            "employee_last_name"
                        ],

                    "phone":
                        row[
                            "employee_phone"
                        ],

                    "email":
                        row[
                            "employee_email"
                        ],

                    "profile_image":
                        row[
                            "employee_profile_image"
                        ],

                    "room":
                        row[
                            "employee_room"
                        ],
                }

                if row[
                    "employee_record_id"
                ]

                else None
            ),

            # =========================
            # INSTITUTION
            # =========================

            "institution": {
                "id":
                    row[
                        "institution_record_id"
                    ],

                "name":
                    row[
                        "institution_name"
                    ],

                "description":
                    row[
                        "institution_description"
                    ],

                "address":
                    row[
                        "institution_address"
                    ],

                "phone":
                    row[
                        "institution_phone"
                    ],

                "email":
                    row[
                        "institution_email"
                    ],

                "photo_url":
                    row[
                        "institution_photo_url"
                    ],

                "latitude":
                    row[
                        "institution_latitude"
                    ],

                "longitude":
                    row[
                        "institution_longitude"
                    ],

                "rating": (
                    round(
                        float(
                            row[
                                "institution_rating"
                            ]
                        ),
                        1,
                    )

                    if row[
                        "institution_rating"
                    ] is not None

                    else None
                ),

                "category": (
                    {
                        "id":
                            row[
                                "category_id"
                            ],

                        "name":
                            row[
                                "category_name"
                            ],

                        "key":
                            row[
                                "category_key"
                            ],

                        "logo_url":
                            row[
                                "category_logo_url"
                            ],
                    }

                    if row["category_id"]

                    else None
                ),
            },
        }

        for row in rows
    ]

@router.get("/history")
async def get_visit_history(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    ClientUser = aliased(User)
    EmployeeUser = aliased(User)

    institution_rating = (
        select(
            func.avg(
                InstitutionReview.rating
            )
        )
        .where(
            InstitutionReview.institution_id
            == Institution.id
        )
        .correlate(Institution)
        .scalar_subquery()
    )

    result = await db.execute(
        select(
            # =========================
            # VISIT
            # =========================

            Visit.id.label(
                "visit_id"
            ),

            Visit.queue_entry_id,
            Visit.service_id,
            Visit.employee_id,

            Visit.actual_start,
            Visit.actual_end,
            Visit.actual_duration,
            Visit.standard_duration,
            Visit.status,

            # =========================
            # QUEUE ENTRY
            # =========================

            QueueEntry.client_note,

            # =========================
            # SERVICE
            # =========================

            Service.name.label(
                "service_name"
            ),

            Service.description.label(
                "service_description"
            ),

            # =========================
            # CLIENT
            # =========================

            ClientUser.id.label(
                "client_user_id"
            ),

            ClientUser.first_name.label(
                "client_first_name"
            ),

            ClientUser.last_name.label(
                "client_last_name"
            ),

            ClientUser.phone.label(
                "client_phone"
            ),

            ClientUser.email.label(
                "client_email"
            ),

            ClientUser.profile_image.label(
                "client_profile_image"
            ),

            # =========================
            # EMPLOYEE
            # =========================

            Employee.id.label(
                "employee_record_id"
            ),

            Employee.room.label(
                "employee_room"
            ),

            EmployeeUser.id.label(
                "employee_user_id"
            ),

            EmployeeUser.first_name.label(
                "employee_first_name"
            ),

            EmployeeUser.last_name.label(
                "employee_last_name"
            ),

            EmployeeUser.phone.label(
                "employee_phone"
            ),

            EmployeeUser.email.label(
                "employee_email"
            ),

            EmployeeUser.profile_image.label(
                "employee_profile_image"
            ),

            # =========================
            # INSTITUTION
            # =========================

            Institution.id.label(
                "institution_id"
            ),

            Institution.name.label(
                "institution_name"
            ),

            Institution.description.label(
                "institution_description"
            ),

            Institution.address.label(
                "institution_address"
            ),

            Institution.phone.label(
                "institution_phone"
            ),

            Institution.email.label(
                "institution_email"
            ),

            Institution.photo_url.label(
                "institution_photo_url"
            ),

            Institution.latitude.label(
                "institution_latitude"
            ),

            Institution.longitude.label(
                "institution_longitude"
            ),

            # =========================
            # CATEGORY
            # =========================

            InstitutionCategory.id.label(
                "category_id"
            ),

            InstitutionCategory.name.label(
                "category_name"
            ),

            InstitutionCategory.key.label(
                "category_key"
            ),

            InstitutionCategory.logo_url.label(
                "category_logo_url"
            ),

            # =========================
            # RATING
            # =========================

            institution_rating.label(
                "institution_rating"
            ),

            InstitutionReview.rating.label(
                "review_rating"
            ),
        )

        # QUEUE ENTRY
        .join(
            QueueEntry,
            Visit.queue_entry_id
            == QueueEntry.id,
        )

        # SERVICE
        .join(
            Service,
            Visit.service_id
            == Service.id,
        )

        # INSTITUTION
        .join(
            Institution,
            Service.institution_id
            == Institution.id,
        )

        # CLIENT
        .join(
            ClientUser,
            Visit.client_id
            == ClientUser.id,
        )

        # EMPLOYEE
        .outerjoin(
            Employee,
            Visit.employee_id
            == Employee.id,
        )

        .outerjoin(
            EmployeeUser,
            Employee.user_id
            == EmployeeUser.id,
        )

        # CATEGORY
        .outerjoin(
            InstitutionCategory,
            Institution.category_id
            == InstitutionCategory.id,
        )

        # REVIEW FOR THIS VISIT
        .outerjoin(
            InstitutionReview,
            (
                InstitutionReview.queue_entry_id
                == Visit.queue_entry_id
            )
            & (
                InstitutionReview.client_id
                == current_user.id
            ),
        )

        .where(
            Visit.client_id
            == current_user.id,

            Visit.status == "done",
        )

        .order_by(
            Visit.actual_end.desc()
        )
    )

    rows = result.mappings().all()

    return [
        {
            "id":
                row["visit_id"],

            "queue_entry_id":
                row["queue_entry_id"],

            "service_id":
                row["service_id"],

            "employee_id":
                row["employee_id"],

            "actual_start":
                row["actual_start"],

            "actual_end":
                row["actual_end"],

            "actual_duration":
                row["actual_duration"],

            "standard_duration":
                row["standard_duration"],

            "status":
                row["status"],

            "client_note":
                row["client_note"],

            "rated":
                row["review_rating"]
                is not None,

            "review_rating":
                row["review_rating"],

            "service": {
                "id":
                    row["service_id"],

                "name":
                    row["service_name"],

                "description":
                    row[
                        "service_description"
                    ],

                "standard_duration":
                    row[
                        "standard_duration"
                    ],
            },

            "client": {
                "id":
                    row["client_user_id"],

                "first_name":
                    row["client_first_name"],

                "last_name":
                    row["client_last_name"],

                "phone":
                    row["client_phone"],

                "email":
                    row["client_email"],

                "profile_image":
                    row[
                        "client_profile_image"
                    ],
            },

            "employee": (
                {
                    "id":
                        row[
                            "employee_record_id"
                        ],

                    "user_id":
                        row[
                            "employee_user_id"
                        ],

                    "first_name":
                        row[
                            "employee_first_name"
                        ],

                    "last_name":
                        row[
                            "employee_last_name"
                        ],

                    "phone":
                        row[
                            "employee_phone"
                        ],

                    "email":
                        row[
                            "employee_email"
                        ],

                    "profile_image":
                        row[
                            "employee_profile_image"
                        ],

                    "room":
                        row[
                            "employee_room"
                        ],
                }

                if row[
                    "employee_record_id"
                ]

                else None
            ),

            "institution": {
                "id":
                    row["institution_id"],

                "name":
                    row[
                        "institution_name"
                    ],

                "description":
                    row[
                        "institution_description"
                    ],

                "address":
                    row[
                        "institution_address"
                    ],

                "phone":
                    row[
                        "institution_phone"
                    ],

                "email":
                    row[
                        "institution_email"
                    ],

                "photo_url":
                    row[
                        "institution_photo_url"
                    ],

                "latitude":
                    row[
                        "institution_latitude"
                    ],

                "longitude":
                    row[
                        "institution_longitude"
                    ],

                "rating": (
                    round(
                        float(
                            row[
                                "institution_rating"
                            ]
                        ),
                        1,
                    )

                    if row[
                        "institution_rating"
                    ] is not None

                    else None
                ),

                "category": (
                    {
                        "id":
                            row["category_id"],

                        "name":
                            row[
                                "category_name"
                            ],

                        "key":
                            row[
                                "category_key"
                            ],

                        "logo_url":
                            row[
                                "category_logo_url"
                            ],
                    }

                    if row["category_id"]

                    else None
                ),
            },
        }

        for row in rows
    ]