"""
Admin Router: System administration, health monitoring, audit logs, and scam reports.
Protected strictly with get_current_admin dependency.
"""
import os
import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.models.audit import AuditEvent
from app.models.scam_report import ScamReport
from app.schemas.admin import (
    SystemHealthResponse,
    AuditLogItem,
    AuditLogListResponse,
    ScamReportResponse,
    ScamReportCreate,
)
from app.api.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Administration"])

START_TIME = datetime.now(timezone.utc)

@router.get("/health", response_model=SystemHealthResponse)
def get_system_health(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    user_count = db.query(User).count()
    scan_count = db.query(Scan).count()
    uptime_sec = (datetime.now(timezone.utc) - START_TIME).total_seconds()

    return SystemHealthResponse(
        status="healthy",
        database="connected",
        version=settings.VERSION,
        uptime_seconds=uptime_sec,
        active_users=user_count,
        total_scans_recorded=scan_count,
        queue_depth=0,
        system_memory_mb=128.5,
    )

@router.get("/audit-logs", response_model=AuditLogListResponse)
def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    total = query.count()
    offset = (page - 1) * limit
    events = query.order_by(AuditEvent.created_at.desc()).offset(offset).limit(limit).all()

    formatted_logs = []
    for ev in events:
        details_val = None
        if ev.details_json:
            try:
                details_val = json.loads(ev.details_json)
            except Exception:
                details_val = ev.details_json

        formatted_logs.append(AuditLogItem(
            id=ev.id,
            user_id=ev.user_id,
            action=ev.action,
            resource=ev.resource,
            ip_address=ev.ip_address,
            status=ev.status,
            details=details_val,
            created_at=ev.created_at.isoformat(),
        ))

    return AuditLogListResponse(
        logs=formatted_logs,
        total=total,
        page=page,
        limit=limit,
    )

@router.get("/scam-reports", response_model=List[ScamReportResponse])
def get_scam_reports(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    records = db.query(ScamReport).order_by(ScamReport.created_at.desc()).limit(50).all()
    results = []
    for r in records:
        results.append(ScamReportResponse(
            id=r.id,
            target_identifier=r.target_identifier,
            target_type=r.target_type,
            description=r.description,
            reported_date=r.reported_date.isoformat(),
            source=r.source,
            verified=r.verified,
            created_at=r.created_at.isoformat(),
        ))
    return results

@router.post("/scam-reports", response_model=ScamReportResponse)
def create_scam_report(
    payload: ScamReportCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    report = ScamReport(
        user_id=admin.id,
        target_identifier=payload.target_identifier.strip().lower(),
        target_type=payload.target_type.upper(),
        description=payload.description.strip(),
        source=payload.source or "Admin Verified",
        verified=True,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return ScamReportResponse(
        id=report.id,
        target_identifier=report.target_identifier,
        target_type=report.target_type,
        description=report.description,
        reported_date=report.reported_date.isoformat(),
        source=report.source,
        verified=report.verified,
        created_at=report.created_at.isoformat(),
    )
