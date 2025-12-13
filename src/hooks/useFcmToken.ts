import { useEffect, useState } from 'react';
import { initializeFirebase } from '@/lib/firebase';

export function useFcmToken() {
  const [token, setToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Defer token retrieval to not block main thread
    const retrieveToken = async () => {
      try {
        // Only get token if already granted - don't request permission automatically
        const permission = Notification.permission;
        setNotificationPermission(permission);

        if (permission === 'granted') {
          // Lazy load Firebase only when needed
          const { messaging } = await initializeFirebase();
          if (!messaging) return;
          
          const { getToken } = await import('firebase/messaging');
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });

          if (currentToken) {
            setToken(currentToken);
            const savedToken = localStorage.getItem('fcm_token');
            if (savedToken !== currentToken) {
              localStorage.setItem('fcm_token', currentToken);
            }
          }
        }
      } catch (error) {
        console.error('An error occurred while retrieving token:', error);
      }
    };

    // Use requestIdleCallback to defer non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => retrieveToken(), { timeout: 5000 });
    } else {
      setTimeout(retrieveToken, 2000);
    }
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        // Lazy load Firebase only when needed
        const { messaging } = await initializeFirebase();
        if (!messaging) return;
        
        const { getToken } = await import('firebase/messaging');
        const currentToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        });
        if (currentToken) {
          setToken(currentToken);
          localStorage.setItem('fcm_token', currentToken);
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
  };

  return { token, notificationPermission, requestPermission };
}
