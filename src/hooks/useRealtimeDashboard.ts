'use client';

import { useState, useEffect, useRef } from 'react';

export interface RealtimeDashboardStats {
  totalOrders: number;
  activeOrders: number; // pending + confirmed
  pendingOrders: number;
  confirmedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

const DEFAULT_STATS: RealtimeDashboardStats = {
  totalOrders: 0,
  activeOrders: 0,
  pendingOrders: 0,
  confirmedOrders: 0,
  deliveredOrders: 0,
  cancelledOrders: 0,
  totalRevenue: 0,
  todayOrders: 0,
  todayRevenue: 0,
};

// Cache Firebase modules to avoid repeated dynamic imports
let firestoreModuleCache: typeof import('firebase/firestore') | null = null;
let appModuleCache: typeof import('firebase/app') | null = null;

async function getFirestoreWithListener() {
  // Import both modules in parallel for speed
  const [appModule, firestoreModule] = await Promise.all([
    appModuleCache ? Promise.resolve(appModuleCache) : import('firebase/app'),
    firestoreModuleCache ? Promise.resolve(firestoreModuleCache) : import('firebase/firestore'),
  ]);
  
  // Cache for future calls
  appModuleCache = appModule;
  firestoreModuleCache = firestoreModule;
  
  const { initializeApp, getApps } = appModule;
  const { getFirestore, collection, onSnapshot, query, orderBy } = firestoreModule;
  
  // Initialize app if needed
  let app;
  if (!getApps().length) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
  } else {
    app = getApps()[0];
  }
  
  const firestore = getFirestore(app);
  return { firestore, collection, onSnapshot, query, orderBy };
}

/**
 * Hook to listen to orders collection in real-time for admin dashboard
 * Updates automatically when new orders come in or status changes
 */
export function useRealtimeDashboard() {
  const [stats, setStats] = useState<RealtimeDashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const setupStarted = useRef(false);

  useEffect(() => {
    // Prevent double setup in strict mode
    if (setupStarted.current) return;
    setupStarted.current = true;
    
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const { firestore, collection, onSnapshot, query, orderBy } = await getFirestoreWithListener();
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, orderBy('orderTime', 'desc'));

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            // Calculate stats from all orders
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

            let totalOrders = 0;
            let pendingOrders = 0;
            let confirmedOrders = 0;
            let deliveredOrders = 0;
            let cancelledOrders = 0;
            let totalRevenue = 0;
            let todayOrders = 0;
            let todayRevenue = 0;

            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              const status = data.status || 'pending';
              const total = data.total || 0;
              const orderTime = data.orderTime || '';

              totalOrders++;
              totalRevenue += total;

              // Count by status
              switch (status.toLowerCase()) {
                case 'pending':
                  pendingOrders++;
                  break;
                case 'confirmed':
                  confirmedOrders++;
                  break;
                case 'delivered':
                  deliveredOrders++;
                  break;
                case 'cancelled':
                  cancelledOrders++;
                  break;
              }

              // Today's orders
              if (orderTime >= todayStart) {
                todayOrders++;
                todayRevenue += total;
              }
            });

            setStats({
              totalOrders,
              activeOrders: pendingOrders + confirmedOrders,
              pendingOrders,
              confirmedOrders,
              deliveredOrders,
              cancelledOrders,
              totalRevenue,
              todayOrders,
              todayRevenue,
            });
            setLastUpdate(new Date());
            setLoading(false);
          },
          (err) => {
            console.error('Dashboard listener error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to setup dashboard listener:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return { stats, loading, error, lastUpdate };
}
