import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ScamReport(Base):
    __tablename__ = "scam_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    target_identifier = Column(String(512), nullable=False, index=True)
    target_type = Column(String(50), nullable=False)  # EMAIL, INSTAGRAM, FACEBOOK, WHATSAPP
    description = Column(Text, nullable=False)
    reported_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    source = Column(String(255), default="Community Submission", nullable=False)
    verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="scam_reports")
