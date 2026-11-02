import base64
import binascii
import json
import logging

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
logger = logging.getLogger(__name__)

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"

# Gemini models get overloaded at random (503 "high demand"). When one is busy we try the
# next, so a scan only fails if all of them are down at once.
FALLBACK_MODELS = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest"]


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
    if not settings.google_api_key:
        raise HTTPException(status_code=500, detail="GOOGLE_API_KEY is not set")

    body = {
        "contents": [{"parts": parts}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": schema,
        },
    }
    models = [settings.gemini_model] + [m for m in FALLBACK_MODELS if m != settings.gemini_model]

    for model in models:
        try:
            res = httpx.post(
                f"{GEMINI_URL}/{model}:generateContent",
                headers={"x-goog-api-key": settings.google_api_key},
                json=body,
                timeout=12,
            )
        except httpx.HTTPError as e:
            logger.warning("Gemini %s request failed, trying the next model: %s", model, e)
            continue

        if res.status_code in (401, 403):
            # a setup problem, another model won't help
            logger.error("Gemini rejected the API key: %s", res.text)
            raise HTTPException(status_code=500, detail="The AI service is not set up: GOOGLE_API_KEY is invalid")
        if res.status_code != 200:
            logger.warning("Gemini %s returned %s, trying the next model", model, res.status_code)
            continue

        try:
            text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except (KeyError, IndexError, ValueError):
            logger.warning("Gemini %s sent an unexpected response: %s", model, res.text[:300])

    raise HTTPException(status_code=502, detail="The AI service is busy right now, please try again")
