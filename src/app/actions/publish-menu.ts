'use server';

import { rename, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function publishMenu(restaurantId: string) {
  try {
    await requireAdmin();
    const dataDir = join(process.cwd(), 'src', 'data', 'menus-json');
    const csvDir = join(process.cwd(), 'src', 'data', 'menus-csv');

    // Paths
    const draftJson = join(dataDir, `${restaurantId}.draft.json`);
    const liveJson = join(dataDir, `${restaurantId}.json`);
    const draftCsv = join(csvDir, `${restaurantId}.draft.csv`);
    const liveCsv = join(csvDir, `${restaurantId}.csv`);

    // Move Draft -> Live
    await rename(draftJson, liveJson);
    
    // Try to move CSV if it exists (it should)
    try {
      await rename(draftCsv, liveCsv);
    } catch (e) {
      console.warn('Draft CSV not found or could not be moved:', e);
    }

    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath('/admin');
    
    return { success: true, message: 'Menu published live successfully!' };
  } catch (error) {
    console.error('Publish error:', error);
    return { success: false, message: 'Failed to publish menu.' };
  }
}

export async function discardDraft(restaurantId: string) {
  try {
    await requireAdmin();
    const dataDir = join(process.cwd(), 'src', 'data', 'menus-json');
    const csvDir = join(process.cwd(), 'src', 'data', 'menus-csv');

    // Paths
    const draftJson = join(dataDir, `${restaurantId}.draft.json`);
    const draftCsv = join(csvDir, `${restaurantId}.draft.csv`);

    // Delete
    await unlink(draftJson);
    try {
      await unlink(draftCsv);
    } catch (e) {
      // Ignore if csv doesn't exist
    }

    revalidatePath('/admin');
    
    return { success: true, message: 'Draft discarded.' };
  } catch (error) {
    console.error('Discard error:', error);
    return { success: false, message: 'Failed to discard draft.' };
  }
}
