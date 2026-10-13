from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
from src.validation.onboarding import OnboardingPreferencesValidation

router = APIRouter(prefix="/onboarding/preferences", tags=["Onboarding"])
supabase = get_supabase_client()


@router.patch("/")
def update_preferences_step(
    data: OnboardingPreferencesValidation,
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
        next_step = max(current_step, 3)

        payload = {
            "user_id": user_id,
            "diet": data.diet,
            "other_diet": data.other_diet,
            "allergies": data.allergies,
            "other_allergy": data.other_allergy,
            "onboarding_step": next_step,
        }

        res = supabase.table("profiles").upsert(payload).execute()
        saved = res.data[0] if res.data else payload

        return {
            "message": "Preferences step saved successfully",
            "step": 2,
            "next_step": 3,
            "preferences": {
                "diet": saved.get("diet"),
                "other_diet": saved.get("other_diet"),
                "allergies": saved.get("allergies"),
                "other_allergy": saved.get("other_allergy"),
            },
        }

    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
