"""
API Endpoint Integration Tests for CortexPKM
"""

import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "service" in data

def test_list_notes(client):
    response = client.get("/api/knowledge/notes")
    assert response.status_code == 200
    notes = response.json()
    assert isinstance(notes, list)
    assert len(notes) >= 1
    first_note = notes[0]
    assert "id" in first_note
    assert "title" in first_note
    assert "content" in first_note
    assert "tags" in first_note

def test_create_and_delete_note(client):
    payload = {
        "title": "Quantum Error Correction Notes",
        "content": "Surface codes and topological qubits minimize decoherence. See [[Quantum Algorithms]].",
        "tags": ["Physics", "Quantum", "Computation"]
    }
    create_resp = client.post("/api/knowledge/notes", json=payload)
    assert create_resp.status_code == 200
    created = create_resp.json()
    note_id = created["id"]
    assert created["title"] == payload["title"]
    assert "Quantum" in created["tags"]

    # Read back
    get_resp = client.get(f"/api/knowledge/notes/{note_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == payload["title"]

    # Delete
    del_resp = client.delete(f"/api/knowledge/notes/{note_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "ok"

    # Confirm 404
    get_after_del = client.get(f"/api/knowledge/notes/{note_id}")
    assert get_after_del.status_code == 404

def test_semantic_query_endpoint(client):
    payload = {
        "query": "What is the Atkinson-Holliday equation for cyclone winds?",
        "top_k": 3
    }
    response = client.post("/api/knowledge/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) > 0

def test_knowledge_graph_endpoint(client):
    response = client.get("/api/knowledge/graph")
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) > 0

def test_system_stats_endpoint(client):
    response = client.get("/api/knowledge/stats")
    assert response.status_code == 200
    stats = response.json()
    assert stats["total_notes"] > 0
    assert stats["total_words"] > 0
    assert stats["total_tags"] > 0
