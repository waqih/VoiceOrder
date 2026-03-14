import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.database import get_db
from voiceorder_server.models.appointment import Provider
from voiceorder_server.schemas import ProviderResponse

router = APIRouter(prefix="/api/v1/providers", tags=["providers"])


@router.get("/", response_model=list[ProviderResponse])
async def list_providers(
    business_id: uuid.UUID = Query(...),
    specialization: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    conditions = [Provider.business_id == business_id, Provider.is_active.is_(True)]
    if specialization:
        conditions.append(Provider.specialization.ilike(f"%{specialization}%"))

    result = await db.execute(select(Provider).where(and_(*conditions)))
    return result.scalars().all()


@router.get("/{provider_id}", response_model=ProviderResponse)
async def get_provider(
    provider_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    return provider
