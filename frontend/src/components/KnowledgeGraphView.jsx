import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Network, ZoomIn, ZoomOut, RefreshCw, Info, Layers, Tag } from 'lucide-react';
import { fetchKnowledgeGraph } from '../api';

export default function KnowledgeGraphView({ onSelectNote }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState('all'); // 'all', 'note', 'concept'
  const svgRef = useRef(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await fetchKnowledgeGraph();
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute 2D node coordinates using circular + degree offset layout
  const layoutNodes = useMemo(() => {
    const nodes = graphData.nodes;
    if (!nodes.length) return [];

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const total = nodes.length;

    return nodes.map((node, i) => {
      // Notes closer to center, external concepts on outer ring
      const isConcept = node.type === 'concept';
      const radius = isConcept ? 220 : 130 + (i % 3) * 25;
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;

      // Small jitter based on connection degree
      const jitterX = Math.cos(angle) * (node.connections * 4);
      const jitterY = Math.sin(angle) * (node.connections * 4);

      const x = centerX + Math.cos(angle) * radius + jitterX;
      const y = centerY + Math.sin(angle) * radius + jitterY;

      return {
        ...node,
        x: Math.max(50, Math.min(width - 50, x)),
        y: Math.max(50, Math.min(height - 50, y)),
        radius: isConcept ? 12 : Math.min(26, 16 + (node.connections || 0) * 1.5),
      };
    });
  }, [graphData.nodes]);

  const nodeMap = useMemo(() => {
    const map = new Map();
    layoutNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [layoutNodes]);

  // Filtered nodes & edges
  const filteredNodes = useMemo(() => {
    if (filterType === 'all') return layoutNodes;
    return layoutNodes.filter((n) => n.type === filterType);
  }, [layoutNodes, filterType]);

  const activeNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(
      (e) => activeNodeIds.has(e.source) && activeNodeIds.has(e.target)
    );
  }, [graphData.edges, activeNodeIds]);

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Interactive Knowledge Graph</h3>
            <p className="text-[11px] text-slate-400">
              {filteredNodes.length} Nodes • {filteredEdges.length} Connections (Wikilinks &amp; Tags)
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded ${filterType === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('note')}
              className={`px-2 py-0.5 rounded ${filterType === 'note' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Notes
            </button>
            <button
              onClick={() => setFilterType('concept')}
              className={`px-2 py-0.5 rounded ${filterType === 'concept' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Concepts
            </button>
          </div>

          {/* Zoom buttons */}
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              loadGraph();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative bg-slate-950 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl min-h-[550px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center space-y-2 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span>Computing Knowledge Topology...</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox="0 0 800 550"
            className="w-full h-full max-h-[600px] cursor-grab active:cursor-grabbing select-none"
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
          >
            <defs>
              {/* Radial Gradients */}
              <radialGradient id="noteGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
              </radialGradient>
              <radialGradient id="conceptGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0369a1" />
              </radialGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Accent */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            <g className="edges">
              {filteredEdges.map((edge, idx) => {
                const src = nodeMap.get(edge.source);
                const tgt = nodeMap.get(edge.target);
                if (!src || !tgt) return null;

                const isConnectedToHover =
                  hoveredNode &&
                  (hoveredNode.id === edge.source || hoveredNode.id === edge.target);

                const isTagEdge = edge.label === 'shares_tag';

                return (
                  <line
                    key={idx}
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isConnectedToHover
                        ? '#38bdf8'
                        : isTagEdge
                        ? '#334155'
                        : '#6366f1'
                    }
                    strokeWidth={isConnectedToHover ? 2.5 : isTagEdge ? 1 : 1.5}
                    strokeOpacity={isConnectedToHover ? 0.9 : isTagEdge ? 0.35 : 0.6}
                    strokeDasharray={isTagEdge ? '4 4' : 'none'}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {filteredNodes.map((node) => {
                const isHovered = hoveredNode?.id === node.id;
                const isNote = node.type === 'note';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer transition-transform duration-150"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => {
                      if (isNote) {
                        const noteId = parseInt(node.id.replace('note-', ''), 10);
                        if (noteId) onSelectNote(noteId);
                      }
                    }}
                  >
                    {/* Pulsing ring on hover */}
                    {isHovered && (
                      <circle
                        r={node.radius + 8}
                        fill="none"
                        stroke={isNote ? '#c084fc' : '#38bdf8'}
                        strokeWidth="2"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Node Body */}
                    <circle
                      r={node.radius}
                      fill={isNote ? 'url(#noteGradient)' : 'url(#conceptGradient)'}
                      stroke={isHovered ? '#ffffff' : isNote ? '#a855f7' : '#0ea5e9'}
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      filter={isHovered ? 'url(#glow)' : undefined}
                    />

                    {/* Text Label */}
                    <text
                      y={node.radius + 14}
                      textAnchor="middle"
                      className={`text-[10px] font-medium pointer-events-none transition-all ${
                        isHovered ? 'fill-white font-bold' : isNote ? 'fill-slate-300' : 'fill-slate-400'
                      }`}
                    >
                      {node.label.length > 20 ? node.label.substring(0, 18) + '...' : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        {/* Floating Node Info Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 max-w-sm bg-slate-900/95 border border-purple-500/40 rounded-xl p-4 shadow-xl backdrop-blur-md z-10 space-y-2 pointer-events-none">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  hoveredNode.type === 'note' ? 'bg-purple-400' : 'bg-cyan-400'
                }`}
              />
              <h4 className="text-xs font-bold text-slate-100">{hoveredNode.label}</h4>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                {hoveredNode.type}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Degree: <strong className="text-purple-300">{hoveredNode.connections} connections</strong></span>
              {hoveredNode.type === 'note' && (
                <span className="text-cyan-400 italic">Click to edit note</span>
              )}
            </div>
            {hoveredNode.tags && hoveredNode.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {hoveredNode.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-300 space-y-1.5 pointer-events-none backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
            <span>Document Note</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 inline-block"></span>
            <span>External Concept</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-indigo-500 inline-block"></span>
            <span>Wikilink Reference</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 border-t border-dashed border-slate-500 inline-block"></span>
            <span>Shared Tag Bond</span>
          </div>
        </div>
      </div>
    </div>
  );
}
