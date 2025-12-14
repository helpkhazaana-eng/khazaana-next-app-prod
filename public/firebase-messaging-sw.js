// Firebase Messaging Service Worker
// Handles background push notifications for Khazaana app
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCGmXqEIfyrB3bgZthZ5-Tkuzv93AqLHrk",
  authDomain: "khazaana-app.firebaseapp.com",
  projectId: "khazaana-app",
  storageBucket: "khazaana-app.appspot.com",
  messagingSenderId: "48257777320",
  appId: "1:48257777320:web:a8fe6d7a63b649995a8c9d",
});

const messaging = firebase.messaging();

// Handle background messages with enhanced notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[FCM] Background message received:', payload);
  
  const { notification, data } = payload;
  
  // Build notification options
  const notificationTitle = notification?.title || 'Khazaana';
  const notificationOptions = {
    body: notification?.body || 'You have a new notification',
    icon: '/android-chrome-192x192.png',
    badge: '/favicon-32x32.png',
    tag: data?.orderId || 'khazaana-notification',
    renotify: true,
    requireInteraction: data?.requireInteraction === 'true',
    vibrate: [200, 100, 200],
    data: {
      url: data?.url || '/',
      orderId: data?.orderId,
      status: data?.status,
      timestamp: Date.now(),
    },
    actions: getNotificationActions(data?.status),
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Get contextual actions based on notification type
function getNotificationActions(status) {
  if (status === 'confirmed') {
    return [
      { action: 'view', title: '📋 View Order', icon: '/favicon-32x32.png' },
      { action: 'track', title: '🚀 Track', icon: '/favicon-32x32.png' },
    ];
  } else if (status === 'delivered') {
    return [
      { action: 'view', title: '📋 View Order', icon: '/favicon-32x32.png' },
      { action: 'reorder', title: '🔄 Reorder', icon: '/favicon-32x32.png' },
    ];
  }
  return [
    { action: 'view', title: '📋 View', icon: '/favicon-32x32.png' },
  ];
}

// Handle notification click - deep link to relevant page
self.addEventListener('notificationclick', (event) => {
  console.log('[FCM] Notification clicked:', event);
  
  event.notification.close();
  
  const { action } = event;
  const { url, orderId } = event.notification.data || {};
  
  let targetUrl = '/';
  
  if (action === 'view' || action === 'track') {
    targetUrl = url || '/history';
  } else if (action === 'reorder' && orderId) {
    targetUrl = `/history?reorder=${orderId}`;
  } else if (url) {
    targetUrl = url;
  }
  
  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes('khazaana') && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[FCM] Notification closed:', event.notification.tag);
});
