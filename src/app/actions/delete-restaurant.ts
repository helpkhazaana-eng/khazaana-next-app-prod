'use server';

import { getFirestore } from '@/lib/firestore';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function deleteRestaurant(restaurantId: string) {
  try {
    await requireAdmin();
    
    const db = getFirestore();
    
    // Delete restaurant document
    await db.collection('restaurants').doc(restaurantId).delete();
    
    // Delete live menu
    await db.collection('menus').doc(restaurantId).delete();
    
    // Delete draft menu if exists
    await db.collection('menus').doc(`${restaurantId}_draft`).delete();
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/admin/restaurants');
    revalidatePath('/');
    revalidatePath('/restaurants');
    
    return { success: true, message: 'Restaurant deleted permanently.' };
  } catch (error: any) {
    console.error('Delete restaurant error:', error);
    const errorMessage = error?.message || 'Unknown error';
    return { success: false, message: `Failed to delete: ${errorMessage}` };
  }
}
