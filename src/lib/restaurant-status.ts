/**
 * Centralized Restaurant Open Status Logic
 * 
 * This module provides a single source of truth for determining if a restaurant
 * is open for orders. It handles:
 * 
 * 1. Admin Override (isOpen field in Firestore):
 *    - isOpen === true  → Restaurant is OPEN (overrides time)
 *    - isOpen === false → Restaurant is CLOSED (overrides time)
 *    - isOpen === undefined → Follow time-based rules (DEFAULT)
 * 
 * 2. Time-based Rules (when isOpen is undefined):
 *    - Open: 9:00 AM - 9:00 PM IST
 *    - Closed: Outside these hours
 * 
 * 3. Global Override (from system config):
 *    - Can force all restaurants open/closed (emergency use)
 */

import { RESTAURANT_TIMINGS } from '@/data/restaurants';

export type RestaurantOpenState = 'open' | 'closed' | 'default';

export interface RestaurantStatusResult {
  isOpen: boolean;
  reason: 'admin_open' | 'admin_closed' | 'time_open' | 'time_closed' | 'global_override';
  message: string;
  canOrder: boolean;
}

/**
 * Determine if a restaurant is open based on admin override and time
 * 
 * @param restaurantIsOpen - The isOpen field from the restaurant document
 *   - true: Admin set to OPEN (override time)
 *   - false: Admin set to CLOSED (override time)
 *   - undefined: Follow time-based rules (DEFAULT)
 * @param currentTimeData - Optional time data from useTimeManager hook
 * @returns RestaurantStatusResult with isOpen status and reason
 */
export function getRestaurantOpenStatus(
  restaurantIsOpen: boolean | undefined,
  currentTimeData?: { isOpen: boolean; overrideStatus?: 'open' | 'closed' | 'auto' | null }
): RestaurantStatusResult {
  // 1. Check admin per-restaurant override first (highest priority)
  if (restaurantIsOpen === true) {
    return {
      isOpen: true,
      reason: 'admin_open',
      message: 'Restaurant is open (admin override)',
      canOrder: true
    };
  }
  
  if (restaurantIsOpen === false) {
    return {
      isOpen: false,
      reason: 'admin_closed',
      message: 'Restaurant is closed (admin override)',
      canOrder: false
    };
  }
  
  // 2. No admin override - check time-based rules
  const isTimeOpen = currentTimeData?.isOpen ?? checkTimeBasedOpen();
  
  // 3. Check global override (from system config)
  if (currentTimeData?.overrideStatus === 'open') {
    return {
      isOpen: true,
      reason: 'global_override',
      message: 'All restaurants are open (system override)',
      canOrder: true
    };
  }
  
  if (currentTimeData?.overrideStatus === 'closed') {
    return {
      isOpen: false,
      reason: 'global_override',
      message: 'All restaurants are closed (system override)',
      canOrder: false
    };
  }
  
  // 4. Return time-based status
  if (isTimeOpen) {
    return {
      isOpen: true,
      reason: 'time_open',
      message: `Open until ${formatTime(RESTAURANT_TIMINGS.closesAt)}`,
      canOrder: true
    };
  }
  
  return {
    isOpen: false,
    reason: 'time_closed',
    message: `Opens at ${formatTime(RESTAURANT_TIMINGS.opensAt)}`,
    canOrder: false
  };
}

/**
 * Check if current time is within operating hours (9 AM - 9 PM IST)
 */
function checkTimeBasedOpen(): boolean {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const istOffset = 5.5 * 60; // minutes
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const istMinutes = utcMinutes + istOffset;
  const istHours = Math.floor((istMinutes % (24 * 60)) / 60);
  
  const opensAt = parseInt(RESTAURANT_TIMINGS.opensAt.split(':')[0]);
  const closesAt = parseInt(RESTAURANT_TIMINGS.closesAt.split(':')[0]);
  
  return istHours >= opensAt && istHours < closesAt;
}

/**
 * Format time string for display
 */
function formatTime(time: string): string {
  const [hours] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:00 ${period}`;
}

/**
 * Convert admin isOpen field to status string
 */
export function getStatusFromIsOpen(isOpen: boolean | undefined): RestaurantOpenState {
  if (isOpen === true) return 'open';
  if (isOpen === false) return 'closed';
  return 'default';
}

/**
 * Convert status string to isOpen field value
 */
export function getIsOpenFromStatus(status: RestaurantOpenState): boolean | undefined {
  if (status === 'open') return true;
  if (status === 'closed') return false;
  return undefined;
}
