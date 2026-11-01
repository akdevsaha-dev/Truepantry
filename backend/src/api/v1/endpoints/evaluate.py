import httpx
from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from src.api.deps import get_current_user
from src.db.supabase import get_supabase_client
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
from src.validation.evaluate import (
    BarcodeInput,
    CartInfo,
    EvaluateRequest,
    EvaluateResponse,
    ImageInput,
    Item,
    LabelInput,
    LowConfidenceResponse,
    NeedsImageResponse,
    OkResponse,
    Verdict,
)

router = APIRouter(prefix="/evaluate", tags=["Evaluate"])
supabase = get_supabase_client()

OFF_URL = "https://world.openfoodfacts.org"
MIN_CONFIDENCE = 0.7
GRADES = "abcde"


@router.post("", response_model=EvaluateResponse)
def evaluate(body: EvaluateRequest, current_user: dict = Depends(get_current_user)):
    """Identifies the scanned item, saves it to the shared catalog, and adds it to the user's cart."""
    if isinstance(body, BarcodeInput):
        # a product we've already seen needs no Open Food Facts call
        product = find_product(barcode=body.barcode)
        if product is None:
            item = find_by_barcode(body.barcode)
            if item is None:
                return NeedsImageResponse(message="We couldn't find that barcode.")

    elif isinstance(body, ImageInput):
        guess = identify_image(body.image)
        if guess["confidence"] < MIN_CONFIDENCE:
            return LowConfidenceResponse(
                guess=guess["name"], confidence=guess["confidence"]
            )
        product = find_product(
            normalized_name=normalize_name(guess["name"], guess.get("brand"))
        )
        if product is None:
            item = {
                "name": guess["name"],
                "brand": guess.get("brand"),
                "is_packaged": guess["is_packaged"],
                "resolved_by": "vision",
            }
            if item["is_packaged"] and item["brand"]:
                # a packaged item has real data somewhere, try to find it
                match = search_off(f"{item['brand']} {item['name']}")
                if match:
                    item.update(
                        {k: v for k, v in match.items() if k not in ("name", "brand", "barcode")}
                    )

    elif isinstance(body, LabelInput):
        name = body.label.strip()
        product = find_product(normalized_name=normalize_name(name, None))
        if product is None:
            item = {
                "name": name,
                "brand": None,
                "is_packaged": False,
                "resolved_by": "label",
            }

    if product is None:
        product = save_product(with_scores(item))

    cart = get_or_create_cart(current_user["id"])
    profile = get_profile(current_user["id"])
    cart_item = add_to_cart(
        cart["id"], product["id"], lambda: get_verdict(product, profile)
    )

    return OkResponse(
        item=Item(
            id=product["id"],
            name=product["name"],
            brand=product["brand"],
            is_packaged=product["is_packaged"],
            resolved_by=product["source"],
            image_url=product["image_url"],
            nutri_grade=product["nutri_grade"],
            eco_grade=product["eco_grade"],
            nova_group=product["nova_group"],
            scores_source=product["scores_source"],
            nutrition=product["nutrition"],
            sourcing=product["sourcing"],
        ),
        verdict=Verdict(**cart_item["verdict"]),
        cart=CartInfo(
            item_id=cart_item["id"],
            quantity=cart_item["quantity"],
            **cart_totals(cart["id"]),
        ),
    )


def with_scores(item: dict) -> dict:
    """Open Food Facts scores are used when it has them. Otherwise (fresh produce, unknown
    products) the LLM estimates them. A failed estimate leaves scores empty so the scan
    still works."""
    if item.get("nutri_grade") or item.get("eco_grade"):
        return {**item, "scores_source": "off"}

    try:
        est = estimate_scores(item)
    except HTTPException:
        return item

    return {
        **item,
        "nutri_grade": est["nutri_grade"],
        "eco_grade": est["eco_grade"],
        "nova_group": clamp_nova(est["nova_group"]),
        "nutrition": item.get("nutrition") or est["nutrition"],  # keep real numbers if OFF had them
        "sourcing": est["sourcing"],
        "scores_source": "llm",
    }


def find_by_barcode(barcode: str) -> dict | None:
    try:
        res = httpx.get(f"{OFF_URL}/api/v2/product/{barcode}.json", timeout=8)
        data = res.json()
    except (httpx.HTTPError, ValueError):
        return None

    if data.get("status") != 1:
        return None
    return product_to_item(data["product"], "barcode", barcode)


def search_off(query: str) -> dict | None:
    try:
        res = httpx.get(
            f"{OFF_URL}/cgi/search.pl",
            params={
                "search_terms": query,
                "search_simple": 1,
                "json": 1,
                "page_size": 1,
            },
            timeout=8,
        )
        products = res.json().get("products", [])
    except (httpx.HTTPError, ValueError):
        return None

    if not products:
        return None
    return product_to_item(products[0], "vision")


def product_to_item(product: dict, resolved_by: str, barcode: str | None = None) -> dict:
    nutriments = product.get("nutriments") or {}
    sodium_g = number(nutriments.get("sodium_100g"))
    nutrition = {
        "energy_kcal": number(nutriments.get("energy-kcal_100g")),
        "protein_g": number(nutriments.get("proteins_100g")),
        "carbs_g": number(nutriments.get("carbohydrates_100g")),
        "sugar_g": number(nutriments.get("sugars_100g")),
        "fat_g": number(nutriments.get("fat_100g")),
        "sat_fat_g": number(nutriments.get("saturated-fat_100g")),
        "fiber_g": number(nutriments.get("fiber_100g")),
        "sodium_mg": sodium_g * 1000 if sodium_g is not None else None,
    }
    labels = [l.strip() for l in (product.get("labels") or "").split(",") if l.strip()]

    return {
        "name": product.get("product_name") or "Unknown product",
        "brand": (product.get("brands") or "").split(",")[0].strip() or None,
        "barcode": barcode,
        "is_packaged": True,
        "resolved_by": resolved_by,
        "ingredients": product.get("ingredients_text") or "",
        "image_url": product.get("image_front_url") or product.get("image_url"),
        "nutri_grade": grade(product.get("nutriscore_grade")),
        "eco_grade": grade(product.get("ecoscore_grade")),
        "nova_group": clamp_nova(product.get("nova_group")),
        "nutrition": {k: v for k, v in nutrition.items() if v is not None},
        "sourcing": {
            "origin": product.get("origins") or product.get("manufacturing_places") or None,
            "packaging": product.get("packaging") or None,
            "labels": labels,
        },
        "raw": product,
    }


def number(value) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def grade(value) -> str | None:
    """OFF also returns 'unknown' and 'not-applicable', which the DB check would reject."""
    value = (value or "").lower()
    return value if len(value) == 1 and value in GRADES else None


def clamp_nova(value) -> int | None:
    try:
        value = int(value)
    except (TypeError, ValueError):
        return None
    return value if 1 <= value <= 4 else None
