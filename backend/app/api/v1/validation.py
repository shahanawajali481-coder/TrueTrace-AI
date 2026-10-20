"""
Validation API Router for TrueTrace AI
Provides pre-scan and standalone validation endpoints for email and phone numbers.
"""
from fastapi import APIRouter
from app.schemas.validation import (
    EmailValidationRequest,
    EmailValidationResponse,
    PhoneValidationRequest,
    PhoneValidationResponse,
)
from app.services.validation_service import validation_service

router = APIRouter(prefix="/validate", tags=["Validation"])

@router.post("/email", response_model=EmailValidationResponse)
def validate_email_endpoint(payload: EmailValidationRequest):
    """
    Validates an email address against RFC 5322 syntax, authoritative DNS/MX records,
    disposable email domains, and phishing heuristics.
    """
    return validation_service.validate_email(payload.email)

@router.post("/phone", response_model=PhoneValidationResponse)
def validate_phone_endpoint(payload: PhoneValidationRequest):
    """
    Validates an international phone number according to ITU-T E.164,
    classifies line type (VoIP, mobile, landline), and attributes carrier/region.
    """
    return validation_service.validate_phone(payload.phone, country_code=payload.country_code or "US")
