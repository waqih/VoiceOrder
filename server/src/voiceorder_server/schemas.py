import uuid
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field

from voiceorder_server.models.appointment import AppointmentStatus
from voiceorder_server.models.business import BusinessType
from voiceorder_server.models.call import CallDirection, CallStatus

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
    greeting_text: str | None = None
    transfer_numbers: list[str] | None = None
    subscription_tier: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Providers ──────────────────────────────────────────


class ProviderResponse(BaseModel):
    id: uuid.UUID
    name: str
    title: str | None = None
    specialization: str | None = None
    services: list[str] | None = None
    is_active: bool

    model_config = {"from_attributes": True}


# ── Appointments ───────────────────────────────────────


class AvailabilitySlot(BaseModel):
    time: str
    available: bool = True


class AppointmentCreate(BaseModel):
    business_id: uuid.UUID
    provider_id: uuid.UUID
    patient_name: str = Field(min_length=1, max_length=255)
    patient_phone: str = Field(min_length=5, max_length=20)
    service_type: str = Field(min_length=1, max_length=100)
    date: date
    time: str = Field(pattern=r"^\d{2}:\d{2}$")
    notes: str | None = None


class AppointmentResponse(BaseModel):
    id: uuid.UUID
    provider_id: uuid.UUID
    patient_id: uuid.UUID
    service_type: str
    scheduled_at: datetime
    duration_minutes: int
    status: AppointmentStatus
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── FAQ ────────────────────────────────────────────────


class FAQResponse(BaseModel):
    id: uuid.UUID
    question: str
    answer: str
    category: str | None = None

    model_config = {"from_attributes": True}


# ── Calls ─────────────────────────────────────────────


class CallCreate(BaseModel):
    business_id: uuid.UUID
    caller_phone: str | None = None
    called_number: str | None = None
    direction: CallDirection = CallDirection.INBOUND
    status: CallStatus = CallStatus.ACTIVE


class CallUpdate(BaseModel):
    status: CallStatus | None = None
    duration_seconds: int | None = None
    intent_detected: str | None = None
    outcome: str | None = None


class CallResponse(BaseModel):
    id: uuid.UUID
    business_id: uuid.UUID
    caller_phone: str | None = None
    called_number: str | None = None
    direction: CallDirection
    status: CallStatus
    duration_seconds: int | None = None
    intent_detected: str | None = None
    outcome: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
