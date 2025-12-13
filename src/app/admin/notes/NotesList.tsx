'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Bug, Lightbulb, FileText, Trash2, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { createNoteAction, deleteNoteAction } from '@/app/actions/notes';
import type { Note, NoteType } from '@/lib/notes-manager';

interface NotesListProps {
  initialNotes: Note[];
  currentPage: number;
  totalPages: number;
  total: number;
}

const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }> = {
  bug: {
    label: 'Bug',
    icon: <Bug className="w-4 h-4" />,
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  feature: {
    label: 'Feature',
    icon: <Lightbulb className="w-4 h-4" />,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  general: {
    label: 'General',
    icon: <FileText className="w-4 h-4" />,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-200',
  },
};

export default function NotesList({ initialNotes, currentPage, totalPages, total }: NotesListProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    heading: '',
    type: 'general' as NoteType,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const result = await createNoteAction(formData);
      if (result.success && result.note) {
        setNotes([result.note, ...notes]);
        setFormData({ heading: '', type: 'general', description: '' });
        setShowForm(false);
        setMessage({ type: 'success', text: 'Note created successfully' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create note' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    setLoading(true);
    try {
      const result = await deleteNoteAction(id);
      if (result.success) {
        setNotes(notes.filter(n => n.id !== id));
        setMessage({ type: 'success', text: 'Note deleted' });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete note' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Note
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Heading</label>
            <input
              type="text"
              value={formData.heading}
              onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium text-slate-900"
              placeholder="Enter note heading..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
            <div className="flex gap-3">
              {(['bug', 'feature', 'general'] as NoteType[]).map((type) => {
                const config = noteTypeConfig[type];
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      formData.type === type
                        ? `${config.bgColor} ${config.textColor} ${config.borderColor} ring-2 ring-offset-1`
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {config.icon}
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none transition-all font-medium text-slate-900 min-h-[120px] resize-none"
              placeholder="Describe the note..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? 'Creating...' : 'Create Note'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No Notes Yet</h3>
          <p className="text-sm text-slate-500 mt-2">Create your first note to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const config = noteTypeConfig[note.type];
            return (
              <div
                key={note.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
                        {config.icon}
                        {config.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {new Date(note.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-2">{note.heading}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{note.description}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={loading}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete note"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Link
            href={`/admin/notes?page=${currentPage - 1}`}
            className={`p-2 rounded-lg border border-slate-200 ${
              currentPage <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </Link>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Link
                key={page}
                href={`/admin/notes?page=${page}`}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-sm transition-all ${
                  page === currentPage
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </Link>
            ))}
          </div>
          
          <Link
            href={`/admin/notes?page=${currentPage + 1}`}
            className={`p-2 rounded-lg border border-slate-200 ${
              currentPage >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-slate-50'
            }`}
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </Link>
        </div>
      )}
    </div>
  );
}
