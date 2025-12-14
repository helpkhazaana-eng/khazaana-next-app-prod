'use client';

import Link from 'next/link';
import { Star, Clock, MapPin, BadgePercent } from 'lucide-react';
import type { Restaurant } from '@/types';
import { useTimeManager } from '@/hooks/useTimeManager';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateRestaurantName, translateCategory, formatPrice } from '@/lib/translations';
import { cn } from '@/lib/utils';
import RestaurantPlaceholder from '@/components/common/RestaurantPlaceholder';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const timeData = useTimeManager();
  const { language } = useLanguage();
  
  // Get translated values
  const displayName = language === 'bn' ? translateRestaurantName(restaurant.name) : restaurant.name;
  const displayCategory = language === 'bn' ? translateCategory(restaurant.category) : restaurant.category;
  const displayCuisine = language === 'bn' 
    ? restaurant.cuisine?.slice(0, 2).map(c => translateCategory(c)).join(', ') 
    : restaurant.cuisine?.slice(0, 2).join(', ') || 'Indian';
  const openText = language === 'bn' ? 'খোলা' : 'Open';
  const closedText = language === 'bn' ? 'বন্ধ' : 'Closed';
  const openNowText = language === 'bn' ? 'এখন খোলা' : 'Open Now';
  const forTwoText = language === 'bn' ? 'দুজনের জন্য' : 'for two';
  const freeDeliveryText = language === 'bn' ? '₹১৯৯ এর উপরে অর্ডারে ফ্রি ডেলিভারি' : 'Free delivery on orders above ₹199';
  
  // Calculate open status based on timeManager (client-side)
  const currentMinutes = timeData.istHour * 60 + timeData.istMinute;
  
  const [openHour, openMin] = restaurant.opensAt.split(':').map(Number);
  const [closeHour, closeMin] = restaurant.closesAt.split(':').map(Number);
  
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;
  
  const isTimeOpen = currentMinutes >= openTime && currentMinutes < closeTime;
  
  // Apply global override if set
  let isOpen = isTimeOpen;
  if (timeData.overrideStatus === 'open') isOpen = true;
  if (timeData.overrideStatus === 'closed') isOpen = false;
  
  // Format times for display
  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  return (
    <Link 
      href={`/restaurants/${restaurant.id}`} 
      className="block h-full group"
      aria-label={`View details for ${restaurant.name}`}
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-row md:flex-col h-full md:h-auto">
        
        {/* Image Section */}
        {/* Mobile: 96x96 Fixed Left */}
        {/* Desktop: Full Width Aspect Video */}
        <div className="shrink-0 w-24 h-24 md:w-full md:h-48 relative bg-slate-100 m-3 md:m-0 rounded-xl md:rounded-none overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
             {/* Gradient Placeholder / Image */}
             {restaurant.menuFile ? (
                 <RestaurantPlaceholder /> 
             ) : (
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100"></div>
             )}
             
             {/* Desktop Overlay Status (Hidden on Mobile) */}
             <div className="hidden md:block absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex justify-between items-end">
                    {/* Offer Badge Mockup */}
                    <span className="text-white text-[10px] font-bold bg-orange-600 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <BadgePercent className="w-3 h-3" />
                        50% OFF
                    </span>
                    
                    <span className={cn(
                        "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md backdrop-blur-md shadow-sm",
                        isOpen ? "bg-white/90 text-green-700" : "bg-white/90 text-red-600"
                    )}>
                        {isOpen ? 'Open Now' : 'Closed'}
                    </span>
                </div>
             </div>
        </div>

        {/* Content Section */}
        <div className="p-3 md:p-4 flex flex-col flex-grow justify-center md:justify-start min-w-0">
          <div className="flex justify-between items-start mb-1 md:mb-2">
            <h3 className="text-base md:text-lg font-extrabold text-slate-900 truncate pr-2 group-hover:text-orange-600 transition-colors">
              {displayName}
            </h3>
            
            <div className="flex items-center bg-green-700 text-white px-1.5 py-0.5 rounded-md text-[10px] md:text-xs font-bold shrink-0 shadow-sm">
              <span className="mr-0.5">{restaurant.rating}</span>
              <Star className="w-2.5 h-2.5 fill-current" />
            </div>
          </div>

          <div className="text-xs md:text-sm text-slate-600 truncate mb-2 md:mb-3 font-medium">
             {displayCategory} • {displayCuisine}
          </div>

          <div className="flex items-center justify-between text-[10px] md:text-xs text-slate-500 mt-auto font-medium">
             {/* Mobile: Time/Status */}
             <div className="flex items-center gap-2 md:hidden">
                 <span className={cn("font-bold", isOpen ? "text-green-600" : "text-red-500")}>
                    {isOpen ? openText : closedText}
                 </span>
                 <span>•</span>
                 <span>30 min</span>
             </div>

             {/* Desktop: More Info */}
             <div className="hidden md:flex items-center gap-3 w-full">
                 <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>30-40 min</span>
                 </div>
                 <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span className="truncate max-w-[100px]">{restaurant.address}</span>
                 </div>
             </div>
             
             <div className="font-bold text-slate-900 text-xs md:text-sm">
                ₹{restaurant.costForTwo} {forTwoText}
             </div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-slate-100 hidden md:flex items-center gap-2 text-[10px] text-blue-600 font-bold">
             <BadgePercent className="w-3 h-3" />
             <span>{freeDeliveryText}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
