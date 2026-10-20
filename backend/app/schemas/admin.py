from typing import List, Optional, Any
from pydantic import BaseModel, ConfigDict

class SystemHealthResponse(BaseModel):
    status: str
    database: str
    version: str
    uptime_seconds: float
    active_users: int
    total_scans_recorded: int
    queue_depth: int
    system_memory_mb: float

class AuditLogItem(BaseModel):
    id: str
    user_id: Optional[str]
    action: str
    resource: str
    ip_address: Optional[str]
    status: str
    details: Optional[Any]
    created_at: str

class AuditLogListResponse(BaseModel):
    logs: List[AuditLogItem]
    total: int
    page: int
    limit: int

class ScamReportCreate(BaseModel):
    target_identifier: str
    target_type: str
    description: str
    source: Optional[str] = "Community Submission"

class ScamReportResponse(BaseModel):
    id: str
    target_identifier: str
    target_type: str
    description: str
    reported_date: str
    source: str
    verified: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)
