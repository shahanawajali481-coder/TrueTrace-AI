"""
Scans Router: Execution of Email, Instagram, Facebook, and WhatsApp scans,
plus report listing, deletion, sharing, and export.
"""
import uuid
import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from fastapi.responses import Response, StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.scan import Scan
from app.schemas.scan import ScanRequestPayload, ScanResponse, ScanListResponse, ShareResponse
from app.api.deps import get_current_user, get_current_user_optional
from app.services.scan_service import scan_service
from app.services.pdf_service import generate_scan_pdf

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("/email", response_model=ScanResponse)
def scan_email(
    payload: ScanRequestPayload,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else None
    return scan_service.execute_scan(
        db=db,
        user_id=current_user.id,
        scan_type="EMAIL",
        identifier=payload.identifier,
        additional_context=payload.additional_context,
        ip_address=client_ip
    )

@router.post("/instagram", response_model=ScanResponse)
def scan_instagram(
    payload: ScanRequestPayload,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else None
    return scan_service.execute_scan(
        db=db,
        user_id=current_user.id,
        scan_type="INSTAGRAM",
        identifier=payload.identifier,
        additional_context=payload.additional_context,
        ip_address=client_ip
    )

@router.post("/facebook", response_model=ScanResponse)
def scan_facebook(
    payload: ScanRequestPayload,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else None
    return scan_service.execute_scan(
        db=db,
        user_id=current_user.id,
        scan_type="FACEBOOK",
        identifier=payload.identifier,
        additional_context=payload.additional_context,
        ip_address=client_ip
    )

@router.post("/whatsapp", response_model=ScanResponse)
def scan_whatsapp(
    payload: ScanRequestPayload,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else None
    return scan_service.execute_scan(
        db=db,
        user_id=current_user.id,
        scan_type="WHATSAPP",
        identifier=payload.identifier,
        additional_context=payload.additional_context,
        ip_address=client_ip
    )

@router.get("", response_model=ScanListResponse)
def list_scans(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    type: Optional[str] = None,
    risk_level: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)
    if type:
        query = query.filter(Scan.scan_type == type.upper())
    if risk_level:
        query = query.filter(Scan.risk_level == risk_level.upper())

    total = query.count()
    offset = (page - 1) * limit
    scans = query.order_by(Scan.created_at.desc()).offset(offset).limit(limit).all()

    formatted_scans = [scan_service.format_scan_to_response(s) for s in scans]
    return ScanListResponse(
        scans=formatted_scans,
        total=total,
        page=page,
        limit=limit
    )

@router.get("/{scan_id}", response_model=ScanResponse)
def get_scan_by_id(
    scan_id: str,
    share_token: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.id == scan_id)
    if share_token:
        scan = query.filter(Scan.share_token == share_token, Scan.is_shared == True).first()
    else:
        if not current_user:
            raise HTTPException(status_code=401, detail="Authentication required")
        scan = query.filter(Scan.user_id == current_user.id).first()

    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan assessment not found or you do not have permission to access it."
        )

    return scan_service.format_scan_to_response(scan)

@router.delete("/{scan_id}")
def delete_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access denied."
        )
    db.delete(scan)
    db.commit()
    return {"success": True, "message": "Scan report permanently removed."}

@router.post("/{scan_id}/share", response_model=ShareResponse)
def share_scan_report(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    token = uuid.uuid4().hex
    scan.share_token = token
    scan.is_shared = True
    db.commit()

    share_url = f"/shared/report/{scan.id}?token={token}"
    return ShareResponse(share_url=share_url, share_token=token)

@router.delete("/{scan_id}/share")
def revoke_share_report(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan.share_token = None
    scan.is_shared = False
    db.commit()
    return {"success": True, "message": "Share link revoked successfully."}

@router.get("/{scan_id}/export/pdf")
def export_scan_pdf(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan report not found")

    pdf_buffer = generate_scan_pdf(scan)
    filename = f"TrueTrace_Report_{scan.scan_type}_{scan.id[:8]}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{scan_id}/export/json")
def export_scan_json(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan report not found")

    formatted = scan_service.format_scan_to_response(scan)
    return Response(
        content=formatted.model_dump_json(indent=2),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=TrueTrace_Report_{scan.id[:8]}.json"}
    )
