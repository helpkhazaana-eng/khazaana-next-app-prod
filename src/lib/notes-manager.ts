import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const NOTES_FILE = path.join(DATA_DIR, 'admin-notes.json');

export type NoteType = 'bug' | 'feature' | 'general';

export interface Note {
  id: string;
  heading: string;
  type: NoteType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(NOTES_FILE, 'utf-8');
    const notes: Note[] = JSON.parse(data);
    // Sort by createdAt descending (newest first)
    return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    return [];
  }
}

export async function getNotesPaginated(page: number = 1, limit: number = 10): Promise<{ notes: Note[]; total: number; totalPages: number }> {
  const allNotes = await getAllNotes();
  const total = allNotes.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const notes = allNotes.slice(start, start + limit);
  
  return { notes, total, totalPages };
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  const notes = await getAllNotes();
  return notes.find(n => n.id === id);
}

export async function createNote(data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
  const notes = await getAllNotes();
  
  const newNote: Note = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    heading: data.heading,
    type: data.type,
    description: data.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  notes.unshift(newNote); // Add to beginning
  
  await ensureDataDir();
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
  
  return newNote;
}

export async function updateNote(id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | null> {
  const notes = await getAllNotes();
  const index = notes.findIndex(n => n.id === id);
  
  if (index === -1) return null;
  
  notes[index] = {
    ...notes[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  await ensureDataDir();
  await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
  
  return notes[index];
}

export async function deleteNote(id: string): Promise<boolean> {
  const notes = await getAllNotes();
  const filtered = notes.filter(n => n.id !== id);
  
  if (filtered.length === notes.length) return false;
  
  await ensureDataDir();
  await fs.writeFile(NOTES_FILE, JSON.stringify(filtered, null, 2));
  
  return true;
}
