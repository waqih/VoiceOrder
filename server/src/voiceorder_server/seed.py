"""Seed the database with demo hospital data.

Run: uv run python -m voiceorder_server.seed
"""

import asyncio
import uuid

from sqlalchemy import select

from voiceorder_server.database import async_session_factory, engine
from voiceorder_server.models.appointment import Provider
from voiceorder_server.models.base import Base
from voiceorder_server.models.business import Business, BusinessType
from voiceorder_server.models.faq import FAQItem
from voiceorder_server.models.user import User, UserRole

# Fixed UUIDs for demo data (so seed is idempotent)
DEMO_OWNER_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
DEMO_BUSINESS_ID = uuid.UUID("00000000-0000-0000-0000-000000000010")


async def seed() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        # Check if already seeded
        result = await session.execute(
            select(Business).where(Business.id == DEMO_BUSINESS_ID)
        )
        if result.scalar_one_or_none():
            print("Demo data already exists, skipping seed.")
            return

        # Create demo owner user
        result = await session.execute(
            select(User).where(User.id == DEMO_OWNER_ID)
        )
        if not result.scalar_one_or_none():
            owner = User(
                id=DEMO_OWNER_ID,
                email="admin@democlinic.pk",
                full_name="Demo Admin",
                hashed_password="not-a-real-hash",
                role=UserRole.OWNER,
                business_id=DEMO_BUSINESS_ID,
                is_active=True,
            )
            session.add(owner)

        # Create demo hospital business
        business = Business(
            id=DEMO_BUSINESS_ID,
            name="CarePoint Medical Center",
            type=BusinessType.CLINIC,
            owner_id=DEMO_OWNER_ID,
            phone_number="+923001234567",
            address={
                "street": "45 Shahrah-e-Faisal",
                "city": "Karachi",
                "province": "Sindh",
                "country": "Pakistan",
            },
            timezone="Asia/Karachi",
            operating_hours={
                "open": "09:00",
                "close": "17:00",
                "days": ["mon", "tue", "wed", "thu", "fri", "sat"],
            },
            languages=["en", "ur"],
            greeting_text=(
                "Thank you for calling CarePoint Medical Center. "
                "How may I help you today?"
            ),
            transfer_numbers=["+923001234568"],
            subscription_tier="starter",
            is_active=True,
        )
        session.add(business)

        # Create providers
        providers = [
            Provider(
                business_id=DEMO_BUSINESS_ID,
                name="Dr. Ayesha Khan",
                title="MBBS, FCPS",
                specialization="General Physician",
                services=[
                    "General Checkup", "Flu Treatment",
                    "Blood Pressure", "Diabetes Management",
                ],
            ),
            Provider(
                business_id=DEMO_BUSINESS_ID,
                name="Dr. Farhan Ahmed",
                title="BDS, MSc",
                specialization="Dentist",
                services=["Dental Checkup", "Teeth Cleaning", "Filling", "Root Canal"],
            ),
            Provider(
                business_id=DEMO_BUSINESS_ID,
                name="Dr. Sara Malik",
                title="MBBS, MCPS",
                specialization="Dermatologist",
                services=["Skin Consultation", "Acne Treatment", "Mole Removal", "Allergy Test"],
            ),
            Provider(
                business_id=DEMO_BUSINESS_ID,
                name="Dr. Hassan Raza",
                title="MBBS, FRCS",
                specialization="Orthopedic Surgeon",
                services=[
                    "Joint Pain", "Fracture Treatment",
                    "Sports Injury", "Spine Consultation",
                ],
            ),
        ]
        session.add_all(providers)

        # Create FAQ items
        faq_items = [
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="What are your operating hours?",
                answer="We are open Monday to Saturday, 9 AM to 5 PM. We are closed on Sundays.",
                category="hours",
                sort_order=1,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="Do you accept insurance?",
                answer=(
                    "Yes, we accept most major insurance providers including "
                    "State Life, Jubilee, EFU, and Adamjee. "
                    "Please bring your insurance card to your appointment."
                ),
                category="insurance",
                sort_order=2,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="What is the consultation fee?",
                answer=(
                    "Consultation fees vary by doctor. General physician "
                    "consultations start at PKR 2,000. Specialist "
                    "consultations range from PKR 3,000 to PKR 5,000."
                ),
                category="billing",
                sort_order=3,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="Do I need to book an appointment in advance?",
                answer=(
                    "We recommend booking in advance to ensure availability, "
                    "but we do accept walk-ins subject to doctor availability."
                ),
                category="appointments",
                sort_order=4,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="Where are you located?",
                answer=(
                    "We are located at 45 Shahrah-e-Faisal, Karachi. "
                    "We are near the main PIDC intersection."
                ),
                category="location",
                sort_order=5,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="Do you offer lab tests?",
                answer=(
                    "Yes, we have an in-house lab offering blood tests, "
                    "urine tests, X-rays, and ultrasound. "
                    "Results are usually available within 24 hours."
                ),
                category="services",
                sort_order=6,
            ),
            FAQItem(
                business_id=DEMO_BUSINESS_ID,
                question="Is parking available?",
                answer="Yes, we have free parking available for patients in front of the building.",
                category="facilities",
                sort_order=7,
            ),
        ]
        session.add_all(faq_items)

        await session.commit()
        print("Demo hospital data seeded successfully!")
        print(f"  Business ID: {DEMO_BUSINESS_ID}")
        print(f"  Providers: {len(providers)}")
        print(f"  FAQ items: {len(faq_items)}")


if __name__ == "__main__":
    asyncio.run(seed())
