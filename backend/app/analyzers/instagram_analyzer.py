"""
Instagram Risk Analyzer for TrueTrace AI
Examines public handle syntax, impersonation keywords, community scam reports,
and provides transparent unavailable states for private data.
"""
import re
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

from app.analyzers.base import BaseAnalyzer
from app.intelligence.threat_intelligence import threat_intel

class InstagramAnalyzer(BaseAnalyzer):
    def mask_identifier(self, identifier: str) -> str:
        """Masks Instagram handle: e.g. @su***rt"""
        clean = identifier.strip().lstrip("@")
        if len(clean) > 4:
            return "@" + clean[:2] + "***" + clean[-2:]
        return "@" + clean[:1] + "***"

    def normalize_username(self, raw_input: str) -> str:
        """Extracts and normalizes Instagram username from URLs or handles."""
        val = raw_input.strip()
        if "instagram.com/" in val:
            try:
                parsed = urlparse(val if "://" in val else f"https://{val}")
                path_parts = [p for p in parsed.path.split("/") if p]
                if path_parts:
                    val = path_parts[0]
            except Exception:
                pass
        val = val.lstrip("@").split("?")[0].strip().lower()
        return val

    def analyze(self, identifier: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        evidence: List[Dict[str, Any]] = []
        username = self.normalize_username(identifier)
        context = context or {}

        # 1. Username Syntax Validation (Instagram rules: <= 30 chars, letters, numbers, periods, underscores)
        valid_format = bool(re.match(r"^[a-zA-Z0-9._]{1,30}$", username))
        if not valid_format or not username:
            evidence.append(self.create_evidence(
                check_id="instagram_syntax",
                name="Instagram Handle Syntax",
                status="SUSPICIOUS",
                finding=f"Submitted username '{username}' does not adhere to Instagram's standard naming rules (1-30 characters: letters, numbers, periods, underscores).",
                source="Instagram Identifier Specification",
                reliability=1.0,
                risk_contribution=30,
                details={"username": username, "valid_format": False}
            ))
            return evidence

        evidence.append(self.create_evidence(
            check_id="instagram_syntax",
            name="Instagram Handle Syntax",
            status="INFO",
            finding=f"Valid Instagram handle format: @{username}.",
            source="Instagram Identifier Specification",
            reliability=1.0,
            risk_contribution=0,
            details={"username": username, "valid_format": True}
        ))

        # 2. Impersonation & Security Keyword Match
        impersonation_keywords = ["support", "official", "helpdesk", "verify", "security", "meta_care", "recovery", "agent"]
        matched_kws = [kw for kw in impersonation_keywords if kw in username]
        if matched_kws:
            evidence.append(self.create_evidence(
                check_id="instagram_impersonation_keywords",
                name="Authority Spoofing Pattern",
                status="SUSPICIOUS",
                finding=f"Username contains authority or support terms: '{', '.join(matched_kws)}'. Common tactic in Instagram credential harvesting scams.",
                source="TrueTrace Heuristic Analyzer",
                reliability=0.85,
                risk_contribution=40,
                details={"matched_keywords": matched_kws}
            ))

        # 3. Random Digit / Burner Pattern
        # Handles ending in 5 or more random digits often signify bulk-created bot accounts
        trailing_digits_match = re.search(r"(\d{5,})$", username)
        if trailing_digits_match:
            evidence.append(self.create_evidence(
                check_id="instagram_trailing_digits",
                name="Automated Handle Generation Pattern",
                status="SUSPICIOUS",
                finding=f"Handle ends with a long sequence of numeric digits ({trailing_digits_match.group(1)}), often indicating automated account generation.",
                source="TrueTrace Heuristic Analyzer",
                reliability=0.7,
                risk_contribution=20,
                details={"trailing_digits": trailing_digits_match.group(1)}
            ))

        # 4. Community Scam Reports Check
        reports = threat_intel.check_public_reports(username, target_type="INSTAGRAM")
        if reports:
            evidence.append(self.create_evidence(
                check_id="instagram_scam_database",
                name="Community Scam Reports",
                status="CONFIRMED",
                finding=f"Found {len(reports)} community scam report(s) associated with @{username}.",
                source="Public Threat Intelligence Feed",
                reliability=0.95,
                risk_contribution=60,
                details={"reports": reports}
            ))
        else:
            evidence.append(self.create_evidence(
                check_id="instagram_scam_database",
                name="Community Scam Reports",
                status="INFO",
                finding=f"No prior fraudulent or phishing reports recorded for @{username}.",
                source="Public Threat Intelligence Feed",
                reliability=0.7,
                risk_contribution=0
            ))

        # 5. User-Provided Context Verification (if submitted)
        claimed_name = context.get("claimed_name")
        if claimed_name:
            evidence.append(self.create_evidence(
                check_id="instagram_user_context",
                name="Claimed Identity Verification",
                status="INFO",
                finding=f"User stated account claims to represent '{claimed_name}'. Verify that the handle matches official verified channels on their main website.",
                source="User-Submitted Context",
                reliability=0.8,
                risk_contribution=0,
                details={"claimed_name": claimed_name}
            ))

        # 6. Official Meta Graph API Status (Honest limitation)
        evidence.append(self.create_evidence(
            check_id="instagram_graph_api",
            name="Meta Graph API Live Telemetry",
            status="UNAVAILABLE",
            finding="Direct server-to-server Instagram Graph API query is unconfigured. Private followers, DMs, and creation dates cannot be retrieved without Meta App Review approval.",
            source="Meta Platform API",
            reliability=0.0,
            risk_contribution=0,
            limitations="TrueTrace AI never accesses private accounts, bypasses two-factor auth, or violates Meta platform policies."
        ))

        return evidence

instagram_analyzer = InstagramAnalyzer()
