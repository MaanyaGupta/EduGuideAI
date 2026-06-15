from difflib import SequenceMatcher

from app.models.schemas import College
from app.services.data_service import get_colleges


class ComparisonService:
    def compare(self, names: list[str]) -> tuple[list[College], dict[str, list[object]], list[str]]:
        colleges = []
        clarifications = []
        for name in names:
            if not name.strip():
                continue
            match, suggestions = self._best_match(name)
            if match:
                colleges.append(match)
            else:
                if suggestions:
                    clarifications.append(f"Could not find exact match for '{name}'. Did you mean {', '.join(suggestions)}?")
                else:
                    clarifications.append(f"Could not find any matches for '{name}'.")

        metrics = {}
        if colleges:
            metrics = {
                "Rating": [college.rating for college in colleges],
                "UG Fees": [college.ug_fee for college in colleges],
                "Placement": [college.placement for college in colleges],
                "Faculty": [college.faculty for college in colleges],
                "Infrastructure": [college.infrastructure for college in colleges],
                "Accommodation": [college.accommodation for college in colleges],
                "Social Life": [college.social_life for college in colleges],
            }
        return colleges, metrics, clarifications

    @staticmethod
    def _best_match(name: str) -> tuple[College | None, list[str]]:
        query = name.lower().strip()
        scored = []
        for college in get_colleges():
            haystack = college.college_name.lower()
            if query == haystack:
                return college, []
            
            if query in haystack:
                scored.append((0.9, college.college_name))
            else:
                ratio = SequenceMatcher(None, query, haystack).ratio()
                if ratio > 0.4:
                    scored.append((ratio, college.college_name))
        
        scored.sort(key=lambda item: item[0], reverse=True)
        suggestions = [item[1] for item in scored[:3]]
        return None, suggestions
