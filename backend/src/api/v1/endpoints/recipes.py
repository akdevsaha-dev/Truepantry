from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
from src.llm.client import chat_about_recipe, generate_recipe
from src.services.catalog import cart_fingerprint, db_error, get_cart, get_cart_items, get_profile
from src.validation.recipes import ChatRequest, FavoriteRequest, GenerateRecipeRequest

router = APIRouter(prefix="/recipes", tags=["Recipes"])
supabase = get_supabase_client()

RECIPE_COLUMNS = (
    "id, cart_id, title, description, servings, prep_minutes, cook_minutes, "
    "ingredients, steps, nutrition, is_favorite, created_at"
)


@router.post("")
def create_recipe(body: GenerateRecipeRequest, current_user: dict = Depends(get_current_user)):
    """Makes a recipe from the user's cart. If a recipe was already made for the same
    products, that one is returned instead of calling the LLM again."""
    user_id = current_user["id"]
    cart = get_cart(user_id)
    items = get_cart_items(cart["id"]) if cart else []
    if not items:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    fingerprint = cart_fingerprint(items)

    try:
        if not body.regenerate:
            saved = (
                supabase.table("recipes")
                .select(RECIPE_COLUMNS)
                .eq("user_id", user_id)
                .eq("cart_fingerprint", fingerprint)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if saved.data:
                return {"recipe": saved.data[0], "cached": True}

        recipe = generate_recipe(items, get_profile(user_id), body.servings)

        # the LLM refers to cart items by their number in the list, swap that for the product id
        ingredients = []
        for ing in recipe["ingredients"]:
            number = ing.get("cart_number")
            product_id = None
            if isinstance(number, int) and 1 <= number <= len(items):
                product_id = items[number - 1]["products"]["id"]
            ingredients.append(
                {
                    "name": ing["name"],
                    "amount": ing["amount"],
                    "product_id": product_id,
                    "is_staple": ing["is_staple"] or product_id is None,
                }
            )

        res = (
            supabase.table("recipes")
            .insert(
                {
                    "user_id": user_id,
                    "cart_id": cart["id"],
                    "cart_fingerprint": fingerprint,
                    "title": recipe["title"][:200],
                    "description": recipe["description"],
                    "servings": max(recipe["servings"], 1),
                    "prep_minutes": max(recipe["prep_minutes"], 0),
                    "cook_minutes": max(recipe["cook_minutes"], 0),
                    "ingredients": ingredients,
                    "steps": recipe["steps"],
                    "nutrition": recipe["nutrition"],
                }
            )
            .execute()
        )
        return {"recipe": res.data[0], "cached": False}

    except APIError as e:
        raise db_error(e)


@router.get("")
def list_recipes(favorites: bool = False, current_user: dict = Depends(get_current_user)):
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


@router.get("/{recipe_id}")
def get_recipe(recipe_id: UUID, current_user: dict = Depends(get_current_user)):
    return find_recipe(recipe_id, current_user["id"])


@router.post("/{recipe_id}/chat")
def chat(recipe_id: UUID, body: ChatRequest, current_user: dict = Depends(get_current_user)):
    """Answers a question about the recipe. The client sends the whole conversation each
    time, so nothing about the chat is stored."""
    recipe = find_recipe(recipe_id, current_user["id"])
    messages = [message.model_dump() for message in body.messages]
    reply = chat_about_recipe(recipe, get_profile(current_user["id"]), messages)
    return {"reply": reply}


@router.patch("/{recipe_id}/favorite")
def set_favorite(
    recipe_id: UUID,
    body: FavoriteRequest,
    current_user: dict = Depends(get_current_user),
):
    try:
        res = (
            supabase.table("recipes")
            .update({"is_favorite": body.is_favorite})
            .eq("id", str(recipe_id))
            .eq("user_id", current_user["id"])
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    if not res.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return res.data[0]


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: UUID, current_user: dict = Depends(get_current_user)):
    try:
        res = (
            supabase.table("recipes")
            .delete()
            .eq("id", str(recipe_id))
            .eq("user_id", current_user["id"])
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    if not res.data:
        raise HTTPException(status_code=404, detail="Recipe not found")


def find_recipe(recipe_id: UUID, user_id: str) -> dict:
    try:
        res = (
            supabase.table("recipes")
            .select(RECIPE_COLUMNS)
            .eq("id", str(recipe_id))
            .eq("user_id", user_id)
            .execute()
        )
    except APIError as e:
        raise db_error(e)

    if not res.data:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return res.data[0]
