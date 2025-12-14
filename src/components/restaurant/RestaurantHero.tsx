'use client';

import Link from 'next/link';
import { MapPin, Clock, ArrowLeft, Star } from 'lucide-react';
import { m } from 'framer-motion';
import type { Restaurant } from '@/types';
import { getFormattedTimings } from '@/data/restaurants';
import { useTimeManager } from '@/hooks/useTimeManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateRestaurantName, translateCategory } from '@/lib/translations';
import { cn } from '@/lib/utils';

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

export default function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const timeData = useTimeManager();
  const { language } = useLanguage();
  
  // Get translated values
  const displayName = language === 'bn' ? translateRestaurantName(restaurant.name) : restaurant.name;
  const displayCategory = language === 'bn' ? translateCategory(restaurant.category) : restaurant.category;
  const backText = language === 'bn' ? 'ফিরে যান' : 'Back';
  const ratingText = language === 'bn' ? 'রেটিং' : 'Rating';
  const timeText = language === 'bn' ? 'সময়' : 'Time';
  const statusText = language === 'bn' ? 'বর্তমান অবস্থা' : 'Current Status';
  const openNowText = language === 'bn' ? 'এখন খোলা' : 'Open Now';
  const closedText = language === 'bn' ? 'বন্ধ' : 'Closed';
  const acceptingOrdersText = language === 'bn' ? 'অর্ডার নেওয়া হচ্ছে' : 'Accepting orders';
  const opensTomorrowText = language === 'bn' ? 'আগামীকাল সকাল ৯টায় খুলবে' : 'Opens tomorrow at 9 AM';
  
  // Calculate open status based on timeManager (client-side)
  const currentMinutes = timeData.istHour * 60 + timeData.istMinute;
  
  const [openHour, openMin] = restaurant.opensAt.split(':').map(Number);
  const [closeHour, closeMin] = restaurant.closesAt.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  const isTimeOpen = currentMinutes >= openTime && currentMinutes < closeTime;
  
  // Check admin-controlled isOpen field (defaults to true if not set)
  const adminIsOpen = restaurant.isOpen !== false;
  
  // Apply global override if set, otherwise check both admin and time
  let isOpen = adminIsOpen && isTimeOpen;
  if (timeData.overrideStatus === 'open') isOpen = true;
  if (timeData.overrideStatus === 'closed') isOpen = false;
  
  // If admin manually closed, always show closed regardless of override
  if (!adminIsOpen) isOpen = false;
  
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
                {backText}
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
                        {displayCategory}
                     </span>
                     <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] mb-2">
                        {displayName}
                     </h1>
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
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{ratingText}</p>
                            <p className="text-slate-900 font-black text-lg leading-none">{restaurant.rating}</p>
                         </div>
                      </div>
                      
                      <div className="w-px h-10 bg-slate-200 hidden md:block" />
                      
                      <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                         <Clock className="w-5 h-5 text-blue-500" />
                         <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{timeText}</p>
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
                      
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{statusText}</p>
                      <div className="flex items-center justify-center md:justify-start gap-2">
                         <span className="relative flex h-3 w-3">
                           {isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                           <span className={cn("relative inline-flex rounded-full h-3 w-3", isOpen ? "bg-green-500" : "bg-red-500")}></span>
                         </span>
                         <span className="text-2xl font-black tracking-tight">{isOpen ? openNowText : closedText}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-2 font-medium">{isOpen ? acceptingOrdersText : opensTomorrowText}</p>
                   </div>
                </m.div>
             </div>
          </div>
        </div>
    </div>
  );
}
