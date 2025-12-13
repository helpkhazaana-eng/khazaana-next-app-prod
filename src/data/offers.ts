/**
 * =====================================================
 * EXCLUSIVE OFFERS MANAGEMENT
 * =====================================================
 */

export interface ExclusiveOffer {
  id: string;
  offerType: 'combo' | 'delivery'; // New field
  minOrderValue?: number; // For delivery offers
  dishName: string; // Used as Title for delivery offers too
  description: string;
  restaurantId: string;
  restaurantName: string;
  originalPrice?: number; // Optional for delivery offers
  offerPrice?: number; // Optional for delivery offers
  discountPercent?: number;
  deliveryCharge?: number; // Optional for delivery offers
  startDate: string;
  endDate: string;
  isActive: boolean;
  imageUrl?: string;
  terms?: string;
  vegNonVeg?: 'Veg' | 'Non-Veg';
}

/**
 * =====================================================
 * ADD YOUR OFFERS BELOW
 * =====================================================
 */
export const exclusiveOffers: ExclusiveOffer[] = [
  // -------- CUPS N CRUMBS OFFER --------
  {
    id: 'cnc-grill-sandwich',
    offerType: 'combo',
    dishName: 'Grill Sandwich Combo',
    description: 'Buy 2 Grill Sandwiches, Get 1 Fruit Cake FREE! Freshly Grilled.',
    restaurantId: 'cupsncrumbs',
    restaurantName: 'Cups N Crumbs',
    originalPrice: 195,
    offerPrice: 180,
    discountPercent: 8,
    deliveryCharge: 0, // FREE delivery
    startDate: '2025-11-27',
    endDate: '2025-11-30',
    isActive: true,
    vegNonVeg: 'Veg',
    terms: 'Limited time offer. Valid 27-30 Nov 2025. FREE Delivery included.'
  },

  // -------- BONDHU RESTAURANT OFFER --------
  {
    id: 'bondhu-free-delivery',
    offerType: 'delivery',
    minOrderValue: 350,
    dishName: 'Free Delivery Special',
    description: 'FREE Delivery on orders above ₹350! Order your favorite Non-Veg dishes.',
    restaurantId: 'bandhu-hotel',
    restaurantName: 'Bondhu Restaurant',
    originalPrice: 0,
    offerPrice: 0,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    isActive: true,
    terms: 'Free delivery on orders above ₹350. Valid on all items.'
  },

  {
    id: 'chicken-burger-and-chaat-combo',
    offerType: 'combo',
    dishName: 'CHICKEN BURGER AND CHAAT COMBO',
    description: '2 CHICKEN BURGER + 1 SAMOSA CHAAT',
    restaurantId: 'cupsncrumbs',
    restaurantName: 'Cups N Crumbs',
    originalPrice: 220,
    offerPrice: 180,
    discountPercent: 18,
    deliveryCharge: 0,
    startDate: '2025-12-01',
    endDate: '2025-12-02',
    isActive: true,
    vegNonVeg: 'Non-Veg'
  }
];

/**
 * Get all active offers (checks date range and isActive flag)
 */
export function getActiveOffers(): ExclusiveOffer[] {
  const now = new Date();
  
  return exclusiveOffers.filter(offer => {
    if (!offer.isActive) return false;
    
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);
    endDate.setHours(23, 59, 59); // Include the entire end date
    
    return now >= startDate && now <= endDate;
  });
}

/**
 * Get offers by restaurant
 */
export function getOffersByRestaurant(restaurantId: string): ExclusiveOffer[] {
  return getActiveOffers().filter(offer => offer.restaurantId === restaurantId);
}

/**
 * Calculate discount percentage if not provided
 */
export function calculateDiscount(original: number, offer: number): number {
  return Math.round(((original - offer) / original) * 100);
}

/**
 * Check if offer is expiring soon (within 3 days)
 */
export function isExpiringSoon(endDate: string): boolean {
  const end = new Date(endDate);
  const now = new Date();
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 3 && diffDays >= 0;
}

/**
 * Get remaining days for offer
 */
export function getRemainingDays(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
