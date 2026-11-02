import base64
import binascii
import json

import httpx
from fastapi import HTTPException

from src.core.config import get_settings
from src.llm.prompts import (
    CHAT_SCHEMA,
    IDENTIFY_PROMPT,
    IDENTIFY_SCHEMA,
    RECIPE_SCHEMA,
    SCORES_SCHEMA,
    VERDICT_SCHEMA,
    chat_prompt,
    recipe_prompt,
    scores_prompt,
    verdict_prompt,
)

settings = get_settings()

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"


def identify_image(image_b64: str) -> dict:
    """Returns {name, brand, is_packaged, confidence} for the item in the photo."""
    try:
        base64.b64decode(image_b64, validate=True)
    except binascii.Error:
        raise HTTPException(status_code=400, detail="Image is not valid base64")

    parts = [
        {"text": IDENTIFY_PROMPT},
        {"inline_data": {"mime_type": "image/jpeg", "data": image_b64}},
    ]
    return call_gemini(parts, IDENTIFY_SCHEMA)


def get_verdict(item: dict, profile: dict) -> dict:
    """Returns {level, headline, spoken, reasons} for this item and shopper."""
    return call_gemini([{"text": verdict_prompt(item, profile)}], VERDICT_SCHEMA)


def estimate_scores(item: dict) -> dict:
    """Returns {nutri_grade, eco_grade, nova_group, nutrition, sourcing} for items with no official data."""
    return call_gemini([{"text": scores_prompt(item)}], SCORES_SCHEMA)


def generate_recipe(items: list[dict], profile: dict, servings: int | None) -> dict:
    """Returns a recipe built from the cart items (see RECIPE_SCHEMA)."""
    return call_gemini([{"text": recipe_prompt(items, profile, servings)}], RECIPE_SCHEMA)


def chat_about_recipe(recipe: dict, profile: dict, messages: list[dict]) -> str:
    """Answers the last message in the conversation about this recipe."""
    return call_gemini([{"text": chat_prompt(recipe, profile, messages)}], CHAT_SCHEMA)["reply"]


def call_gemini(parts: list, schema: dict) -> dict:
    if not settings.gemini_api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set")

    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }
    try:
        res = httpx.post(
            f"{GEMINI_URL}/{settings.gemini_model}:generateContent",
            headers={"x-goog-api-key": settings.gemini_api_key},
            json=body,
            timeout=25,
        )
        res.raise_for_status()
        text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (httpx.HTTPError, KeyError, IndexError, ValueError):
        raise HTTPException(
            status_code=502, detail="The AI service failed, please try again"
        )
