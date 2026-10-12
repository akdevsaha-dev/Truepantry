from fastapi import APIRouter

router = APIRouter(prefix="/auth/signup", tags=["Signup"])


@router.get("/")
def signup():
    return {"message": "signup route"}
