import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    check_id = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False)  # CONFIRMED, SUSPICIOUS, INFO, UNAVAILABLE, FAILED
    finding = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    reliability = Column(Float, default=1.0, nullable=False)  # 0.0 to 1.0
    risk_contribution = Column(Integer, default=0, nullable=False)
    limitations = Column(Text, nullable=True)
    details_json = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="evidence")
