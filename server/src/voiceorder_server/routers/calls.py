import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.database import get_db
from voiceorder_server.models.call import Call
from voiceorder_server.schemas import CallCreate, CallResponse, CallUpdate

router = APIRouter(prefix="/api/v1/calls", tags=["calls"])


@router.post("/", response_model=CallResponse, status_code=status.HTTP_201_CREATED)
async def create_call(
    body: CallCreate,
    db: AsyncSession = Depends(get_db),
):
    call = Call(
        business_id=body.business_id,
        caller_phone=body.caller_phone,
        called_number=body.called_number,
        direction=body.direction,
        status=body.status,
    )
    db.add(call)
    await db.flush()
    return call


@router.patch("/{call_id}", response_model=CallResponse)
async def update_call(
    call_id: uuid.UUID,
    body: CallUpdate,
    db: AsyncSession = Depends(get_db),
):
    call = await db.get(Call, call_id)
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(call, field, value)

    await db.flush()
    return call


@router.get("/", response_model=list[CallResponse])
async def list_calls(
    business_id: uuid.UUID = Query(...),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Call)
        .where(Call.business_id == business_id)
        .order_by(Call.created_at.desc())
    )
    return result.scalars().all()
