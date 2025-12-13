'use client';

import { useState, useEffect } from 'react';
import { getOrderHistory } from '@/lib/cart';
import type { Order } from '@/types';

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from order history
    const history = getOrderHistory();
    if (history.length > 0) {
      // Use the most recent order's customer info
      const lastOrder = history[0];
      if (lastOrder.customer) {
        setUser({
          name: lastOrder.customer.name,
          phone: lastOrder.customer.phone,
          email: lastOrder.customer.email,
          address: lastOrder.customer.address
        });
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
}
