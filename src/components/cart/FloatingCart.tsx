'use client';

import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';
import { getCart } from '@/lib/cart';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnimatePresence, m } from 'framer-motion';

export default function FloatingCart() {
  const count = useCartCount();
  const [subtotal, setSubtotal] = useState(0);
  const [restaurantName, setRestaurantName] = useState('');

  useEffect(() => {
    const updateCartInfo = () => {
      const cart = getCart();
      setSubtotal(cart.subtotal);
      setRestaurantName(cart.restaurantName || '');
    };

    updateCartInfo();
    window.addEventListener('cartUpdated', updateCartInfo);
    window.addEventListener('storage', updateCartInfo);

    return () => {
      window.removeEventListener('cartUpdated', updateCartInfo);
      window.removeEventListener('storage', updateCartInfo);
    };
  }, [count]);

  // Don't show if empty or on cart/checkout pages (simple heuristic)
  if (count === 0) return null;

  return (
    <AnimatePresence>
      {count > 0 && (
        <m.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-40 md:hidden"
        >
          <Link href="/cart">
            <div className="bg-orange-600 text-white rounded-xl shadow-xl shadow-orange-600/30 p-4 flex items-center justify-between border border-orange-500 backdrop-blur-xl">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs font-bold text-orange-100 uppercase tracking-wider">
                  <span>{count} ITEMS</span>
                  <span className="w-1 h-1 bg-orange-200 rounded-full" />
                  <span className="truncate max-w-[120px]">{restaurantName}</span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  ₹{subtotal.toFixed(0)} <span className="text-xs font-medium text-orange-100 opacity-90">plus taxes</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 font-bold text-sm bg-white/20 px-4 py-2.5 rounded-lg hover:bg-white/30 transition-colors">
                View Cart
                <ShoppingBag className="w-4 h-4 fill-current" />
              </div>
            </div>
          </Link>
        </m.div>
      )}
    </AnimatePresence>
  );
}
