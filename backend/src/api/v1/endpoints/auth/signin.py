from fastapi import APIRouter

router = APIRouter(prefix="/auth/signin", tags=["Signin"])


@router.get("/")
def signin():
    return {"message": "signin route"}
