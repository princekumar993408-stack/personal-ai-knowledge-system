import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, Trash2, Tag, Link2, Sparkles, BookOpen } from 'lucide-react';

export default function NoteEditor({ note, onSave, onCancel, onDelete }) {
  const isNew = !note || !note.id;

  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tagsInput, setTagsInput] = useState(note?.tags ? note.tags.join(', ') : '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setTagsInput(note.tags ? note.tags.join(', ') : '');
    }
  }, [note]);

  // Extract wikilinks from content
  const detectedWikilinks = useMemo(() => {
    const matches = content.match(/\[\[(.*?)\]\]/g) || [];
    return Array.from(new Set(matches.map((m) => m.replace(/\[\[|\]\]/g, '').trim()))).filter(Boolean);
  }, [content]);

  const wordCount = useMemo(() => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  }, [content]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setError(null);
    setIsSaving(true);

    try {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        id: note?.id,
        title: title.trim(),
        content: content.trim(),
        tags: parsedTags,
      });
    } catch (err) {
      setError(err.message || 'Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </button>

        <div className="flex items-center space-x-3">
          {!isNew && (
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
                  onDelete(note.id);
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : isNew ? 'Create Note' : 'Update Note'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Editor Form */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">Note Title</label>
          <input
            type="text"
            placeholder="e.g. Tropical Cyclone Intensity & Dvorak Physics"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-base font-semibold text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-purple-400" />
            <span>Tags (comma-separated)</span>
          </label>
          <input
            type="text"
            placeholder="AI, PyTorch, RAG, Meteorology, Edge IoT"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Markdown Content Area */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>Markdown Content &amp; [[Wikilinks]]</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">{wordCount} words</span>
          </div>
          <textarea
            rows={14}
            placeholder="# Note Title&#10;&#10;Write detailed technical insights, mathematical equations, or system notes here...&#10;&#10;Use [[Another Note Title]] to create bidirectional links across your knowledge graph."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 leading-relaxed resize-y"
          />
        </div>

        {/* Wikilink & Backlink Metadata Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Outgoing Wikilinks */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-2">
              <Link2 className="w-3.5 h-3.5" />
              <span>Outgoing Wikilinks ({detectedWikilinks.length})</span>
            </div>
            {detectedWikilinks.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                Type [[Note Name]] in your content to link other concepts.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {detectedWikilinks.map((link, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 font-mono"
                  >
                    [[{link}]]
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Backlinks */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Incoming Backlinks ({note?.backlinks?.length || 0})</span>
            </div>
            {!note?.backlinks || note.backlinks.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">
                No other notes currently cite this document.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {note.backlinks.map((link, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-mono"
                  >
                    {link}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
