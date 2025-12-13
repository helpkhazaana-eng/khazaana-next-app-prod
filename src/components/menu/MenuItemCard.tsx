'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import type { MenuItem } from '@/types';
import { cn } from '@/lib/utils';
import { useTimeManager } from '@/hooks/useTimeManager';
import { m } from 'framer-motion';

interface MenuItemProps {
  item: MenuItem;
  restaurantId: string;
  restaurantName: string;
  opensAt?: string;
  closesAt?: string;
  index?: number;
}

export default function MenuItemCard({ 
  item, 
  restaurantId, 
  restaurantName, 
  opensAt = '09:00',
  closesAt = '21:00',
  index = 0
}: MenuItemProps) {
  const [quantity, setQuantity] = useState(0);
  const timeData = useTimeManager();
  
  // Calculate real-time open status
  const currentMinutes = timeData.istHour * 60 + timeData.istMinute;
  const [openHour, openMin] = opensAt.split(':').map(Number);
  const [closeHour, closeMin] = closesAt.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;

  // Sync quantity with cart from localStorage on mount and updates
  useEffect(() => {
    const updateQuantity = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('khazaana_cart') || '{"items":[]}');
        if (cart.restaurantId === restaurantId) {
          const cartItem = cart.items.find((i: any) => i.itemName === item.itemName);
          setQuantity(cartItem ? cartItem.quantity : 0);
        } else {
          setQuantity(0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    updateQuantity();
    window.addEventListener('cartUpdated', updateQuantity);
    window.addEventListener('storage', updateQuantity);

    return () => {
      window.removeEventListener('cartUpdated', updateQuantity);
      window.removeEventListener('storage', updateQuantity);
    };
  }, [restaurantId, item.itemName]);
  
  const handleAdd = () => {
    if (!isOpen) {
      alert('Restaurant is currently closed.');
      return;
    }
    
    // Optimistic update
    setQuantity(prev => prev + 1);
    
    // Add to cart logic
    const currentCart = JSON.parse(localStorage.getItem('khazaana_cart') || '{"items":[]}');
    
    // Check if cart has items from another restaurant
    if (currentCart.restaurantId && currentCart.restaurantId !== restaurantId && currentCart.items.length > 0) {
      if (!confirm(`Your cart contains items from ${currentCart.restaurantName}. Reset cart to add items from ${restaurantName}?`)) {
        // Revert optimistic update
        setQuantity(prev => prev - 1);
        return;
      }
      currentCart.items = [];
    }
    
    // Add item
    currentCart.restaurantId = restaurantId;
    currentCart.restaurantName = restaurantName;
    
    const existingItemIndex = currentCart.items.findIndex((i: any) => i.itemName === item.itemName);
    if (existingItemIndex >= 0) {
      currentCart.items[existingItemIndex].quantity += 1;
    } else {
      currentCart.items.push({
        ...item,
        quantity: 1,
        restaurantId,
        restaurantName
      });
    }
    
    localStorage.setItem('khazaana_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };
  
  const handleRemove = () => {
    if (quantity === 0) return;
    
    // Optimistic update
    setQuantity(prev => prev - 1);
    
    // Remove from cart logic
    const currentCart = JSON.parse(localStorage.getItem('khazaana_cart') || '{"items":[]}');
    const existingItemIndex = currentCart.items.findIndex((i: any) => i.itemName === item.itemName);
    
    if (existingItemIndex >= 0) {
      if (currentCart.items[existingItemIndex].quantity > 1) {
        currentCart.items[existingItemIndex].quantity -= 1;
      } else {
        currentCart.items.splice(existingItemIndex, 1);
      }
      
      if (currentCart.items.length === 0) {
        currentCart.restaurantId = null;
        currentCart.restaurantName = null;
      }
      
      localStorage.setItem('khazaana_cart', JSON.stringify(currentCart));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  return (
    <m.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg transition-all flex flex-col h-full relative overflow-hidden group"
    >
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500 opacity-60"></div>

      <div className="flex justify-between items-start gap-3 mb-3 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0",
              item.vegNonVeg === 'Non-Veg' ? "border-red-500" : "border-green-500"
            )} aria-label={item.vegNonVeg}>
                <span className={cn(
                    "w-2 h-2 rounded-full",
                    item.vegNonVeg === 'Non-Veg' ? "bg-red-500" : "bg-green-500"
                )}></span>
            </span>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{item.vegNonVeg === 'Non-Veg' ? 'Non-Veg' : 'Veg'}</span>
          </div>
          <h4 className="font-extrabold text-slate-900 text-lg leading-tight mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {item.itemName}
          </h4>
          <p className="font-bold text-slate-900 text-base">₹{item.price}</p>
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-slate-500 mb-5 line-clamp-2 relative z-10 font-medium leading-relaxed">{item.description}</p>
      )}
      
      <div className="mt-auto pt-2 relative z-10">
        {quantity === 0 ? (
          <button 
            onClick={handleAdd}
            disabled={!isOpen}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 border",
              isOpen 
                ? "bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300" 
                : "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200"
            )}
          >
            <ShoppingBag className="w-4 h-4" />
            Add to Cart
          </button>
        ) : (
          <div className="flex items-center justify-between bg-orange-50 rounded-xl border border-orange-200 p-1">
            <button 
              onClick={handleRemove}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white text-orange-600 shadow-sm hover:scale-105 transition-transform"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-bold text-orange-700 text-base px-2">{quantity}</span>
            <button 
              onClick={handleAdd}
              disabled={!isOpen}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </m.div>
  );
}
