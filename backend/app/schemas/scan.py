from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.evidence import EvidenceResponse

class ScanRequestPayload(BaseModel):
    identifier: str = Field(..., min_length=2, max_length=512)
    additional_context: Optional[Dict[str, Any]] = None

class ScanResponse(BaseModel):
    scan_id: str
    user_id: str
    scan_type: str
    target_identifier: str
    masked_identifier: str
    risk_score: int
    risk_level: str
    summary: str
    confidence_explanation: str
    evidence: List[EvidenceResponse]
    limitations: List[str]
    recommendations: List[str]
    created_at: str
    completed_at: str
    share_token: Optional[str] = None
    is_shared: bool = False

    model_config = ConfigDict(from_attributes=True)

class ScanListResponse(BaseModel):
    scans: List[ScanResponse]
    total: int
    page: int
    limit: int

class ShareResponse(BaseModel):
    share_url: str
    share_token: str
    expires_at: Optional[str] = None
