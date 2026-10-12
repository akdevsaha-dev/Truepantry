from pydantic import BaseModel, EmailStr, Field


class SignupValidation(BaseModel):
    username: str = Field(min_length=3, max_length=18)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class SigninValidation(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
