'use client';

import { useEffect } from 'react';
import { useFcmToken } from '@/hooks/useFcmToken';
import { initializeFirebase } from '@/lib/firebase';

export default function NotificationManager() {
  const { token, notificationPermission } = useFcmToken();

  useEffect(() => {
    // Defer Firebase initialization to not block main thread
    const setupMessaging = async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
      
      try {
        const { app, messaging } = await initializeFirebase();
        if (!app || !messaging) return;
        
        // Dynamically import onMessage only when needed
        const { onMessage } = await import('firebase/messaging');
        
        const unsubscribe = onMessage(messaging, (payload: any) => {
          // Show browser notification if allowed
          if (Notification.permission === 'granted') {
            new Notification(payload.notification?.title || 'Khazaana Update', {
              body: payload.notification?.body,
              icon: '/images/logo.png',
            });
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to setup messaging:', error);
      }
    };

    // Use requestIdleCallback to defer non-critical initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setupMessaging(), { timeout: 5000 });
    } else {
      setTimeout(setupMessaging, 2000);
    }
  }, []);

  return null; // This component doesn't render anything visible
}
