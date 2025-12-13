'use server';

import { updateRestaurantPriority as updatePriorityLib } from '@/lib/restaurant-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function updateRestaurantPriority(restaurantId: string, priority: number | null) {
  try {
    await requireAdmin();
    await updatePriorityLib(restaurantId, priority);
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/admin/restaurants');
    revalidatePath('/');
    revalidatePath('/restaurants');
    
    return { success: true, message: priority === null ? 'Priority removed.' : 'Priority updated successfully.' };
  } catch (error: any) {
    console.error('Update priority error:', error);
    return { success: false, message: error.message || 'Failed to update priority.' };
  }
}
