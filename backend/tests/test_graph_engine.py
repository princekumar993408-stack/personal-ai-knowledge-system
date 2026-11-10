"""
Unit Tests for Knowledge Graph Construction Engine
"""

import pytest
from app.core.graph_engine import build_knowledge_graph

def test_build_knowledge_graph_empty():
    graph = build_knowledge_graph([], [])
    assert graph["nodes"] == []
    assert graph["edges"] == []

def test_build_knowledge_graph_with_wikilinks_and_tags():
    notes = [
        {
            "id": 1,
            "title": "RAG System",
            "content": "RAG connects to [[Neural Search]] and [[Vector DB]].",
            "tags": "AI, Search"
        },
        {
            "id": 2,
            "title": "Neural Search",
            "content": "Deep learning search algorithms.",
            "tags": "AI, Algorithms"
        }
    ]

    links = [
        {"source_note_id": 1, "target_title": "Neural Search"},
        {"source_note_id": 1, "target_title": "Vector DB"}
    ]

    graph = build_knowledge_graph(notes, links)
    nodes = graph["nodes"]
    edges = graph["edges"]

    # Should have Note 1, Note 2, and external concept Vector DB
    node_ids = {n["id"] for n in nodes}
    assert "note-1" in node_ids
    assert "note-2" in node_ids
    assert any("vector-db" in nid for nid in node_ids)

    # Check edges
    has_ref_edge = any(e["source"] == "note-1" and e["target"] == "note-2" and e["label"] == "references" for e in edges)
    assert has_ref_edge

    # Check tag cluster edge (both share 'AI' tag)
    has_tag_edge = any((e["source"] == "note-1" and e["target"] == "note-2" and e["label"] == "shares_tag") or
                       (e["source"] == "note-2" and e["target"] == "note-1" and e["label"] == "shares_tag") for e in edges)
    assert has_tag_edge
