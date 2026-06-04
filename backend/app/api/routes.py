from fastapi import APIRouter, Query

from app.agents.supervisor import SupervisorAgent
from app.models.schemas import (
    CareerRequest,
    CareerResponse,
    ChatRequest,
    ChatResponse,
    CompareResponse,
    RecommendationResponse,
)
from app.rag.rag_service import RagService
from app.services.career_service import CareerService
from app.services.comparison_service import ComparisonService
from app.services.recommendation_service import RecommendationService

router = APIRouter()
supervisor = SupervisorAgent()
recommendations = RecommendationService()
comparisons = ComparisonService()
careers = CareerService()
rag = RagService()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "EduGuide AI"}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    return supervisor.handle(payload.message, payload.session_id)


@router.get("/recommend", response_model=RecommendationResponse)
def recommend(
    state: str | None = None,
    stream: str | None = None,
    max_fee: int | None = Query(default=None, ge=0),
    min_rating: float | None = Query(default=None, ge=0, le=10),
    priority: str = "balanced",
    limit: int = Query(default=10, ge=1, le=50),
) -> RecommendationResponse:
    results = recommendations.recommend(state, stream, max_fee, min_rating, priority, limit)
    return RecommendationResponse(count=len(results), results=results)


@router.get("/compare", response_model=CompareResponse)
def compare(names: str = Query(..., description="Comma-separated college names")) -> CompareResponse:
    colleges, metrics = comparisons.compare([name.strip() for name in names.split(",")])
    return CompareResponse(colleges=colleges, metrics=metrics)


@router.get("/search", response_model=RecommendationResponse)
def search(q: str, limit: int = Query(default=10, ge=1, le=50)) -> RecommendationResponse:
    results = rag.retrieve(q, limit=limit)
    return RecommendationResponse(count=len(results), results=results)


@router.get("/top-rated", response_model=RecommendationResponse)
def top_rated(limit: int = Query(default=10, ge=1, le=50)) -> RecommendationResponse:
    results = recommendations.recommend(priority="balanced", limit=limit)
    return RecommendationResponse(count=len(results), results=results)


@router.get("/top-placement", response_model=RecommendationResponse)
def top_placement(limit: int = Query(default=10, ge=1, le=50)) -> RecommendationResponse:
    results = recommendations.recommend(priority="placement", limit=limit)
    return RecommendationResponse(count=len(results), results=results)


@router.post("/career", response_model=CareerResponse)
def career(payload: CareerRequest) -> CareerResponse:
    return careers.guide(payload.interests)
