"""
Scan Orchestration Service for TrueTrace AI
Directs identifiers to correct analyzer, invokes risk engine, and stores results.
"""
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.scan import Scan
from app.models.evidence import Evidence
from app.analyzers.email_analyzer import email_analyzer
from app.analyzers.phone_analyzer import phone_analyzer
from app.analyzers.instagram_analyzer import instagram_analyzer
from app.analyzers.facebook_analyzer import facebook_analyzer
from app.intelligence.risk_engine import risk_engine
from app.services.audit_service import audit_service
from app.schemas.scan import ScanResponse
from app.schemas.evidence import EvidenceResponse

class ScanService:
    @staticmethod
    def execute_scan(
        db: Session,
        user_id: str,
        scan_type: str,
        identifier: str,
        additional_context: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> ScanResponse:
        clean_id = identifier.strip()
        additional_context = additional_context or {}

        # 1. Select Analyzer
        if scan_type == "EMAIL":
            analyzer = email_analyzer
        elif scan_type == "WHATSAPP":
            analyzer = phone_analyzer
        elif scan_type == "INSTAGRAM":
            analyzer = instagram_analyzer
        elif scan_type == "FACEBOOK":
            analyzer = facebook_analyzer
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported scan type: {scan_type}"
            )

        # 2. Execute Analyzer Checks
        raw_evidence = analyzer.analyze(clean_id, context=additional_context)
        masked_id = analyzer.mask_identifier(clean_id)

        # 3. Evaluate Risk through Explainable Rules Engine
        evaluation = risk_engine.evaluate(
            scan_type=scan_type,
            raw_evidence=raw_evidence,
            context=additional_context
        )

        # 4. Persist Scan and Evidence in DB
        scan_id = str(uuid.uuid4())
        scan_record = Scan(
            id=scan_id,
            user_id=user_id,
            scan_type=scan_type,
            target_identifier=clean_id,
            masked_identifier=masked_id,
            risk_score=evaluation.score,
            risk_level=evaluation.level,
            summary=evaluation.summary,
            confidence_explanation=evaluation.confidence_explanation,
            limitations_json=json.dumps(evaluation.limitations),
            recommendations_json=json.dumps(evaluation.recommendations),
            created_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )
        db.add(scan_record)

        evidence_responses = []
        for ev in evaluation.deduplicated_evidence:
            ev_id = str(uuid.uuid4())
            ts = datetime.now(timezone.utc)
            ev_record = Evidence(
                id=ev_id,
                scan_id=scan_id,
                check_id=ev.get("check_id", "unknown"),
                name=ev.get("name", "Verification Check"),
                status=ev.get("status", "INFO"),
                finding=ev.get("finding", ""),
                source=ev.get("source", "TrueTrace System"),
                timestamp=ts,
                reliability=ev.get("reliability", 1.0),
                risk_contribution=ev.get("risk_contribution", 0),
                limitations=ev.get("limitations"),
                details_json=json.dumps(ev.get("details")) if ev.get("details") else None,
            )
            db.add(ev_record)

            evidence_responses.append(EvidenceResponse(
                id=ev_id,
                scan_id=scan_id,
                check_id=ev_record.check_id,
                name=ev_record.name,
                status=ev_record.status,
                finding=ev_record.finding,
                source=ev_record.source,
                timestamp=ts.isoformat(),
                reliability=ev_record.reliability,
                risk_contribution=ev_record.risk_contribution,
                limitations=ev_record.limitations,
                details=ev.get("details"),
            ))

        db.commit()
        db.refresh(scan_record)

        # Log audit event
        audit_service.log_event(
            db=db,
            user_id=user_id,
            action=f"SCAN_{scan_type}",
            resource=f"scan:{scan_id}",
            ip_address=ip_address,
            status="SUCCESS",
            details={"risk_score": evaluation.score, "risk_level": evaluation.level}
        )

        return ScanResponse(
            scan_id=scan_record.id,
            user_id=scan_record.user_id,
            scan_type=scan_record.scan_type,
            target_identifier=scan_record.target_identifier,
            masked_identifier=scan_record.masked_identifier,
            risk_score=scan_record.risk_score,
            risk_level=scan_record.risk_level,
            summary=scan_record.summary,
            confidence_explanation=scan_record.confidence_explanation,
            evidence=evidence_responses,
            limitations=evaluation.limitations,
            recommendations=evaluation.recommendations,
            created_at=scan_record.created_at.isoformat(),
            completed_at=scan_record.completed_at.isoformat(),
            share_token=scan_record.share_token,
            is_shared=scan_record.is_shared,
        )

    @staticmethod
    def format_scan_to_response(scan: Scan) -> ScanResponse:
        """Helper to convert SQLAlchemy Scan to Pydantic ScanResponse."""
        evidence_list = []
        for ev in scan.evidence:
            details_dict = {}
            if ev.details_json:
                try:
                    details_dict = json.loads(ev.details_json)
                except Exception:
                    pass
            evidence_list.append(EvidenceResponse(
                id=ev.id,
                scan_id=ev.scan_id,
                check_id=ev.check_id,
                name=ev.name,
                status=ev.status,
                finding=ev.finding,
                source=ev.source,
                timestamp=ev.timestamp.isoformat(),
                reliability=ev.reliability,
                risk_contribution=ev.risk_contribution,
                limitations=ev.limitations,
                details=details_dict,
            ))

        limitations = []
        if scan.limitations_json:
            try:
                limitations = json.loads(scan.limitations_json)
            except Exception:
                pass

        recommendations = []
        if scan.recommendations_json:
            try:
                recommendations = json.loads(scan.recommendations_json)
            except Exception:
                pass

        return ScanResponse(
            scan_id=scan.id,
            user_id=scan.user_id,
            scan_type=scan.scan_type,
            target_identifier=scan.target_identifier,
            masked_identifier=scan.masked_identifier,
            risk_score=scan.risk_score,
            risk_level=scan.risk_level,
            summary=scan.summary,
            confidence_explanation=scan.confidence_explanation,
            evidence=evidence_list,
            limitations=limitations,
            recommendations=recommendations,
            created_at=scan.created_at.isoformat(),
            completed_at=scan.completed_at.isoformat(),
            share_token=scan.share_token,
            is_shared=scan.is_shared,
        )

scan_service = ScanService()
