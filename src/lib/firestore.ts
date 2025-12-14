/**
 * Firestore Database Utilities
 * 
 * Collections:
 * - restaurants: All restaurant data (draft and live)
 * - menus: Menu items for each restaurant (subcollection or separate)
 * - system-config: Global system configuration
 * - offers: Dynamic offers
 */

import admin from 'firebase-admin';
import { getFirestore as getFirestoreAdmin } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './firebase-admin';
import type { Restaurant } from '@/types';

// Get Firestore instance with correct database ID
export function getFirestore() {
  const app = getFirebaseAdmin();
  const databaseId = process.env.FIREBASE_DATABASE_ID;
  
  // For named databases, use getFirestore with database ID
  if (databaseId && databaseId !== '(default)') {
    return getFirestoreAdmin(app, databaseId);
  }
  return getFirestoreAdmin(app);
}

// Helper to convert Firestore document to plain object (removes timestamps and non-serializable fields)
function toPlainObject<T>(doc: admin.firestore.DocumentSnapshot): T {
  const data = doc.data();
  if (!data) return { id: doc.id } as T;
  
  // Remove migratedAt and other Firestore-specific fields
  const { migratedAt, updatedAt, ...rest } = data;
  return { id: doc.id, ...rest } as T;
}

// ============================================================
// SYSTEM CONFIG
// ============================================================

export interface SystemConfig {
  whatsappOrderNumber: string;
  globalOverride: 'open' | 'closed' | 'auto';
}

const DEFAULT_CONFIG: SystemConfig = {
  whatsappOrderNumber: '8695902696',
  globalOverride: 'auto'
};

export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const db = getFirestore();
    const doc = await db.collection('system').doc('config').get();
    
    if (!doc.exists) {
      // Initialize with defaults
      await db.collection('system').doc('config').set(DEFAULT_CONFIG);
      return DEFAULT_CONFIG;
    }
    
    const data = doc.data();
    // Only extract the fields we need (avoid Firestore Timestamp objects)
    return {
      whatsappOrderNumber: data?.whatsappOrderNumber || DEFAULT_CONFIG.whatsappOrderNumber,
      globalOverride: data?.globalOverride || DEFAULT_CONFIG.globalOverride,
    };
  } catch (error) {
    console.error('Error getting system config:', error);
    return DEFAULT_CONFIG;
  }
}

export async function saveSystemConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
  const db = getFirestore();
  const current = await getSystemConfig();
  const newConfig = { ...current, ...config };
  
  await db.collection('system').doc('config').set(newConfig);
  return newConfig;
}

// ============================================================
// RESTAURANTS
// ============================================================

// Get all draft restaurants
export async function getDraftRestaurants(): Promise<Restaurant[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('restaurants')
      .where('adminStatus', '==', 'draft')
      .get();
    
    return snapshot.docs.map(doc => toPlainObject<Restaurant>(doc));
  } catch (error) {
    console.error('Error getting draft restaurants:', error);
    return [];
  }
}

// Get all live restaurants from Firestore
export async function getLiveRestaurants(): Promise<Restaurant[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('restaurants')
      .where('adminStatus', '==', 'live')
      .get();
    
    return snapshot.docs.map(doc => toPlainObject<Restaurant>(doc));
  } catch (error) {
    console.error('Error getting live restaurants:', error);
    return [];
  }
}

// Get ALL restaurants (for admin view)
export async function getAllRestaurantsFromFirestore(includeHidden = false): Promise<Restaurant[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('restaurants').get();
    
    let restaurants = snapshot.docs.map(doc => toPlainObject<Restaurant>(doc));
    
    // Sort by priority
    restaurants.sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) {
        return a.priority - b.priority;
      }
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      return a.name.localeCompare(b.name);
    });
    
    if (includeHidden) {
      return restaurants;
    }
    
    // Filter out deleted and archived for public view
    return restaurants.filter(r => r.adminStatus !== 'deleted' && r.adminStatus !== 'archived');
  } catch (error) {
    console.error('Error getting all restaurants:', error);
    return [];
  }
}

// Get restaurant by ID
export async function getRestaurantByIdFromFirestore(id: string): Promise<Restaurant | undefined> {
  try {
    const db = getFirestore();
    const doc = await db.collection('restaurants').doc(id).get();
    
    if (!doc.exists) {
      return undefined;
    }
    
    return toPlainObject<Restaurant>(doc);
  } catch (error) {
    console.error('Error getting restaurant by ID:', error);
    return undefined;
  }
}

// Save restaurant (create or update)
export async function saveRestaurant(restaurant: Restaurant): Promise<void> {
  const db = getFirestore();
  const { id, ...data } = restaurant;
  await db.collection('restaurants').doc(id).set(data, { merge: true });
}

// Save draft restaurant
export async function saveDraftRestaurant(restaurant: Restaurant): Promise<void> {
  const db = getFirestore();
  const { id, ...data } = restaurant;
  await db.collection('restaurants').doc(id).set({ ...data, adminStatus: 'draft' }, { merge: true });
}

// Publish restaurant (change status from draft to live)
export async function publishRestaurantToFirestore(restaurantId: string): Promise<Restaurant> {
  const db = getFirestore();
  const doc = await db.collection('restaurants').doc(restaurantId).get();
  
  if (!doc.exists) {
    throw new Error('Restaurant not found');
  }
  
  const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  
  // Check priority conflict
  if (restaurant.priority) {
    const conflict = await checkPriorityConflictFirestore(restaurant.priority, restaurantId);
    if (conflict) {
      throw new Error(`Priority ${restaurant.priority} is already taken by "${conflict.name}". Update priority before publishing.`);
    }
  }
  
  // Update status to live
  await db.collection('restaurants').doc(restaurantId).update({ adminStatus: 'live' });
  
  return { ...restaurant, adminStatus: 'live' };
}

// Update restaurant status
export async function updateRestaurantStatusFirestore(
  restaurantId: string, 
  status: 'live' | 'archived' | 'deleted'
): Promise<Restaurant> {
  const db = getFirestore();
  const doc = await db.collection('restaurants').doc(restaurantId).get();
  
  if (!doc.exists) {
    throw new Error('Restaurant not found');
  }
  
  const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  
  // If activating, check priority conflict
  if (status === 'live' && restaurant.priority) {
    const conflict = await checkPriorityConflictFirestore(restaurant.priority, restaurantId);
    if (conflict) {
      throw new Error(`Cannot set to Live: Priority ${restaurant.priority} is already taken by "${conflict.name}". Change priority first.`);
    }
  }
  
  await db.collection('restaurants').doc(restaurantId).update({ adminStatus: status });
  
  return { ...restaurant, adminStatus: status };
}

// Check priority conflict
export async function checkPriorityConflictFirestore(
  priority: number, 
  excludeId?: string
): Promise<Restaurant | undefined> {
  const db = getFirestore();
  const snapshot = await db.collection('restaurants')
    .where('priority', '==', priority)
    .where('adminStatus', '==', 'live')
    .get();
  
  const restaurants = snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as Restaurant))
    .filter(r => r.id !== excludeId);
  
  return restaurants[0];
}

// Update restaurant priority
export async function updateRestaurantPriorityFirestore(
  restaurantId: string, 
  priority: number | null
): Promise<Restaurant> {
  const db = getFirestore();
  const doc = await db.collection('restaurants').doc(restaurantId).get();
  
  if (!doc.exists) {
    throw new Error('Restaurant not found');
  }
  
  const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  
  if (priority !== null) {
    const conflict = await checkPriorityConflictFirestore(priority, restaurantId);
    if (conflict) {
      throw new Error(`Priority ${priority} is already taken by "${conflict.name}". Remove it there first.`);
    }
  }
  
  const updateData = priority === null 
    ? { priority: admin.firestore.FieldValue.delete() }
    : { priority };
  
  await db.collection('restaurants').doc(restaurantId).update(updateData);
  
  return { ...restaurant, priority: priority === null ? undefined : priority };
}

// Toggle restaurant open/close
export async function toggleRestaurantOpenFirestore(
  restaurantId: string, 
  isOpen: boolean
): Promise<Restaurant> {
  const db = getFirestore();
  const doc = await db.collection('restaurants').doc(restaurantId).get();
  
  if (!doc.exists) {
    throw new Error('Restaurant not found');
  }
  
  await db.collection('restaurants').doc(restaurantId).update({ isOpen });
  
  const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  return { ...restaurant, isOpen };
}

// ============================================================
// MENUS
// ============================================================

export interface MenuItem {
  itemName: string;
  price: number;
  category: string;
  vegNonVeg: 'Veg' | 'Non-Veg';
  description?: string;
  inStock?: boolean;
}

// Get menu for a restaurant
export async function getMenuFromFirestore(restaurantId: string): Promise<MenuItem[]> {
  try {
    const db = getFirestore();
    const doc = await db.collection('menus').doc(restaurantId).get();
    
    if (!doc.exists) {
      return [];
    }
    
    const data = doc.data();
    return data?.items || [];
  } catch (error) {
    console.error('Error getting menu:', error);
    return [];
  }
}

// Get draft menu for a restaurant
export async function getDraftMenuFromFirestore(restaurantId: string): Promise<MenuItem[]> {
  try {
    const db = getFirestore();
    const doc = await db.collection('menus').doc(`${restaurantId}_draft`).get();
    
    if (!doc.exists) {
      return [];
    }
    
    const data = doc.data();
    return data?.items || [];
  } catch (error) {
    console.error('Error getting draft menu:', error);
    return [];
  }
}

// Save draft menu
export async function saveDraftMenuToFirestore(restaurantId: string, items: MenuItem[]): Promise<void> {
  const db = getFirestore();
  await db.collection('menus').doc(`${restaurantId}_draft`).set({ 
    items,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

// Publish menu (copy draft to live)
export async function publishMenuToFirestore(restaurantId: string): Promise<void> {
  const db = getFirestore();
  
  // Get draft
  const draftDoc = await db.collection('menus').doc(`${restaurantId}_draft`).get();
  
  if (!draftDoc.exists) {
    throw new Error('Draft menu not found');
  }
  
  const draftData = draftDoc.data();
  
  // Save to live
  await db.collection('menus').doc(restaurantId).set({
    items: draftData?.items || [],
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  // Optionally delete draft
  // await db.collection('menus').doc(`${restaurantId}_draft`).delete();
}

// ============================================================
// MIGRATION HELPER - Import existing data to Firestore
// ============================================================

export async function migrateRestaurantsToFirestore(restaurants: Restaurant[]): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  
  for (const restaurant of restaurants) {
    const { id, ...data } = restaurant;
    const ref = db.collection('restaurants').doc(id);
    batch.set(ref, { ...data, adminStatus: data.adminStatus || 'live' });
  }
  
  await batch.commit();
  console.log(`Migrated ${restaurants.length} restaurants to Firestore`);
}

export async function migrateMenuToFirestore(restaurantId: string, items: MenuItem[]): Promise<void> {
  const db = getFirestore();
  await db.collection('menus').doc(restaurantId).set({
    items,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log(`Migrated menu for ${restaurantId} to Firestore (${items.length} items)`);
}
