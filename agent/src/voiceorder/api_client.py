"""Thin HTTP client for the VoiceOrder server API."""

import os
import uuid

import httpx

API_BASE = os.environ.get("VOICEORDER_API_URL", "http://localhost:8000")


class VoiceOrderAPI:
    def __init__(self) -> None:
        self._client = httpx.AsyncClient(base_url=API_BASE, timeout=10.0)

    async def get_providers(
        self, business_id: uuid.UUID, specialization: str | None = None
    ) -> list[dict]:
        params: dict = {"business_id": str(business_id)}
        if specialization:
            params["specialization"] = specialization
        resp = await self._client.get("/api/v1/providers", params=params)
        resp.raise_for_status()
        return resp.json()

    async def check_availability(
        self, provider_id: uuid.UUID, date: str
    ) -> list[dict]:
        resp = await self._client.get(
            "/api/v1/appointments/availability",
            params={"provider_id": str(provider_id), "date": date},
        )
        resp.raise_for_status()
        return resp.json()

    async def book_appointment(self, data: dict) -> dict:
        resp = await self._client.post("/api/v1/appointments", json=data)
        resp.raise_for_status()
        return resp.json()

    async def get_faq(
        self, business_id: uuid.UUID, category: str | None = None
    ) -> list[dict]:
        params: dict = {"business_id": str(business_id)}
        if category:
            params["category"] = category
        resp = await self._client.get("/api/v1/faq", params=params)
        resp.raise_for_status()
        return resp.json()

    async def get_business(self, business_id: uuid.UUID) -> dict:
        resp = await self._client.get(f"/businesses/{business_id}")
        resp.raise_for_status()
        return resp.json()

    async def create_call(
        self,
        business_id: uuid.UUID,
        caller_phone: str | None = None,
        called_number: str | None = None,
    ) -> dict:
        resp = await self._client.post(
            "/api/v1/calls",
            json={
                "business_id": str(business_id),
                "caller_phone": caller_phone,
                "called_number": called_number,
                "direction": "inbound",
                "status": "active",
            },
        )
        resp.raise_for_status()
        return resp.json()

    async def update_call(
        self,
        call_id: uuid.UUID,
        status: str | None = None,
        duration_seconds: int | None = None,
    ) -> dict:
        payload: dict = {}
        if status is not None:
            payload["status"] = status
        if duration_seconds is not None:
            payload["duration_seconds"] = duration_seconds
        resp = await self._client.patch(f"/api/v1/calls/{call_id}", json=payload)
        resp.raise_for_status()
        return resp.json()

    async def close(self) -> None:
        await self._client.aclose()
