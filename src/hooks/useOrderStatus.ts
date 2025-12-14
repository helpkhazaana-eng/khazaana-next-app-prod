'use client';

import { useState, useEffect } from 'react';
import { getClientFirestore } from '@/lib/firebase';

export type OrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';

export interface RealtimeOrder {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  items: Array<{
    itemName: string;
    price: number;
    quantity: number;
    vegNonVeg: 'Veg' | 'Non-Veg';
  }>;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
  };
  subtotal: number;
  tax: number;
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  orderTime: string;
  updatedAt?: string;
}

// Hook to listen to a single order's status in realtime
export function useOrderStatus(orderId: string | null) {
  const [order, setOrder] = useState<RealtimeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const firestore = await getClientFirestore();
        if (!firestore) {
          setError('Firestore not available');
          setLoading(false);
          return;
        }

        const { doc, onSnapshot } = await import('firebase/firestore');
        const orderRef = doc(firestore, 'orders', orderId);

        unsubscribe = onSnapshot(
          orderRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setOrder({
                orderId: snapshot.id,
                restaurantId: data.restaurantId,
                restaurantName: data.restaurantName,
                items: data.items || [],
                customer: data.customer || {},
                subtotal: data.subtotal || 0,
                tax: data.tax || 0,
                total: data.total || 0,
                deliveryFee: data.deliveryFee || 0,
                status: data.status || 'pending',
                orderTime: data.orderTime,
                updatedAt: data.updatedAt,
              });
            } else {
              setOrder(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Order listener error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to setup order listener:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [orderId]);

  return { order, loading, error };
}

// Hook to listen to multiple orders by phone number
export function useOrdersByPhone(phone: string | null) {
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const firestoreDb = await getClientFirestore();
        if (!firestoreDb) {
          setError('Firestore not available');
          setLoading(false);
          return;
        }

        const { collection, query, where, orderBy, limit, onSnapshot } = await import('firebase/firestore');
        const ordersRef = collection(firestoreDb, 'orders');
        const q = query(
          ordersRef,
          where('customer.phone', '==', phone),
          orderBy('orderTime', 'desc'),
          limit(50)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const ordersList: RealtimeOrder[] = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                orderId: doc.id,
                restaurantId: data.restaurantId,
                restaurantName: data.restaurantName,
                items: data.items || [],
                customer: data.customer || {},
                subtotal: data.subtotal || 0,
                tax: data.tax || 0,
                total: data.total || 0,
                deliveryFee: data.deliveryFee || 0,
                status: data.status || 'pending',
                orderTime: data.orderTime,
                updatedAt: data.updatedAt,
              };
            });
            setOrders(ordersList);
            setLoading(false);
          },
          (err) => {
            console.error('Orders listener error:', err);
            setError(err.message);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error('Failed to setup orders listener:', err);
        setError((err as Error).message);
        setLoading(false);
      }
    };

    setupListener();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [phone]);

  return { orders, loading, error };
}
