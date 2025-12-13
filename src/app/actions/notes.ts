'use server';

import { createNote, updateNote, deleteNote, type NoteType } from '@/lib/notes-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function createNoteAction(data: {
  heading: string;
  type: NoteType;
  description: string;
}) {
  try {
    await requireAdmin();
    
    if (!data.heading?.trim()) {
      return { success: false, message: 'Heading is required' };
    }
    if (!data.description?.trim()) {
      return { success: false, message: 'Description is required' };
    }
    if (!['bug', 'feature', 'general'].includes(data.type)) {
      return { success: false, message: 'Invalid note type' };
    }
    
    const note = await createNote({
      heading: data.heading.trim(),
      type: data.type,
      description: data.description.trim(),
    });
    
    revalidatePath('/admin/notes');
    return { success: true, message: 'Note created successfully', note };
  } catch (error) {
    console.error('Failed to create note:', error);
    return { success: false, message: 'Failed to create note' };
  }
}

export async function updateNoteAction(id: string, data: {
  heading?: string;
  type?: NoteType;
  description?: string;
}) {
  try {
    await requireAdmin();
    
    const note = await updateNote(id, data);
    
    if (!note) {
      return { success: false, message: 'Note not found' };
    }
    
    revalidatePath('/admin/notes');
    return { success: true, message: 'Note updated successfully', note };
  } catch (error) {
    console.error('Failed to update note:', error);
    return { success: false, message: 'Failed to update note' };
  }
}

export async function deleteNoteAction(id: string) {
  try {
    await requireAdmin();
    
    const deleted = await deleteNote(id);
    
    if (!deleted) {
      return { success: false, message: 'Note not found' };
    }
    
    revalidatePath('/admin/notes');
    return { success: true, message: 'Note deleted successfully' };
  } catch (error) {
    console.error('Failed to delete note:', error);
    return { success: false, message: 'Failed to delete note' };
  }
}
