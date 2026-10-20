"""
Validation Service for TrueTrace AI
Provides standalone and pre-scan validation for Email addresses and Phone numbers.
"""
from typing import Optional, List, Dict, Any
import dns.resolver
import phonenumbers
from phonenumbers import geocoder, carrier, PhoneNumberType
from email_validator import validate_email, EmailNotValidError

from app.schemas.validation import EmailValidationResponse, PhoneValidationResponse
from app.intelligence.disposable_domains import is_disposable_domain, is_free_provider
from app.core.config import settings

class ValidationService:
    def validate_email(self, email_str: str) -> EmailValidationResponse:
        """
        Validates email address against RFC 5322 syntax, domain MX/A DNS records,
        disposable email lists, and phishing/impersonation keyword heuristics.
        """
        raw_email = email_str.strip().lower()

        # 1. Syntax Validation
        try:
            validated = validate_email(raw_email, check_deliverability=False)
            normalized_email = validated.normalized
            domain = validated.domain
            local_part = validated.local_part
        except EmailNotValidError as e:
            return EmailValidationResponse(
                is_valid=False,
                error=f"Invalid email syntax: {str(e)}",
                details={"reason": "syntax_error", "raw": raw_email}
            )

        # 2. Local-part impersonation heuristics
        impersonation_keywords = [
            "support", "security", "billing", "verify", "official", "officer",
            "helpdesk", "account-alert", "admin", "service", "apple-support",
            "meta-care", "fraud-prevention"
        ]
        matched_keywords = [kw for kw in impersonation_keywords if kw in local_part]
        has_impersonation = len(matched_keywords) > 0

        # 3. Disposable & Free Provider checks
        disposable = is_disposable_domain(domain)
        free_provider = is_free_provider(domain)

        # 4. Authoritative DNS A/AAAA and MX resolution
        has_dns_resolution = False
        has_mx_records = False
        mx_records: List[str] = []

        resolver = dns.resolver.Resolver()
        resolver.timeout = settings.DNS_TIMEOUT_SECONDS
        resolver.lifetime = settings.DNS_TIMEOUT_SECONDS

        try:
            a_answers = resolver.resolve(domain, "A")
            if a_answers:
                has_dns_resolution = True
        except Exception:
            has_dns_resolution = False

        if has_dns_resolution:
            try:
                mx_answers = resolver.resolve(domain, "MX")
                mx_records = [rdata.exchange.to_text().rstrip(".") for rdata in mx_answers]
                if mx_records:
                    has_mx_records = True
            except Exception:
                has_mx_records = False

        return EmailValidationResponse(
            is_valid=True,
            normalized_email=normalized_email,
            domain=domain,
            local_part=local_part,
            is_disposable=disposable,
            is_free_provider=free_provider,
            has_dns_resolution=has_dns_resolution,
            has_mx_records=has_mx_records,
            mx_records=mx_records[:5],
            has_impersonation_keywords=has_impersonation,
            matched_keywords=matched_keywords,
            error=None,
            details={
                "normalized": normalized_email,
                "domain": domain,
                "local_part": local_part,
                "is_disposable": disposable,
                "is_free_provider": free_provider,
                "has_dns_resolution": has_dns_resolution,
                "has_mx_records": has_mx_records,
                "mx_hosts_count": len(mx_records),
            }
        )

    def validate_phone(self, phone_str: str, country_code: str = "US") -> PhoneValidationResponse:
        """
        Validates and normalizes phone number according to ITU-T E.164,
        determines line type (VOIP, Mobile, Fixed), carrier, and geographic region.
        """
        raw_input = phone_str.strip()
        default_region = (country_code or "US").strip().upper()

        try:
            if not raw_input.startswith("+") and not default_region:
                default_region = "US"
            parsed_number = phonenumbers.parse(raw_input, default_region)
        except phonenumbers.NumberParseException as e:
            return PhoneValidationResponse(
                is_valid=False,
                is_possible=False,
                error=f"Invalid phone number format: {str(e)}",
                details={"reason": "parse_exception", "raw": raw_input}
            )

        is_possible = phonenumbers.is_possible_number(parsed_number)
        is_valid = phonenumbers.is_valid_number(parsed_number)

        if not is_valid:
            e164_fmt = None
            try:
                e164_fmt = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
            except Exception:
                pass
            return PhoneValidationResponse(
                is_valid=False,
                is_possible=is_possible,
                e164=e164_fmt,
                error="Number pattern is not allocated or invalid under international numbering plans.",
                details={"is_possible": is_possible}
            )

        e164_format = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.E164)
        international_format = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.INTERNATIONAL)
        national_format = phonenumbers.format_number(parsed_number, phonenumbers.PhoneNumberFormat.NATIONAL)

        num_type = phonenumbers.number_type(parsed_number)
        type_str = "UNKNOWN"
        is_voip = False
        is_premium_rate = False

        if num_type == PhoneNumberType.VOIP:
            type_str = "VOIP"
            is_voip = True
        elif num_type == PhoneNumberType.MOBILE:
            type_str = "MOBILE"
        elif num_type == PhoneNumberType.FIXED_LINE:
            type_str = "LANDLINE"
        elif num_type == PhoneNumberType.FIXED_LINE_OR_MOBILE:
            type_str = "FIXED_OR_MOBILE"
        elif num_type == PhoneNumberType.TOLL_FREE:
            type_str = "TOLL_FREE"
        elif num_type == PhoneNumberType.PREMIUM_RATE:
            type_str = "PREMIUM_RATE"
            is_premium_rate = True
        elif num_type == PhoneNumberType.SHARED_COST:
            type_str = "SHARED_COST"
        else:
            type_str = "SPECIAL_SERVICE"

        region_desc = geocoder.description_for_number(parsed_number, "en") or "International Allocation"
        carrier_name = carrier.name_for_number(parsed_number, "en") or "Unassigned / MVNO"
        region_code = phonenumbers.region_code_for_number(parsed_number)

        return PhoneValidationResponse(
            is_valid=True,
            is_possible=True,
            e164=e164_format,
            international=international_format,
            national=national_format,
            country_code=parsed_number.country_code,
            region_code=region_code,
            region_description=region_desc,
            carrier_name=carrier_name,
            line_type=type_str,
            is_voip=is_voip,
            is_premium_rate=is_premium_rate,
            error=None,
            details={
                "e164": e164_format,
                "international": international_format,
                "national": national_format,
                "country_code": parsed_number.country_code,
                "region_code": region_code,
                "region_description": region_desc,
                "carrier": carrier_name,
                "line_type": type_str,
                "is_voip": is_voip,
            }
        )

validation_service = ValidationService()
