import React, { useState, useMemo } from 'react';
import { Search, Tag, FileText, Link2, Calendar, Trash2, ArrowUpRight } from 'lucide-react';

export default function NotesExplorer({ notes, onSelectNote, onDeleteNote, onNewNote }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => {
      n.tags.forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchSearch =
        !searchQuery ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = !selectedTag || n.tags.includes(selectedTag);
      return matchSearch && matchTag;
    });
  }, [notes, searchQuery, selectedTag]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search titles, concepts, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              Clear
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span>Showing <strong className="text-purple-400">{filteredNotes.length}</strong> of {notes.length} notes</span>
        </div>
      </div>

      {/* Tag Filter Pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
            <Tag className="w-3 h-3" /> Filter by:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`text-xs px-2.5 py-1 rounded-full shrink-0 transition-colors ${
              selectedTag === null
                ? 'bg-purple-600 text-white font-medium'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag(selectedTag === t ? null : t)}
              className={`text-xs px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                selectedTag === t
                  ? 'bg-purple-600 text-white font-medium'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No notes found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search query or create a new technical note.
          </p>
          <button
            onClick={onNewNote}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500"
          >
            + Create New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            // Strip markdown heading for preview
            const preview = note.content
              .replace(/#+\s+/g, '')
              .replace(/\[\[(.*?)\]\]/g, '$1')
              .substring(0, 160)
              .trim();

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="group relative bg-slate-900/60 hover:bg-slate-900 border border-slate-800/90 hover:border-purple-500/50 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-purple-950/20 cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2">
                      {note.title}
                    </h3>
                    <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">
                    {preview}...
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/60">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {note.tags.slice(0, 3).map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/50 text-purple-300 border border-purple-800/40"
                      >
                        #{t}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center space-x-3">
                      <span>{note.word_count} words</span>
                      {note.backlinks && note.backlinks.length > 0 && (
                        <span className="flex items-center space-x-1 text-cyan-400/90">
                          <Link2 className="w-3 h-3" />
                          <span>{note.backlinks.length} backlinks</span>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete note "${note.title}"?`)) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1 rounded text-slate-600 hover:text-red-400 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
