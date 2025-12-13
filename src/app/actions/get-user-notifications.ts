'use server';

import { getUserNotifications } from '@/lib/googleSheets';

export async function fetchUserNotifications(userId: string) {
  try {
    const data = await getUserNotifications(userId);
    return { success: true, notifications: data.notifications || [] };
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return { success: false, notifications: [] };
  }
}
