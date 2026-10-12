from fastapi import APIRouter, HTTPException
from src.validation.auth import SignupValidation
from src.services.hash import get_hashed_password
from src.db.supabase import get_supabase_client

router = APIRouter(prefix="/auth/signup", tags=["Signup"])
supabase = get_supabase_client()


@router.post("/")
def signup(data: SignupValidation):
    existing_user = (
        supabase.table("users")
        .select("email, username")
        .or_(f"email.eq.{data.email}, username.eq.{data.email}")
        .execute()
    )

    if existing_user.data:
        for u in existing_user.data:
            if u["email"] == data.email:
                raise HTTPException(status_code=409, detail="Email already registered")
            if u["username"] == data.username:
                raise HTTPException(status_code=409, detail="Username already taken")

    hashed_password = get_hashed_password(data.password)
    result = (
        supabase.table("users")
        .insert(
            {
                "username": data.username,
                "email": data.email,
                "password_hash": hashed_password,
            }
        )
        .execute()
    )
    return {
        "message": "User registered successfully",
        "user": {"username": data.username, "email": data.email},
    }
