from fastapi import APIRouter
from src.api.v1.endpoints import health
from src.api.v1.endpoints.auth import signup, signin, logout, me

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(signup.router)
api_router.include_router(signin.router)
api_router.include_router(logout.router)
api_router.include_router(me.router)
