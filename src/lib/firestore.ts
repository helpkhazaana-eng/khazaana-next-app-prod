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
  const docRef = db.collection('restaurants').doc(restaurantId);
  const doc = await docRef.get();
  
  let restaurant: Restaurant;
  
  if (!doc.exists) {
    // Check static restaurants and create in Firestore
    const { restaurants: staticRestaurants } = await import('@/data/restaurants');
    const staticRestaurant = staticRestaurants.find(r => r.id === restaurantId);
    
    if (!staticRestaurant) {
      throw new Error('Restaurant not found');
    }
    
    // Create the restaurant in Firestore
    const { id, ...data } = staticRestaurant;
    await docRef.set({ ...data, adminStatus: status });
    
    return { ...staticRestaurant, adminStatus: status };
  }
  
  restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  
  // If activating, check priority conflict
  if (status === 'live' && restaurant.priority) {
    const conflict = await checkPriorityConflictFirestore(restaurant.priority, restaurantId);
    if (conflict) {
      throw new Error(`Cannot set to Live: Priority ${restaurant.priority} is already taken by "${conflict.name}". Change priority first.`);
    }
  }
  
  await docRef.update({ adminStatus: status });
  
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
  const docRef = db.collection('restaurants').doc(restaurantId);
  const doc = await docRef.get();
  
  let restaurant: Restaurant;
  
  if (!doc.exists) {
    // Check static restaurants and create in Firestore
    const { restaurants: staticRestaurants } = await import('@/data/restaurants');
    const staticRestaurant = staticRestaurants.find(r => r.id === restaurantId);
    
    if (!staticRestaurant) {
      throw new Error('Restaurant not found');
    }
    
    if (priority !== null) {
      const conflict = await checkPriorityConflictFirestore(priority, restaurantId);
      if (conflict) {
        throw new Error(`Priority ${priority} is already taken by "${conflict.name}". Remove it there first.`);
      }
    }
    
    // Create the restaurant in Firestore with priority
    const { id, ...data } = staticRestaurant;
    await docRef.set({ ...data, priority: priority ?? undefined, adminStatus: 'live' });
    
    return { ...staticRestaurant, priority: priority ?? undefined };
  }
  
  restaurant = { id: doc.id, ...doc.data() } as Restaurant;
  
  if (priority !== null) {
    const conflict = await checkPriorityConflictFirestore(priority, restaurantId);
    if (conflict) {
      throw new Error(`Priority ${priority} is already taken by "${conflict.name}". Remove it there first.`);
    }
  }
  
  const updateData = priority === null 
    ? { priority: admin.firestore.FieldValue.delete() }
    : { priority };
  
  await docRef.update(updateData);
  
  return { ...restaurant, priority: priority === null ? undefined : priority };
}

// Toggle restaurant open/close (legacy - use setRestaurantOpenStatusFirestore instead)
export async function toggleRestaurantOpenFirestore(
  restaurantId: string, 
  isOpen: boolean
): Promise<Restaurant> {
  // Convert boolean to status
  return setRestaurantOpenStatusFirestore(restaurantId, isOpen ? 'open' : 'closed');
}

// Set restaurant open status with 3 options
// 'open' = always open (override time restrictions)
// 'closed' = always closed
// 'default' = follow time-based rules (9 AM - 9 PM)
export async function setRestaurantOpenStatusFirestore(
  restaurantId: string,
  status: 'open' | 'closed' | 'default'
): Promise<Restaurant> {
  try {
    const db = getFirestore();
    const docRef = db.collection('restaurants').doc(restaurantId);
    const doc = await docRef.get();
    
    // Convert status to isOpen value for storage
    // 'open' -> true, 'closed' -> false, 'default' -> undefined (delete field)
    let isOpenValue: boolean | undefined;
    if (status === 'open') {
      isOpenValue = true;
    } else if (status === 'closed') {
      isOpenValue = false;
    } else {
      isOpenValue = undefined; // Will delete the field
    }
    
    if (!doc.exists) {
      // Restaurant doesn't exist in Firestore - check static restaurants and create it
      const { restaurants: staticRestaurants } = await import('@/data/restaurants');
      const staticRestaurant = staticRestaurants.find(r => r.id === restaurantId);
      
      if (!staticRestaurant) {
        throw new Error(`Restaurant not found: ${restaurantId}`);
      }
      
      // Create the restaurant in Firestore with the status
      const { id, ...data } = staticRestaurant;
      const saveData: any = { ...data, adminStatus: 'live' };
      if (isOpenValue !== undefined) {
        saveData.isOpen = isOpenValue;
      }
      await docRef.set(saveData);
      
      return { ...staticRestaurant, isOpen: isOpenValue };
    }
    
    // Update existing restaurant - use set with merge to avoid issues with missing fields
    const updateData: any = {};
    if (isOpenValue === undefined) {
      // For 'default', we need to delete the isOpen field
      // Use set with merge and FieldValue.delete()
      updateData.isOpen = admin.firestore.FieldValue.delete();
    } else {
      updateData.isOpen = isOpenValue;
    }
    
    await docRef.set(updateData, { merge: true });
    
    const restaurant = { id: doc.id, ...doc.data() } as Restaurant;
    return { ...restaurant, isOpen: isOpenValue };
  } catch (error: any) {
    console.error('setRestaurantOpenStatusFirestore error:', error);
    throw new Error(`Failed to update restaurant status: ${error.message}`);
  }
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

// Save menu directly (for admin edits - saves to live menu)
export async function saveMenuToFirestore(restaurantId: string, items: MenuItem[]): Promise<void> {
  const db = getFirestore();
  await db.collection('menus').doc(restaurantId).set({ 
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
  
  // Delete draft after publishing
  await db.collection('menus').doc(`${restaurantId}_draft`).delete();
}

// ============================================================
// MIGRATION HELPER - Import existing data to Firestore
// ============================================================
// ORDERS (Realtime Status Updates)
// ============================================================

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface FirestoreOrder {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  items: Array<{
    itemName: string;
    price: number;
    quantity: number;
    vegNonVeg: 'Veg' | 'Non-Veg';
  }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  subtotal: number;
  tax: number;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  fcmToken?: string;
  orderTime: string;
  updatedAt?: string;
}

// Save order to Firestore (called during checkout)
export async function saveOrderToFirestore(order: FirestoreOrder): Promise<void> {
  try {
    const db = getFirestore();
    await db.collection('orders').doc(order.orderId).set({
      ...order,
      updatedAt: new Date().toISOString(),
    });
    console.log('[Firestore] Order saved:', order.orderId);
  } catch (error) {
    console.error('[Firestore] Error saving order:', error);
    throw error;
  }
}

// Get order by ID
export async function getOrderFromFirestore(orderId: string): Promise<FirestoreOrder | null> {
  try {
    const db = getFirestore();
    const doc = await db.collection('orders').doc(orderId).get();
    
    if (!doc.exists) return null;
    
    const data = doc.data();
    return {
      orderId: doc.id,
      restaurantId: data?.restaurantId,
      restaurantName: data?.restaurantName,
      items: data?.items || [],
      customer: data?.customer || {},
      subtotal: data?.subtotal || 0,
      tax: data?.tax || 0,
      total: data?.total || 0,
      deliveryFee: data?.deliveryFee || 0,
      status: data?.status || 'pending',
      fcmToken: data?.fcmToken,
      orderTime: data?.orderTime,
      updatedAt: data?.updatedAt,
    } as FirestoreOrder;
  } catch (error) {
    console.error('[Firestore] Error getting order:', error);
    return null;
  }
}

// Update order status (Admin action)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const db = getFirestore();
    await db.collection('orders').doc(orderId).update({
      status,
      updatedAt: new Date().toISOString(),
    });
    console.log('[Firestore] Order status updated:', orderId, status);
    return true;
  } catch (error) {
    console.error('[Firestore] Error updating order status:', error);
    return false;
  }
}

// Get orders by phone number (for user order history)
export async function getOrdersByPhone(phone: string): Promise<FirestoreOrder[]> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('orders')
      .where('customer.phone', '==', phone)
      .orderBy('orderTime', 'desc')
      .limit(50)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        orderId: doc.id,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        items: data.items || [],
        customer: data.customer || {},
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        deliveryFee: data.deliveryFee || 0,
        status: data.status || 'pending',
        fcmToken: data.fcmToken,
        orderTime: data.orderTime,
        updatedAt: data.updatedAt,
      } as FirestoreOrder;
    });
  } catch (error) {
    console.error('[Firestore] Error getting orders by phone:', error);
    return [];
  }
}

// Get all orders for admin (with pagination)
export async function getAdminOrdersFromFirestore(
  limit: number = 50,
  status?: OrderStatus
): Promise<FirestoreOrder[]> {
  try {
    const db = getFirestore();
    let query = db.collection('orders').orderBy('orderTime', 'desc').limit(limit);
    
    if (status) {
      query = db.collection('orders')
        .where('status', '==', status)
        .orderBy('orderTime', 'desc')
        .limit(limit);
    }
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        orderId: doc.id,
        restaurantId: data.restaurantId,
        restaurantName: data.restaurantName,
        items: data.items || [],
        customer: data.customer || {},
        subtotal: data.subtotal || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        deliveryFee: data.deliveryFee || 0,
        status: data.status || 'pending',
        fcmToken: data.fcmToken,
        orderTime: data.orderTime,
        updatedAt: data.updatedAt,
      } as FirestoreOrder;
    });
  } catch (error) {
    console.error('[Firestore] Error getting admin orders:', error);
    return [];
  }
}

// ============================================================
// MIGRATION HELPERS
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
