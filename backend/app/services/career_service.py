from app.models.schemas import CareerResponse


class CareerService:
    STREAM_SIGNALS = {
        "Computer Science": ["coding", "programming", "software", "math", "mathematics", "ai", "data", "logic"],
        "Artificial Intelligence": ["ai", "machine learning", "automation", "robotics", "data", "python"],
        "Data Science": ["statistics", "analytics", "data", "mathematics", "visualization", "prediction"],
        "Electronics": ["circuits", "hardware", "iot", "embedded", "robotics", "physics"],
        "Mechanical": ["machines", "design", "manufacturing", "automobile", "physics"],
        "Business Administration": ["business", "management", "startup", "marketing", "leadership"],
        "Commerce": ["finance", "accounting", "economics", "banking", "investment"],
        "Medicine": ["biology", "healthcare", "doctor", "patient", "medical"],
        "Law": ["justice", "debate", "policy", "constitution", "rights"],
        "Design": ["creative", "drawing", "ui", "fashion", "product", "visual"],
    }

    def guide(self, interests: str) -> CareerResponse:
        text = interests.lower()
        scored = []
        for stream, signals in self.STREAM_SIGNALS.items():
            score = sum(1 for signal in signals if signal in text)
            if score:
                scored.append((score, stream))

        if not scored:
            recommended = ["Computer Science", "Business Administration", "Data Science"]
        else:
            scored.sort(reverse=True)
            recommended = [stream for _, stream in scored[:3]]

        guidance = (
            "Build a portfolio around your top stream: complete two applied projects, "
            "learn the required fundamentals, and shortlist colleges with strong faculty, "
            "placement, and infrastructure scores in that area."
        )
        return CareerResponse(recommended_streams=recommended, guidance=guidance)
