'use server';

import { getAdminUsers, logNotification } from '@/lib/googleSheets';
import { requireAdmin } from '@/lib/auth';
import { sendPushNotificationToMany, sendTopicNotification } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

export interface SendNotificationState {
  success: boolean;
  message: string;
  errors?: string[];
}

export async function sendPushNotification(prevState: SendNotificationState, formData: FormData): Promise<SendNotificationState> {
  await requireAdmin();
  const title = formData.get('title') as string;
  const body = formData.get('body') as string;
  const target = formData.get('target') as 'all' | 'user' | 'topic';
  const targetId = formData.get('targetId') as string;
  const link = formData.get('link') as string;

  if (!title || !body) {
    return { success: false, message: 'Title and body are required' };
  }

  try {
    let successCount = 0;
    let failureCount = 0;
    let errors: string[] = [];

    // 1. Send via Firebase
    if (target === 'all') {
      // Fetch all users with valid tokens
      const usersData = await getAdminUsers();
      const tokens = usersData.users
        .map(u => u.fcmToken)
        .filter((t): t is string => !!t && t.length > 10);

      if (tokens.length > 0) {
        const result = await sendPushNotificationToMany(tokens, title, body, { url: link || '/' });
        successCount = result.successCount;
        failureCount = result.failureCount;
        errors = result.errors;
      }
    } else if (target === 'topic') {
      const result = await sendTopicNotification(targetId || 'all', title, body, { url: link || '/' });
      if (result.success) {
        successCount = 1;
      } else {
        failureCount = 1;
        errors.push(result.error || 'Failed to send to topic');
      }
    } else if (target === 'user') {
        const usersData = await getAdminUsers();
        const user = usersData.users.find(u => u.userId === targetId);
        
        if (user && user.fcmToken) {
            const result = await sendPushNotificationToMany([user.fcmToken], title, body, { url: link || '/' });
            successCount = result.successCount;
            failureCount = result.failureCount;
            errors = result.errors;
        } else {
            return { success: false, message: 'User not found or has no push token registered' };
        }
    }

    // 2. Log to Google Sheets
    await logNotification({
      title,
      body,
      target: target || 'all',
      targetId: targetId || '',
      status: failureCount === 0 && successCount > 0 ? 'sent' : successCount > 0 ? 'sent' : 'failed',
      sentAt: new Date().toISOString(),
      sentBy: 'Admin', 
      successCount,
      failureCount,
      error: errors.join(', ').substring(0, 1000) 
    });

    revalidatePath('/admin/notifications');
    
    if (successCount === 0 && failureCount > 0) {
        return { 
            success: false, 
            message: `Failed to send to all ${failureCount} devices.`,
            errors 
        };
    }

    return { 
        success: true, 
        message: `Successfully sent to ${successCount} devices${failureCount > 0 ? `, ${failureCount} failed` : ''}` 
    };

  } catch (error) {
    console.error('Send notification error:', error);
    return { success: false, message: 'Internal server error: ' + (error as Error).message };
  }
}
