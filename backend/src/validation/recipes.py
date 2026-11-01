from typing import Optional
from pydantic import BaseModel, Field


class GenerateRecipeRequest(BaseModel):
    servings: Optional[int] = Field(default=None, ge=1, le=12)
    regenerate: bool = False  # skip the saved recipe for this cart and ask the LLM again


class FavoriteRequest(BaseModel):
    is_favorite: bool


class RecipeIngredient(BaseModel):
    name: str
    amount: str
    product_id: Optional[str] = None  # set when it comes from a cart item
    is_staple: bool


class Recipe(BaseModel):
    id: str
    cart_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    servings: Optional[int] = None
    prep_minutes: Optional[int] = None
    cook_minutes: Optional[int] = None
    ingredients: list[RecipeIngredient]
    steps: list[str]
    nutrition: dict = {}
    is_favorite: bool
    created_at: str


class GenerateRecipeResponse(BaseModel):
    recipe: Recipe
    cached: bool  # true when a saved recipe for the same cart was reused, no LLM call
