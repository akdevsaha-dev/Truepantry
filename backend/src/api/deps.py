from fastapi import HTTPException, Request
import jwt
from src.core.config import get_settings
from src.services.jwt import decode_access_token
from src.db.supabase import get_supabase_client

settings = get_settings()
supabase = get_supabase_client()


def get_current_user(req: Request) -> dict:
    token = req.cookies.get(settings.cookie_name)
    if not token:
        auth_header = req.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Not Authenticated")

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401, detail="Session expired, please login again"
        )

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    res = (
        supabase.table("users")
        .select("id, email, username, created_at")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return res.data[0]
