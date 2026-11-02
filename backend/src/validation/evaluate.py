from typing import Annotated, Literal, Union
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

