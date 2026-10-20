from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class EvidenceBase(BaseModel):
    check_id: str
    name: str
    status: str  # CONFIRMED, SUSPICIOUS, INFO, UNAVAILABLE, FAILED
    finding: str
    source: str
    reliability: float = 1.0
    risk_contribution: int = 0
    limitations: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceResponse(EvidenceBase):
    id: str
    scan_id: str
    timestamp: str

    model_config = ConfigDict(from_attributes=True)
