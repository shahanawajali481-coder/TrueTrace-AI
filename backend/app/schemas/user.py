from typing import Optional, Dict
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    notification_preferences: Optional[Dict[str, bool]] = None

class UserProfileResponse(UserBase):
    id: str
    role: str
    created_at: str
    notification_preferences: Optional[Dict[str, bool]] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int

class AuthResponse(BaseModel):
    user: UserProfileResponse
    tokens: TokenResponse
