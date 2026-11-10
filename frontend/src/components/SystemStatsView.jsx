import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Network, Tag, Share2, Layers, Cpu, ShieldCheck } from 'lucide-react';
import { fetchSystemStats } from '../api';

export default function SystemStatsView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Document Notes',
      value: stats?.total_notes || 0,
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-950/30 border-purple-800/40',
      desc: 'Technical markdown entries',
    },
    {
      label: 'Total Corpus Words',
      value: (stats?.total_words || 0).toLocaleString(),
      icon: Layers,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/30 border-cyan-800/40',
      desc: 'Indexed for semantic vector search',
    },
    {
      label: 'Knowledge Graph Nodes',
      value: stats?.total_graph_nodes || 0,
      icon: Network,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/30 border-indigo-800/40',
      desc: 'Notes & extracted external concepts',
    },
    {
      label: 'Graph Directed Edges',
      value: stats?.total_graph_edges || 0,
      icon: Share2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/30 border-emerald-800/40',
      desc: 'Wikilinks & semantic tag bonds',
    },
    {
      label: 'Unique Tags',
      value: stats?.total_tags || 0,
      icon: Tag,
      color: 'text-pink-400',
      bg: 'bg-pink-950/30 border-pink-800/40',
      desc: 'Taxonomic categorization tags',
    },
    {
      label: 'Network Degree',
      value: stats?.avg_connections_per_note || 0,
      icon: BarChart3,
      color: 'text-amber-400',
      bg: 'bg-amber-950/30 border-amber-800/40',
      desc: 'Avg connections per note',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <span>Memory &amp; Graph Analytics</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics for your local-first knowledge base and semantic search engine.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${c.bg} bg-slate-900/60 backdrop-blur-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-400">{c.label}</span>
                <div className={`p-2 rounded-xl bg-slate-950 ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-100 font-mono tracking-tight">
                  {loading ? '...' : c.value}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Engineering Architecture Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span>Under the Hood: Pure NumPy Vector Engine &amp; Offline Privacy</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-slate-200">1. Zero Heavy Binary Bloat</h4>
            <p className="leading-relaxed">
              Vectorization and cosine distance run via pure NumPy matrix dot products. No PyTorch or heavy C++ compilation required for retrieval.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-slate-200">2. Bidirectional Graph</h4>
            <p className="leading-relaxed">
              Regex parser identifies all <code className="text-purple-300">[[wikilinks]]</code> upon note creation/update and maintains foreign key constraints in SQLite.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
            <h4 className="font-semibold text-slate-200">3. Local First &amp; Private</h4>
            <p className="leading-relaxed">
              All notes, indices, and citation logs reside in your local <code className="text-cyan-300">cortex_knowledge.db</code> with zero cloud telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
