'use server';

import { getActiveOffers } from '@/lib/offer-manager';

export async function getPublicActiveOffers() {
  try {
    const offers = await getActiveOffers();
    return offers;
  } catch (error) {
    console.error('Failed to fetch public offers:', error);
    return [];
  }
}
