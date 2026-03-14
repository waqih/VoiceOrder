"""LLM function tools for the VoiceOrder AI hospital agent.

Each tool calls the VoiceOrder server API via httpx.
"""

import json
import logging
import os
import uuid

from livekit.agents import Agent, RunContext
from livekit.agents.llm import function_tool

from voiceorder.api_client import VoiceOrderAPI

logger = logging.getLogger("voiceorder.tools")

BUSINESS_ID = uuid.UUID(
    os.environ.get("VOICEORDER_BUSINESS_ID", "00000000-0000-0000-0000-000000000010")
)

api = VoiceOrderAPI()


class HospitalTools(Agent):
    """Agent mixin providing hospital/clinic function tools."""

    @function_tool
    async def lookup_providers(
        self,
        context: RunContext,
        specialization: str = "",
    ) -> str:
        """Find doctors at the clinic. Call this when a caller asks about
        available doctors or needs a doctor for a specific service.

        Args:
            specialization: Type of doctor to search for, e.g. "dentist", \
"dermatologist", "general physician". Leave empty to list all doctors.
        """
        logger.info(f"lookup_providers called — specialization={specialization!r}")
        try:
            providers = await api.get_providers(
                BUSINESS_ID, specialization=specialization or None
            )
            if not providers:
                return json.dumps({"message": "No providers found for that specialization."})
            result = []
            for p in providers:
                result.append({
                    "id": p["id"],
                    "name": p["name"],
                    "title": p.get("title", ""),
                    "specialization": p.get("specialization", ""),
                    "services": p.get("services", []),
                })
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"lookup_providers error: {e}")
            return json.dumps({"error": "Could not look up providers right now."})

    @function_tool
    async def check_availability(
        self,
        context: RunContext,
        provider_id: str,
        date: str,
    ) -> str:
        """Check a doctor's available appointment slots for a given date.

        Args:
            provider_id: The UUID of the doctor/provider.
            date: The date to check in YYYY-MM-DD format, e.g. "2026-03-15".
        """
        logger.info(f"check_availability called — provider={provider_id}, date={date}")
        try:
            slots = await api.check_availability(uuid.UUID(provider_id), date)
            available = [s for s in slots if s["available"]]
            if not available:
                return json.dumps({"message": f"No available slots on {date}."})
            return json.dumps({
                "date": date,
                "available_slots": [s["time"] for s in available],
            })
        except Exception as e:
            logger.error(f"check_availability error: {e}")
            return json.dumps({"error": "Could not check availability right now."})

    @function_tool
    async def book_appointment(
        self,
        context: RunContext,
        provider_id: str,
        patient_name: str,
        patient_phone: str,
        service_type: str,
        date: str,
        time: str,
    ) -> str:
        """Book an appointment after the caller has confirmed all details.
        Only call this AFTER confirming the doctor, date, time, and service with the caller.

        Args:
            provider_id: The UUID of the doctor/provider.
            patient_name: The patient's full name.
            patient_phone: The patient's phone number.
            service_type: The type of service, e.g. "General Checkup", "Dental Checkup".
            date: The appointment date in YYYY-MM-DD format.
            time: The appointment time in HH:MM format, e.g. "10:00".
        """
        logger.info(
            f"book_appointment called — provider={provider_id}, "
            f"patient={patient_name}, date={date}, time={time}"
        )
        try:
            result = await api.book_appointment({
                "business_id": str(BUSINESS_ID),
                "provider_id": provider_id,
                "patient_name": patient_name,
                "patient_phone": patient_phone,
                "service_type": service_type,
                "date": date,
                "time": time,
            })
            return json.dumps({
                "status": "confirmed",
                "appointment_id": result["id"],
                "scheduled_at": result["scheduled_at"],
                "service": result["service_type"],
            })
        except Exception as e:
            logger.error(f"book_appointment error: {e}")
            return json.dumps({"error": "Could not book the appointment right now. Let me transfer you to staff."})

    @function_tool
    async def get_faq(
        self,
        context: RunContext,
        category: str = "",
    ) -> str:
        """Look up frequently asked questions about the clinic. Call this when
        a caller asks about hours, insurance, fees, location, parking, or lab tests.

        Args:
            category: FAQ category to filter by (hours, insurance, billing, \
appointments, location, services, facilities). Leave empty for all FAQs.
        """
        logger.info(f"get_faq called — category={category!r}")
        try:
            items = await api.get_faq(BUSINESS_ID, category=category or None)
            if not items:
                return json.dumps({"message": "No FAQ found for that topic."})
            result = [{"question": i["question"], "answer": i["answer"]} for i in items]
            return json.dumps(result, indent=2)
        except Exception as e:
            logger.error(f"get_faq error: {e}")
            return json.dumps({"error": "Could not look up that information right now."})

    @function_tool
    async def get_business_hours(
        self,
        context: RunContext,
    ) -> str:
        """Get the clinic's operating hours and contact info. Call this when a
        caller asks what time the clinic opens, closes, or its schedule.
        """
        logger.info("get_business_hours called")
        try:
            biz = await api.get_business(BUSINESS_ID)
            hours = biz.get("operating_hours", {})
            return json.dumps({
                "name": biz["name"],
                "phone": biz.get("phone_number", ""),
                "operating_hours": hours,
                "address": biz.get("address", {}),
            })
        except Exception as e:
            logger.error(f"get_business_hours error: {e}")
            return json.dumps({"error": "Could not retrieve business hours right now."})

    @function_tool
    async def transfer_to_staff(
        self,
        context: RunContext,
        reason: str = "",
    ) -> str:
        """Transfer the caller to a human staff member. Call this when the caller
        requests to speak to someone, has an emergency, or you cannot help them.

        Args:
            reason: Brief reason for the transfer, e.g. "emergency", "billing question", \
"complaint".
        """
        logger.info(f"transfer_to_staff called — reason={reason!r}")
        return json.dumps({
            "action": "transfer",
            "message": "I'm transferring you to our staff right now. Please hold for a moment.",
            "reason": reason,
        })
