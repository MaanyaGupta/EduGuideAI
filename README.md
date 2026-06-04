# EduGuide AI

EduGuide AI is a final-year AI/ML capstone project for college discovery, recommendations, comparison, RAG-based question answering, career guidance, and conversational memory.

## Architecture

- Backend: FastAPI, Python, Pandas
- AI: Groq LLM, LangChain/LangGraph-ready supervisor, ChromaDB, Sentence Transformers
- Frontend: React, Vite, TailwindCSS
- Dataset: `data/College_data.csv`

## Run Backend

```bash
cd EduGuideAI/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The backend also reads the root `.env` two folders above the backend, so `GROQ_API_KEY` can stay outside the project folder during local development.

To build the ChromaDB semantic index:

```bash
cd EduGuideAI/backend
python scripts/build_vector_index.py
```

Then set `ENABLE_VECTOR_STORE=true` in the backend environment.

## Run Frontend

```bash
cd EduGuideAI/frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API

- `POST /api/v1/chat`
- `GET /api/v1/recommend`
- `GET /api/v1/compare`
- `GET /api/v1/search`
- `GET /api/v1/top-rated`
- `GET /api/v1/top-placement`
- `POST /api/v1/career`
## Notes

The backend is production-shaped but local-friendly. If ChromaDB or Sentence Transformers are unavailable, semantic search falls back to lexical ranking. If Groq is unavailable, responses fall back to deterministic dataset summaries.
