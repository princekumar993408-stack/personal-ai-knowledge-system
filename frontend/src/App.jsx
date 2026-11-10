import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import NotesExplorer from './components/NotesExplorer';
import NoteEditor from './components/NoteEditor';
import KnowledgeGraphView from './components/KnowledgeGraphView';
import SemanticAsk from './components/SemanticAsk';
import SystemStatsView from './components/SystemStatsView';
import { fetchNotes, fetchNoteById, createNote, updateNote, deleteNote } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('notes');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNote = async (id) => {
    try {
      const note = await fetchNoteById(id);
      setSelectedNote(note);
      setIsEditing(true);
    } catch (err) {
      console.error('Failed to fetch note details:', err);
    }
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setIsEditing(true);
  };

  const handleSaveNote = async (noteData) => {
    if (noteData.id) {
      // Update
      await updateNote(noteData.id, noteData);
    } else {
      // Create
      await createNote(noteData);
    }
    await loadNotes();
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      await loadNotes();
      if (selectedNote?.id === id) {
        setIsEditing(false);
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={isEditing ? 'editor' : activeTab}
        setActiveTab={(tab) => {
          setIsEditing(false);
          setActiveTab(tab);
        }}
        onNewNote={handleNewNote}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <NoteEditor
            note={selectedNote}
            onSave={handleSaveNote}
            onCancel={() => {
              setIsEditing(false);
              setSelectedNote(null);
            }}
            onDelete={handleDeleteNote}
          />
        ) : (
          <>
            {activeTab === 'notes' && (
              <NotesExplorer
                notes={notes}
                onSelectNote={handleSelectNote}
                onDeleteNote={handleDeleteNote}
                onNewNote={handleNewNote}
              />
            )}
            {activeTab === 'graph' && (
              <KnowledgeGraphView onSelectNote={handleSelectNote} />
            )}
            {activeTab === 'ask' && (
              <SemanticAsk onSelectNote={handleSelectNote} />
            )}
            {activeTab === 'analytics' && <SystemStatsView />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>
          CortexPKM • Local-First Personal AI Knowledge Management Platform • Built by{' '}
          <span className="text-purple-400 font-medium">Prince Kumar</span> (B.Tech CSE IoT, Jain University)
        </p>
      </footer>
    </div>
  );
}
