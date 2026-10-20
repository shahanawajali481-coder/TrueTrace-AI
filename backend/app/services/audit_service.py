"""
Audit Logging Service for TrueTrace AI
Logs security actions, auth events, scan events, and data access.
"""
import json
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        resource: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
    ):
        try:
            event = AuditEvent(
                user_id=user_id,
                action=action,
                resource=resource,
                ip_address=ip_address,
                status=status,
                details_json=json.dumps(details) if details else None,
            )
            db.add(event)
            db.commit()
        except Exception as e:
            db.rollback()
            # Non-blocking: audit log failure should not break critical user flow
            print(f"[AuditService Error] Failed to write audit event: {e}")

audit_service = AuditService()
