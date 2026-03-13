from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from voiceorder_server.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.jwt_access_token_expire_minutes)
    )
    return jwt.encode(
        {"sub": subject, "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> str | None:
    """Returns the subject (user id) or None if invalid."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        return payload.get("sub")
    except JWTError:
        return None


def create_reset_token(email: str) -> str:
    """Creates a JWT for password reset with 15-minute expiry."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    return jwt.encode(
        {"sub": email, "purpose": "reset", "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_reset_token(token: str) -> str | None:
    """Returns the email from a reset token, or None if invalid/expired."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
        if payload.get("purpose") != "reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None
