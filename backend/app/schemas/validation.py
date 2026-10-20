from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class EmailValidationRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=320, description="Email address to validate")

class EmailValidationResponse(BaseModel):
    is_valid: bool
    normalized_email: Optional[str] = None
    domain: Optional[str] = None
    local_part: Optional[str] = None
    is_disposable: bool = False
    is_free_provider: bool = False
    has_dns_resolution: bool = False
    has_mx_records: bool = False
    mx_records: List[str] = Field(default_factory=list)
    has_impersonation_keywords: bool = False
    matched_keywords: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)

class PhoneValidationRequest(BaseModel):
    phone: str = Field(..., min_length=3, max_length=64, description="Phone number to validate")
    country_code: Optional[str] = Field(default="US", max_length=4, description="Default 2-letter ISO country code if not prefixed with +")

class PhoneValidationResponse(BaseModel):
    is_valid: bool
    is_possible: bool = False
    e164: Optional[str] = None
    international: Optional[str] = None
    national: Optional[str] = None
    country_code: Optional[int] = None
    region_code: Optional[str] = None
    region_description: Optional[str] = None
    carrier_name: Optional[str] = None
    line_type: str = "UNKNOWN"
    is_voip: bool = False
    is_premium_rate: bool = False
    error: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)
