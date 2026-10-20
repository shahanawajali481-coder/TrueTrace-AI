"""
Email Risk Analyzer for TrueTrace AI
Performs syntax validation, real DNS/MX lookups, disposable domain checks,
and threat intelligence correlation without sending unsolicited emails.
"""
import re
from typing import List, Dict, Any, Optional
import dns.resolver
from email_validator import validate_email, EmailNotValidError

from app.analyzers.base import BaseAnalyzer
from app.intelligence.disposable_domains import is_disposable_domain, is_free_provider
from app.intelligence.threat_intelligence import threat_intel
from app.core.config import settings

class EmailAnalyzer(BaseAnalyzer):
    def mask_identifier(self, identifier: str) -> str:
        """Masks email: e.g. j***n@example.com"""
        try:
            parts = identifier.strip().split("@")
            if len(parts) != 2:
                return identifier[:3] + "***"
            local, domain = parts
            if len(local) <= 2:
                masked_local = local[0] + "***"
            else:
                masked_local = local[0] + "***" + local[-1]
            return f"{masked_local}@{domain}"
        except Exception:
            return identifier[:3] + "***"

    def analyze(self, identifier: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        evidence: List[Dict[str, Any]] = []
        raw_email = identifier.strip().lower()

        # 1. Syntax Validation
        is_valid_syntax = False
        domain = ""
        local_part = ""

        try:
            validated = validate_email(raw_email, check_deliverability=False)
            normalized_email = validated.normalized
            domain = validated.domain
            local_part = validated.local_part
            is_valid_syntax = True

            evidence.append(self.create_evidence(
                check_id="email_syntax",
                name="Email Syntax Validation",
                status="INFO",
                finding=f"Email format conforms to RFC 5322 specifications.",
                source="RFC 5322 Syntax Validator",
                reliability=1.0,
                risk_contribution=0,
                details={"normalized": normalized_email, "domain": domain}
            ))
        except EmailNotValidError as e:
            evidence.append(self.create_evidence(
                check_id="email_syntax",
                name="Email Syntax Validation",
                status="SUSPICIOUS",
                finding=f"Invalid email syntax: {str(e)}",
                source="RFC 5322 Syntax Validator",
                reliability=1.0,
                risk_contribution=50,
                details={"error": str(e)}
            ))
            # Stop further network lookups if syntax is completely invalid
            return evidence

        # 2. Local-part Impersonation Keywords
        impersonation_keywords = ["support", "security", "billing", "verify", "official", "helpdesk", "account-alert"]
        matched_keywords = [kw for kw in impersonation_keywords if kw in local_part]
        if matched_keywords:
            evidence.append(self.create_evidence(
                check_id="email_local_part_keywords",
                name="Sensitive Keyword Pattern",
                status="SUSPICIOUS",
                finding=f"Local address contains security/support keywords: {', '.join(matched_keywords)}. Frequently used in phishing pretexts.",
                source="Heuristic Pattern Matcher",
                reliability=0.75,
                risk_contribution=25,
                details={"keywords": matched_keywords}
            ))

        # 3. Disposable Domain Check
        if is_disposable_domain(domain):
            evidence.append(self.create_evidence(
                check_id="email_disposable_domain",
                name="Disposable Email Provider",
                status="SUSPICIOUS",
                finding=f"Domain '{domain}' is a recognized temporary or disposable inbox provider. High correlation with throwaway accounts.",
                source="TrueTrace Disposable Domain Registry",
                reliability=0.95,
                risk_contribution=45,
                details={"domain": domain, "is_disposable": True}
            ))
        else:
            evidence.append(self.create_evidence(
                check_id="email_disposable_domain",
                name="Disposable Email Provider",
                status="INFO",
                finding=f"Domain '{domain}' is not on the disposable email domain blocklist.",
                source="TrueTrace Disposable Domain Registry",
                reliability=0.90,
                risk_contribution=0,
                details={"domain": domain, "is_disposable": False}
            ))

        # 4. Domain DNS Resolution (A / AAAA Record)
        resolver = dns.resolver.Resolver()
        resolver.timeout = settings.DNS_TIMEOUT_SECONDS
        resolver.lifetime = settings.DNS_TIMEOUT_SECONDS

        has_dns_resolution = False
        try:
            answers = resolver.resolve(domain, "A")
            ips = [rdata.to_text() for rdata in answers]
            has_dns_resolution = True
            evidence.append(self.create_evidence(
                check_id="email_domain_dns",
                name="Domain DNS Resolution",
                status="INFO",
                finding=f"Domain '{domain}' successfully resolved to active IP addresses ({len(ips)} found).",
                source="Authoritative DNS Query",
                reliability=1.0,
                risk_contribution=0,
                details={"ips": ips[:3]}
            ))
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            evidence.append(self.create_evidence(
                check_id="email_domain_dns",
                name="Domain DNS Resolution",
                status="SUSPICIOUS",
                finding=f"Domain '{domain}' does not exist (NXDOMAIN) or has no DNS records.",
                source="Authoritative DNS Query",
                reliability=0.95,
                risk_contribution=50,
                details={"error": "NXDOMAIN"}
            ))
        except (dns.resolver.Timeout, dns.exception.DNSException) as err:
            evidence.append(self.create_evidence(
                check_id="email_domain_dns",
                name="Domain DNS Resolution",
                status="UNAVAILABLE",
                finding=f"DNS resolution query timed out or had network error.",
                source="Authoritative DNS Query",
                reliability=0.0,
                risk_contribution=0,
                limitations="DNS nameserver was unreachable during the check.",
                details={"error": str(err)}
            ))

        # 5. MX Records Check (Mail Exchange)
        if has_dns_resolution:
            try:
                mx_answers = resolver.resolve(domain, "MX")
                mx_servers = [rdata.exchange.to_text().rstrip(".") for rdata in mx_answers]
                if mx_servers:
                    evidence.append(self.create_evidence(
                        check_id="email_mx_record",
                        name="Mail Exchange (MX) Configuration",
                        status="INFO",
                        finding=f"Domain has {len(mx_servers)} valid MX records configured for receiving mail ({', '.join(mx_servers[:2])}).",
                        source="Authoritative MX Query",
                        reliability=1.0,
                        risk_contribution=0,
                        details={"mx_records": mx_servers[:4]}
                    ))
                else:
                    evidence.append(self.create_evidence(
                        check_id="email_mx_record",
                        name="Mail Exchange (MX) Configuration",
                        status="SUSPICIOUS",
                        finding=f"Domain has no MX records configured. It cannot receive inbound email.",
                        source="Authoritative MX Query",
                        reliability=0.9,
                        risk_contribution=35
                    ))
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
                evidence.append(self.create_evidence(
                    check_id="email_mx_record",
                    name="Mail Exchange (MX) Configuration",
                    status="SUSPICIOUS",
                    finding=f"Domain has no MX records. Inbound mail will fail to route.",
                    source="Authoritative MX Query",
                    reliability=0.9,
                    risk_contribution=35
                ))
            except Exception as err:
                evidence.append(self.create_evidence(
                    check_id="email_mx_record",
                    name="Mail Exchange (MX) Configuration",
                    status="UNAVAILABLE",
                    finding="MX lookup request timed out.",
                    source="Authoritative MX Query",
                    reliability=0.0,
                    risk_contribution=0,
                    limitations="Authoritative mail server records could not be resolved within timeout."
                ))

        # 6. Public Scam Reports Check
        reports = threat_intel.check_public_reports(raw_email, target_type="EMAIL")
        if reports:
            evidence.append(self.create_evidence(
                check_id="email_scam_database",
                name="Community Scam Reports",
                status="CONFIRMED",
                finding=f"Found {len(reports)} incident report(s) associated with this email address in community threat databases.",
                source="Public Threat Intelligence Feed",
                reliability=0.95,
                risk_contribution=65,
                details={"reports": reports}
            ))
        else:
            evidence.append(self.create_evidence(
                check_id="email_scam_database",
                name="Community Scam Reports",
                status="INFO",
                finding="No prior scam or fraud reports found matching this address.",
                source="Public Threat Intelligence Feed",
                reliability=0.7,
                risk_contribution=0
            ))

        # 7. Breach Intelligence Indicator
        # Transparently disclose status if HIBP API key is unconfigured
        if settings.HIBP_API_KEY:
            # When configured, would query breach status
            pass
        else:
            evidence.append(self.create_evidence(
                check_id="email_breach_service",
                name="Credential Breach Intelligence",
                status="UNAVAILABLE",
                finding="Commercial credential breach intelligence service is unconfigured.",
                source="Breach Intelligence Provider",
                reliability=0.0,
                risk_contribution=0,
                limitations="Breach intelligence requires an active enterprise API key."
            ))

        return evidence

email_analyzer = EmailAnalyzer()
