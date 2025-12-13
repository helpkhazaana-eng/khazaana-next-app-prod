import { promises as fs } from 'fs';
import path from 'path';
import type { ExclusiveOffer } from '@/data/offers';
import { exclusiveOffers as staticOffers } from '@/data/offers';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const OFFERS_FILE = path.join(DATA_DIR, 'dynamic-offers.json');

// Ensure data directory exists
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Get all dynamic offers
export async function getDynamicOffers(): Promise<ExclusiveOffer[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(OFFERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
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

// Save/Update an offer
export async function saveOffer(offer: ExclusiveOffer) {
  const offers = await getDynamicOffers();
  const index = offers.findIndex(o => o.id === offer.id);
  
  if (index >= 0) {
    offers[index] = offer;
  } else {
    offers.push(offer);
  }
  
  await ensureDataDir();
  await fs.writeFile(OFFERS_FILE, JSON.stringify(offers, null, 2));
}

// Delete an offer (physically remove from dynamic list)
// If it's a static offer, we can't physically delete it from the file, 
// but we can "soft delete" it by adding it to dynamic list with isActive: false? 
// Or better, support a 'deleted' status in the type? 
// For now, let's stick to simple deletion for dynamic ones.
export async function deleteOffer(offerId: string) {
  const offers = await getDynamicOffers();
  const newOffers = offers.filter(o => o.id !== offerId);
  
  await ensureDataDir();
  await fs.writeFile(OFFERS_FILE, JSON.stringify(newOffers, null, 2));
}

// Toggle offer status
export async function toggleOfferStatus(offerId: string, isActive: boolean) {
  const allOffers = await getAllOffers();
  const offer = allOffers.find(o => o.id === offerId);
  
  if (!offer) throw new Error('Offer not found');
  
  offer.isActive = isActive;
  await saveOffer(offer); // This will effectively "promote" a static offer to dynamic if modified
}
