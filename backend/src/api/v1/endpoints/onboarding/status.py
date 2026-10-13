from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])
supabase = get_supabase_client()


@router.get("/")
def get_onboarding(current_user: dict = Depends(get_current_user)):
    try:
        res = (
            supabase.table("profiles")
            .select("*")
            .eq("user_id", current_user["id"])
            .limit(1)
            .execute()
        )

        if not res.data:
            return {
                "onboarding_step": 0,
                "is_completed": current_user.get("is_onboarded", False),
                "profile": None,
                "goal": None,
                "preferences": None,
            }

        profile = res.data[0]
        has_profile = profile.get("dob") is not None
        has_goal = profile.get("goal") is not None
        has_preferences = profile.get("diet") is not None

        return {
            "onboarding_step": profile.get("onboarding_step", 0),
            "is_completed": profile.get("is_completed", False),
            "profile": {
                "dob": profile.get("dob"),
                "height": profile.get("height"),
                "gender": profile.get("gender"),
            }
            if has_profile
            else None,
            "goal": {
                "goal": profile.get("goal"),
            }
            if has_goal
            else None,
            "preferences": {
                "diet": profile.get("diet"),
                "other_diet": profile.get("other_diet"),
                "allergies": profile.get("allergies") or [],
                "other_allergy": profile.get("other_allergy"),
            }
            if has_preferences
            else None,
        }

    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
