import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_type = Column(String(50), nullable=False, index=True)  # EMAIL, INSTAGRAM, FACEBOOK, WHATSAPP
    target_identifier = Column(String(512), nullable=False)
    masked_identifier = Column(String(512), nullable=False)
    risk_score = Column(Integer, nullable=False, default=0)  # 0 to 100
    risk_level = Column(String(50), nullable=False, default="INCONCLUSIVE")  # LOW, MEDIUM, HIGH, INCONCLUSIVE
    summary = Column(Text, nullable=False)
    confidence_explanation = Column(Text, nullable=False)
    limitations_json = Column(Text, default="[]", nullable=False)
    recommendations_json = Column(Text, default="[]", nullable=False)
    share_token = Column(String(64), unique=True, nullable=True, index=True)
    is_shared = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="scans")
    evidence = relationship("Evidence", back_populates="scan", cascade="all, delete-orphan", order_by="Evidence.risk_contribution.desc()")
