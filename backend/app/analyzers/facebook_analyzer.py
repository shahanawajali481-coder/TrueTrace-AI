"""
Facebook Profile & Page Risk Analyzer for TrueTrace AI
Analyzes public URL structures, impersonation patterns, community scam reports,
and provides transparent limitations for inaccessible private data.
"""
import re
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

from app.analyzers.base import BaseAnalyzer
from app.intelligence.threat_intelligence import threat_intel

class FacebookAnalyzer(BaseAnalyzer):
    def mask_identifier(self, identifier: str) -> str:
        """Masks Facebook URL or username: e.g. facebook.com/us***99"""
        clean = identifier.strip()
        if len(clean) > 8:
            return clean[:8] + "***" + clean[-4:]
        return clean[:3] + "***"

    def normalize_identifier(self, raw_input: str) -> str:
        val = raw_input.strip()
        if not val.startswith("http://") and not val.startswith("https://") and "facebook.com" in val:
            val = f"https://{val}"
        return val

    def analyze(self, identifier: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        evidence: List[Dict[str, Any]] = []
        normalized_url = self.normalize_identifier(identifier)
        context = context or {}

        # 1. URL Domain & Format Check
        is_fb_domain = "facebook.com" in normalized_url or "fb.com" in normalized_url or "fb.me" in normalized_url
        if not is_fb_domain:
            evidence.append(self.create_evidence(
                check_id="facebook_url_domain",
                name="Facebook Domain Verification",
                status="SUSPICIOUS",
                finding="Submitted link does not point to an authentic Facebook domain (facebook.com, fb.com, or fb.me). Potential typo-squatting or phishing site.",
                source="Domain Syntax Validator",
                reliability=1.0,
                risk_contribution=50,
                details={"input": normalized_url}
            ))
            return evidence

        evidence.append(self.create_evidence(
            check_id="facebook_url_domain",
            name="Facebook Domain Verification",
            status="INFO",
            finding="Link targets a legitimate Facebook hostname.",
            source="Domain Syntax Validator",
            reliability=1.0,
            risk_contribution=0,
            details={"url": normalized_url}
        ))

        # 2. Extract profile ID or username
        path = ""
        try:
            parsed = urlparse(normalized_url)
            path = parsed.path.strip("/")
        except Exception:
            path = normalized_url

        # Check for impersonation keywords in URL path
        impersonation_keywords = ["security", "support", "billing", "appeal", "policy-violation", "meta-business-suite", "recovery"]
        matched_kws = [kw for kw in impersonation_keywords if kw in path.lower()]
        if matched_kws:
            evidence.append(self.create_evidence(
                check_id="facebook_impersonation_keywords",
                name="Meta Security Spoofing Pattern",
                status="SUSPICIOUS",
                finding=f"URL path contains high-risk terms ('{', '.join(matched_kws)}') frequently used in phishing campaigns targeting business page admins.",
                source="TrueTrace Heuristic Analyzer",
                reliability=0.9,
                risk_contribution=45,
                details={"matched_keywords": matched_kws}
            ))

        # 3. Community Scam Reports Check
        reports = threat_intel.check_public_reports(normalized_url, target_type="FACEBOOK")
        if reports:
            evidence.append(self.create_evidence(
                check_id="facebook_scam_database",
                name="Community Scam Reports",
                status="CONFIRMED",
                finding=f"Identified {len(reports)} community scam or impersonation report(s) associated with this Facebook URL.",
                source="Public Threat Intelligence Feed",
                reliability=0.95,
                risk_contribution=65,
                details={"reports": reports}
            ))
        else:
            evidence.append(self.create_evidence(
                check_id="facebook_scam_database",
                name="Community Scam Reports",
                status="INFO",
                finding="No prior scam or malicious profile reports recorded for this Facebook address.",
                source="Public Threat Intelligence Feed",
                reliability=0.7,
                risk_contribution=0
            ))

        # 4. Official Meta Graph API Status (Honest limitation)
        evidence.append(self.create_evidence(
            check_id="facebook_graph_api",
            name="Meta Graph API Telemetry",
            status="UNAVAILABLE",
            finding="Direct profile metadata retrieval is unavailable without approved Meta Business App permissions.",
            source="Meta Graph API",
            reliability=0.0,
            risk_contribution=0,
            limitations="Private timeline contents, friends lists, and private account details are not accessible."
        ))

        return evidence

facebook_analyzer = FacebookAnalyzer()
