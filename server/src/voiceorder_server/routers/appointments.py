import uuid
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.database import get_db
from voiceorder_server.models.appointment import Appointment, Patient, Provider
from voiceorder_server.schemas import AppointmentCreate, AppointmentResponse, AvailabilitySlot

router = APIRouter(prefix="/api/v1/appointments", tags=["appointments"])

# Default slot settings
SLOT_START_HOUR = 9
SLOT_END_HOUR = 17
SLOT_DURATION_MINUTES = 30


@router.get("/availability", response_model=list[AvailabilitySlot])
async def check_availability(
    provider_id: uuid.UUID = Query(...),
    date_param: date = Query(..., alias="date"),
    db: AsyncSession = Depends(get_db),
):
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Generate all possible slots for the day
    slots: list[AvailabilitySlot] = []
    current = datetime.combine(date_param, time(SLOT_START_HOUR, 0))
    end = datetime.combine(date_param, time(SLOT_END_HOUR, 0))

    # Get existing appointments for this provider on this date
    result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.provider_id == provider_id,
                Appointment.scheduled_at >= current,
                Appointment.scheduled_at < end,
                Appointment.status.notin_(["cancelled"]),
            )
        )
    )
    booked = {appt.scheduled_at.strftime("%H:%M") for appt in result.scalars().all()}

    while current < end:
        time_str = current.strftime("%H:%M")
        slots.append(AvailabilitySlot(time=time_str, available=time_str not in booked))
        current += timedelta(minutes=SLOT_DURATION_MINUTES)

    return slots


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def book_appointment(
    body: AppointmentCreate,
    db: AsyncSession = Depends(get_db),
):
    # Validate provider exists
    provider = await db.get(Provider, body.provider_id)
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")

    # Find or create patient
    result = await db.execute(
        select(Patient).where(
            and_(
                Patient.business_id == body.business_id,
                Patient.phone == body.patient_phone,
            )
        )
    )
    patient = result.scalar_one_or_none()

    if not patient:
        patient = Patient(
            business_id=body.business_id,
            name=body.patient_name,
            phone=body.patient_phone,
            is_new_patient=True,
        )
        db.add(patient)
        await db.flush()

    # Build scheduled_at from date + time
    hour, minute = map(int, body.time.split(":"))
    scheduled_at = datetime.combine(body.date, time(hour, minute))

    # Check slot is not already booked
    result = await db.execute(
        select(Appointment).where(
            and_(
                Appointment.provider_id == body.provider_id,
                Appointment.scheduled_at == scheduled_at,
                Appointment.status.notin_(["cancelled"]),
            )
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Time slot is already booked")

    appointment = Appointment(
        business_id=body.business_id,
        provider_id=body.provider_id,
        patient_id=patient.id,
        service_type=body.service_type,
        scheduled_at=scheduled_at,
        duration_minutes=SLOT_DURATION_MINUTES,
        notes=body.notes,
    )
    db.add(appointment)
    await db.flush()

    return appointment


@router.get("/{appointment_id}", response_model=AppointmentResponse)
async def get_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    appointment = await db.get(Appointment, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment
