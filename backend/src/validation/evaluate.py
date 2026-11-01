from typing import Annotated, Literal, Optional, Union
from pydantic import BaseModel, Field


class BarcodeInput(BaseModel):
    source: Literal["barcode"]
    barcode: str = Field(pattern=r"^\d{8,14}$")


class ImageInput(BaseModel):
    source: Literal["image"]
    image: str = Field(
        min_length=1, max_length=2_000_000
    )  # base64 jpeg, no data: prefix


class LabelInput(BaseModel):
    source: Literal["label"]
    label: str = Field(min_length=1, max_length=120)


EvaluateRequest = Annotated[
    Union[BarcodeInput, ImageInput, LabelInput],
    Field(discriminator="source"),
]


class Item(BaseModel):
    id: str
    name: str
    brand: Optional[str] = None
    is_packaged: bool
    resolved_by: Literal["barcode", "vision", "label"]
    image_url: Optional[str] = None
    nutri_grade: Optional[str] = None
    eco_grade: Optional[str] = None
    nova_group: Optional[int] = None
    scores_source: Optional[Literal["off", "llm"]] = None  # "llm" means estimated
    nutrition: dict = {}
    sourcing: dict = {}


class CartInfo(BaseModel):
    item_id: str  # the cart_items row this scan landed in
    quantity: int  # how many of this product are in the cart now
    distinct_items: int
    total_quantity: int


class Verdict(BaseModel):
    level: Literal["good", "caution", "avoid"]
    headline: str
    spoken: str
    reasons: list[str] = []


class OkResponse(BaseModel):
    status: Literal["ok"] = "ok"
    item: Item
    verdict: Verdict
    cart: CartInfo


class NeedsImageResponse(BaseModel):
    status: Literal["needs_image"] = "needs_image"
    message: Optional[str] = None


class LowConfidenceResponse(BaseModel):
    status: Literal["low_confidence"] = "low_confidence"
    guess: str
    confidence: float


EvaluateResponse = Annotated[
    Union[OkResponse, NeedsImageResponse, LowConfidenceResponse],
    Field(discriminator="status"),
]
