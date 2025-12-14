/**
 * Data Access - Firestore-based
 * 
 * Menu data is now stored in Firebase Firestore for production compatibility.
 * Falls back to local JSON files for development/migration purposes.
 */

import { promises as fs } from 'fs';
import path from 'path';
import type { MenuItem } from '@/types';
import { logger, perfMonitor } from './logger';
import { getMenuFromFirestore, getDraftMenuFromFirestore } from './firestore';

const DATA_DIR = path.join(process.cwd(), 'src/data/menus-json');

export async function getMenu(restaurantId: string, type: 'live' | 'draft' = 'live'): Promise<MenuItem[]> {
  const metricName = `getMenu:${restaurantId}:${type}`;
  perfMonitor.start(metricName);
  
  try {
    // Try Firestore first
    let menuItems: MenuItem[];
    
    if (type === 'draft') {
      menuItems = await getDraftMenuFromFirestore(restaurantId);
    } else {
      menuItems = await getMenuFromFirestore(restaurantId);
    }
    
    // If Firestore has data, return it
    if (menuItems.length > 0) {
      perfMonitor.end(metricName);
      return menuItems;
    }
    
    // Fallback to local JSON files (for migration/development)
    const filename = type === 'draft' ? `${restaurantId}.draft.json` : `${restaurantId}.json`;
    const filePath = path.join(DATA_DIR, filename);
    
    try {
      await fs.access(filePath);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      menuItems = JSON.parse(fileContent) as MenuItem[];
      perfMonitor.end(metricName);
      return menuItems;
    } catch {
      if (type === 'draft') return [];
      logger.warn(`Menu not found for ${restaurantId} (${type}) in Firestore or local files`, undefined, 'DATA_ACCESS');
      return [];
    }
  } catch (error) {
    logger.error(`Failed to load menu for ${restaurantId} (${type})`, error as Error, 'DATA_ACCESS');
    perfMonitor.end(metricName);
    return [];
  }
}

export async function hasDraft(restaurantId: string): Promise<boolean> {
  try {
    // Check Firestore first
    const draftItems = await getDraftMenuFromFirestore(restaurantId);
    if (draftItems.length > 0) return true;
    
    // Fallback to local file check
    const filePath = path.join(DATA_DIR, `${restaurantId}.draft.json`);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function groupByCategory(items: MenuItem[]): Record<string, MenuItem[]> {
  return items.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);
}
