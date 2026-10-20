"""
Integrations Router: Exposes live connection statuses of adapters.
"""
from typing import List
from fastapi import APIRouter
from app.schemas.dashboard import IntegrationStatusItem
from app.api.v1.dashboard import get_real_integrations_status

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.get("/status", response_model=List[IntegrationStatusItem])
def get_integrations_status():
    return get_real_integrations_status()
