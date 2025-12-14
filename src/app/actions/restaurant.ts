'use server';

import { toggleRestaurantOpen } from '@/lib/restaurant-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

export async function toggleRestaurantOpenAction(restaurantId: string, isOpen: boolean) {
  try {
    await requireAdmin();
    
    const restaurant = await toggleRestaurantOpen(restaurantId, isOpen);
    
    revalidatePath('/admin/restaurants');
    revalidatePath('/restaurants');
    revalidatePath(`/restaurants/${restaurantId}`);
    revalidatePath('/');
    
    return { 
      success: true, 
      message: `${restaurant.name} is now ${isOpen ? 'OPEN' : 'CLOSED'}`,
      restaurant 
    };
  } catch (error: any) {
    console.error('Failed to toggle restaurant status:', error);
    const errorMessage = error?.message || 'Unknown error';
    return { success: false, message: `Failed to update: ${errorMessage}` };
  }
}
