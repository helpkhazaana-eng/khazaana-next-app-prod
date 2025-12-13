import { promises as fs } from 'fs';
import path from 'path';
import type { MenuItem } from '@/types';
import { logger, perfMonitor } from './logger';

const DATA_DIR = path.join(process.cwd(), 'src/data/menus-json');

export async function getMenu(restaurantId: string, type: 'live' | 'draft' = 'live'): Promise<MenuItem[]> {
  const metricName = `getMenu:${restaurantId}:${type}`;
  perfMonitor.start(metricName);
  try {
    const filename = type === 'draft' ? `${restaurantId}.draft.json` : `${restaurantId}.json`;
    const filePath = path.join(DATA_DIR, filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      if (type === 'draft') return []; // Draft might not exist
      logger.warn(`Menu JSON not found for ${restaurantId} (${type}), falling back to empty array`, undefined, 'DATA_ACCESS');
      return [];
    }

    const fileContent = await fs.readFile(filePath, 'utf-8');
    const menuItems = JSON.parse(fileContent) as MenuItem[];
    
    perfMonitor.end(metricName);
    return menuItems;
  } catch (error) {
    logger.error(`Failed to load menu for ${restaurantId} (${type})`, error as Error, 'DATA_ACCESS');
    perfMonitor.end(metricName);
    return [];
  }
}

export async function hasDraft(restaurantId: string): Promise<boolean> {
  try {
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
