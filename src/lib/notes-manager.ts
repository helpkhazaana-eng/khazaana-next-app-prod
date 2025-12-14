import { getFirestore } from './firestore';

export type NoteType = 'bug' | 'feature' | 'general';

export interface Note {
  id: string;
  heading: string;
  type: NoteType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllNotes(): Promise<Note[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('notes')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        heading: data.heading,
        type: data.type as NoteType,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    });
  } catch (error) {
    console.error('Error getting notes:', error);
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
  try {
    const db = getFirestore();
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const newNote: Note = {
      id: noteId,
      heading: data.heading,
      type: data.type,
      description: data.description,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection('notes').doc(noteId).set({
      heading: newNote.heading,
      type: newNote.type,
      description: newNote.description,
      createdAt: newNote.createdAt,
      updatedAt: newNote.updatedAt,
    });
    
    return newNote;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}

export async function updateNote(id: string, data: Partial<Omit<Note, 'id' | 'createdAt'>>): Promise<Note | null> {
  try {
    const db = getFirestore();
    const docRef = db.collection('notes').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return null;
    
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.update(updateData);
    
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();
    
    return {
      id: updatedDoc.id,
      heading: updatedData?.heading,
      type: updatedData?.type as NoteType,
      description: updatedData?.description,
      createdAt: updatedData?.createdAt,
      updatedAt: updatedData?.updatedAt,
    };
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    const db = getFirestore();
    const docRef = db.collection('notes').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) return false;
    
    await docRef.delete();
    return true;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
}
