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

    async def close(self) -> None:
        await self._client.aclose()
