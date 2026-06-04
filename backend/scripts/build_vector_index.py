from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(ROOT))

from app.core.config import get_settings
from app.services.data_service import get_colleges


def main() -> None:
    import chromadb
    from sentence_transformers import SentenceTransformer

    settings = get_settings()
    settings.resolved_chroma_dir.mkdir(parents=True, exist_ok=True)

    colleges = list(get_colleges())
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    embeddings = embedder.encode([college.profile for college in colleges], show_progress_bar=True).tolist()

    client = chromadb.PersistentClient(path=str(settings.resolved_chroma_dir))
    collection = client.get_or_create_collection("college_profiles")
    existing = collection.count()
    if existing:
        collection.delete(ids=[str(college.id) for college in colleges])

    collection.add(
        ids=[str(college.id) for college in colleges],
        documents=[college.profile for college in colleges],
        metadatas=[
            {"college_id": college.id, "name": college.college_name, "state": college.state, "stream": college.stream}
            for college in colleges
        ],
        embeddings=embeddings,
    )
    print(f"Indexed {len(colleges)} college profiles into {settings.resolved_chroma_dir}")


if __name__ == "__main__":
    main()
