'use server';

import { updateRestaurantStatus as updateStatusLib } from '@/lib/restaurant-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function updateRestaurantStatus(restaurantId: string, status: 'live' | 'archived' | 'deleted') {
  try {
    await requireAdmin();
    await updateStatusLib(restaurantId, status);
    
    // Revalidate paths
    revalidatePath('/admin');
    revalidatePath('/admin/restaurants');
    revalidatePath('/');
    revalidatePath('/restaurants');
    
    return { success: true, message: `Restaurant ${status === 'deleted' ? 'deleted' : status === 'archived' ? 'archived' : 'activated'} successfully.` };
  } catch (error) {
    console.error('Update status error:', error);
    return { success: false, message: 'Failed to update restaurant status.' };
  }
}
