# 🎓 EduGuide AI


EduGuide AI is an intelligent college discovery and career guidance platform designed to help students make informed academic decisions. The system combines Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), semantic search, and recommendation algorithms to provide personalized college recommendations, comparisons, and career guidance.

---

## 🚀 Key Features

### 🤖 AI-Powered Chat Assistant

Ask natural language questions such as:

* "Suggest engineering colleges under ₹2 lakhs"
* "Which colleges have the best placements?"
* "Compare VIT and SRM"
* "Recommend colleges in Karnataka for Computer Science"

The assistant understands intent, retrieves relevant information, and generates personalized responses using Groq-powered LLMs.

---

### 🎯 Intelligent College Recommendations

Generate recommendations based on:

* State
* Academic Stream
* UG/PG Fees
* Overall Ratings
* Placement Scores
* Faculty Scores
* Infrastructure Quality
* Accommodation Facilities

---

### ⚖️ College Comparison Engine

Compare multiple colleges side-by-side using:

* Ratings
* Fees
* Placement Scores
* Faculty Scores
* Infrastructure Scores
* Accommodation Scores
* Social Life Scores

---

### 🔍 Semantic Search & RAG

EduGuide AI uses ChromaDB and Sentence Transformers to create vector embeddings of college profiles.

Workflow:

User Query → Vector Search → Relevant Colleges → Groq LLM → Final Response

This enables context-aware responses beyond traditional keyword matching.

---

### 🎓 Career Guidance Assistant

Students can receive personalized stream recommendations based on:

* Interests
* Academic Strengths
* Career Goals
* Technology Preferences

Example:

**Input:**

> I enjoy coding, mathematics, and problem-solving.

**Output:**

* Computer Science Engineering
* Artificial Intelligence & Data Science
* Information Technology

---

### 🧠 Conversational Memory

The system maintains user preferences including:

* Preferred State
* Budget Constraints
* Stream Interests

This enables more personalized recommendations across conversations.

---

## 🏗️ System Architecture

```text
Frontend (React + Vite + TailwindCSS)
                │
                ▼
         FastAPI Backend
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
 Recommendation Search   Career
    Engine      Engine   Agent
                │
                ▼
          RAG Pipeline
                │
      ChromaDB Vector Store
                │
                ▼
            Groq LLM
                │
                ▼
      College Dataset (6700+ Colleges)
```

---

## 📊 Dataset

link to the dataset - https://www.kaggle.com/datasets/soumyadipghorai/top-indian-colleges
 
The platform utilizes a dataset containing **6,700+ colleges** across India with attributes such as:

* College Name
* State
* Stream
* UG Fees
* PG Fees
* Rating
* Academic Score
* Faculty Score
* Infrastructure Score
* Placement Score
* Accommodation Score
* Social Life Score

---

## 🛠️ Technology Stack

### Backend

* FastAPI
* Python
* Pandas
* Pydantic

### AI & Machine Learning

* Groq LLM
* LangChain
* LangGraph
* ChromaDB
* Sentence Transformers

### Frontend

* React
* Vite
* TailwindCSS
* TypeScript

### Data Processing

* Pandas
* NumPy

---

## 📁 Project Structure

```text
EduGuideAI/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agents/
│   │   ├── services/
│   │   ├── rag/
│   │   └── models/
│   │
│   ├── data/
│   ├── scripts/
│   ├── storage/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── data/
│   └── College_data.csv
│
└── README.md
```

---

## ⚙️ Backend Setup

```bash
cd EduGuideAI/backend

python -m venv .venv

.venv\Scripts\activate

pip install -r requirements.txt

copy .env.example .env

uvicorn app.main:app --reload
```

Backend URL:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

## 🧠 Build Semantic Search Index

```bash
cd EduGuideAI/backend

python scripts/build_vector_index.py
```

Enable vector search:

```env
ENABLE_VECTOR_STORE=true
```

---

## 💻 Frontend Setup

```bash
cd EduGuideAI/frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 🔗 API Endpoints

| Method | Endpoint              | Description             |
| ------ | --------------------- | ----------------------- |
| POST   | /api/v1/chat          | AI Chat Assistant       |
| GET    | /api/v1/recommend     | College Recommendations |
| GET    | /api/v1/search        | College Search          |
| GET    | /api/v1/compare       | College Comparison      |
| GET    | /api/v1/top-rated     | Top Rated Colleges      |
| GET    | /api/v1/top-placement | Best Placement Colleges |
| POST   | /api/v1/career        | Career Guidance         |

---

## 📈 Future Enhancements

* User Authentication
* Personalized Dashboards
* Scholarship Recommendation System
* Placement Prediction Models
* Admission Probability Estimation
* Multi-Agent Workflow Orchestration
* Cloud Deployment & CI/CD

---

## 🌟 Resume Highlights

* Built an AI-powered college recommendation platform using FastAPI, Groq LLM, ChromaDB, and React.
* Implemented Retrieval-Augmented Generation (RAG) for semantic college search and contextual question answering.
* Developed recommendation and comparison engines leveraging 6,700+ college records.
* Designed conversational AI workflows with memory and personalized career guidance capabilities.
* Engineered scalable APIs and a modern frontend for real-time student decision support.

---


