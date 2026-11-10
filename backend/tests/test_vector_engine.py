"""
Unit Tests for Vector Engine & Semantic Search
"""

import pytest
from app.core.vector_engine import vector_engine, tokenize

def test_tokenize():
    text = "Retrieval-Augmented Generation (RAG) and Deep Learning in Python 3.13"
    tokens = tokenize(text)
    assert "retrieval-augmented" in tokens or "retrieval" in tokens or "generation" in tokens
    assert "rag" in tokens
    assert "deep" in tokens
    assert "learning" in tokens
    assert "python" in tokens
    # stop words removed
    assert "and" not in tokens
    assert "in" not in tokens

def test_search_relevant_documents():
    notes = [
        {
            "id": 1,
            "title": "RAG Architecture",
            "content": "Retrieval-Augmented Generation connects LLM to external vector memory for factual grounded responses.",
            "tags": "AI, RAG, NLP"
        },
        {
            "id": 2,
            "title": "Microbial Fuel Cell",
            "content": "Bio-electrochemical systems using Shewanella oneidensis bacteria to generate voltage across proton exchange membranes.",
            "tags": "IoT, Biology, Energy"
        },
        {
            "id": 3,
            "title": "Cyclone Forecasting",
            "content": "Satellite thermal infrared intensity estimation using Atkinson-Holliday empirical equations.",
            "tags": "Meteorology, PyTorch, Weather"
        }
    ]

    results = vector_engine.search("vector memory LLM generation", notes, top_k=2)
    assert len(results) > 0
    assert results[0]["title"] == "RAG Architecture"
    assert results[0]["score"] > 0.1

    mfc_results = vector_engine.search("bacteria bio-electrochemical voltage", notes, top_k=2)
    assert len(mfc_results) > 0
    assert mfc_results[0]["title"] == "Microbial Fuel Cell"

def test_answer_query_synthesis():
    notes = [
        {
            "id": 1,
            "title": "PyTorch Optimization",
            "content": "PyTorch tensors leverage CUDA kernels for tensor acceleration and automatic differentiation via autograd.",
            "tags": "AI, PyTorch, Deep Learning"
        }
    ]

    resp = vector_engine.answer_query("CUDA tensor autograd acceleration", notes)
    assert resp["confidence"] > 0.2
    assert "According to [[PyTorch Optimization]]" in resp["answer"]
    assert len(resp["sources"]) == 1

def test_answer_query_out_of_domain():
    notes = [
        {"id": 1, "title": "Database Indexing", "content": "B-Tree indexes speed up range queries in relational database management systems.", "tags": "SQL, Database"}
    ]
    resp = vector_engine.answer_query("astrophysics quantum gravitation black holes", notes)
    assert resp["confidence"] <= 0.1
    assert "No directly matching concepts found" in resp["answer"]
