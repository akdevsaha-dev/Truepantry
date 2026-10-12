from fastapi import FastAPI
from src.api.router import api_router

app = FastAPI(title="TruePantry API")

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}
