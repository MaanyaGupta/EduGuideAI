import re
from typing import Any

from app.models.schemas import ChatResponse
from app.rag.rag_service import RagService
from app.services.career_service import CareerService
from app.services.comparison_service import ComparisonService
from app.services.recommendation_service import RecommendationService


class MemoryStore:
    def __init__(self) -> None:
        self._sessions: dict[str, dict[str, Any]] = {}

    def update_from_message(self, session_id: str, message: str) -> dict[str, Any]:
        memory = self._sessions.setdefault(session_id, {})
        lower = message.lower()
        budget = re.search(r"(?:under|below|less than|max|budget)\s*(?:inr|rs|rupees)?\s*([0-9,.]+)\s*(lakh|lac|k)?", lower)
        if budget:
            value = float(budget.group(1).replace(",", ""))
            unit = budget.group(2)
            if unit in {"lakh", "lac"}:
                value *= 100000
            elif unit == "k":
                value *= 1000
            memory["budget"] = int(value)
        return memory

    def get(self, session_id: str) -> dict[str, Any]:
        return self._sessions.setdefault(session_id, {})


class SupervisorAgent:
    def __init__(self) -> None:
        self.recommendations = RecommendationService()
        self.comparisons = ComparisonService()
        self.careers = CareerService()
        self.rag = RagService()
        self.memory = MemoryStore()

    def handle(self, message: str, session_id: str = "default") -> ChatResponse:
        memory = self.memory.update_from_message(session_id, message)
        route = self._route(message)

        if route == "comparison":
            cat_comp = self._parse_category_comparison(message)
            if cat_comp:
                limit, stream, state = cat_comp
                colleges = self.recommendations.recommend(state=state, stream=stream, limit=limit)
                answer = self.rag.answer(message, colleges)
                return ChatResponse(route=route, answer=answer, results=colleges, memory=memory)

            names = self._extract_comparison_names(message)
            if not names:
                return ChatResponse(route=route, answer="Please provide colleges to compare.", results=[], memory=memory)

            colleges, _, clarifications = self.comparisons.compare(names)
            if clarifications:
                answer = "\n".join(clarifications) + "\nPlease clarify which colleges you meant."
                return ChatResponse(route=route, answer=answer, results=[], memory=memory)

            answer = self.rag.answer(message, colleges)
            return ChatResponse(route=route, answer=answer, results=colleges, memory=memory)

        if route == "career":
            guidance = self.careers.guide(message)
            return ChatResponse(
                route=route,
                answer=f"Recommended streams: {', '.join(guidance.recommended_streams)}. {guidance.guidance}",
                results=[],
                memory=memory,
            )

        if route == "recommendation":
            priority = self._priority(message)
            max_fee = memory.get("budget")
            stream = self._extract_stream(message)
            state = self._extract_state(message)
            colleges = self.recommendations.recommend(
                state=state,
                stream=stream,
                max_fee=max_fee,
                priority=priority,
                limit=6,
            )
            answer = self.rag.answer(message, colleges)
            return ChatResponse(route=route, answer=answer, results=colleges, memory=memory)

        colleges = self.rag.retrieve(message, limit=6)
        answer = self.rag.answer(message, colleges)
        return ChatResponse(route="search", answer=answer, results=colleges, memory=memory)

    @staticmethod
    def _route(message: str) -> str:
        text = message.lower()
        if any(word in text for word in ["compare", "vs", "versus"]):
            return "comparison"
        if any(word in text for word in ["career", "interest", "enjoy", "stream should", "suggest streams"]):
            return "career"
        if any(word in text for word in ["recommend", "best", "under", "placement", "infrastructure", "faculty"]):
            return "recommendation"
        return "search"

    @staticmethod
    def _priority(message: str) -> str:
        text = message.lower()
        for priority in ["placement", "infrastructure", "faculty", "budget"]:
            if priority in text or (priority == "budget" and any(word in text for word in ["under", "below", "cheap"])):
                return priority
        return "balanced"

    @staticmethod
    def _extract_comparison_names(message: str) -> list[str]:
        cleaned = re.sub(r"compare|colleges?|please|between", "", message, flags=re.I)
        parts = re.split(r"\s+vs\s+|\s+versus\s+|\s+and\s+|\n|;", cleaned, flags=re.I)
        return [part.strip(" ,").strip() for part in parts if len(part.strip(" ,").strip()) > 2][:4]

    @staticmethod
    def _parse_category_comparison(message: str) -> tuple[int, str, str] | None:
        text = message.lower()
        if "compare" not in text:
            return None
        
        limit_match = re.search(r"compare\s+(\d+)", text)
        if not limit_match:
            return None
        limit = int(limit_match.group(1))
        
        stream = SupervisorAgent._extract_stream(message)
        state = SupervisorAgent._extract_state(message)
        
        if stream and state:
            return limit, stream, state
        return None

    @staticmethod
    def _extract_stream(message: str) -> str | None:
        streams = ["engineering", "management", "medical", "science", "commerce", "arts", "law", "design", "pharmacy"]
        text = message.lower()
        return next((stream for stream in streams if stream in text), None)

    @staticmethod
    def _extract_state(message: str) -> str | None:
        states = [
            "tamil nadu",
            "karnataka",
            "maharashtra",
            "delhi",
            "kerala",
            "telangana",
            "uttar pradesh",
            "gujarat",
            "rajasthan",
            "west bengal",
            "madhya pradesh",
            "punjab",
            "haryana",
        ]
        text = message.lower()
        return next((state for state in states if state in text), None)
