from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    ForeignKey,
    Float,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.database.connection import Base


class InstitutionCategory(Base):
    __tablename__ = "institution_categories"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
    )

    name = Column(
        String(120),
        nullable=False,
    )

    logo_url = Column(Text)

    key = Column(
        String(100),
        nullable=False,
        unique=True,
    )


class Institution(Base):
    __tablename__ = "institutions"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
    )

    name = Column(
        String(120),
        nullable=False,
    )

    description = Column(Text)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(60))

    category_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("institution_categories.id"),
    )

    latitude = Column(Float)
    longitude = Column(Float)
    photo_url = Column(Text)

    # Brak konfiguracji zachowuje dotychczasową dostępność;
    # pusty włączony grafik zamyka instytucję.
    calendar_enabled = Column(
        Boolean,
        nullable=False,
        default=False,
    )


class Service(Base):
    __tablename__ = "services"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
    )

    institution_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey(
            "institutions.id",
            ondelete="CASCADE",
        ),
    )

    name = Column(
        String(120),
        nullable=False,
    )

    description = Column(Text)

    standard_duration = Column(
        Integer,
        nullable=False,
    )

    max_queue_length = Column(
        Integer,
        default=50,
    )

    is_active = Column(
        Boolean,
        default=True,
    )