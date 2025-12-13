import { promises as fs } from 'fs';
import path from 'path';
import type { Restaurant } from '@/types';
import { restaurants as staticRestaurants } from '@/data/restaurants';

const DATA_DIR = path.join(process.cwd(), 'src/data');
const DRAFT_RESTAURANTS_FILE = path.join(DATA_DIR, 'draft-restaurants.json');
const LIVE_RESTAURANTS_FILE = path.join(DATA_DIR, 'live-restaurants.json');

// Ensure data directory exists
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// Get all draft restaurants
export async function getDraftRestaurants(): Promise<Restaurant[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DRAFT_RESTAURANTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Get all live dynamic restaurants
export async function getLiveDynamicRestaurants(): Promise<Restaurant[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(LIVE_RESTAURANTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
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
  // Items with priority come first, sorted by value.
  // Items without priority come last, sorted by name.
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

// Save a new draft restaurant
export async function saveDraftRestaurant(restaurant: Restaurant) {
  const drafts = await getDraftRestaurants();
  // Update if exists, else append
  const index = drafts.findIndex(r => r.id === restaurant.id);
  if (index >= 0) {
    drafts[index] = restaurant;
  } else {
    drafts.push(restaurant);
  }
  
  await ensureDataDir();
  await fs.writeFile(DRAFT_RESTAURANTS_FILE, JSON.stringify(drafts, null, 2));
}

// Publish a draft restaurant to live
export async function publishRestaurant(restaurantId: string) {
  const drafts = await getDraftRestaurants();
  const restaurant = drafts.find(r => r.id === restaurantId);
  
  if (!restaurant) {
    throw new Error('Draft restaurant not found');
  }

  // Check priority conflict before publishing
  if (restaurant.priority) {
    const conflict = await checkPriorityConflict(restaurant.priority, restaurantId);
    if (conflict) {
      throw new Error(`Priority ${restaurant.priority} is already taken by "${conflict.name}". Update priority before publishing.`);
    }
  }
  
  // Ensure status is live
  restaurant.adminStatus = 'live';
  
  // Get live list
  const live = await getLiveDynamicRestaurants();
  const index = live.findIndex(r => r.id === restaurantId);
  if (index >= 0) {
    live[index] = restaurant;
  } else {
    live.push(restaurant);
  }
  
  // Save live
  await fs.writeFile(LIVE_RESTAURANTS_FILE, JSON.stringify(live, null, 2));
  
  // Remove from draft
  const newDrafts = drafts.filter(r => r.id !== restaurantId);
  await fs.writeFile(DRAFT_RESTAURANTS_FILE, JSON.stringify(newDrafts, null, 2));
  
  return restaurant;
}

// Update restaurant status (live, archived, deleted)
export async function updateRestaurantStatus(restaurantId: string, status: 'live' | 'archived' | 'deleted') {
  let restaurant = await getRestaurantById(restaurantId);
  
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  // If activating, check priority conflict
  if (status === 'live' && restaurant.priority) {
    const conflict = await checkPriorityConflict(restaurant.priority, restaurantId);
    if (conflict) {
      throw new Error(`Cannot set to Live: Priority ${restaurant.priority} is already taken by "${conflict.name}". Change priority first.`);
    }
  }
  
  // Update status
  restaurant = { ...restaurant, adminStatus: status };
  
  // We need to save this to the live dynamic list to persist the status change
  // effectively overriding any static definition
  const live = await getLiveDynamicRestaurants();
  const index = live.findIndex(r => r.id === restaurantId);
  
  if (index >= 0) {
    live[index] = restaurant;
  } else {
    live.push(restaurant);
  }
  
  await ensureDataDir();
  await fs.writeFile(LIVE_RESTAURANTS_FILE, JSON.stringify(live, null, 2));
  
  return restaurant;
}

// Check if priority is taken by another restaurant
export async function checkPriorityConflict(priority: number, excludeId?: string): Promise<Restaurant | undefined> {
  const allRestaurants = await getAllRestaurants(true);
  return allRestaurants.find(r => r.priority === priority && r.id !== excludeId);
}

// Update restaurant priority
export async function updateRestaurantPriority(restaurantId: string, priority: number | null) {
  let restaurant = await getRestaurantById(restaurantId);
  
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  if (priority !== null) {
    const conflict = await checkPriorityConflict(priority, restaurantId);
    if (conflict) {
      throw new Error(`Priority ${priority} is already taken by "${conflict.name}". Remove it there first.`);
    }
  }
  
  // Update priority (undefined if null passed)
  restaurant = { ...restaurant, priority: priority === null ? undefined : priority };
  
  // We need to save this to the live dynamic list to persist the priority change
  // effectively overriding any static definition
  const live = await getLiveDynamicRestaurants();
  const index = live.findIndex(r => r.id === restaurantId);
  
  if (index >= 0) {
    live[index] = restaurant;
  } else {
    live.push(restaurant);
  }
  
  await ensureDataDir();
  await fs.writeFile(LIVE_RESTAURANTS_FILE, JSON.stringify(live, null, 2));
  
  return restaurant;
}

// Get a specific restaurant (live or draft)
export async function getRestaurantById(id: string): Promise<Restaurant | undefined> {
  // Check drafts first
  const drafts = await getDraftRestaurants();
  const draft = drafts.find(r => r.id === id);
  if (draft) return draft;
  
  // Check live dynamic
  const live = await getLiveDynamicRestaurants();
  const liveRes = live.find(r => r.id === id);
  if (liveRes) return liveRes;
  
  // Check static
  return staticRestaurants.find(r => r.id === id);
}

// Toggle restaurant open/close status (emergency override)
export async function toggleRestaurantOpen(restaurantId: string, isOpen: boolean): Promise<Restaurant> {
  let restaurant = await getRestaurantById(restaurantId);
  
  if (!restaurant) {
    throw new Error('Restaurant not found');
  }
  
  // Update isOpen status
  restaurant = { ...restaurant, isOpen };
  
  // Save to live dynamic list to persist the change
  const live = await getLiveDynamicRestaurants();
  const index = live.findIndex(r => r.id === restaurantId);
  
  if (index >= 0) {
    live[index] = restaurant;
  } else {
    live.push(restaurant);
  }
  
  await ensureDataDir();
  await fs.writeFile(LIVE_RESTAURANTS_FILE, JSON.stringify(live, null, 2));
  
  return restaurant;
}
