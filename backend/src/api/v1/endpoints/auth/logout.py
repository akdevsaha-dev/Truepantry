from fastapi import APIRouter, Response
from src.services.jwt import clear_auth_cookie

router = APIRouter(prefix="/auth/logout", tags=["Logout"])


@router.get("/")
@router.post("/")
def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Logged out successfully!"}
    
