import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (server-side only)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Load service account from JSON file in project root
  // This file should NOT be committed to git
  try {
    const serviceAccount = require('../../khazaana-app-firebase-adminsdk-fbsvc-1c9747965b.json');
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Firebase Admin SDK initialization failed. Ensure the service account JSON file exists.');
  }
}

// Get the admin app instance
export function getFirebaseAdmin() {
  return initializeFirebaseAdmin();
}

// Get messaging instance
export function getMessaging() {
  getFirebaseAdmin();
  return admin.messaging();
}

// Send push notification to a single device
export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const messaging = getMessaging();
    
    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Failed to send push notification:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}

// Send push notification to multiple devices
export async function sendPushNotificationToMany(
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  if (fcmTokens.length === 0) {
    return { successCount: 0, failureCount: 0, errors: [] };
  }

  try {
    const messaging = getMessaging();
    
    const message: admin.messaging.MulticastMessage = {
      tokens: fcmTokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await messaging.sendEachForMulticast(message);
    
    const errors: string[] = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error) {
        errors.push(`Token ${idx}: ${resp.error.message}`);
      }
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors,
    };
  } catch (error: any) {
    console.error('Failed to send multicast notification:', error);
    return { successCount: 0, failureCount: fcmTokens.length, errors: [error.message] };
  }
}

// Send topic notification (for broadcast to all subscribed users)
export async function sendTopicNotification(
  topic: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const messaging = getMessaging();
    
    const message: admin.messaging.Message = {
      topic,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: '/',
        },
      },
    };

    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error('Failed to send topic notification:', error);
    return { success: false, error: error.message || 'Unknown error' };
  }
}
