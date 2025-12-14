import admin from 'firebase-admin';

// Initialize Firebase Admin SDK (server-side only)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // Use environment variables for Firebase Admin credentials
  // These should be set in Vercel dashboard for production
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const databaseId = process.env.FIREBASE_DATABASE_ID || '(default)';

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Firebase Admin SDK: Missing environment variables');
    console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
    throw new Error('Firebase Admin SDK initialization failed. Missing environment variables.');
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
      databaseId, // Explicitly specify database ID
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    throw new Error('Firebase Admin SDK initialization failed.');
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
