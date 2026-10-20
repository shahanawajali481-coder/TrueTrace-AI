from typing import List
from pydantic import BaseModel
from app.schemas.scan import ScanResponse

class RiskDistributionItem(BaseModel):
    name: str
    value: int
    color: str

class ScansByDateItem(BaseModel):
    date: str
    count: int

class IntegrationStatusItem(BaseModel):
    name: str
    provider: str
    category: str
    status: str  # operational, limited, unconfigured, offline
    last_checked: str
    notes: str

class DashboardStatsResponse(BaseModel):
    total_scans: int
    email_scans: int
    social_scans: int
    phone_scans: int
    low_risk_count: int
    medium_risk_count: int
    high_risk_count: int
    inconclusive_count: int
    recent_activity: List[ScanResponse]
    risk_distribution: List[RiskDistributionItem]
    scans_by_date: List[ScansByDateItem]
    integrations_status: List[IntegrationStatusItem]
