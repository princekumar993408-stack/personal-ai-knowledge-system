/**
 * API Service for CortexPKM
 */

const API_BASE = '/api/knowledge';

export async function fetchNotes(tag = null, query = null) {
  let url = `${API_BASE}/notes`;
  const params = new URLSearchParams();
  if (tag) params.append('tag', tag);
  if (query) params.append('q', query);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch notes: ${res.statusText}`);
  return res.json();
}

export async function fetchNoteById(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch note ${id}: ${res.statusText}`);
  return res.json();
}

export async function createNote(noteData) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to create note');
  }
  return res.json();
}

export async function updateNote(id, noteData) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noteData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Failed to update note');
  }
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete note: ${res.statusText}`);
  return res.json();
}

export async function askSemanticQuery(query, topK = 4) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });
  if (!res.ok) throw new Error(`Failed to query knowledge base: ${res.statusText}`);
  return res.json();
}

export async function fetchKnowledgeGraph() {
  const res = await fetch(`${API_BASE}/graph`);
  if (!res.ok) throw new Error(`Failed to fetch graph data: ${res.statusText}`);
  return res.json();
}

export async function fetchSystemStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error(`Failed to fetch system stats: ${res.statusText}`);
  return res.json();
}
