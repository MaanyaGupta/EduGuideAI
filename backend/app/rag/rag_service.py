from app.core.config import get_settings
from app.models.schemas import College
from app.rag.vector_store import VectorStore


class RagService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.vector_store = VectorStore()

    def retrieve(self, question: str, limit: int = 6) -> list[College]:
        return self.vector_store.search(question, limit=limit)

    def answer(self, question: str, colleges: list[College]) -> str:
        context = "\n".join(f"- {college.profile}" for college in colleges)
        fallback = self._fallback_answer(question, colleges)
        if not self.settings.groq_api_key:
            return fallback

        try:
            from groq import Groq

            client = Groq(api_key=self.settings.groq_api_key)
            completion = client.chat.completions.create(
                model=self.settings.groq_model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are EduGuide AI, a concise college recommendation and career guidance assistant. "
                            "Use only the provided college context for factual college claims."
                        ),
                    },
                    {
                        "role": "user",
                        "content": f"Question: {question}\n\nCollege context:\n{context}",
                    },
                ],
                temperature=0.25,
                max_tokens=700,
            )
            return completion.choices[0].message.content or fallback
        except Exception:
            return fallback

    @staticmethod
    def _fallback_answer(question: str, colleges: list[College]) -> str:
        if not colleges:
            return "I could not find a strong match in the dataset. Try adding a state, stream, or budget."
        lines = ["Based on the dataset, these are the strongest matches:"]
        for college in colleges[:5]:
            fee = f"INR {college.ug_fee:,}" if college.ug_fee else "fee unavailable"
            lines.append(
                f"{college.college_name} ({college.state}) - rating {college.rating}/10, "
                f"placement {college.placement}/10, UG fee {fee}."
            )
        return "\n".join(lines)
