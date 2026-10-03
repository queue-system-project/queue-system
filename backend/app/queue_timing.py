from app.business_time import business_date, day_bounds
"""Szacunki UTC i trwałe terminy; każdy zapis wymaga blokady wiersza usługi."""

from datetime import datetime, timedelta
from math import ceil

from sqlalchemy import select

from app.models.queue import QueueEntry, queue_order
from app.models.visit import Visit
from app.models.employees import Employee, EmployeeService
from app.models.settings import SystemSettings
from app.models.users import User
from app.realtime import changed

ACTIVE = ("waiting", "confirmed", "in_service")


async def recalculate(
    db,
    service,
    now=None,
    queue_date=None,
):
    """
    Przelicza pozycje i ETA.

    - Gdy queue_date jest podane, przelicza tylko wybrany dzień.
    - Gdy queue_date jest None, zachowuje poprzednie zachowanie
      i przelicza wszystkie aktywne wpisy usługi.
    """
    now = now or datetime.utcnow()
    await db.flush()

    entries_query = (
        select(QueueEntry)
        .where(
            QueueEntry.service_id == service.id,
            QueueEntry.status.in_(ACTIVE),
        )
    )

    if queue_date is not None:
        entries_query = entries_query.where(
            QueueEntry.queue_date == queue_date
        )

    entries_query = entries_query.order_by(
        QueueEntry.queue_date,
        *queue_order(),
    )

    entries = list(
        (await db.scalars(entries_query)).all()
    )

    employee_ids = list(
        (
            await db.scalars(
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
            )
        ).all()
    )

    # Dla bieżącego dnia pracownik jest dostępny najwcześniej od "now".
    available_now = {
        employee_id: now
        for employee_id in employee_ids
    }

    # Uwzględnij wizyty trwające teraz.
    visits = (
        list(
            (
                await db.scalars(
                    select(Visit).where(
                        Visit.employee_id.in_(employee_ids),
                        Visit.status == "in_service",
                    )
                )
            ).all()
        )
        if employee_ids
        else []
    )

    for visit in visits:
        duration = max(
            1,
            visit.standard_duration
            or service.standard_duration
            or 15,
        )

        finish = (
            (visit.actual_start or now)
            + timedelta(minutes=duration)
        )

        if visit.employee_id in available_now:
            available_now[visit.employee_id] = max(
                available_now[visit.employee_id],
                finish,
                now + timedelta(minutes=1),
            )

    duration = max(
        1,
        service.standard_duration or 15,
    )

    from app.calendar import load_calendar

    calendar = await load_calendar(
        db,
        service.institution_id,
    )

    current_day = None
    position = 0

    for entry in entries:
        if entry.queue_date != current_day:
            current_day = entry.queue_date
            position = 0

            if current_day <= business_date(now):
                available = available_now.copy()
            else:
                # Dla przyszłego dnia zaczynamy od początku lokalnego dnia.
                day_start = day_bounds(current_day)[0]
                available = {
                    employee_id: day_start
                    for employee_id in employee_ids
                }

        position += 1

        old = (
            entry.queue_position,
            entry.estimated_wait_time,
            entry.delay_time,
            entry.estimated_start_at,
        )

        entry.queue_position = position

        if entry.status == "in_service":
            entry.estimated_wait_time = 0

            current = next(
                (
                    visit
                    for visit in visits
                    if visit.queue_entry_id == entry.id
                ),
                None,
            )

            if current and current.actual_start:
                entry.estimated_start_at = (
                    current.actual_start
                )

                if entry.initial_estimated_start_at:
                    entry.delay_time = int(
                        (
                            current.actual_start
                            - entry.initial_estimated_start_at
                        ).total_seconds()
                        / 60
                    )

        else:
            if entry.employee_id in available:
                eligible = [entry.employee_id]
            elif entry.employee_id is None:
                eligible = list(available)
            else:
                eligible = []

            # Rezerwacja ze slotem nie może wystartować przed scheduled_at.
            # Oferta priorytetowa może przyspieszyć termin.
            planned = (
                entry.scheduled_at
                if entry.priority_at is None
                else None
            )

            candidates = {}

            print(
                "QUEUE ETA:",
                {
                    "queue_date": entry.queue_date,
                    "eligible": eligible,
                    "available": available,
                    "employee_ids": employee_ids,
                }
            )

            for employee_id in eligible:
                employee_available = available[
                    employee_id
                ]

                earliest_from = max(
                    employee_available,
                    entry.arrival_time or now,
                    planned or now,
                    now,
                )

                candidate = calendar.earliest(
                    entry.queue_date,
                    earliest_from,
                    timedelta(minutes=duration),
                    employee_id,
                )

                print(
                    "ETA DEBUG:",
                    {
                        "queue_date": entry.queue_date,
                        "employee_id": employee_id,
                        "entry_employee_id": entry.employee_id,
                        "employee_ids": employee_ids,
                        "earliest_from": earliest_from,
                        "duration": duration,
                        "candidate": candidate,
                    }
                )

                if candidate is not None:
                    candidates[
                        employee_id
                    ] = candidate

            if candidates and service.is_active:
                chosen = min(
                    candidates,
                    key=lambda employee_id: (
                        candidates[employee_id],
                        str(employee_id),
                    ),
                )
                if entry.employee_id is None:
                    entry.employee_id = chosen

                start = candidates[chosen]

                entry.estimated_start_at = start

                if (
                    entry.initial_estimated_start_at
                    is None
                ):
                    entry.initial_estimated_start_at = (
                        start
                    )

                if entry.queue_date == business_date(now):

                    entry.estimated_wait_time = max(
                        0,
                        ceil(
                            (
                                start - now
                            ).total_seconds()
                            / 60
                        ),
                    )

                else:

                    day_start = day_bounds(
                        entry.queue_date
                    )[0]

                    first_available_start = (
                        calendar.earliest(
                            entry.queue_date,
                            day_start,
                            timedelta(minutes=duration),
                            chosen,
                        )
                    )

                    if first_available_start is not None:
                        entry.estimated_wait_time = max(
                            0,
                            ceil(
                                (
                                    start
                                    - first_available_start
                                ).total_seconds()
                                / 60
                            ),
                        )
                    else:
                        entry.estimated_wait_time = None

                entry.delay_time = int(
                    (
                        start
                        - entry.initial_estimated_start_at
                    ).total_seconds()
                    / 60
                )

                available[chosen] = (
                    start
                    + timedelta(minutes=duration)
                )

            else:
                entry.estimated_start_at = None
                entry.estimated_wait_time = None
                entry.delay_time = None

        entry.eta_updated_at = now

        new = (
            entry.queue_position,
            entry.estimated_wait_time,
            entry.delay_time,
            entry.estimated_start_at,
        )

        if old != new:
            changed(
                db,
                f"service:{service.id}",
                f"user:{entry.client_id}",
            )

    await db.flush()

    return entries


async def process_service(
    db,
    service,
    now=None,
):
    """
    Najpierw wygaszaj, potem przeliczaj i proś
    o potwierdzenie tylko raz dla wpisu.
    """
    from app.notifications import (
        create_notification,
        queue_changed,
    )

    now = now or datetime.utcnow()

    from app.day_closure import is_closed

    if await is_closed(
        db,
        service.institution_id,
        now,
    ):
        return

    settings = await db.scalar(
        select(SystemSettings).where(
            SystemSettings.institution_id
            == service.institution_id
        )
    )

    threshold = max(
        0,
        (
            settings.confirmation_time_minutes
            if (
                settings
                and settings.confirmation_time_minutes
                is not None
            )
            else 20
        ),
    )

    response_minutes = max(
        1,
        (
            settings.client_response_minutes
            if (
                settings
                and settings.client_response_minutes
                is not None
            )
            else 2
        ),
    )

    expired = list(
        (
            await db.scalars(
                select(QueueEntry)
                .where(
                    QueueEntry.service_id
                    == service.id,
                    QueueEntry.status
                    == "waiting",
                    QueueEntry.queue_date
                    == business_date(now),
                    QueueEntry.confirmation_expires_at
                    <= now,
                )
                .order_by(QueueEntry.id)
                .with_for_update()
            )
        ).all()
    )

    for entry in expired:
        entry.status = "skipped"
        entry.queue_position = None

        await queue_changed(
            db,
            entry,
            update_eta=False,
        )

    # Automatyczny processing dotyczy bieżącego dnia.
    entries = await recalculate(
        db,
        service,
        now,
        queue_date=business_date(now),
    )

    if not service.is_active:
        import os

        if (
            os.getenv("QUEUE_OFFERS_ENABLED")
            == "1"
        ):
            from app.queue_offers import advance

            await advance(
                db,
                service,
                now,
            )

        return

    for entry in entries:
        if (
            entry.queue_date
            != business_date(now)
            or entry.status != "waiting"
            or entry.confirmation_sent_at
            is not None
            or entry.estimated_wait_time
            is None
            or entry.estimated_wait_time
            > threshold
        ):
            continue

        entry.confirmation_sent_at = now
        entry.confirmation_expires_at = (
            now
            + timedelta(
                minutes=response_minutes
            )
        )

        user = await db.get(
            User,
            entry.client_id,
        )

        polish = user.language == "pl"

        title = (
            "Potwierdź przybycie"
            if polish
            else "Confirm your arrival"
        )

        message = (
            f"Potwierdź przybycie w ciągu "
            f"{response_minutes} min."
            if polish
            else (
                "Confirm your arrival within "
                f"{response_minutes} minutes."
            )
        )

        await create_notification(
            db,
            entry.client_id,
            title,
            message,
            f"confirmation:{entry.id}",
        )

        changed(
            db,
            f"service:{service.id}",
            f"user:{entry.client_id}",
        )

    import os

    if (
        os.getenv("QUEUE_OFFERS_ENABLED")
        == "1"
    ):
        from app.queue_offers import advance

        await advance(
            db,
            service,
            now,
        )
