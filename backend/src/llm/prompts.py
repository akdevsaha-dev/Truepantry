from datetime import date

# Gemini's response schemas live next to the prompts they belong to.

IDENTIFY_PROMPT = (
    "You are helping a grocery shopper. Identify the single food item the "
    "camera is pointed at. Give a short specific name (e.g. 'honeycrisp apple'), "
    "the brand if you can read one, whether it is packaged, and your confidence "
    "from 0 to 1. If you can't see a food item, use a low confidence."
)

IDENTIFY_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "name": {"type": "STRING"},
        "brand": {"type": "STRING", "nullable": True},
        "is_packaged": {"type": "BOOLEAN"},
        "confidence": {"type": "NUMBER"},
    },
    "required": ["name", "is_packaged", "confidence"],
}

VERDICT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "level": {"type": "STRING", "enum": ["good", "caution", "avoid"]},
        "headline": {"type": "STRING"},
        "spoken": {"type": "STRING"},
        "reasons": {"type": "ARRAY", "items": {"type": "STRING"}},
    },
    "required": ["level", "headline", "spoken", "reasons"],
}


def verdict_prompt(item: dict, profile: dict) -> str:
    return f"""You are TruePantry, a friendly grocery assistant. A shopper is holding a product.
Say whether it fits their goal and diet.

Product: {item['name']}
Brand: {item['brand'] or 'unknown'}
Ingredients: {item['ingredients'] or 'not available, use what you know about this kind of food'}

Shopper:
- goal: {profile.get('goal') or 'not set'}
- diet: {profile.get('other_diet') or profile.get('diet') or 'not set'}
- age: {age_from_dob(profile.get('dob')) or 'unknown'}
- height (cm): {profile.get('height') or 'unknown'}

Rules:
- "spoken" is read aloud: 1 to 3 short, natural sentences.
- "headline" is under 10 words. "reasons" has 1 to 3 short points.
- Don't invent exact nutrition numbers you aren't sure about.
- If the product breaks their diet, use level "avoid"."""


def age_from_dob(dob: str | None) -> int | None:
    if not dob:
        return None
    born = date.fromisoformat(dob)
    today = date.today()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


NUTRITION_FIELDS = [
    "energy_kcal",
    "protein_g",
    "carbs_g",
    "sugar_g",
    "fat_g",
    "sat_fat_g",
    "fiber_g",
    "sodium_mg",
]

SCORES_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "nutri_grade": {"type": "STRING", "enum": ["a", "b", "c", "d", "e"]},
        "eco_grade": {"type": "STRING", "enum": ["a", "b", "c", "d", "e"]},
        "nova_group": {"type": "INTEGER"},
        "nutrition": {
            "type": "OBJECT",
            "properties": {f: {"type": "NUMBER"} for f in NUTRITION_FIELDS},
            "required": NUTRITION_FIELDS,
        },
        "sourcing": {
            "type": "OBJECT",
            "properties": {
                "origin": {"type": "STRING", "nullable": True},
                "packaging": {"type": "STRING", "nullable": True},
                "labels": {"type": "ARRAY", "items": {"type": "STRING"}},
                "notes": {"type": "STRING", "nullable": True},
            },
            "required": ["labels"],
        },
    },
    "required": ["nutri_grade", "eco_grade", "nova_group", "nutrition", "sourcing"],
}

RECIPE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "title": {"type": "STRING"},
        "description": {"type": "STRING"},
        "servings": {"type": "INTEGER"},
        "prep_minutes": {"type": "INTEGER"},
        "cook_minutes": {"type": "INTEGER"},
        "ingredients": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "name": {"type": "STRING"},
                    "amount": {"type": "STRING"},
                    "cart_number": {"type": "INTEGER", "nullable": True},
                    "is_staple": {"type": "BOOLEAN"},
                },
                "required": ["name", "amount", "is_staple"],
            },
        },
        "steps": {"type": "ARRAY", "items": {"type": "STRING"}},
        "nutrition": {
            "type": "OBJECT",
            "properties": {f: {"type": "NUMBER"} for f in NUTRITION_FIELDS},
            "required": NUTRITION_FIELDS,
        },
    },
    "required": [
        "title",
        "description",
        "servings",
        "prep_minutes",
        "cook_minutes",
        "ingredients",
        "steps",
        "nutrition",
    ],
}


def scores_prompt(item: dict) -> str:
    return f"""You are TruePantry's food data assistant. Estimate typical scores for this food,
which has no official data.

Food: {item['name']}
Brand: {item.get('brand') or 'unknown'}
Packaged: {'yes' if item['is_packaged'] else 'no, fresh or loose'}
Ingredients: {item.get('ingredients') or 'not available'}

Rules:
- These are estimates for a typical item of this kind, not exact measurements.
- nutri_grade: Nutri-Score a (best) to e (worst). eco_grade: Eco-Score a (best) to e (worst).
- nova_group: 1 (unprocessed) to 4 (ultra-processed).
- nutrition values are per 100g (sodium in mg).
- sourcing: typical origin, packaging and labels (e.g. organic) only if usual for this food.
  Use null or an empty list when you don't know, don't invent specifics."""


def recipe_prompt(items: list[dict], profile: dict, servings: int | None) -> str:
    lines = []
    for number, item in enumerate(items, start=1):
        p = item["products"]
        avoid = " (flagged AVOID for this shopper)" if item["verdict"].get("level") == "avoid" else ""
        lines.append(f"{number}. {p['name']}" + (f" ({p['brand']})" if p["brand"] else "")
                     + f" x{item['quantity']}{avoid}")

    return f"""You are TruePantry, a friendly home cook. Build one recipe from the shopper's cart.

Cart:
{chr(10).join(lines)}

Shopper:
- goal: {profile.get('goal') or 'not set'}
- diet: {profile.get('other_diet') or profile.get('diet') or 'not set'}
- servings wanted: {servings or 'your choice, 2 to 4'}

Rules:
- Build the recipe mainly from the cart items. Use as many as make sense, you don't need all of them.
- You may add basic staples that are not in the cart (salt, pepper, oil, water, common spices).
  Mark those is_staple true and cart_number null.
- For an ingredient that comes from the cart, set cart_number to its number above and is_staple false.
- Never add other main ingredients (meat, dairy, vegetables, etc.) that are not in the cart.
- Respect the shopper's diet strictly. Skip cart items that break it.
- Steps are short, clear and in order. nutrition is a per-serving estimate."""
