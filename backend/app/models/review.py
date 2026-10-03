import uuid
from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.database.connection import Base


class InstitutionReview(Base):
    __tablename__ = "institution_reviews"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    queue_entry_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("queue_entries.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    institution_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("institutions.id", ondelete="CASCADE"),
        nullable=False,
    )

    client_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    rating = Column(
        Integer,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )