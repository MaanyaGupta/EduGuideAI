from app.models.schemas import College
from app.services.data_service import get_colleges


class RecommendationService:
    def recommend(
        self,
        state: str | None = None,
        stream: str | None = None,
        max_fee: int | None = None,
        min_rating: float | None = None,
        priority: str = "balanced",
        limit: int = 10,
    ) -> list[College]:
        colleges = list(get_colleges())

        if state:
            state_query = state.lower()
            colleges = [c for c in colleges if state_query in c.state.lower()]
        if stream:
            stream_query = stream.lower()
            colleges = [c for c in colleges if stream_query in c.stream.lower()]
        if max_fee:
            colleges = [c for c in colleges if c.ug_fee is not None and c.ug_fee <= max_fee]
        if min_rating:
            colleges = [c for c in colleges if c.rating >= min_rating]

        return sorted(colleges, key=lambda college: self._score(college, priority), reverse=True)[:limit]

    @staticmethod
    def _score(college: College, priority: str) -> float:
        weights = {
            "placement": {"placement": 0.45, "rating": 0.2, "faculty": 0.15, "academic": 0.1, "infrastructure": 0.1},
            "infrastructure": {"infrastructure": 0.45, "rating": 0.2, "faculty": 0.15, "placement": 0.1, "academic": 0.1},
            "faculty": {"faculty": 0.45, "academic": 0.25, "rating": 0.2, "placement": 0.1},
            "budget": {"rating": 0.25, "placement": 0.25, "faculty": 0.2, "infrastructure": 0.15, "academic": 0.15},
            "balanced": {"rating": 0.25, "placement": 0.25, "faculty": 0.2, "infrastructure": 0.15, "academic": 0.15},
        }.get(priority.lower(), {})

        quality = sum(getattr(college, metric) * weight for metric, weight in weights.items())
        fee_bonus = 0.0
        if college.ug_fee:
            fee_bonus = max(0.0, 1.0 - min(college.ug_fee, 500000) / 500000)
        if priority == "budget":
            return quality + fee_bonus * 2
        return quality + fee_bonus * 0.3
