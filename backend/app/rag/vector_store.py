import logging
import re

from app.core.config import get_settings
from app.models.schemas import College
from app.services.data_service import get_colleges

logger = logging.getLogger(__name__)


def _tokens(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", text.lower()) if len(token) > 2}


class VectorStore:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._collection = None
        self._embedder = None
        self._ready = False
        self._bootstrap()

    def _bootstrap(self) -> None:
        if not self.settings.enable_vector_store:
            logger.info("Vector store disabled; lexical retrieval fallback active")
            return

        try:
            import chromadb
            from sentence_transformers import SentenceTransformer

            self.settings.resolved_chroma_dir.mkdir(parents=True, exist_ok=True)
            client = chromadb.PersistentClient(path=str(self.settings.resolved_chroma_dir))
            self._collection = client.get_or_create_collection("college_profiles")
            self._embedder = SentenceTransformer("all-MiniLM-L6-v2")
            if self._collection.count() == 0:
                colleges = list(get_colleges())
                embeddings = self._embedder.encode([college.profile for college in colleges]).tolist()
                self._collection.add(
                    ids=[str(college.id) for college in colleges],
                    documents=[college.profile for college in colleges],
                    metadatas=[
                        {"college_id": college.id, "name": college.college_name, "state": college.state, "stream": college.stream}
                        for college in colleges
                    ],
                    embeddings=embeddings,
                )
            self._ready = True
            logger.info("Chroma vector store ready")
        except Exception as exc:
            logger.warning("Vector store fallback enabled: %s", exc)
            self._ready = False

    def search(self, query: str, limit: int = 6) -> list[College]:
        colleges_by_id = {college.id: college for college in get_colleges()}
        if self._ready and self._collection and self._embedder:
            query_embedding = self._embedder.encode([query]).tolist()[0]
            response = self._collection.query(query_embeddings=[query_embedding], n_results=limit)
            ids = response.get("ids", [[]])[0]
            return [colleges_by_id[int(college_id)] for college_id in ids if int(college_id) in colleges_by_id]

        query_tokens = _tokens(query)
        scored = []
        for college in colleges_by_id.values():
            overlap = len(query_tokens & _tokens(college.profile))
            quality = college.rating + college.placement + college.infrastructure + college.faculty
            scored.append((overlap * 10 + quality, college))
        scored.sort(key=lambda item: item[0], reverse=True)
        return [college for _, college in scored[:limit]]
