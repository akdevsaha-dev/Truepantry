from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
from src.validation.onboarding import OnboardingProfileValidation

router = APIRouter(prefix="/onboarding/profile", tags=["Onboarding"])
supabase = get_supabase_client()


@router.patch("/")
def update_profile_step(
    data: OnboardingProfileValidation,
    current_user: dict = Depends(get_current_user),
):
    try:
        user_id = current_user["id"]
        existing = (
            supabase.table("profiles")
            .select("onboarding_step")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        current_step = (
            existing.data[0].get("onboarding_step", 0) if existing.data else 0
        )
        next_step = max(current_step, 1)

        payload = {
            "user_id": user_id,
            "dob": str(data.dob),
            "height": data.height,
            "gender": data.gender,
            "onboarding_step": next_step,
        }

        res = supabase.table("profiles").upsert(payload).execute()
        saved = res.data[0] if res.data else payload

        return {
            "message": "Profile step saved successfully",
            "step": 0,
            "next_step": 1,
            "profile": {
                "dob": saved.get("dob"),
                "height": saved.get("height"),
                "gender": saved.get("gender"),
            },
        }

    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
