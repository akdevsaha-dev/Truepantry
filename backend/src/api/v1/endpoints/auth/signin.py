from fastapi import APIRouter, HTTPException, Response
from src.db.supabase import get_supabase_client
from src.validation.auth import SigninValidation
from src.services.hash import check_password_valid
from postgrest.exceptions import APIError
from src.services.jwt import create_access_token, set_auth_cookie

router = APIRouter(prefix="/auth/signin", tags=["Signin"])
supabase = get_supabase_client()


@router.post("/")
def signin(data: SigninValidation, response: Response):
    try:
        user_exists = (
            supabase.table("users")
            .select("id, email, password_hash")
            .eq("email", data.email)
            .limit(1)
            .execute()
        )

        if not user_exists.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        user = user_exists.data[0]
        is_password_valid = check_password_valid(data.password, user["password_hash"])

        if not is_password_valid:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token(user_id=user["id"], email=user["email"])
        set_auth_cookie(response, token)
        return {
            "message": "Signin successful",
            "user": {"id": user["id"], "email": user["email"]},
        }

    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"database error: {e.message}")
