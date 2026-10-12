from datetime import datetime, timezone, timedelta
import jwt
from fastapi import Response
from src.core.config import get_settings

settings = get_settings()


def create_access_token(user_id: str, email: str) -> str:
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.jwt_access_token_expire_minutes)

    payload = {"sub": user_id, "email": email, "iat": now, "exp": expire}

    return jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )


def set_auth_cookie(response: Response, token: str) -> None:
    max_age = settings.jwt_access_token_expire_minutes * 60
    is_production = settings.environment.lower() == "production"
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        max_age=max_age,
        expires=max_age,
        httponly=True,  # Prevents JavaScript XSS attacks from reading the token
        secure=is_production,  # Only send over HTTPS in production
        samesite="lax",  # Protects against CSRF
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    is_production = settings.environment.lower() == "production"
    response.delete_cookie(
        key=settings.cookie_name,
        httponly=True,
        secure=is_production,
        samesite="lax",
        path="/",
    )
