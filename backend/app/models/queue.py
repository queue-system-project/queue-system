import uuid
from app.business_time import business_date
from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, Date, ForeignKey, String, case, func, Index, text
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, ENUM

from app.database.connection import Base


class QueueEntry(Base):
    __tablename__ = "queue_entries"
    # Indeksy chronią przed równoczesnym zajęciem slotu i podwójnym zapisem klienta tego samego dnia.
    __table_args__ = (
        Index("uq_queue_active_client_day", "client_id", "service_id", "queue_date", unique=True,
              postgresql_where=text("status IN ('waiting','confirmed','in_service')"),
              sqlite_where=text("status IN ('waiting','confirmed','in_service')")),
        Index("uq_queue_active_slot", "slot_id", unique=True,
              postgresql_where=text("status IN ('waiting','confirmed','in_service') AND slot_id IS NOT NULL"),
              sqlite_where=text("status IN ('waiting','confirmed','in_service') AND slot_id IS NOT NULL")),
    )

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    institution_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("institutions.id"),
    )
    service_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("services.id"),
    )
    client_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id"),
    )
    # Instancja Column zapewnia mapowanie ORM; samo przypisanie klasy go nie tworzyło.
    employee_id = Column(PG_UUID(as_uuid=True))
    slot_id = Column(PG_UUID(as_uuid=True))
    # Dzień instytucji oddziela rezerwacje od kolejki bieżącej; termin zachowuje dolną granicę ETA.
    queue_date = Column(Date, nullable=False, default=business_date)
    scheduled_at = Column(DateTime)
    confirmation_sent_at = Column(DateTime)
    confirmation_expires_at = Column(DateTime)
    confirmed_at = Column(DateTime)
    # Trwały zapis ETA i przybycia pozwala zachować uzgodniony czas po przeliczeniu.
    arrival_time = Column(DateTime)
    estimated_wait_time = Column(Integer)
    delay_time = Column(Integer)
    estimated_start_at = Column(DateTime)
    initial_estimated_start_at = Column(DateTime)
    eta_updated_at = Column(DateTime)
    priority_at = Column(DateTime)
    # Przyczyna anulowania i autor nieobecności rozróżniają odmowę klienta od decyzji pracownika.
    cancellation_reason = Column(String(80))
    missed_at = Column(DateTime)
    missed_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))

    queue_position = Column(Integer)

    status = Column(
        ENUM(
            "waiting",
            "confirmed",
            "in_service",
            "done",
            "missed",
            "skipped",
            "cancelled",
            name="queue_status",
            create_type=False,
        ),
        default="waiting",
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


def queue_order():
    # Wspólny porządek dla HTTP i WebSocket: obsługiwani, priorytetowi, pozostali.
    # Dla rezerwacji kolejność wyznacza termin slotu, a nie dzień utworzenia zapisu.
    return (case((QueueEntry.status == "in_service", 0),
                 (QueueEntry.priority_at.is_not(None), 1), else_=2),
            func.coalesce(QueueEntry.priority_at, QueueEntry.scheduled_at, QueueEntry.created_at), QueueEntry.id)
