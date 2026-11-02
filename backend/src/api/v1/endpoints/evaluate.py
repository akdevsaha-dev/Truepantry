import httpx
from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_current_user
from src.llm.client import estimate_scores, get_verdict, identify_image
from src.services.catalog import (
    add_to_cart,
    cart_totals,
    find_product,
    get_or_create_cart,
    get_profile,
    normalize_name,
    save_product,
)
from src.validation.evaluate import EvaluateRequest

router = APIRouter(prefix="/evaluate", tags=["Evaluate"])

OFF_URL = "https://world.openfoodfacts.org"
MIN_CONFIDENCE = 0.7

# Open Food Facts nutriment name -> our nutrition key (all per 100g)
NUTRIENTS = {
    "energy-kcal_100g": "energy_kcal",
    "proteins_100g": "protein_g",
    "carbohydrates_100g": "carbs_g",
    "sugars_100g": "sugar_g",
    "fat_100g": "fat_g",
    "saturated-fat_100g": "sat_fat_g",
    "fiber_100g": "fiber_g",
    "sodium_100g": "sodium_g",
}


@router.post("")
def evaluate(body: EvaluateRequest, current_user: dict = Depends(get_current_user)):
    """Identifies the scanned item, saves it to the shared catalog, and adds it to the user's cart."""
    if body.source == "barcode":
        product = find_product(barcode=body.barcode)
        if not product:
            item = off_lookup(body.barcode)
            if not item:
                return {"status": "needs_image", "message": "We couldn't find that barcode."}
            product = save_product(add_scores(item))

    elif body.source == "image":
        guess = identify_image(body.image)
        if guess["confidence"] < MIN_CONFIDENCE:
            return {
                "status": "low_confidence",
                "guess": guess["name"],
                "confidence": guess["confidence"],
            }

        name, brand = guess["name"], guess.get("brand")
        product = find_product(normalized_name=normalize_name(name, brand))
        if not product:
            item = {"name": name, "brand": brand, "is_packaged": guess["is_packaged"], "resolved_by": "vision"}
            # a packaged item probably has real data on Open Food Facts
            if item["is_packaged"] and brand:
                match = off_search(f"{brand} {name}")
                if match:
                    item = {**match, "name": name, "brand": brand}
            product = save_product(add_scores(item))

    else:
        name = body.label.strip()
        product = find_product(normalized_name=normalize_name(name, None))
        if not product:
            item = {"name": name, "brand": None, "is_packaged": False, "resolved_by": "label"}
            product = save_product(add_scores(item))

    cart = get_or_create_cart(current_user["id"])
    profile = get_profile(current_user["id"])
    # the verdict is an LLM call, so it only runs the first time this product lands in the cart
    cart_item = add_to_cart(cart["id"], product["id"], lambda: get_verdict(product, profile))

    return {
        "status": "ok",
        "item": {**product, "resolved_by": product["source"]},
        "verdict": cart_item["verdict"],
        "cart": {
            "item_id": cart_item["id"],
            "quantity": cart_item["quantity"],
            **cart_totals(cart["id"]),
        },
    }


def add_scores(item: dict) -> dict:
    """Uses the Open Food Facts scores if there are any, otherwise asks the LLM to estimate them.
    If the estimate fails the item is saved without scores so the scan still works."""
    if item.get("nutri_grade") or item.get("eco_grade"):
        return {**item, "scores_source": "off"}

    try:
        scores = estimate_scores(item)
    except HTTPException:
        return item

    return {
        **item,
        "nutri_grade": scores["nutri_grade"],
        "eco_grade": scores["eco_grade"],
        "nova_group": nova(scores["nova_group"]),
        "nutrition": item.get("nutrition") or scores["nutrition"],
        "sourcing": scores["sourcing"],
        "scores_source": "llm",
    }


def off_lookup(barcode: str) -> dict | None:
    try:
        data = httpx.get(f"{OFF_URL}/api/v2/product/{barcode}.json", timeout=8).json()
    except (httpx.HTTPError, ValueError):
        return None

    if data.get("status") != 1:
        return None
    return off_to_item(data["product"], barcode)


def off_search(query: str) -> dict | None:
    params = {"search_terms": query, "search_simple": 1, "json": 1, "page_size": 1}
    try:
        data = httpx.get(f"{OFF_URL}/cgi/search.pl", params=params, timeout=8).json()
    except (httpx.HTTPError, ValueError):
        return None

    products = data.get("products") or []
    return off_to_item(products[0]) if products else None


def off_to_item(product: dict, barcode: str | None = None) -> dict:
    nutriments = product.get("nutriments") or {}
    nutrition = {}
    for off_key, key in NUTRIENTS.items():
        try:
            nutrition[key] = float(nutriments[off_key])
        except (KeyError, TypeError, ValueError):
            pass
    if "sodium_g" in nutrition:
        nutrition["sodium_mg"] = nutrition.pop("sodium_g") * 1000

    labels = (product.get("labels") or "").split(",")

    return {
        "name": product.get("product_name") or "Unknown product",
        "brand": (product.get("brands") or "").split(",")[0].strip() or None,
        "barcode": barcode,
        "is_packaged": True,
        "resolved_by": "barcode" if barcode else "vision",
        "ingredients": product.get("ingredients_text"),
        "image_url": product.get("image_front_url") or product.get("image_url"),
        "nutri_grade": grade(product.get("nutriscore_grade")),
        "eco_grade": grade(product.get("ecoscore_grade")),
        "nova_group": nova(product.get("nova_group")),
        "nutrition": nutrition,
        "sourcing": {
            "origin": product.get("origins") or product.get("manufacturing_places") or None,
            "packaging": product.get("packaging") or None,
            "labels": [label.strip() for label in labels if label.strip()],
        },
        "raw": product,
    }


def grade(value) -> str | None:
    """OFF also returns things like 'unknown' and 'not-applicable', which the DB would reject."""
    value = (value or "").lower()
    return value if value in ("a", "b", "c", "d", "e") else None


def nova(value) -> int | None:
    try:
        value = int(value)
    except (TypeError, ValueError):
        return None
    return value if 1 <= value <= 4 else None
