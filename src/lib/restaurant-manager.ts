/**
 * Restaurant Manager - Firestore-based
 * 
 * All restaurant data is now stored in Firebase Firestore for production compatibility.
 * Static restaurants from src/data/restaurants.ts are used as fallback/seed data.
 */

import type { Restaurant } from '@/types';
import { restaurants as staticRestaurants } from '@/data/restaurants';
import {
  getDraftRestaurants as getDraftRestaurantsFirestore,
  getLiveRestaurants as getLiveRestaurantsFirestore,
  getRestaurantByIdFromFirestore,
  saveDraftRestaurant as saveDraftRestaurantFirestore,
  publishRestaurantToFirestore,
  updateRestaurantStatusFirestore,
  updateRestaurantPriorityFirestore,
  toggleRestaurantOpenFirestore,
  checkPriorityConflictFirestore,
  saveRestaurant
} from './firestore';

// Get all draft restaurants
export async function getDraftRestaurants(): Promise<Restaurant[]> {
  return getDraftRestaurantsFirestore();
}

// Get all live dynamic restaurants from Firestore
export async function getLiveDynamicRestaurants(): Promise<Restaurant[]> {
  return getLiveRestaurantsFirestore();
}

// Get ALL live restaurants (static + dynamic), filtering out deleted ones for public view
export async function getAllRestaurants(includeHidden = false): Promise<Restaurant[]> {
  const dynamic = await getLiveDynamicRestaurants();
  const dynamicIds = new Set(dynamic.map(r => r.id));
  
  // Static restaurants that haven't been overridden by dynamic ones
  const activeStatic = staticRestaurants.filter(r => !dynamicIds.has(r.id));
  
  // Combine
  const all = [...activeStatic, ...dynamic];
  
  // Sort by priority (ascending: 1, 2, 3...)
  all.sort((a, b) => {
    if (a.priority !== undefined && b.priority !== undefined) {
      return a.priority - b.priority;
    }
    if (a.priority !== undefined) return -1;
    if (b.priority !== undefined) return 1;
    return a.name.localeCompare(b.name);
  });
  
  if (includeHidden) {
    return all;
  }
  
  // Filter out deleted and archived for public view
  return all.filter(r => r.adminStatus !== 'deleted' && r.adminStatus !== 'archived');
}

// Save a new draft restaurant to Firestore
export async function saveDraftRestaurant(restaurant: Restaurant): Promise<void> {
  await saveDraftRestaurantFirestore(restaurant);
}

// Publish a draft restaurant to live
export async function publishRestaurant(restaurantId: string): Promise<Restaurant> {
  return publishRestaurantToFirestore(restaurantId);
}

// Update restaurant status (live, archived, deleted)
export async function updateRestaurantStatus(
  restaurantId: string, 
  status: 'live' | 'archived' | 'deleted'
): Promise<Restaurant> {
  return updateRestaurantStatusFirestore(restaurantId, status);
}

// Check if priority is taken by another restaurant
export async function checkPriorityConflict(
  priority: number, 
  excludeId?: string
): Promise<Restaurant | undefined> {
  return checkPriorityConflictFirestore(priority, excludeId);
}

// Update restaurant priority
export async function updateRestaurantPriority(
  restaurantId: string, 
  priority: number | null
): Promise<Restaurant> {
  return updateRestaurantPriorityFirestore(restaurantId, priority);
}

// Get a specific restaurant (Firestore first, then static fallback)
export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  // Check Firestore first
  const firestoreRestaurant = await getRestaurantByIdFromFirestore(id);
  if (firestoreRestaurant) return firestoreRestaurant;
  
  // Fallback to static
  return staticRestaurants.find(r => r.id === id);
}

// Toggle restaurant open/close status (emergency override)
export async function toggleRestaurantOpen(
  restaurantId: string, 
  isOpen: boolean
): Promise<Restaurant> {
  return toggleRestaurantOpenFirestore(restaurantId, isOpen);
}
