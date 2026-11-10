"""
Knowledge Graph Construction Engine for CortexPKM
Extracts entities, wikilinks, and generates 2D graph topology.
Author: Prince Kumar (B.Tech CSE IoT, Jain University)
"""

import re
from typing import List, Dict, Any, Set
from collections import defaultdict

def build_knowledge_graph(notes: List[Dict[str, Any]], links: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a connected knowledge graph from notes, tags, and wikilinks.
    """
    nodes_map: Dict[str, Dict[str, Any]] = {}
    edges_set: Set[tuple] = set()
    node_degree: Dict[str, int] = defaultdict(int)

    # 1. Add Note Nodes
    for note in notes:
        node_id = f"note-{note['id']}"
        raw_tags = [t.strip() for t in note.get("tags", "").split(",") if t.strip()]
        nodes_map[node_id] = {
            "id": node_id,
            "label": note["title"],
            "type": "note",
            "tags": raw_tags,
            "connections": 0
        }

    # Title to Note ID mapping
    title_to_id = {n["title"].lower().strip(): f"note-{n['id']}" for n in notes}

    # 2. Add Wikilink Edges
    for link in links:
        src_id = f"note-{link['source_note_id']}"
        target_title = link["target_title"].lower().strip()

        if target_title in title_to_id:
            dst_id = title_to_id[target_title]
            if src_id != dst_id:
                edges_set.add((src_id, dst_id, "references"))
                node_degree[src_id] += 1
                node_degree[dst_id] += 1
        else:
            # Concept node (external referenced concept)
            concept_id = f"concept-{re.sub(r'[^a-zA-Z0-9]', '-', target_title)}"
            if concept_id not in nodes_map:
                nodes_map[concept_id] = {
                    "id": concept_id,
                    "label": link["target_title"],
                    "type": "concept",
                    "tags": ["External Concept"],
                    "connections": 0
                }
            edges_set.add((src_id, concept_id, "mentions"))
            node_degree[src_id] += 1
            node_degree[concept_id] += 1

    # 3. Add Tag Clustering Edges
    tag_to_notes = defaultdict(list)
    for note in notes:
        n_id = f"note-{note['id']}"
        raw_tags = [t.strip() for t in note.get("tags", "").split(",") if t.strip()]
        for tag in raw_tags:
            tag_to_notes[tag.lower()].append(n_id)

    for tag, note_ids in tag_to_notes.items():
        if len(note_ids) > 1:
            for i in range(len(note_ids)):
                for j in range(i + 1, len(note_ids)):
                    src = note_ids[i]
                    dst = note_ids[j]
                    if (dst, src, "shares_tag") not in edges_set:
                        edges_set.add((src, dst, "shares_tag"))
                        node_degree[src] += 1
                        node_degree[dst] += 1

    # Update connection counts on nodes
    for nid, degree in node_degree.items():
        if nid in nodes_map:
            nodes_map[nid]["connections"] = degree

    formatted_edges = [
        {"source": src, "target": dst, "label": lbl}
        for src, dst, lbl in edges_set
    ]

    return {
        "nodes": list(nodes_map.values()),
        "edges": formatted_edges
    }
