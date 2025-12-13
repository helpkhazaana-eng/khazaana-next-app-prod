'use server';

import { saveOffer, deleteOffer as deleteOfferLib, toggleOfferStatus as toggleOfferStatusLib } from '@/lib/offer-manager';
import { revalidatePath } from 'next/cache';
import type { ExclusiveOffer } from '@/data/offers';
import { requireAdmin } from '@/lib/auth';

export async function createOffer(formData: FormData) {
  try {
    await requireAdmin();
    const offerType = formData.get('offerType') as 'combo' | 'delivery';
    const minOrderValue = formData.get('minOrderValue') ? parseFloat(formData.get('minOrderValue') as string) : undefined;
    const dishName = formData.get('dishName') as string;
    const description = formData.get('description') as string;
    const restaurantId = formData.get('restaurantId') as string;
    const restaurantName = formData.get('restaurantName') as string;
    
    // Optional for delivery offers
    const originalPrice = formData.get('originalPrice') ? parseFloat(formData.get('originalPrice') as string) : undefined;
    const offerPrice = formData.get('offerPrice') ? parseFloat(formData.get('offerPrice') as string) : undefined;
    const deliveryCharge = formData.get('deliveryCharge') ? parseFloat(formData.get('deliveryCharge') as string) : undefined;
    
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const terms = formData.get('terms') as string;
    const vegNonVeg = formData.get('vegNonVeg') as 'Veg' | 'Non-Veg';

    if (!offerType || !dishName || !restaurantId || !startDate || !endDate) {
      return { success: false, message: 'Missing required fields' };
    }
    
    // Specific validation based on type
    if (offerType === 'combo') {
        if (originalPrice === undefined || offerPrice === undefined) {
             return { success: false, message: 'Price is required for Combo offers' };
        }
    } else if (offerType === 'delivery') {
        if (minOrderValue === undefined) {
            return { success: false, message: 'Minimum Order Value is required for Delivery offers' };
        }
    }

    const discountPercent = (originalPrice && offerPrice) 
        ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
        : undefined;
        
    const id = `offer-${Date.now()}`; // Simple ID generation

    const newOffer: ExclusiveOffer = {
      id,
      offerType,
      minOrderValue,
      dishName,
      description,
      restaurantId,
      restaurantName,
      originalPrice,
      offerPrice,
      discountPercent,
      deliveryCharge,
      startDate,
      endDate,
      isActive: true,
      terms,
      vegNonVeg: vegNonVeg || undefined
    };

    await saveOffer(newOffer);
    
    revalidatePath('/');
    revalidatePath('/admin/offers');
    
    return { success: true, message: 'Offer created successfully!' };
  } catch (error) {
    console.error('Create offer error:', error);
    return { success: false, message: 'Failed to create offer.' };
  }
}

export async function deleteOffer(offerId: string) {
  try {
    await requireAdmin();
    await deleteOfferLib(offerId);
    revalidatePath('/');
    revalidatePath('/admin/offers');
    return { success: true, message: 'Offer deleted successfully.' };
  } catch (error) {
    return { success: false, message: 'Failed to delete offer.' };
  }
}

export async function toggleOfferStatus(offerId: string, isActive: boolean) {
  try {
    await requireAdmin();
    await toggleOfferStatusLib(offerId, isActive);
    revalidatePath('/');
    revalidatePath('/admin/offers');
    return { success: true, message: `Offer ${isActive ? 'activated' : 'deactivated'} successfully.` };
  } catch (error) {
    return { success: false, message: 'Failed to update status.' };
  }
}
