from fastapi import APIRouter
from src.api.v1.endpoints import health
from src.api.v1.endpoints.auth import logout, me, signin, signup
from src.api.v1.endpoints.onboarding import (
    complete as onboarding_complete,
    goals as onboarding_goals,
    preferences as onboarding_preferences,
    profile as onboarding_profile,
    status as onboarding_status,
)

api_router = APIRouter()

api_router.include_router(health.router)

# Auth
api_router.include_router(signup.router)
api_router.include_router(signin.router)
api_router.include_router(logout.router)
api_router.include_router(me.router)

# Onboarding
api_router.include_router(onboarding_status.router)
api_router.include_router(onboarding_profile.router)
api_router.include_router(onboarding_goals.router)
api_router.include_router(onboarding_preferences.router)
api_router.include_router(onboarding_complete.router)
