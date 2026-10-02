from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base


class AuthChallenge(Base):
    __tablename__ = "auth_challenges"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    purpose = Column(String(20), primary_key=True)
    code_hash = Column(String(64), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    sent_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
