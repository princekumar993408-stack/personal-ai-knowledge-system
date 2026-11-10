import React, { useState } from 'react';
import { Sparkles, Search, BookOpen, ExternalLink, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { askSemanticQuery } from '../api';

export default function SemanticAsk({ onSelectNote }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const sampleQueries = [
    'What is the Atkinson-Holliday equation for cyclone wind speed?',
    'Explain the 4 core subsystems of RAG Architecture',
    'How does Shewanella oneidensis generate voltage in Microbial Fuel Cells?',
    'What is the Google XYZ bullet formula for ATS resume optimization?',
    'How does PyTorch autograd compute backpropagation derivatives?',
  ];

  const handleSearch = async (queryString = null) => {
    const q = queryString || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await askSemanticQuery(q);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to search knowledge base');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Local Vector Embedding &amp; TF-IDF Semantic Retrieval</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Ask Your Engineering Knowledge Base
        </h2>
        <p className="text-xs text-slate-400 max-w-lg mx-auto">
          Query your personal notes using pure NumPy cosine similarity vector search with automatic citation extraction.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ask anything across your engineering notes (e.g. RAG, Cyclone Dvorak physics, MFC telemetry)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-5 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 flex items-center space-x-1.5 shrink-0"
          >
            <span>{loading ? 'Synthesizing...' : 'Query'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="mt-3 flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-500 font-medium">Try asking:</span>
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleSearch(sq);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-purple-300 border border-slate-800/80 transition-colors"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Answer Synthesis Card */}
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
                  Synthesized Answer
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400">Semantic Confidence:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    result.confidence > 0.6
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : result.confidence > 0.3
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Answer Text */}
            <div className="text-sm text-slate-200 leading-relaxed space-y-3 font-normal whitespace-pre-line">
              {result.answer}
            </div>
          </div>

          {/* Citations & Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Retrieved Source Citations ({result.sources.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.sources.map((src, idx) => (
                  <div
                    key={idx}
                    onClick={() => src.note_id && onSelectNote(src.note_id)}
                    className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/40 transition-all cursor-pointer group flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                          {src.title}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-800/40">
                          sim: {src.score}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed italic">
                        "{src.snippet}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Click to open note</span>
                      <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
