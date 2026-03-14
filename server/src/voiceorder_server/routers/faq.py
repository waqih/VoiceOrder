import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.database import get_db
from voiceorder_server.models.faq import FAQItem
from voiceorder_server.schemas import FAQResponse

router = APIRouter(prefix="/api/v1/faq", tags=["faq"])


@router.get("/", response_model=list[FAQResponse])
async def list_faq(
    business_id: uuid.UUID = Query(...),
    category: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    conditions = [FAQItem.business_id == business_id, FAQItem.is_active.is_(True)]
    if category:
        conditions.append(FAQItem.category.ilike(f"%{category}%"))

    result = await db.execute(
        select(FAQItem).where(and_(*conditions)).order_by(FAQItem.sort_order)
    )
    return result.scalars().all()
