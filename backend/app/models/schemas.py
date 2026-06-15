from typing import Any

from pydantic import BaseModel, Field


class College(BaseModel):
    id: int
    college_name: str
    state: str
    stream: str
    ug_fee: int | None
    pg_fee: int | None
    rating: float
    academic: float
    accommodation: float
    faculty: float
    infrastructure: float
    placement: float
    social_life: float
    profile: str


class RecommendationResponse(BaseModel):
    count: int
    results: list[College]


class CompareResponse(BaseModel):
    colleges: list[College]
    metrics: dict[str, list[Any]]
    clarifications: list[str] = []


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=2)
    session_id: str = "default"


class ChatResponse(BaseModel):
    route: str
    answer: str
    results: list[College] = []
    memory: dict[str, Any] = {}


class CareerRequest(BaseModel):
    interests: str = Field(..., min_length=2)


class CareerResponse(BaseModel):
    recommended_streams: list[str]
    guidance: str
