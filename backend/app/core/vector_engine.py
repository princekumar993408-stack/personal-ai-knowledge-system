"""
Vector Engine & Semantic Search for CortexPKM
Pure NumPy TF-IDF Embedding and Citation Retrieval.
Author: Prince Kumar (B.Tech CSE IoT, Jain University)
"""

import re
import math
from typing import List, Dict, Any, Tuple
from collections import Counter
import numpy as np

STOP_WORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
    "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
    "can", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "had", "has",
    "have", "having", "he", "her", "here", "him", "his", "how", "i", "if", "in", "into", "is", "it",
    "its", "me", "more", "most", "my", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
    "other", "our", "out", "over", "own", "same", "she", "so", "some", "such", "than", "that", "the",
    "their", "them", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under",
    "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
    "why", "will", "with", "you", "your"
}

def tokenize(text: str) -> List[str]:
    words = re.findall(r"\b[a-zA-Z0-9_\+\#\.-]{2,}\b", text.lower())
    return [w for w in words if w not in STOP_WORDS]

class VectorEngine:
    def __init__(self):
        pass

    def search(self, query: str, notes: List[Dict[str, Any]], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Calculates cosine similarity between query and notes corpus using TF-IDF.
        """
        if not query.strip() or not notes:
            return []

        q_tokens = tokenize(query)
        if not q_tokens:
            return []

        # Tokenize all notes
        corpus_tokens = [tokenize(n["title"] + " " + n["content"] + " " + n["tags"]) for n in notes]
        
        # Build vocabulary
        vocab = set(q_tokens)
        for doc in corpus_tokens:
            vocab.update(doc)
        
        vocab_list = sorted(list(vocab))
        word2idx = {w: i for i, w in enumerate(vocab_list)}
        num_features = len(vocab_list)
        N = len(notes) + 1

        # Calculate document frequency
        df = Counter()
        for doc in corpus_tokens:
            for w in set(doc):
                df[w] += 1
        for w in set(q_tokens):
            df[w] += 1

        # Smooth IDF
        idf = np.zeros(num_features, dtype=np.float32)
        for w, idx in word2idx.items():
            idf[idx] = math.log((1 + N) / (1 + df[w])) + 1.0

        # Query vector
        q_counts = Counter(q_tokens)
        q_tf = np.zeros(num_features, dtype=np.float32)
        for w, c in q_counts.items():
            q_tf[word2idx[w]] = c / len(q_tokens)
        q_vec = q_tf * idf
        q_norm = np.linalg.norm(q_vec)

        if q_norm == 0.0:
            return []

        results = []
        for i, note in enumerate(notes):
            doc = corpus_tokens[i]
            if not doc:
                continue

            doc_counts = Counter(doc)
            doc_tf = np.zeros(num_features, dtype=np.float32)
            for w, c in doc_counts.items():
                doc_tf[word2idx[w]] = c / len(doc)

            doc_vec = doc_tf * idf
            doc_norm = np.linalg.norm(doc_vec)

            if doc_norm > 0.0:
                sim = float(np.dot(q_vec, doc_vec) / (q_norm * doc_norm))
            else:
                sim = 0.0

            # Extract best matching snippet
            snippet = self._extract_snippet(query, note["content"])

            results.append({
                "note_id": note["id"],
                "title": note["title"],
                "score": round(sim, 3),
                "snippet": snippet
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def _extract_snippet(self, query: str, content: str) -> str:
        q_words = set(tokenize(query))
        sentences = re.split(r"(?<=[.!?\n])\s+", content)
        best_sentence = ""
        best_overlap = -1

        for s in sentences:
            s_clean = s.strip()
            if len(s_clean) < 15:
                continue
            s_words = set(tokenize(s_clean))
            overlap = len(q_words.intersection(s_words))
            if overlap > best_overlap:
                best_overlap = overlap
                best_sentence = s_clean

        if not best_sentence and sentences:
            best_sentence = sentences[0].strip()

        return best_sentence[:220] + ("..." if len(best_sentence) > 220 else "")

    def answer_query(self, query: str, notes: List[Dict[str, Any]], top_k: int = 3) -> Dict[str, Any]:
        """Synthesizes a response with citations."""
        sources = self.search(query, notes, top_k=top_k)

        if not sources or sources[0]["score"] < 0.05:
            return {
                "query": query,
                "answer": "No directly matching concepts found in your personal knowledge base. Try querying terms related to RAG, Cyclone tracking, Microbial Fuel Cells, ATS optimization, or PyTorch.",
                "sources": [],
                "confidence": 0.1
            }

        top_source = sources[0]
        # Construct summary synthesis
        answer_parts = []
        for s in sources:
            if s["score"] > 0.08:
                answer_parts.append(f"According to [[{s['title']}]]: {s['snippet']}")

        combined_answer = "\n\n".join(answer_parts)
        conf = min(0.98, top_source["score"] * 2.2)

        return {
            "query": query,
            "answer": combined_answer,
            "sources": sources,
            "confidence": round(conf, 2)
        }

vector_engine = VectorEngine()
