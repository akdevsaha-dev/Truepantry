from fastapi import APIRouter, HTTPException, Response
from src.validation.auth import SignupValidation
from src.services.hash import get_hashed_password
from src.db.supabase import get_supabase_client
from postgrest.exceptions import APIError
from src.services.jwt import create_access_token, set_auth_cookie

router = APIRouter(prefix="/auth/signup", tags=["Signup"])
supabase = get_supabase_client()


@router.post("/")
def signup(data: SignupValidation, response: Response):
    try:
        existing_user = (
            supabase.table("users")
            .select("email, username")
            .or_(f"email.eq.{data.email}, username.eq.{data.username}")
            .execute()
        )

        for u in existing_user.data:
            if u["email"] == data.email:
                raise HTTPException(status_code=409, detail="Email already registered")
            if u["username"] == data.username:
                raise HTTPException(status_code=409, detail="Username already taken")

        hashed_password = get_hashed_password(data.password)

        new_user = (
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

        created_user = new_user.data[0]
        token = create_access_token(
            user_id=created_user["id"], email=created_user["email"]
        )
        set_auth_cookie(response, token)

        return {
            "message": "User registered successfully",
            "user": {"username": data.username, "email": data.email},
        }

    except HTTPException:
        raise

    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
