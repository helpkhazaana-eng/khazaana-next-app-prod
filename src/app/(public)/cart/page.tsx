'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Trash2, ShoppingCart, Minus, Plus } from 'lucide-react';
import { getCart, updateQuantity, removeFromCart } from '@/lib/cart';
import type { Cart } from '@/types';
import { useTimeManager } from '@/hooks/useTimeManager';
import { RESTAURANT_TIMINGS } from '@/data/restaurants';
import { formatTime12Hour } from '@/data/restaurants';
import { cn } from '@/lib/utils';
import { m } from 'framer-motion';

// Cart List Item Component
function CartItemList({ cart, onUpdate, onRemove }: { cart: Cart; onUpdate: (name: string, qty: number) => void; onRemove: (name: string) => void }) {
  return (
    <div className="space-y-4">
      {cart.items.map((item, index) => (
        <m.div 
            key={`${item.itemName}-${item.vegNonVeg}`} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span 
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                    item.vegNonVeg === 'Non-Veg' ? "border-red-500" : "border-green-500"
                  )}
                  title={item.vegNonVeg}
                >
                    <span className={cn(
                        "w-2 h-2 rounded-full",
                        item.vegNonVeg === 'Non-Veg' ? "bg-red-500" : "bg-green-500"
                    )}></span>
                </span>
                <h3 className="font-bold text-lg text-slate-900">{item.itemName}</h3>
              </div>
              {item.description && <p className="text-slate-500 text-sm mb-3 line-clamp-1">{item.description}</p>}
              <div className="flex items-center space-x-2">
                {item.price === 195 ? (
                  <>
                    <p className="text-slate-400 line-through text-sm">₹{item.price}</p>
                    <p className="text-lg font-bold text-orange-600">₹180</p>
                    <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">8% OFF</span>
                  </>
                ) : (
                  <p className="text-lg font-bold text-slate-900">₹{item.price}</p>
                )}
              </div>
            </div>
            <button 
              onClick={() => onRemove(item.itemName)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove item"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
              <button 
                onClick={() => onUpdate(item.itemName, item.quantity - 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold w-8 text-center text-slate-900 text-sm">{item.quantity}</span>
              <button 
                onClick={() => onUpdate(item.itemName, item.quantity + 1)}
                className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Total</p>
              <p className="text-lg font-bold text-slate-900">₹{((item.price === 195 ? 180 : item.price) * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
}

import { getPublicActiveOffers } from '@/app/actions/get-public-offers';
import type { ExclusiveOffer } from '@/data/offers';
import { calculateCartTotals } from '@/lib/cart';

// ... existing imports

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [offers, setOffers] = useState<ExclusiveOffer[]>([]);
  const timeData = useTimeManager();
  const isOpen = timeData.isOpen;
  
  const MINIMUM_ORDER_VALUE = 100;

  useEffect(() => {
    // Fetch offers first
    getPublicActiveOffers().then(fetchedOffers => {
      setOffers(fetchedOffers);
      // Then load cart and recalculate with offers
      const loadedCart = getCart();
      const updatedCart = calculateCartTotals(loadedCart, fetchedOffers);
      setCart(updatedCart);
    });

    // Listen for updates
    const handleCartUpdate = () => {
        const currentCart = getCart();
        // We need to use the current offers state or fetch again? 
        // Using state is fine for now, but inside event listener we might have stale closure if not careful.
        // Actually, getCart reads from local storage. 
        // But calculateCartTotals needs offers.
        // Let's rely on the effect dependency or a ref if needed, but simple re-fetch or state usage might work.
        // Better: just set the cart, and let a useEffect dependent on cart & offers recalculate?
        // No, getCart returns a cart that might have old totals.
        
        // We will just use the latest offers we have.
        setCart(prevCart => {
            const rawCart = getCart();
            // If we don't have offers yet (initial load race), it might be empty, but that's okay, it will update when offers load.
            return calculateCartTotals(rawCart, offers); // access from closure
        });
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, [offers]); // Re-run listener setup if offers change, which is fine

  const handleUpdateQuantity = (itemName: string, newQty: number) => {
    if (!cart) return;
    updateQuantity(cart, itemName, newQty, offers);
  };

  const handleRemove = (itemName: string) => {
    if (!cart) return;
    if (confirm(`Remove ${itemName} from cart?`)) {
      removeFromCart(cart, itemName, offers);
    }
  };

  if (!cart) return null; // Hydration gap

  if (cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center p-4">
        <m.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full border border-slate-100"
        >
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-slate-900">Your cart is empty</h2>
          <p className="text-slate-500 mb-8 font-medium">Looks like you haven&apos;t added anything yet. Hungry?</p>
          <Link href="/restaurants" className="w-full inline-flex items-center justify-center py-4 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200">
            Browse Restaurants
          </Link>
        </m.div>
      </div>
    );
  }

  const meetsMinimum = cart.subtotal >= MINIMUM_ORDER_VALUE;
  const amountNeeded = Math.max(0, MINIMUM_ORDER_VALUE - cart.subtotal);

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-16">
      <div className="container-custom">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-slate-500 font-medium">Review your items and proceed to checkout</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <CartItemList 
              cart={cart} 
              onUpdate={handleUpdateQuantity} 
              onRemove={handleRemove} 
            />
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-6 text-slate-900">Order Summary</h2>
              
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-xs text-slate-500 uppercase tracking-wide font-bold mb-1">Ordering from</p>
                <p className="font-bold text-lg text-slate-900">{cart.restaurantName}</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                  <span className="font-bold text-slate-900">₹{cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax</span>
                  <span className="font-bold text-slate-900">₹{cart.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className={cart.deliveryFee === 0 ? "text-green-600 font-bold" : "font-bold text-slate-900"}>
                    {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-bold text-orange-600">₹{cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Warnings */}
              {!meetsMinimum && (
                <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
                  <p className="text-sm text-orange-800 font-medium">
                    ⚠️ <strong>Minimum order is ₹{MINIMUM_ORDER_VALUE}.</strong>
                    <br />Add items worth ₹{amountNeeded.toFixed(0)} more.
                  </p>
                </div>
              )}

              {!isOpen && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-sm text-red-800 font-medium">
                    🕒 <strong>Restaurant Closed</strong>
                    <br />Orders accepted {formatTime12Hour(RESTAURANT_TIMINGS.opensAt)} - {formatTime12Hour(RESTAURANT_TIMINGS.closesAt)}.
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              {isOpen && meetsMinimum ? (
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 mb-4 py-4 text-lg bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 mb-4 py-4 text-lg bg-slate-200 text-slate-400 rounded-2xl font-bold cursor-not-allowed"
                  title={!isOpen ? "Restaurant is closed" : "Minimum order not met"}
                >
                  {!isOpen ? (
                    <>
                      🕒 Closed - {timeData.countdown}
                    </>
                  ) : (
                    <>
                      Minimum ₹{MINIMUM_ORDER_VALUE} Required
                    </>
                  )}
                </button>
              )}

              <Link href="/restaurants" className="text-slate-500 hover:text-orange-600 font-bold text-sm block text-center transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
