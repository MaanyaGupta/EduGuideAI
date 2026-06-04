from difflib import SequenceMatcher

from app.models.schemas import College
from app.services.data_service import get_colleges


class ComparisonService:
    def compare(self, names: list[str]) -> tuple[list[College], dict[str, list[object]]]:
        colleges = [self._best_match(name) for name in names if name.strip()]
        colleges = [college for college in colleges if college is not None]
        metrics = {
            "Rating": [college.rating for college in colleges],
            "UG Fees": [college.ug_fee for college in colleges],
            "Placement": [college.placement for college in colleges],
            "Faculty": [college.faculty for college in colleges],
            "Infrastructure": [college.infrastructure for college in colleges],
            "Accommodation": [college.accommodation for college in colleges],
            "Social Life": [college.social_life for college in colleges],
        }
        return colleges, metrics

    @staticmethod
    def _best_match(name: str) -> College | None:
        query = name.lower().strip()
        scored = []
        for college in get_colleges():
            haystack = college.college_name.lower()
            if query in haystack:
                return college
            scored.append((SequenceMatcher(None, query, haystack).ratio(), college))
        scored.sort(key=lambda item: item[0], reverse=True)
        return scored[0][1] if scored and scored[0][0] > 0.35 else None
