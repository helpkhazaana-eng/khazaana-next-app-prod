'use client';

import Link from 'next/link';
import { MapPin, Clock, ArrowLeft, Star } from 'lucide-react';
import { m } from 'framer-motion';
import type { Restaurant } from '@/types';
import { getFormattedTimings } from '@/data/restaurants';
import { useTimeManager } from '@/hooks/useTimeManager';
import { cn } from '@/lib/utils';

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const timeData = useTimeManager();
  
  // Calculate open status based on timeManager (client-side)
  const currentMinutes = timeData.istHour * 60 + timeData.istMinute;
  
  const [openHour, openMin] = restaurant.opensAt.split(':').map(Number);
  const [closeHour, closeMin] = restaurant.closesAt.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  const isOpen = currentMinutes >= openTime && currentMinutes < closeTime;
  
  return (
    <div className="relative pt-24 pb-12 md:pt-32 md:pb-16 overflow-hidden">
        {/* Dynamic Background Gradient based on category/theme could go here, keeping it clean for now */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 via-white to-white z-0" />
        
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-40 translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl opacity-40 -translate-x-1/3 translate-y-1/3" />

        <div className="container-custom relative z-10">
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
             <Link href="/restaurants" className="inline-flex items-center text-slate-500 hover:text-orange-600 transition-colors text-sm font-bold group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 shadow-sm hover:shadow-md">
                <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
                Back
             </Link>
          </m.div>
          
          <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden">
             {/* Glossy overlay */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
             
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                <div className="flex-1 space-y-4">
                   <m.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5 }}
                   >
                     <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-widest rounded-lg mb-3">
                        {restaurant.category}
                     </span>
                     <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                        {restaurant.name}
                     </h1>
                     <p className="text-slate-500 font-medium text-sm md:text-base flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {restaurant.address}
                     </p>
                   </m.div>
                   
                   <m.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.1 }}
                     className="flex flex-wrap items-center gap-4 pt-2"
                   >
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                         <Star className="w-5 h-5 text-yellow-400 fill-current" />
                         <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Rating</p>
                            <p className="text-slate-900 font-black text-lg leading-none">{restaurant.rating}</p>
                         </div>
                      </div>
                      
                      <div className="w-px h-10 bg-slate-200 hidden md:block" />
                      
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                         <Clock className="w-5 h-5 text-blue-500" />
                         <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Time</p>
                            <p className="text-slate-900 font-bold text-sm leading-tight">{getFormattedTimings(restaurant)}</p>
                         </div>
                      </div>
                   </m.div>
                </div>
                
                <m.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full md:w-auto"
                >
                   {/* Status Card */}
                   <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden group w-full md:min-w-[200px] text-center md:text-left">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                      
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Status</p>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                         <span className="relative flex h-3 w-3">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                         </span>
                         <span className="text-2xl font-black tracking-tight">Open Now</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-2 font-medium">Accepting orders</p>
                   </div>
                </m.div>
             </div>
          </div>
        </div>
    </div>
  );
}
