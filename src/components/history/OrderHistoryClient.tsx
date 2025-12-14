'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrderHistory } from '@/lib/cart';
import type { Order } from '@/types';
import { m } from 'framer-motion';
import { Package, MapPin, Phone, Mail, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

export default function OrderHistoryClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrders(getOrderHistory());
    setLoading(false);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted text-sm font-medium">Loading your orders...</p>
    </div>
  );

  if (orders.length === 0) {
    return (
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6"
      >
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-slate-900">No orders yet</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven't ordered anything yet. Hungry?</p>
        <Link href="/restaurants" className="flex items-center gap-2 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200">
          <span>Browse Restaurants</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </m.div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {orders.map((order, index) => {
        const orderDate = new Date(order.orderTime);
        const formattedDate = orderDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        const formattedTime = orderDate.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const deliveryFee = typeof order.deliveryFee === 'number'
          ? order.deliveryFee
          : Math.max(0, order.total - order.subtotal - order.tax);
        
        return (
          <m.div 
            key={order.orderId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
             {/* Header */}
             <div className="p-4 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-xl shrink-0">
                        🥘
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-slate-900 line-clamp-1">{order.restaurantName}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <span className="text-green-600 font-bold">Delivered</span>
                            <span>•</span>
                            <span>{formattedDate}, {formattedTime}</span>
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{order.total.toFixed(0)}</p>
                    <Link 
                        href={`/restaurants/${order.restaurantId}`}
                        className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 mt-1"
                    >
                        <RotateCcw className="w-3 h-3" />
                        Repeat
                    </Link>
                </div>
             </div>

             {/* Items */}
             <div className="p-4">
                <div className="space-y-3 mb-4">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-start justify-between text-sm">
                            <div className="flex items-start gap-2">
                                <span 
                                    className={`mt-1 flex-shrink-0 w-3 h-3 rounded border flex items-center justify-center ${item.vegNonVeg === 'Non-Veg' ? 'border-red-500' : 'border-green-500'}`} 
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.vegNonVeg === 'Non-Veg' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                </span>
                                <span className="text-slate-700">
                                    <span className="font-bold text-slate-900 mr-1">{item.quantity}x</span>
                                    {item.itemName}
                                </span>
                            </div>
                            <span className="text-slate-600 font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                        </div>
                    ))}
                </div>

                {/* Footer/Details Accordion could go here, keeping it simple for now */}
                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="max-w-[150px] truncate">{order.customer.address}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Order Sent</span>
                    </div>
                </div>
             </div>
          </m.div>
        );
      })}
    </div>
  );
}
