// Firebase client-side initialization
// Used for push notifications and admin authentication

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let messaging: any = null;

// Initialize Firebase app
function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client can only be used in browser');
  }
  
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

// Get Firebase Auth instance
export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

// Lazy load messaging (only when needed for push notifications)
export async function initializeMessaging() {
  if (typeof window === 'undefined') return null;
  
  try {
    const { getMessaging } = await import('firebase/messaging');
    const firebaseApp = getFirebaseApp();
    
    if ('serviceWorker' in navigator) {
      messaging = getMessaging(firebaseApp);
    }
    return messaging;
  } catch (error) {
    console.error('Firebase messaging initialization error:', error);
    return null;
  }
}

// Legacy exports for compatibility
export async function initializeFirebase() {
  if (typeof window === 'undefined') return { app: null, messaging: null };
  
  const firebaseApp = getFirebaseApp();
  await initializeMessaging();
  
  return { app: firebaseApp, messaging };
}

export const getFirebaseMessaging = () => messaging;
export { app, messaging };
