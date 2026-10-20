"""
Tests for standalone Email and Phone Number Validation API and Service
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.validation_service import validation_service

client = TestClient(app)

def test_validate_email_valid_syntax():
    result = validation_service.validate_email("user@gmail.com")
    assert result.is_valid is True
    assert result.normalized_email == "user@gmail.com"
    assert result.domain == "gmail.com"
    assert result.is_free_provider is True
    assert result.is_disposable is False
    assert result.error is None

def test_validate_email_disposable():
    result = validation_service.validate_email("burner_user@mailinator.com")
    assert result.is_valid is True
    assert result.is_disposable is True
    assert result.domain == "mailinator.com"

def test_validate_email_invalid_syntax():
    result = validation_service.validate_email("not-an-email-address")
    assert result.is_valid is False
    assert result.error is not None
    assert "syntax" in result.error.lower()

def test_validate_email_impersonation_keywords():
    result = validation_service.validate_email("security-support-alerts@example.com")
    assert result.is_valid is True
    assert result.has_impersonation_keywords is True
    assert "security" in result.matched_keywords or "support" in result.matched_keywords

def test_validate_phone_valid():
    # Google Mountain View official number format
    result = validation_service.validate_phone("+16502530000")
    assert result.is_valid is True
    assert result.country_code == 1
    assert result.e164 == "+16502530000"
    assert result.region_code == "US"
    assert result.error is None

def test_validate_phone_with_default_region():
    # Number without leading '+' but with default region 'US'
    result = validation_service.validate_phone("6502530000", country_code="US")
    assert result.is_valid is True
    assert result.country_code == 1
    assert result.e164 == "+16502530000"

def test_validate_phone_invalid_syntax():
    result = validation_service.validate_phone("999")
    assert result.is_valid is False
    assert result.error is not None

def test_validate_email_api_endpoint():
    response = client.post("/api/v1/validate/email", json={"email": "official-support@mailinator.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["domain"] == "mailinator.com"
    assert data["is_disposable"] is True
    assert data["has_impersonation_keywords"] is True

def test_validate_phone_api_endpoint():
    response = client.post("/api/v1/validate/phone", json={"phone": "+14155552671", "country_code": "US"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["country_code"] == 1
    assert data["line_type"] is not None
