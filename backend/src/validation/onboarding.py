from datetime import date
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class OnboardingProfileValidation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    dob: date
    height: float = Field(ge=50.0, le=250.0, description="Height in cm between 50 and 250")
    gender: str = Field(min_length=1, max_length=50)

    @field_validator("dob")
    @classmethod
    def validate_dob(cls, v: date) -> date:
        today = date.today()
        if v > today:
            raise ValueError("Date of birth cannot be in the future")
        oldest = today.replace(year=today.year - 120)
        if v < oldest:
            raise ValueError("Date of birth must be within the last 120 years")
        return v


class OnboardingGoalValidation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    goal: str = Field(min_length=1, max_length=50)

    @field_validator("goal")
    @classmethod
    def validate_goal(cls, v: str) -> str:
        valid_goals = {"balance", "energy", "weight"}
        if v.lower() not in valid_goals:
            raise ValueError(
                f"Invalid goal '{v}'. Allowed goals: {', '.join(sorted(valid_goals))}"
            )
        return v.lower()


class OnboardingPreferencesValidation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    diet: str = Field(min_length=1, max_length=50)
    other_diet: Optional[str] = Field(default=None, alias="otherDiet", max_length=120)
    allergies: List[str] = Field(default_factory=list)
    other_allergy: Optional[str] = Field(default=None, alias="otherAllergy", max_length=200)

    @field_validator("other_diet")
    @classmethod
    def validate_other_diet(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v

    @field_validator("other_allergy")
    @classmethod
    def validate_other_allergy(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v

    @model_validator(mode="after")
    def validate_other_fields(self):
        if self.diet.lower() == "other" and not self.other_diet:
            raise ValueError("Please specify your dietary preference when 'Other' is selected")
        if any(a.lower() == "other" for a in self.allergies) and not self.other_allergy:
            raise ValueError("Please specify other allergies when 'Other' is selected")
        return self
