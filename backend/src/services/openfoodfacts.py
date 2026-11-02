"""Open Food Facts client. Free, open product database, used for packaged goods."""
import httpx

BASE_URL = "https://world.openfoodfacts.org"
SEARCH_URL = "https://search.openfoodfacts.org/search"
# OFF asks every app to identify itself with a custom User-Agent
HEADERS = {"User-Agent": "TruePantry/1.0"}

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


def lookup_barcode(barcode: str) -> dict | None:
    try:
        data = httpx.get(f"{BASE_URL}/api/v2/product/{barcode}.json", headers=HEADERS, timeout=8).json()
    except (httpx.HTTPError, ValueError):
        return None

    if data.get("status") != 1:
        return None
    return to_item(data["product"], barcode)


def search(query: str) -> dict | None:
    """Finds the best match for a "brand name" query. The search API only gives us the
    barcode, then the normal barcode lookup returns the full product."""
    params = {"q": query, "page_size": 1, "fields": "code"}
    try:
        data = httpx.get(SEARCH_URL, params=params, headers=HEADERS, timeout=8).json()
    except (httpx.HTTPError, ValueError):
        return None

    hits = data.get("hits") or []
    return lookup_barcode(hits[0]["code"]) if hits else None


def to_item(product: dict, barcode: str | None = None) -> dict:
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
        "nutri_grade": valid_grade(product.get("nutriscore_grade")),
        "eco_grade": valid_grade(product.get("ecoscore_grade")),
        "nova_group": valid_nova(product.get("nova_group")),
        "nutrition": nutrition,
        "sourcing": {
            "origin": product.get("origins") or product.get("manufacturing_places") or None,
            "packaging": product.get("packaging") or None,
            "labels": [label.strip() for label in labels if label.strip()],
        },
        "raw": product,
    }


def valid_grade(value) -> str | None:
    """OFF also returns things like 'unknown' and 'not-applicable', which the DB would reject."""
    value = (value or "").lower()
    return value if value in ("a", "b", "c", "d", "e") else None


def valid_nova(value) -> int | None:
    try:
        value = int(value)
    except (TypeError, ValueError):
        return None
    return value if 1 <= value <= 4 else None
