<div align="center">

# 🧠 CortexPKM: Personal AI Knowledge Management Platform
### Local-First Semantic Memory Hub • NumPy TF-IDF Vector Search • Dynamic Knowledge Graph • Conversational Q&A with Citations

[![CI Pipeline](https://img.shields.io/badge/CI-Passing-10b981?style=for-the-badge&logo=github-actions&logoColor=white)](#)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](#)

<p align="center">
  <b>Architected by Prince Kumar</b><br>
  B.Tech Computer Science & Engineering (Internet of Things) • Jain University<br>
  <i>princekumar993408-stack</i>
</p>

</div>

---

## 📌 Executive Summary

**CortexPKM** is a high-performance, local-first Personal AI Knowledge Management and Semantic Memory Platform. Engineered to solve the fragmentation of engineering notes, research literature, and technical architectures, CortexPKM combines:

1. **Lightweight Pure NumPy Vector Engine**: Custom TF-IDF vectorization, document frequency weighting, and cosine similarity distance computation without heavy binary dependencies.
2. **Dynamic 2D Knowledge Graph Topology**: Auto-extracts bidirectional `[[wikilinks]]`, cross-document concept mentions, and shared tag clusters into an interactive force-directed graph.
3. **Conversational Synthesis with Strict Citations**: Synthesizes grounded answers to technical inquiries, directly citing source notes (`[[Note Title]]`) with similarity confidence scores and contextual snippets.
4. **Local-First SQLite Persistence**: Complete privacy and portability, operating 100% offline without telemetry or third-party cloud leakage.

---

## 🏛️ System Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │               React 18 / Vite 6              │
                    │        (Modern Dark Glassmorphism UI)        │
                    └───────┬───────────────────────────────▲──────┘
                            │                               │
                      REST Requests                    JSON Responses
                            │                               │
                    ┌───────▼───────────────────────────────┴──────┐
                    │              FastAPI Server                  │
                    │  (/api/knowledge/notes, /query, /graph)      │
                    └───────┬───────────────────────────────▲──────┘
                            │                               │
            ┌───────────────┴──────────────┐                │
            ▼                              ▼                │
 ┌──────────────────────┐      ┌──────────────────────┐     │
 │  NumPy Vector Engine │      │ Knowledge Graph      │     │
 │  - Tokenizer         │      │  Topology Extractor  │     │
 │  - TF-IDF Matrix     │      │  - Note Nodes        │─────┘
 │  - Cosine Distance   │      │  - Concept Nodes     │
 │  - Citation Matcher  │      │  - Wikilink Edges    │
 └──────────┬───────────┘      └──────────┬───────────┘
            │                             │
            ▼                             ▼
 ┌─────────────────────────────────────────────────────────┐
 │               Local SQLite Data Store                   │
 │   - notes (id, title, content, tags, word_count, time)  │
 │   - links (id, source_note_id, target_title)            │
 └─────────────────────────────────────────────────────────┘
```

---

## ✨ Key Capabilities

- **Bidirectional Wikilinks (`[[Concept]]`)**: Automatically links related notes when referenced inside brackets, updating backlink indices in real-time.
- **Topological Knowledge Graph**: Visualizes notes as nodes, wikilinks as directed reference vectors, and shared tags as semantic clustering bonds.
- **Natural Language Semantic Search**: Matches concepts based on semantic relevance, TF-IDF term weights, and lexical frequency rather than brittle substring matching.
- **Contextual Answer Synthesis**: Generates cited responses quoting exact sentences from matching knowledge documents.
- **Markdown Editor with Live Stats**: Real-time word count calculation, tag management, and instant backlink inspection.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.11, 3.12, 3.13)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/princekumar993408-stack/personal-ai-knowledge-system.git
cd personal-ai-knowledge-system

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Run pytest verification suite (12/12 passing)
pytest -v

# Start FastAPI backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
# In a separate terminal
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to interact with CortexPKM.

---

## 🧪 Automated Testing

The backend suite covers vector tokenization, cosine ranking, graph generation, tag clustering, and end-to-end API lifecycle:

```bash
cd backend
pytest -v
```

```
tests/test_endpoints.py::test_health_check PASSED                        [  8%]
tests/test_endpoints.py::test_list_notes PASSED                          [ 16%]
tests/test_endpoints.py::test_create_and_delete_note PASSED              [ 25%]
tests/test_endpoints.py::test_semantic_query_endpoint PASSED             [ 33%]
tests/test_endpoints.py::test_knowledge_graph_endpoint PASSED            [ 41%]
tests/test_endpoints.py::test_system_stats_endpoint PASSED               [ 50%]
tests/test_graph_engine.py::test_build_knowledge_graph_empty PASSED      [ 58%]
tests/test_graph_engine.py::test_build_knowledge_graph_with_wikilinks_and_tags PASSED [ 66%]
tests/test_vector_engine.py::test_tokenize PASSED                        [ 75%]
tests/test_vector_engine.py::test_search_relevant_documents PASSED       [ 83%]
tests/test_vector_engine.py::test_answer_query_synthesis PASSED          [ 91%]
tests/test_vector_engine.py::test_answer_query_out_of_domain PASSED      [100%]
======================= 12 passed in 0.15s ========================
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status & SQLite connection verification |
| `GET` | `/api/knowledge/notes` | List all notes with optional tag or query filter |
| `GET` | `/api/knowledge/notes/{id}` | Retrieve specific note with active backlinks |
| `POST` | `/api/knowledge/notes` | Create note and parse `[[wikilinks]]` |
| `PUT` | `/api/knowledge/notes/{id}` | Update note title, content, or tags |
| `DELETE` | `/api/knowledge/notes/{id}` | Delete note and cascade remove outgoing links |
| `POST` | `/api/knowledge/query` | Semantic vector query with cited answer synthesis |
| `GET` | `/api/knowledge/graph` | Generate nodes and edge topology for 2D visualization |
| `GET` | `/api/knowledge/stats` | Aggregated corpus metrics (total notes, words, graph degree) |

---

## 👨‍💻 Author

**Prince Kumar**
- **GitHub**: [@princekumar993408-stack](https://github.com/princekumar993408-stack)
- **Degree**: B.Tech in Computer Science and Engineering (IoT)
- **Institution**: Jain University, India
- **Focus Areas**: AI Systems, RAG Architectures, IoT Edge Systems, Full-Stack Engineering
