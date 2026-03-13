import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from voiceorder_server.models.business import BusinessType


# ── Auth ────────────────────────────────────────────────


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    business_id: uuid.UUID | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Password Reset ─────────────────────────────────────


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


class MessageResponse(BaseModel):
    message: str


# ── Business ────────────────────────────────────────────


class AddressSchema(BaseModel):
    street: str = ""
    city: str = "Karachi"
    province: str = ""
    country: str = "Pakistan"


class OperatingHoursSchema(BaseModel):
    open: str = "09:00"
    close: str = "23:00"
    days: list[str] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


class CreateBusinessRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    type: BusinessType
    phone_number: str = Field(pattern=r"^\+92\d{10}$")
    address: AddressSchema
    operating_hours: OperatingHoursSchema
    languages: list[str] = ["en", "ur"]


class BusinessResponse(BaseModel):
    id: uuid.UUID
    name: str
    type: BusinessType
    phone_number: str | None
    address: dict | None
    operating_hours: dict | None
    languages: list[str] | None
    subscription_tier: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
