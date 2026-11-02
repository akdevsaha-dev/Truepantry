import hashlib
import re
from datetime import datetime, timezone

from fastapi import HTTPException
from postgrest.exceptions import APIError

from src.db.supabase import get_supabase_client

supabase = get_supabase_client()

PRODUCT_COLUMNS = (
    "id, barcode, name, brand, is_packaged, source, image_url, ingredients, "
    "nutri_grade, eco_grade, nova_group, scores_source, nutrition, sourcing"
)


def db_error(e: APIError) -> HTTPException:
    return HTTPException(status_code=500, detail=f"Database error: {e.message}")


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_name(name: str, brand: str | None) -> str:
    return re.sub(r"\s+", " ", f"{brand or ''} {name}").strip().lower()


def find_product(barcode: str | None = None, normalized_name: str | None = None):
    """Looks a product up in the shared catalog, by barcode or by name (barcode-less items)."""
    query = supabase.table("products").select(PRODUCT_COLUMNS)
    if barcode:
        query = query.eq("barcode", barcode)
    elif normalized_name:
        query = query.is_("barcode", "null").eq("normalized_name", normalized_name)
    else:
        return None

    try:
        res = query.limit(1).execute()
    except APIError as e:
        raise db_error(e)
    return res.data[0] if res.data else None


def save_product(item: dict) -> dict:
    """Inserts a resolved item into the catalog, or returns the row that beat us to it."""
    normalized = normalize_name(item["name"], item.get("brand"))
    row = {
        "barcode": item.get("barcode"),
        "name": item["name"],
        "normalized_name": normalized,
        "brand": item.get("brand"),
        "is_packaged": item["is_packaged"],
        "source": item["resolved_by"],
        "image_url": item.get("image_url"),
        "ingredients": item.get("ingredients") or None,
        "nutri_grade": item.get("nutri_grade"),
        "eco_grade": item.get("eco_grade"),
        "nova_group": item.get("nova_group"),
        "scores_source": item.get("scores_source"),
        "nutrition": item.get("nutrition") or {},
        "sourcing": item.get("sourcing") or {},
        "raw": item.get("raw"),
    }
    try:
        res = supabase.table("products").insert(row).execute()
        return {k: res.data[0][k] for k in PRODUCT_COLUMNS.split(", ")}
    except APIError as e:
        # unique violation: another request saved the same product first
        existing = find_product(item.get("barcode"), normalized)
        if e.code == "23505" and existing:
            return existing
        raise db_error(e)


def get_or_create_cart(user_id: str) -> dict:
    try:
        res = supabase.table("carts").select("id").eq("user_id", user_id).limit(1).execute()
        if res.data:
            return res.data[0]
        try:
            return supabase.table("carts").insert({"user_id": user_id}).execute().data[0]
        except APIError as e:
            if e.code != "23505":
                raise
            # two scans created the cart at once, use the winner
            return supabase.table("carts").select("id").eq("user_id", user_id).limit(1).execute().data[0]
    except APIError as e:
        raise db_error(e)


def get_cart(user_id: str) -> dict | None:
    try:
        res = supabase.table("carts").select("id").eq("user_id", user_id).limit(1).execute()
    except APIError as e:
        raise db_error(e)
    return res.data[0] if res.data else None


def get_cart_items(cart_id: str) -> list[dict]:
    """Cart rows with their product joined in, oldest first."""
    try:
        res = (
            supabase.table("cart_items")
            .select(f"id, quantity, verdict, added_at, products({PRODUCT_COLUMNS})")
            .eq("cart_id", cart_id)
            .order("added_at")
            .execute()
        )
    except APIError as e:
        raise db_error(e)
    return res.data


def add_to_cart(cart_id: str, product_id: str, make_verdict) -> dict:
    """Adds one of a product to the cart. A repeat scan bumps the quantity and reuses the saved
    verdict, so make_verdict (an LLM call) only runs the first time."""
    try:
        res = (
            supabase.table("cart_items")
            .select("id, quantity, verdict")
            .eq("cart_id", cart_id)
            .eq("product_id", product_id)
            .limit(1)
            .execute()
        )
        if res.data:
            row = res.data[0]
            quantity = row["quantity"] + 1
            supabase.table("cart_items").update({"quantity": quantity, "updated_at": now()}).eq(
                "id", row["id"]
            ).execute()
            return {"id": row["id"], "quantity": quantity, "verdict": row["verdict"]}

        verdict = make_verdict()
        created = (
            supabase.table("cart_items")
            .insert({"cart_id": cart_id, "product_id": product_id, "verdict": verdict})
            .execute()
            .data[0]
        )
        return {"id": created["id"], "quantity": created["quantity"], "verdict": verdict}
    except APIError as e:
        raise db_error(e)


def cart_fingerprint(items: list[dict]) -> str:
    """Same products in the cart => same fingerprint, whatever order or quantity."""
    ids = sorted(item["products"]["id"] for item in items)
    return hashlib.sha256(",".join(ids).encode()).hexdigest()


def get_profile(user_id: str) -> dict:
    try:
        res = (
            supabase.table("profiles")
            .select("dob, height, gender, goal, diet, other_diet")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
    except APIError as e:
        raise db_error(e)
    return res.data[0] if res.data else {}
