from typing import Literal, Optional
from pydantic import BaseModel, Field


class GenerateRecipeRequest(BaseModel):
    servings: Optional[int] = Field(default=None, ge=1, le=12)
    regenerate: bool = False  # skip the saved recipe for this cart and ask the LLM again


class FavoriteRequest(BaseModel):
    is_favorite: bool


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=1500)


class ChatRequest(BaseModel):
    # the whole conversation so far, the last message is the user's new question
    messages: list[ChatMessage] = Field(min_length=1, max_length=30)
