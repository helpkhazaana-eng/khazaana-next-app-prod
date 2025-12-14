'use server';

import { publishRestaurant as publishRestaurantLib } from '@/lib/restaurant-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function publishRestaurant(restaurantId: string) {
  try {
    await requireAdmin();
    await publishRestaurantLib(restaurantId);
    
    // Revalidate all relevant paths
    revalidatePath('/');
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath('/admin');
    
    return { success: true, message: 'Restaurant activated successfully!' };
  } catch (error: any) {
    console.error('Publish restaurant error:', error);
    const errorMessage = error?.message || 'Unknown error';
    return { success: false, message: `Failed to activate: ${errorMessage}` };
  }
}
