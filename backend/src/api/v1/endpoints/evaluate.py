from fastapi import APIRouter, Depends, HTTPException

from src.api.deps import get_current_user
from src.llm.client import estimate_scores, get_verdict, identify_image
from src.services import openfoodfacts
from src.services.catalog import (
    add_to_cart,
    find_product,
    get_or_create_cart,
    get_profile,
    normalize_name,
    save_product,
)
from src.validation.evaluate import EvaluateRequest

router = APIRouter(prefix="/evaluate", tags=["Evaluate"])

MIN_CONFIDENCE = 0.7

@router.post("")
def evaluate(body: EvaluateRequest, current_user: dict = Depends(get_current_user)):
    """Identifies the scanned item, saves it to the shared catalog, and adds it to the user's cart."""
    if body.source == "barcode":
        product = find_product(barcode=body.barcode)
        if not product:
            item = openfoodfacts.lookup_barcode(body.barcode)
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
                match = openfoodfacts.search(f"{brand} {name}")
                if match:
                    # keep the barcode empty so the next photo of this item is found by name
                    item = {**match, "name": name, "brand": brand, "barcode": None, "resolved_by": "vision"}
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
        "item": product,
        "verdict": cart_item["verdict"],
        "quantity": cart_item["quantity"],  # how many of this product are in the cart now
    }


def add_scores(item: dict) -> dict:
    """Real Open Food Facts data always wins. When the Nutri-Score is missing (fresh produce,
    unknown products) the LLM estimates whatever is still empty. If that call fails the item
    is saved without scores so the scan still works."""
    if item.get("nutri_grade"):
        return {**item, "scores_source": "off"}

    try:
        estimate = estimate_scores(item)
    except HTTPException:
        return item

    return {
        **item,
        "nutri_grade": estimate["nutri_grade"],
        "eco_grade": item.get("eco_grade") or estimate["eco_grade"],
        "nova_group": item.get("nova_group") or openfoodfacts.valid_nova(estimate["nova_group"]),
        "nutrition": item.get("nutrition") or estimate["nutrition"],
        "sourcing": item.get("sourcing") or estimate["sourcing"],
        "scores_source": "llm",
    }
