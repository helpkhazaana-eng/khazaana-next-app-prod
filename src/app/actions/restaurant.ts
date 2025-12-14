'use server';

import { setRestaurantOpenStatus } from '@/lib/restaurant-manager';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';

// Status types: 'open' = always open, 'closed' = always closed, 'default' = follow time rules
export type RestaurantOpenStatus = 'open' | 'closed' | 'default';

export async function setRestaurantOpenStatusAction(
  restaurantId: string, 
  status: RestaurantOpenStatus
) {
  try {
    await requireAdmin();
    
    console.log(`[setRestaurantOpenStatusAction] Setting ${restaurantId} to ${status}`);
    
    const restaurant = await setRestaurantOpenStatus(restaurantId, status);
    
    console.log(`[setRestaurantOpenStatusAction] Success:`, restaurant?.name);
    
    // Revalidate paths - wrap in try-catch to prevent revalidation errors from failing the action
    try {
      revalidatePath('/admin/restaurants');
      revalidatePath('/restaurants');
      revalidatePath(`/restaurants/${restaurantId}`);
      revalidatePath('/');
    } catch (revalError) {
      console.warn('Revalidation warning:', revalError);
      // Don't fail the action if revalidation has issues
    }
    
    const statusMessages: Record<RestaurantOpenStatus, string> = {
      'open': `${restaurant.name} is now OPEN (overrides time restrictions)`,
      'closed': `${restaurant.name} is now CLOSED`,
      'default': `${restaurant.name} is now on DEFAULT schedule (9 AM - 9 PM)`
    };
    
    return { 
      success: true, 
      message: statusMessages[status],
      restaurant 
    };
  } catch (error: any) {
    console.error('Failed to set restaurant status:', error);
    const errorMessage = error?.message || 'Unknown error';
    return { success: false, message: `Failed to update: ${errorMessage}` };
  }
}

// Keep old function for backward compatibility
export async function toggleRestaurantOpenAction(restaurantId: string, isOpen: boolean) {
  return setRestaurantOpenStatusAction(restaurantId, isOpen ? 'open' : 'closed');
}
