'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, Mail, MessageCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getCart, clearCart, saveOrderToHistory, calculateCartTotals } from '@/lib/cart';
import { submitCompleteOrder, type OrderItem, type CustomerInfo, type OrderPricing } from '@/lib/googleSheets';
import { generateWhatsAppURLFromOrderData } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';
import { useTimeManager } from '@/hooks/useTimeManager';
import { useFcmToken } from '@/hooks/useFcmToken';
import type { Cart, Order } from '@/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { m, AnimatePresence } from 'framer-motion';
import { getPublicActiveOffers } from '@/app/actions/get-public-offers';
import type { ExclusiveOffer } from '@/data/offers';

// Success Animation Component
function SuccessAnimation() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
      <m.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
          >
            <div className="w-12 h-12 border-4 border-green-500 rounded-full border-t-transparent animate-spin absolute inset-0 m-auto opacity-0" />
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <m.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </m.div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Order Placed!</h2>
        <p className="text-slate-500 font-medium">Redirecting to WhatsApp...</p>
      </m.div>
    </div>
  );
}

interface CheckoutClientProps {
  restaurantOpenStatus?: Record<string, boolean>;
  globalOverride?: 'open' | 'closed' | 'auto';
  systemPhone?: string;
}

export default function CheckoutClient({ restaurantOpenStatus = {}, globalOverride = 'auto', systemPhone }: CheckoutClientProps) {
  const router = useRouter();
  const timeData = useTimeManager();
  const { token: fcmToken } = useFcmToken();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false); // Add success state
  const [locationStatus, setLocationStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [customerLocation, setCustomerLocation] = useState<{ latitude?: number; longitude?: number }>({});
  
  const MINIMUM_ORDER_VALUE = 100;

  useEffect(() => {
    async function initCheckout() {
      try {
        const offers = await getPublicActiveOffers();
        const loadedCart = getCart();
        // Recalculate with fresh offers to ensure correct delivery fee
        const updatedCart = calculateCartTotals(loadedCart, offers);
        setCart(updatedCart);
      } catch (error) {
        console.error('Failed to init checkout:', error);
        setCart(getCart()); // Fallback
      } finally {
        setLoading(false);
      }
    }
    initCheckout();
  }, []);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
  
  if (success) return <SuccessAnimation />;

  if (!cart || cart.items.length === 0) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg mb-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-800 mb-1">Your cart is empty</h3>
            <p className="text-orange-700 mb-4 text-sm">Please add items to your cart before checking out.</p>
            <Link href="/restaurants" className="inline-flex items-center text-sm px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-200">
              Browse Restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const meetsMinimum = subtotal >= MINIMUM_ORDER_VALUE;
  const amountNeeded = Math.max(0, MINIMUM_ORDER_VALUE - subtotal);
  // Determine if ordering is allowed
  // 1. Check global override first
  // 2. Then check per-restaurant status
  // 3. Finally check time-based status
  let isOpen = timeData.isOpen;
  let restaurantClosed = false;
  
  if (globalOverride === 'closed') {
    isOpen = false;
  } else if (globalOverride === 'open') {
    isOpen = true;
  }
  
  // Check if specific restaurant is closed
  if (cart?.restaurantId && restaurantOpenStatus[cart.restaurantId] === false) {
    restaurantClosed = true;
    isOpen = false;
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    setLocationStatus({ type: 'loading', message: 'Getting your location...' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCustomerLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus({ 
          type: 'success', 
          message: `Location captured: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}` 
        });
        logger.info('Location captured', { lat: position.coords.latitude, lng: position.coords.longitude }, 'CHECKOUT');
      },
      (error) => {
        let msg = `Error: ${error.message}`;
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location access denied. Please enable location permissions.';
        }
        setLocationStatus({ type: 'error', message: msg });
        logger.error('Geolocation error', new Error(error.message), 'CHECKOUT');
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isOpen) {
      alert('Ordering is currently closed. We accept orders between 9:00 AM and 9:00 PM (IST).');
      return;
    }

    if (!meetsMinimum) {
      alert(`Minimum order value is ₹${MINIMUM_ORDER_VALUE}. Please add more items.`);
      return;
    }

    setSubmitting(true);
    logger.info('Checkout form submitted', {}, 'CHECKOUT');

    const formData = new FormData(e.currentTarget);
    
    const customer = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string || undefined,
      address: formData.get('address') as string,
      latitude: customerLocation.latitude,
      longitude: customerLocation.longitude
    };

    // Strict Validation
    // Phone: 10 digits, starts with 6,7,8,9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!customer.phone || !phoneRegex.test(customer.phone)) {
      alert('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9');
      setSubmitting(false);
      return;
    }

    // Email: Standard email regex if provided
    if (customer.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(customer.email)) {
        alert('Please enter a valid email address');
        setSubmitting(false);
        return;
      }
    }

    try {
      const orderItems: OrderItem[] = cart.items.map(item => {
        const actualPrice = item.price === 195 ? 180 : item.price;
        return {
          name: item.itemName,
          qty: item.quantity,
          price: actualPrice,
          vegNonVeg: item.vegNonVeg
        };
      });

      const customerInfo: CustomerInfo = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        lat: customer.latitude,
        lng: customer.longitude,
        fcmToken: fcmToken || undefined
      };

      const pricing: OrderPricing = {
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: cart.deliveryFee || 0,
        total: cart.total
      };

      const termsAccepted = true; // Checkbox is required in form

      const result = await submitCompleteOrder(
        cart.restaurantName || 'Unknown Restaurant',
        orderItems,
        customerInfo,
        pricing,
        termsAccepted
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      // Create local order record
      const order: Order = {
        orderId: result.orderId,
        restaurantId: cart.restaurantId || '',
        restaurantName: cart.restaurantName || '',
        items: cart.items,
        customer,
        subtotal: cart.subtotal,
        tax: cart.tax,
        total: cart.total,
        deliveryFee: cart.deliveryFee,
        orderTime: new Date().toISOString(),
        status: 'pending'
      };

      saveOrderToHistory(order);

      const whatsappURL = generateWhatsAppURLFromOrderData(
        result.orderId,
        cart.restaurantName || 'Unknown Restaurant',
        orderItems,
        customerInfo,
        pricing
      );

      clearCart();
      window.location.href = whatsappURL;

    } catch (error) {
      console.error(error);
      alert('Failed to place order. Please try again or contact support.');
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-24">
      {/* Back Link */}
      <div className="lg:col-span-3">
        <Link href="/cart" className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Cart
        </Link>
      </div>

      {/* Messages */}
      <div className="lg:col-span-3 space-y-4">
        {!meetsMinimum && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-800 text-sm mb-1">Minimum order not met</h3>
                <p className="text-orange-700 text-xs">
                  Minimum order is <strong>₹{MINIMUM_ORDER_VALUE}</strong>. Current: ₹{subtotal.toFixed(0)}.
                  <br/>Add items worth ₹{amountNeeded.toFixed(0)} more.
                </p>
                <Link href="/restaurants" className="inline-block mt-2 text-orange-800 text-xs font-bold hover:underline">
                  Add more items →
                </Link>
              </div>
            </div>
          </div>
        )}

        {!isOpen && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 text-sm mb-1">
                  {restaurantClosed ? 'Restaurant Temporarily Closed' : 'Restaurant Closed'}
                </h3>
                <p className="text-red-700 text-xs">
                  {restaurantClosed 
                    ? 'This restaurant is temporarily not accepting orders. Please try again later.'
                    : 'Orders accepted 9:00 AM - 9:00 PM.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Form */}
      <div className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold mb-6 text-slate-900">Delivery Information</h2>

          <div className="mb-5">
            <label htmlFor="customer-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Full Name *
            </label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                type="text"
                id="customer-name"
                name="name"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                placeholder="Enter your name"
                />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="customer-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              WhatsApp Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm font-medium">
                +91
              </span>
              <input
                type="tel"
                id="customer-phone"
                name="phone"
                required
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                minLength={10}
                className="w-full bg-slate-50 border border-slate-200 rounded-r-xl py-3 px-4 text-base focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                placeholder="10-digit mobile number"
              />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="customer-email" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Email (Optional)
            </label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                type="email"
                id="customer-email"
                name="email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900"
                placeholder="email@example.com"
                />
            </div>
          </div>

          <div className="mb-5">
            <label htmlFor="customer-address" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Delivery Address *
            </label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <textarea
                id="customer-address"
                name="address"
                required
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none text-slate-900"
                placeholder="Flat / House no / Floor, Building Name"
                />
            </div>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={handleGetLocation}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3 h-3" />
              Use Current Location
            </button>
            {locationStatus.message && (
              <p className={cn(
                "text-[10px] mt-1.5 font-medium",
                locationStatus.type === 'error' ? 'text-red-600' : 
                locationStatus.type === 'success' ? 'text-green-700' : 'text-blue-700'
              )}>
                {locationStatus.message}
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6">
            <p className="text-xs text-blue-800 leading-relaxed flex gap-2">
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>
                <strong>WhatsApp Order:</strong> Clicking &quot;Place Order&quot; will open WhatsApp with your pre-filled order details to confirm with the restaurant.
              </span>
            </p>
          </div>

          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                required
                className="mt-0.5 w-4 h-4 text-orange-600 border-slate-300 rounded focus:ring-orange-500 cursor-pointer accent-orange-600"
              />
              <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                I agree to the <Link href="/terms" target="_blank" className="text-orange-600 hover:underline">Terms & Conditions</Link>.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !meetsMinimum || !isOpen}
            className={cn(
                "w-full py-4 text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2",
                "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200",
                (submitting || !meetsMinimum || !isOpen) && 'opacity-50 cursor-not-allowed grayscale'
            )}
          >
            {submitting ? 'Processing...' : 'Place Order via WhatsApp'}
            {!submitting && <MessageCircle className="w-5 h-5" />}
          </button>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-28">
          <h2 className="text-lg font-bold mb-4 text-slate-900">Order Summary</h2>
          
          <div className="mb-4 pb-4 border-b border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Ordering from</p>
            <p className="font-bold text-slate-900">{cart.restaurantName}</p>
          </div>

          <div className="space-y-3 mb-4 pb-4 border-b border-slate-100 max-h-[300px] overflow-y-auto">
            {cart.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="flex-1 text-slate-500">
                  <span className="text-slate-900 font-medium">{item.quantity}x</span> {item.itemName}
                </span>
                <span className="font-medium text-slate-900">
                  ₹{((item.price === 195 ? 180 : item.price) * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span>₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className={cart.deliveryFee === 0 ? "text-green-600 font-medium" : "text-slate-900"}>
                {cart.deliveryFee === 0 ? 'FREE' : `₹${cart.deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Tax</span>
              <span>₹{cart.tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-dashed border-slate-200 pt-3 mt-2 flex justify-between text-lg font-bold">
              <span className="text-slate-900">Total</span>
              <span className="text-orange-600">₹{cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
