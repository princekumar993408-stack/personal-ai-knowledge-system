"""
REST API Routers for Personal AI Knowledge Management
"""

import re
import sqlite3
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.db import get_db
from app.models.schemas import (
    Note, NoteCreate, NoteUpdate,
    QueryRequest, QueryResponse,
    KnowledgeGraphData, SystemStats
)
from app.core.vector_engine import vector_engine
from app.core.graph_engine import build_knowledge_graph

router = APIRouter(prefix="", tags=["Knowledge"])

@router.get("/notes", response_model=List[Note])
def list_notes(
    tag: Optional[str] = None,
    q: Optional[str] = None
):
    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT id, title, content, tags, created_at, updated_at, word_count FROM notes WHERE 1=1"
    params = []

    if tag:
        query += " AND tags LIKE ?"
        params.append(f"%{tag}%")
    if q:
        query += " AND (title LIKE ? OR content LIKE ?)"
        params.extend([f"%{q}%", f"%{q}%"])

    query += " ORDER BY id DESC;"
    cursor.execute(query, params)
    rows = cursor.fetchall()

    notes = []
    for r in rows:
        # Find backlinks for note
        cursor.execute("SELECT n.title FROM links l JOIN notes n ON l.source_note_id = n.id WHERE l.target_title = ?;", (r["title"],))
        backlinks = [row[0] for row in cursor.fetchall()]

        tags_list = [t.strip() for t in r["tags"].split(",") if t.strip()]
        notes.append(Note(
            id=r["id"],
            title=r["title"],
            content=r["content"],
            tags=tags_list,
            created_at=r["created_at"],
            updated_at=r["updated_at"],
            word_count=r["word_count"],
            backlinks=backlinks
        ))

    conn.close()
    return notes

@router.get("/notes/{note_id}", response_model=Note)
def get_note(note_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, tags, created_at, updated_at, word_count FROM notes WHERE id = ?;", (note_id,))
    r = cursor.fetchone()
    if not r:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")

    cursor.execute("SELECT n.title FROM links l JOIN notes n ON l.source_note_id = n.id WHERE l.target_title = ?;", (r["title"],))
    backlinks = [row[0] for row in cursor.fetchall()]

    tags_list = [t.strip() for t in r["tags"].split(",") if t.strip()]
    note = Note(
        id=r["id"],
        title=r["title"],
        content=r["content"],
        tags=tags_list,
        created_at=r["created_at"],
        updated_at=r["updated_at"],
        word_count=r["word_count"],
        backlinks=backlinks
    )
    conn.close()
    return note

@router.post("/notes", response_model=Note)
def create_note(payload: NoteCreate):
    conn = get_db()
    cursor = conn.cursor()

    now = datetime.utcnow().isoformat() + "Z"
    tags_str = ", ".join(payload.tags)
    word_count = len(payload.content.split())

    try:
        cursor.execute("""
        INSERT INTO notes (title, content, tags, created_at, updated_at, word_count)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (payload.title, payload.content, tags_str, now, now, word_count))
        note_id = cursor.lastrowid

        # Parse [[wikilinks]]
        links = re.findall(r"\[\[(.*?)\]\]", payload.content)
        for link in links:
            cursor.execute("INSERT INTO links (source_note_id, target_title) VALUES (?, ?);", (note_id, link.strip()))

        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail=f"A note titled '{payload.title}' already exists.")

    conn.close()
    return Note(
        id=note_id,
        title=payload.title,
        content=payload.content,
        tags=payload.tags,
        created_at=now,
        updated_at=now,
        word_count=word_count,
        backlinks=[]
    )

@router.put("/notes/{note_id}", response_model=Note)
def update_note(note_id: int, payload: NoteUpdate):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, tags, created_at FROM notes WHERE id = ?;", (note_id,))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")

    new_title = payload.title if payload.title is not None else existing["title"]
    new_content = payload.content if payload.content is not None else existing["content"]
    new_tags = payload.tags if payload.tags is not None else [t.strip() for t in existing["tags"].split(",") if t.strip()]
    now = datetime.utcnow().isoformat() + "Z"
    word_count = len(new_content.split())

    cursor.execute("""
    UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ?, word_count = ?
    WHERE id = ?;
    """, (new_title, new_content, ", ".join(new_tags), now, word_count, note_id))

    # Update wikilinks
    cursor.execute("DELETE FROM links WHERE source_note_id = ?;", (note_id,))
    links = re.findall(r"\[\[(.*?)\]\]", new_content)
    for link in links:
        cursor.execute("INSERT INTO links (source_note_id, target_title) VALUES (?, ?);", (note_id, link.strip()))

    conn.commit()

    cursor.execute("SELECT n.title FROM links l JOIN notes n ON l.source_note_id = n.id WHERE l.target_title = ?;", (new_title,))
    backlinks = [row[0] for row in cursor.fetchall()]
    conn.close()

    return Note(
        id=note_id,
        title=new_title,
        content=new_content,
        tags=new_tags,
        created_at=existing["created_at"],
        updated_at=now,
        word_count=word_count,
        backlinks=backlinks
    )

@router.delete("/notes/{note_id}")
def delete_note(note_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notes WHERE id = ?;", (note_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Note {note_id} not found")
    cursor.execute("DELETE FROM links WHERE source_note_id = ?;", (note_id,))
    conn.commit()
    conn.close()
    return {"status": "ok", "message": f"Note {note_id} deleted"}

@router.post("/query", response_model=QueryResponse)
def semantic_query(payload: QueryRequest):
    """Answers user query by searching over personal knowledge corpus."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, tags FROM notes;")
    notes = [dict(r) for r in cursor.fetchall()]
    conn.close()

    result = vector_engine.answer_query(payload.query, notes, top_k=payload.top_k)
    return QueryResponse(**result)

@router.get("/graph", response_model=KnowledgeGraphData)
def get_graph():
    """Generates 2D knowledge graph data."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content, tags FROM notes;")
    notes = [dict(r) for r in cursor.fetchall()]

    cursor.execute("SELECT source_note_id, target_title FROM links;")
    links = [dict(r) for r in cursor.fetchall()]
    conn.close()

    graph = build_knowledge_graph(notes, links)
    return KnowledgeGraphData(**graph)

@router.get("/stats", response_model=SystemStats)
def get_stats():
    """Returns memory system statistics."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), SUM(word_count) FROM notes;")
    note_count, total_words = cursor.fetchone()

    cursor.execute("SELECT tags FROM notes;")
    all_tags = set()
    for row in cursor.fetchall():
        for t in row[0].split(","):
            if t.strip():
                all_tags.add(t.strip().lower())

    cursor.execute("SELECT source_note_id, target_title FROM links;")
    links = [dict(r) for r in cursor.fetchall()]
    cursor.execute("SELECT id, title, content, tags FROM notes;")
    notes = [dict(r) for r in cursor.fetchall()]
    conn.close()

    graph = build_knowledge_graph(notes, links)
    node_count = len(graph["nodes"])
    edge_count = len(graph["edges"])
    avg_conn = round(edge_count / max(1, note_count), 1)

    return SystemStats(
        total_notes=note_count or 0,
        total_words=total_words or 0,
        total_tags=len(all_tags),
        total_graph_nodes=node_count,
        total_graph_edges=edge_count,
        avg_connections_per_note=avg_conn
    )
