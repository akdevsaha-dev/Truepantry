from pydantic import BaseModel, Field


class QuantityRequest(BaseModel):
    quantity: int = Field(ge=1, le=99)
