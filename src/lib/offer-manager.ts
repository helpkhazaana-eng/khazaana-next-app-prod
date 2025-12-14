import type { ExclusiveOffer } from '@/data/offers';
import { exclusiveOffers as staticOffers } from '@/data/offers';
import { getFirestore } from './firestore';

// Get all dynamic offers from Firestore
export async function getDynamicOffers(): Promise<ExclusiveOffer[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('offers').get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        offerType: data.offerType,
        minOrderValue: data.minOrderValue,
        dishName: data.dishName,
        description: data.description,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        originalPrice: data.originalPrice,
        offerPrice: data.offerPrice,
        discountPercent: data.discountPercent,
        deliveryCharge: data.deliveryCharge,
        startDate: data.startDate,
        endDate: data.endDate,
        isActive: data.isActive,
        terms: data.terms,
        vegNonVeg: data.vegNonVeg,
      } as ExclusiveOffer;
    });
  } catch (error) {
    console.error('Error getting dynamic offers:', error);
    return [];
  }
}

// Get ALL offers (static + dynamic)
export async function getAllOffers(): Promise<ExclusiveOffer[]> {
  const dynamic = await getDynamicOffers();
  
  // Merge, preferring dynamic if ID conflicts (to allow overriding static)
  const dynamicIds = new Set(dynamic.map(o => o.id));
  const activeStatic = staticOffers.filter(o => !dynamicIds.has(o.id));
  
  return [...activeStatic, ...dynamic];
}

// Get ACTIVE offers (checks date and isActive)
export async function getActiveOffers(): Promise<ExclusiveOffer[]> {
  const allOffers = await getAllOffers();
  const now = new Date();
  
  return allOffers.filter(offer => {
    if (!offer.isActive) return false;
    
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    endDate.setHours(23, 59, 59); // Include the entire end date
    
    return now >= startDate && now <= endDate;
  });
}

// Save/Update an offer to Firestore
export async function saveOffer(offer: ExclusiveOffer) {
  try {
    const db = getFirestore();
    const offerData = {
      offerType: offer.offerType,
      minOrderValue: offer.minOrderValue || null,
      dishName: offer.dishName,
      description: offer.description,
      restaurantId: offer.restaurantId,
      restaurantName: offer.restaurantName,
      originalPrice: offer.originalPrice || null,
      offerPrice: offer.offerPrice || null,
      discountPercent: offer.discountPercent || null,
      deliveryCharge: offer.deliveryCharge || null,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: offer.isActive,
      terms: offer.terms || null,
      vegNonVeg: offer.vegNonVeg || null,
    };
    
    await db.collection('offers').doc(offer.id).set(offerData, { merge: true });
  } catch (error) {
    console.error('Error saving offer:', error);
    throw error;
  }
}

// Delete an offer from Firestore
export async function deleteOffer(offerId: string) {
  try {
    const db = getFirestore();
    await db.collection('offers').doc(offerId).delete();
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
}

// Toggle offer status in Firestore
export async function toggleOfferStatus(offerId: string, isActive: boolean) {
  try {
    const db = getFirestore();
    
    // First check if offer exists in Firestore
    const docRef = db.collection('offers').doc(offerId);
    const doc = await docRef.get();
    
    if (doc.exists) {
      // Update existing Firestore offer
      await docRef.update({ isActive });
    } else {
      // Check if it's a static offer and migrate it to Firestore
      const allOffers = await getAllOffers();
      const offer = allOffers.find(o => o.id === offerId);
      
      if (!offer) throw new Error('Offer not found');
      
      offer.isActive = isActive;
      await saveOffer(offer);
    }
  } catch (error) {
    console.error('Error toggling offer status:', error);
    throw error;
  }
}
