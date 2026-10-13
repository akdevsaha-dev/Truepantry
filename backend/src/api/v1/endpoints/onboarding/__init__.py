from .complete import router as complete_router
from .goals import router as goals_router
from .preferences import router as preferences_router
from .profile import router as profile_router
from .status import router as status_router

__all__ = [
    "status_router",
    "profile_router",
    "goals_router",
    "preferences_router",
    "complete_router",
]
