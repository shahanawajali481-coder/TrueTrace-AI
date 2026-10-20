"""
Threat Intelligence Service: Aggregates scam reports, known malicious patterns, and external reputation checks.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.scam_report import ScamReport

# Known fraudulent keywords in display names or usernames
HIGH_RISK_IMPERSONATION_TERMS = [
    "support", "official", "helpdesk", "verify", "security",
    "customer_service", "care", "claim", "reward", "billing",
    "lottery", "crypto_recovery", "giftcard", "airdrop"
]

class ThreatIntelligence:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def check_public_reports(self, identifier: str, target_type: str) -> List[Dict[str, Any]]:
        """Queries local database and indexed public scam registry for reported incidents."""
        reports = []
        if self.db:
            clean_id = identifier.strip().lower()
            records = (
                self.db.query(ScamReport)
                .filter(
                    ScamReport.target_identifier == clean_id,
                    ScamReport.target_type == target_type
                )
                .all()
            )
            for r in records:
                reports.append({
                    "id": r.id,
                    "description": r.description,
                    "reported_date": r.reported_date.isoformat(),
                    "source": r.source,
                    "verified": r.verified,
                })
        return reports

    def check_impersonation_keywords(self, identifier: str) -> List[str]:
        """Detects if an identifier tries to spoof official security, banking, or tech support."""
        lower_id = identifier.lower()
        matched = []
        for term in HIGH_RISK_IMPERSONATION_TERMS:
            if term in lower_id:
                matched.append(term)
        return matched

threat_intel = ThreatIntelligence()
