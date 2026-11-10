"""
Pydantic Data Models for Personal Knowledge System
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class NoteBase(BaseModel):
    title: str
    content: str
    tags: List[str] = []

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class Note(NoteBase):
    id: int
    created_at: str
    updated_at: str
    word_count: int
    backlinks: List[str] = []

class QueryRequest(BaseModel):
    query: str
    top_k: int = 4

class CitationSource(BaseModel):
    note_id: int
    title: str
    score: float
    snippet: str

class QueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[CitationSource]
    confidence: float

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # note, concept, tech, hardware
    tags: List[str] = []
    connections: int = 0

class GraphEdge(BaseModel):
    source: str
    target: str
    label: str = "references"

class KnowledgeGraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class SystemStats(BaseModel):
    total_notes: int
    total_words: int
    total_tags: int
    total_graph_nodes: int
    total_graph_edges: int
    avg_connections_per_note: float
