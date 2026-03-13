from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.database import get_db
from voiceorder_server.dependencies import get_current_user
from voiceorder_server.models.business import Business
from voiceorder_server.models.user import User
from voiceorder_server.schemas import BusinessResponse, CreateBusinessRequest

router = APIRouter(prefix="/businesses", tags=["businesses"])


@router.post(
    "/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED
)
async def create_business(
    body: CreateBusinessRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.business_id is not None:
        raise HTTPException(status_code=409, detail="User already has a business")

    business = Business(
        name=body.name,
        type=body.type,
        owner_id=user.id,
        phone_number=body.phone_number,
        address=body.address.model_dump(),
        timezone="Asia/Karachi",
        operating_hours=body.operating_hours.model_dump(),
        languages=body.languages,
    )
    db.add(business)
    await db.flush()

    user.business_id = business.id

    return business
