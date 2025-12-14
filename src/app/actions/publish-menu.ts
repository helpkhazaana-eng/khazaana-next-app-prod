'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { publishMenuToFirestore, getFirestore } from '@/lib/firestore';

export async function publishMenu(restaurantId: string) {
  try {
    await requireAdmin();
    
    // Publish menu from draft to live in Firestore
    await publishMenuToFirestore(restaurantId);

    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath('/admin');
    
    return { success: true, message: 'Menu published live successfully!' };
  } catch (error: any) {
    console.error('Publish error:', error);
    return { success: false, message: `Failed to publish: ${error?.message || 'Unknown error'}` };
  }
}

export async function discardDraft(restaurantId: string) {
  try {
    await requireAdmin();
    
    // Delete draft menu from Firestore
    const db = getFirestore();
    await db.collection('menus').doc(`${restaurantId}_draft`).delete();

    revalidatePath('/admin');
    
    return { success: true, message: 'Draft discarded.' };
  } catch (error: any) {
    console.error('Discard error:', error);
    return { success: false, message: `Failed to discard: ${error?.message || 'Unknown error'}` };
  }
}
