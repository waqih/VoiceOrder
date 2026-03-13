from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from voiceorder_server.auth import (
    create_access_token,
    create_refresh_token,
    create_reset_token,
    decode_reset_token,
    hash_password,
    verify_password,
)
from voiceorder_server.database import get_db
from voiceorder_server.dependencies import get_current_user
from voiceorder_server.email import send_reset_email
from voiceorder_server.models.user import User
from voiceorder_server.schemas import (
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=body.email,
        hashed_password=hash_password(body.password),
        full_name=body.full_name,
    )
    db.add(user)
    await db.flush()

    return TokenResponse(
        access_token=create_access_token(sub=str(user.id)),
        refresh_token=create_refresh_token(sub=str(user.id)),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    return TokenResponse(
        access_token=create_access_token(sub=str(user.id)),
        refresh_token=create_refresh_token(sub=str(user.id)),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated")

    token = create_reset_token(user.email)
    await send_reset_email(user.email, token)

    return MessageResponse(message="Reset link sent to your email")


@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    email = decode_reset_token(body.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user.hashed_password = hash_password(body.new_password)
    await db.flush()

    return MessageResponse(message="Password reset successful")
