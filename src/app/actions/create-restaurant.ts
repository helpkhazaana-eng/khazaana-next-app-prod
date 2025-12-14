'use server';

import { saveDraftRestaurant, checkPriorityConflict } from '@/lib/restaurant-manager';
import { uploadMenuCSV } from './upload-menu';
import type { Restaurant } from '@/types';
import { RESTAURANT_TIMINGS, RESTAURANT_PRICING, KHAZAANA_CONTACT } from '@/data/restaurants';
import { requireAdmin } from '@/lib/auth';

export async function createRestaurant(formData: FormData) {
  try {
    await requireAdmin();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const category = formData.get('category') as string;
    const cuisineStr = formData.get('cuisine') as string;
    const priceRange = formData.get('priceRange') as '₹' | '₹₹' | '₹₹₹';
    const costForTwo = parseInt(formData.get('costForTwo') as string);
    const priority = formData.get('priority') ? parseInt(formData.get('priority') as string) : undefined;
    const menuFile = formData.get('menuFile') as File;

    if (!name || !address || !phone || !menuFile) {
      return { success: false, message: 'Missing required fields' };
    }

    // Check Priority Conflict
    if (priority !== undefined) {
      const conflict = await checkPriorityConflict(priority);
      if (conflict) {
        return { success: false, message: `Priority ${priority} is already taken by "${conflict.name}". Please choose another or update the existing one.` };
      }
    }

    // Generate ID from name
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Create Restaurant Object - only include priority if it's defined
    const newRestaurant: Restaurant = {
      id,
      name,
      address,
      phone,
      whatsapp: KHAZAANA_CONTACT.whatsapp, // Default for now
      opensAt: RESTAURANT_TIMINGS.opensAt,
      closesAt: RESTAURANT_TIMINGS.closesAt,
      status: 'open', // Default to open for testing
      category,
      featured: false,
      rating: 4.5, // Default new rating
      cuisine: cuisineStr.split(',').map(c => c.trim()),
      priceRange,
      costForTwo,
      menuFile: `${id}.csv`, // Will be saved by uploadMenuCSV
      ...(priority !== undefined && { priority })
    };

    // Save Restaurant Draft
    await saveDraftRestaurant(newRestaurant);

    // Upload Menu
    // We need to construct a new FormData for the uploadMenuCSV function
    const menuFormData = new FormData();
    menuFormData.append('file', menuFile);
    menuFormData.append('restaurantId', id);

    const uploadResult = await uploadMenuCSV(menuFormData);

    if (!uploadResult.success) {
      return { success: false, message: `Restaurant created but menu upload failed: ${uploadResult.message}` };
    }

    return { 
      success: true, 
      message: 'Restaurant created successfully! Go to Dashboard to preview and publish.',
      restaurantId: id
    };

  } catch (error: any) {
    console.error('Create restaurant error:', error);
    const errorMessage = error?.message || 'Unknown error';
    return { success: false, message: `Server error: ${errorMessage}` };
  }
}
