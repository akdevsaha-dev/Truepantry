from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError
from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client

router = APIRouter(prefix="/onboarding/complete", tags=["Onboarding"])
supabase = get_supabase_client()


@router.post("/")
def complete_onboarding(current_user: dict = Depends(get_current_user)):
    try:
        user_id = current_user["id"]
        res = (
            supabase.table("profiles")
            .select("*")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if not res.data:
            raise HTTPException(
                status_code=400,
                detail="Onboarding profile not found. Please complete step 1 first.",
            )

        profile = res.data[0]

        missing_fields = []
        if (
            not profile.get("dob")
            or profile.get("height") is None
            or not profile.get("gender")
        ):
            missing_fields.append("profile details (dob, height, gender)")
        if not profile.get("goal"):
            missing_fields.append("goal")
        if not profile.get("diet") or not profile.get("allergies"):
            missing_fields.append("plate preferences (diet, allergies)")

        if missing_fields:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot complete onboarding. Incomplete steps: {', '.join(missing_fields)}",
            )

        
        supabase.table("profiles").update(
            {"is_completed": True, "onboarding_step": 3}
        ).eq("user_id", user_id).execute()

        
        supabase.table("users").update({"is_onboarded": True}).eq(
            "id", user_id
        ).execute()

        return {
            "message": "Onboarding completed successfully",
            "is_completed": True,
            "redirect_to": "/dashboard",
        }

    except HTTPException:
        raise
    except APIError as e:
        raise HTTPException(status_code=500, detail=f"Database error: {e.message}")
