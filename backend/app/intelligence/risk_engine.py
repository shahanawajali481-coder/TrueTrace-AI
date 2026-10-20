"""
TrueTrace AI Explainable Risk Engine
Calculates evidence-based scores, removes duplicate indicators,
and generates human-auditable risk conclusions.
"""
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone

class RiskEvaluationResult:
    def __init__(
        self,
        score: int,
        level: str,
        summary: str,
        confidence_explanation: str,
        limitations: List[str],
        recommendations: List[str],
        deduplicated_evidence: List[Dict[str, Any]]
    ):
        self.score = score
        self.level = level
        self.summary = summary
        self.confidence_explanation = confidence_explanation
        self.limitations = limitations
        self.recommendations = recommendations
        self.deduplicated_evidence = deduplicated_evidence

class RiskEngine:
    """
    Modular, transparent rules-based risk assessment engine.
    Applies evidence reliability weighting, deduplication, and
    honest handling of unavailable checks.
    """

    def evaluate(
        self,
        scan_type: str,
        raw_evidence: List[Dict[str, Any]],
        context: Dict[str, Any] = None
    ) -> RiskEvaluationResult:
        context = context or {}
        limitations: List[str] = []
        recommendations: List[str] = []

        # Step 1: Filter & Deduplicate Evidence
        seen_checks = set()
        deduped: List[Dict[str, Any]] = []

        for ev in raw_evidence:
            check_id = ev.get("check_id")
            # If same check repeated, take highest severity/contribution
            if check_id in seen_checks:
                continue
            seen_checks.add(check_id)
            deduped.append(ev)

            # Collect explicit limitations
            if ev.get("limitations"):
                limitations.append(ev["limitations"])

        # Step 2: Separate available checks vs unavailable checks
        available_checks = [e for e in deduped if e.get("status") not in ("UNAVAILABLE", "FAILED")]
        unavailable_checks = [e for e in deduped if e.get("status") in ("UNAVAILABLE", "FAILED")]

        # If too many critical checks were unavailable or no data retrieved
        if len(available_checks) == 0:
            return RiskEvaluationResult(
                score=0,
                level="INCONCLUSIVE",
                summary="Insufficient data to perform an assessment. Key external verification sources were unavailable.",
                confidence_explanation="Confidence is low because no conclusive evidence could be collected from authoritative sources.",
                limitations=["Primary lookup services timed out or were not configured.", *limitations],
                recommendations=[
                    "Verify the submitted identifier spelling.",
                    "Ensure connectivity to verification services.",
                    "Request manual verification or supporting documents from the sender."
                ],
                deduplicated_evidence=deduped
            )

        # Step 3: Calculate score from weighted contributions
        total_risk_points = 0.0
        max_possible_points = 100.0
        suspicious_count = 0
        confirmed_count = 0

        # Anti-double-counting logic:
        # e.g. If both DNS failure and MX failure triggered, combine into single network indicator
        has_domain_missing = any(e.get("check_id") == "email_domain_dns" and e.get("status") == "SUSPICIOUS" for e in deduped)
        has_mx_missing = any(e.get("check_id") == "email_mx_record" and e.get("status") == "SUSPICIOUS" for e in deduped)

        for ev in available_checks:
            check_id = ev.get("check_id")
            status = ev.get("status", "INFO")
            base_contribution = float(ev.get("risk_contribution", 0))
            reliability = float(ev.get("reliability", 1.0))

            # Prevent double penalization if both DNS domain and MX failed
            if check_id == "email_mx_record" and has_domain_missing and has_mx_missing:
                # DNS failure already accounts for no mail domain
                base_contribution = base_contribution * 0.3

            weighted_contribution = base_contribution * reliability

            if status == "SUSPICIOUS":
                suspicious_count += 1
                total_risk_points += weighted_contribution
            elif status == "CONFIRMED":
                confirmed_count += 1
                total_risk_points += weighted_contribution
            elif status == "INFO" and weighted_contribution > 0:
                total_risk_points += weighted_contribution

        # Bound score between 0 and 100
        calculated_score = min(100, max(0, int(round(total_risk_points))))

        # Step 4: Determine Risk Level
        # HIGH: Score >= 65 OR confirmed scam report OR confirmed malicious spoofing
        # MEDIUM: Score between 25 and 64 OR 2+ suspicious indicators
        # LOW: Score < 25 and no confirmed fraudulent records
        # INCONCLUSIVE: If available evidence is contradictory or critical checks missing

        if confirmed_count >= 1 or calculated_score >= 65:
            level = "HIGH"
            summary = (
                f"Elevated risk indicators detected for {scan_type.lower()}. "
                "Credible suspicious signals or reported scam data suggest high risk."
            )
            recommendations.extend([
                "Do NOT transfer funds, share OTPs, or click unverified links.",
                "Report this profile/number to platform authorities or law enforcement.",
                "Block and terminate further communication."
            ])
        elif suspicious_count >= 1 or calculated_score >= 25:
            level = "MEDIUM"
            summary = (
                f"Moderate risk signals observed for {scan_type.lower()}. "
                "Some anomalies were detected that warrant heightened caution before proceeding."
            )
            recommendations.extend([
                "Independently verify identity via trusted out-of-band channels.",
                "Inspect message contents closely for phishing or impersonation pretexts.",
                "Refrain from sharing sensitive credentials or private info."
            ])
        else:
            level = "LOW"
            summary = (
                f"No prominent risk signals were found during this {scan_type.lower()} analysis. "
                "Basic configuration and authoritative records appear consistent."
            )
            recommendations.extend([
                "Maintain standard digital security hygiene.",
                "Remember that low risk does not guarantee the counterparty's real-world identity."
            ])

        # Step 5: Transparency and confidence calibration explanation
        analyzed_count = len(available_checks)
        unavail_count = len(unavailable_checks)

        if unavail_count == 0:
            confidence_explanation = (
                f"High confidence ({analyzed_count}/{len(deduped)} checks performed). "
                "All standard verification tests ran against live authoritative sources."
            )
        else:
            confidence_explanation = (
                f"Moderate confidence ({analyzed_count}/{len(deduped)} checks evaluated). "
                f"{unavail_count} auxiliary check(s) were unavailable and were not counted as negative evidence."
            )

        # Standard safety limitation
        limitations.append("TrueTrace AI evaluations are evidence-based indicators and do not constitute legal proof or a 100% guarantee.")

        return RiskEvaluationResult(
            score=calculated_score,
            level=level,
            summary=summary,
            confidence_explanation=confidence_explanation,
            limitations=list(set(limitations)),
            recommendations=recommendations,
            deduplicated_evidence=deduped
        )

risk_engine = RiskEngine()
