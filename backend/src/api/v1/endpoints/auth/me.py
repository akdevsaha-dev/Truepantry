from fastapi import APIRouter, HTTPException, Depends
from src.api.deps import get_current_user

router = APIRouter(prefix="/auth/me", tags=["Auth"])


@router.get("/")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": current_user}
