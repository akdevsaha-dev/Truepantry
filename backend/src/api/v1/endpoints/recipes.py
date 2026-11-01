from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
from src.llm.client import generate_recipe
from src.services.catalog import cart_fingerprint, db_error, get_cart, get_cart_items, get_profile
from src.validation.recipes import (
    FavoriteRequest,
    GenerateRecipeRequest,
    GenerateRecipeResponse,
    Recipe,
)

router = APIRouter(prefix="/recipes", tags=["Recipes"])
supabase = get_supabase_client()

RECIPE_COLUMNS = (
    "id, cart_id, title, description, servings, prep_minutes, cook_minutes, "
    "ingredients, steps, nutrition, is_favorite, created_at"
)


@router.post("", response_model=GenerateRecipeResponse)
def create_recipe(
    body: GenerateRecipeRequest, current_user: dict = Depends(get_current_user)
):
    """Builds a recipe from the user's cart. If the cart has the same products as when a recipe
    was last made, that saved recipe is returned and the LLM isn't called."""
    cart = get_cart(current_user["id"])
    items = get_cart_items(cart["id"]) if cart else []
    if not items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    fingerprint = cart_fingerprint(items)

    if not body.regenerate:
        try:
            saved = (
                supabase.table("recipes")
                .select(RECIPE_COLUMNS)
                .eq("user_id", current_user["id"])
                .eq("cart_fingerprint", fingerprint)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
        except APIError as e:
            raise db_error(e)
        if saved.data:
            return GenerateRecipeResponse(recipe=saved.data[0], cached=True)

    generated = generate_recipe(items, get_profile(current_user["id"]), body.servings)

    # the LLM refers to cart items by number, swap that for the real product id
    ingredients = []
    for ing in generated["ingredients"]:
        number = ing.get("cart_number")
        in_cart = isinstance(number, int) and 1 <= number <= len(items)
        ingredients.append(
            {
                "name": ing["name"],
                "amount": ing["amount"],
                "product_id": items[number - 1]["products"]["id"] if in_cart else None,
                "is_staple": ing["is_staple"] or not in_cart,
            }
        )

    try:
        res = (
            supabase.table("recipes")
            .insert(
                {
                    "user_id": current_user["id"],
                    "cart_id": cart["id"],
                    "cart_fingerprint": fingerprint,
                    "title": generated["title"][:200],
                    "description": generated["description"],
                    "servings": max(generated["servings"], 1),
                    "prep_minutes": max(generated["prep_minutes"], 0),
                    "cook_minutes": max(generated["cook_minutes"], 0),
                    "ingredients": ingredients,
                    "steps": generated["steps"],
                    "nutrition": generated["nutrition"],
                }
            )
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    return GenerateRecipeResponse(recipe=res.data[0], cached=False)


@router.get("", response_model=list[Recipe])
def list_recipes(
    favorites: bool = False, current_user: dict = Depends(get_current_user)
):
    """Recipe history, newest first. ?favorites=true for favorites only."""
    query = (
        supabase.table("recipes")
        .select(RECIPE_COLUMNS)
        .eq("user_id", current_user["id"])
        .order("created_at", desc=True)
    )
    if favorites:
        query = query.eq("is_favorite", True)
    try:
        return query.execute().data
    except APIError as e:
        raise db_error(e)


@router.get("/{recipe_id}", response_model=Recipe)
def get_recipe(recipe_id: str, current_user: dict = Depends(get_current_user)):
    return find_recipe(recipe_id, current_user["id"])


@router.patch("/{recipe_id}/favorite", response_model=Recipe)
def set_favorite(
    recipe_id: str,
    body: FavoriteRequest,
    current_user: dict = Depends(get_current_user),
):
    find_recipe(recipe_id, current_user["id"])
    try:
        res = (
            supabase.table("recipes")
            .update({"is_favorite": body.is_favorite})
            .eq("id", recipe_id)
            .eq("user_id", current_user["id"])
            .execute()
        )
    except APIError as e:
        raise db_error(e)
    return res.data[0]


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str, current_user: dict = Depends(get_current_user)):
    find_recipe(recipe_id, current_user["id"])
    try:
        supabase.table("recipes").delete().eq("id", recipe_id).eq(
            "user_id", current_user["id"]
        ).execute()
    except APIError as e:
        raise db_error(e)


def find_recipe(recipe_id: str, user_id: str) -> dict:
    try:
        res = (
            supabase.table("recipes")
            .select(RECIPE_COLUMNS)
            .eq("id", recipe_id)
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except APIError as e:
        # a malformed uuid is a Postgres error, but to the caller it's just "not found"
        if e.code == "22P02":
            raise HTTPException(status_code=404, detail="Recipe not found")
        raise db_error(e)
    if not res.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return res.data[0]
