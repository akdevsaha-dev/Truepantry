from functools import lru_cache
from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TruePantry API"
    environment: str = "development"

    supabase_url: str
    supabase_key: str

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60 * 24 * 7
    cookie_name: str = "access_token"

    # Gemini key from Google AI Studio, either name works in .env
    google_api_key: str = Field("", validation_alias=AliasChoices("GOOGLE_API_KEY", "GEMINI_API_KEY"))
    gemini_model: str = "gemini-3.1-flash-lite"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
