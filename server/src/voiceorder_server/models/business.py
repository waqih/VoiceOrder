import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from voiceorder_server.models.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class BusinessType(str, enum.Enum):
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    CLINIC = "clinic"
    OTHER = "other"


class Business(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "businesses"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[BusinessType] = mapped_column(
        Enum(BusinessType, name="business_type"), nullable=False
    )
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", use_alter=True, name="fk_businesses_owner_id"),
        nullable=False,
    )
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    address: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC", nullable=False)
    operating_hours: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    languages: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    ai_voice_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    greeting_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    transfer_numbers: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    settings: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    subscription_tier: Mapped[str] = mapped_column(String(20), default="starter", nullable=False)
    pos_integration: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    calendar_integration: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
