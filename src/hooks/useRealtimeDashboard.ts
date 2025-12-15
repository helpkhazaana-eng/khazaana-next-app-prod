'use client';

import { useState, useEffect } from 'react';
import { getClientFirestore } from '@/lib/firebase';

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

/**
 * Hook to listen to orders collection in real-time for admin dashboard
 * Updates automatically when new orders come in or status changes
 */
export function useRealtimeDashboard() {
  const [stats, setStats] = useState<RealtimeDashboardStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const firestore = await getClientFirestore();
        if (!firestore) {
          setError('Firestore not available');
          setLoading(false);
          return;
        }

        const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
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
