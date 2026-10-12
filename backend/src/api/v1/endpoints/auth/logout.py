from fastapi import APIRouter

router = APIRouter(prefix="/auth/logout", tags=["Logout"])


@router.get("/")
def logout():
    return {"message": "logout route"}
