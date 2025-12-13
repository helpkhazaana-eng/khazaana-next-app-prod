'use client';

import { useState, useEffect } from 'react';

export function useCartCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      try {
        const cart = localStorage.getItem('khazaana_cart');
        if (cart) {
          const cartData = JSON.parse(cart);
          const totalItems = cartData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
          setCount(totalItems);
        } else {
          setCount(0);
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCount(0);
      }
    };

    // Initial count
    updateCount();

    // Listen for events
    window.addEventListener('storage', updateCount);
    window.addEventListener('cartUpdated', updateCount);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('cartUpdated', updateCount);
    };
  }, []);

  return count;
}
