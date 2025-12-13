// Lazy load Firebase to reduce initial bundle size
// Firebase is only needed for push notifications

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: any = null;
let messaging: any = null;
let isInitialized = false;

// Lazy initialization function - call this when Firebase is actually needed
export async function initializeFirebase() {
  if (isInitialized || typeof window === 'undefined' || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return { app, messaging };
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getMessaging } = await import('firebase/messaging');
    
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    // Messaging is only supported in environments with a Service Worker (browser)
    if ('serviceWorker' in navigator) {
      messaging = getMessaging(app);
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
  
  return { app, messaging };
}

// Export getters that lazily initialize
export const getFirebaseApp = () => app;
export const getFirebaseMessaging = () => messaging;
export { app, messaging };
