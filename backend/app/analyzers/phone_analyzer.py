"""
Phone Number & WhatsApp Risk Analyzer for TrueTrace AI
Uses Google's libphonenumber port for real E.164 normalization, carrier/region metadata,
VOIP detection, and threat intelligence lookups.
"""
from typing import List, Dict, Any, Optional
import phonenumbers
from phonenumbers import geocoder, carrier, PhoneNumberType

from app.analyzers.base import BaseAnalyzer
from app.intelligence.threat_intelligence import threat_intel

class PhoneAnalyzer(BaseAnalyzer):
    def mask_identifier(self, identifier: str) -> str:
        """Masks phone number: e.g. +1 *** *** 4921"""
        clean = identifier.strip()
        if len(clean) > 6:
            return clean[:3] + " *** *** " + clean[-4:]
        return clean[:2] + "***"

    def analyze(self, identifier: str, context: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        evidence: List[Dict[str, Any]] = []
        raw_input = identifier.strip()
        default_region = (context or {}).get("country_code", "US")

        # 1. Parse and validate using Google's libphonenumber
        parsed_number = None
        try:
            # Handle user passing with or without leading +
            if not raw_input.startswith("+") and not default_region:
                default_region = "US"
            parsed_number = phonenumbers.parse(raw_input, default_region)
        except phonenumbers.NumberParseException as e:
            evidence.append(self.create_evidence(
                check_id="phone_syntax",
                name="International Phone Format",
                status="SUSPICIOUS",
                finding=f"Invalid phone number format: {str(e)}",
                source="ITU-T E.164 Parser (libphonenumber)",
                reliability=1.0,
                risk_contribution=40,
                details={"error": str(e)}
            ))
            return evidence

        is_possible = phonenumbers.is_possible_number(parsed_number)
        is_valid = phonenumbers.is_valid_number(parsed_number)
        e164_format = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        international_format = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)

        if not is_valid:
            evidence.append(self.create_evidence(
                check_id="phone_syntax",
                name="International Phone Format",
                status="SUSPICIOUS",
                finding=f"Number is not an active or allocated pattern according to international numbering plans.",
                source="ITU-T E.164 Numbering Plan",
                reliability=0.9,
                risk_contribution=35,
                details={"e164": e164_format, "is_possible": is_possible}
            ))
            return evidence

        # Number is valid
        evidence.append(self.create_evidence(
            check_id="phone_syntax",
            name="International Phone Format",
            status="INFO",
            finding=f"Valid E.164 phone number ({international_format}).",
            source="ITU-T E.164 Numbering Plan",
            reliability=1.0,
            risk_contribution=0,
            details={"e164": e164_format, "international": international_format}
        ))

        # 2. Line Type Classification (VOIP, Mobile, Landline, Toll-Free)
        num_type = phonenumbers.number_type(parsed_number)
        type_str = "UNKNOWN"
        risk_points = 0
        status_val = "INFO"

        if num_type == PhoneNumberType.VOIP:
            type_str = "VOIP (Virtual / Over IP)"
            status_val = "SUSPICIOUS"
            risk_points = 30
            finding_msg = "Virtual VoIP number detected. Frequently used by remote scammers for temporary burner identities."
        elif num_type == PhoneNumberType.MOBILE:
            type_str = "MOBILE"
            finding_msg = "Standard mobile cellular telephone line."
        elif num_type == PhoneNumberType.FIXED_LINE:
            type_str = "LANDLINE"
            finding_msg = "Geographic fixed wireline telephone service."
        elif num_type == PhoneNumberType.TOLL_FREE:
            type_str = "TOLL_FREE"
            finding_msg = "Toll-free business numbering service."
        elif num_type == PhoneNumberType.PREMIUM_RATE:
            type_str = "PREMIUM_RATE"
            status_val = "SUSPICIOUS"
            risk_points = 45
            finding_msg = "Premium rate number detected. Outbound calls or replies may incur high surcharge billing."
        else:
            type_str = "SPECIAL_SERVICE"
            finding_msg = f"Telephone line classified as {type_str}."

        evidence.append(self.create_evidence(
            check_id="phone_line_type",
            name="Telephony Line Classification",
            status=status_val,
            finding=finding_msg,
            source="Carrier Routing Metadata",
            reliability=0.85,
            risk_contribution=risk_points,
            details={"line_type": type_str}
        ))

        # 3. Geolocation & Carrier Resolution
        region_desc = geocoder.description_for_number(parsed_number, "en") or "International Allocation"
        carrier_name = carrier.name_for_number(parsed_number, "en") or "Unassigned / MVNO"

        evidence.append(self.create_evidence(
            check_id="phone_region_carrier",
            name="Region & Carrier Attribution",
            status="INFO",
            finding=f"Allocated region: {region_desc}. Operating carrier: {carrier_name}.",
            source="Public Telecom Number Allocation",
            reliability=0.9,
            risk_contribution=0,
            details={"region": region_desc, "carrier": carrier_name}
        ))

        # 4. Public Scam & Threat Intelligence Check
        reports = threat_intel.check_public_reports(e164_format, target_type="WHATSAPP")
        if reports:
            evidence.append(self.create_evidence(
                check_id="phone_scam_database",
                name="Public Scam Incident Reports",
                status="CONFIRMED",
                finding=f"Identified {len(reports)} reported scam incident(s) for this phone number in community security logs.",
                source="Public Threat Intelligence Feed",
                reliability=0.95,
                risk_contribution=60,
                details={"reports": reports}
            ))
        else:
            evidence.append(self.create_evidence(
                check_id="phone_scam_database",
                name="Public Scam Incident Reports",
                status="INFO",
                finding="No prior scam, spam, or telemarketing fraud reports match this number.",
                source="Public Threat Intelligence Feed",
                reliability=0.75,
                risk_contribution=0
            ))

        # 5. WhatsApp API Verification (Disclosed honestly)
        evidence.append(self.create_evidence(
            check_id="whatsapp_live_presence",
            name="WhatsApp Direct Account Verification",
            status="UNAVAILABLE",
            finding="Direct WhatsApp account presence check requires authorized Meta Business WhatsApp API integration.",
            source="Meta WhatsApp Cloud API",
            reliability=0.0,
            risk_contribution=0,
            limitations="TrueTrace AI adheres to platform privacy terms and will not scrape or probe user messaging endpoints without authorized keys."
        ))

        return evidence

phone_analyzer = PhoneAnalyzer()
