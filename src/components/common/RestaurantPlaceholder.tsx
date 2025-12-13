'use client';

import React from 'react';

export default function RestaurantPlaceholder({ className }: { className?: string }) {
  return (
    <div className={`relative w-full h-full bg-[#FFF5E6] overflow-hidden ${className}`}>
      {/* Pattern Background */}
      <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
        <pattern id="food-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M10 10a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm15 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm-5 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" fill="#FF6B00"/>
          <path d="M30 5l5 5M35 5l-5 5" stroke="#FF6B00" strokeWidth="2"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#food-pattern)" />
      </svg>
      
      {/* Central Logo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div className="relative z-10 text-center transform -rotate-6">
           <span className="block text-xs sm:text-xl md:text-5xl font-black text-orange-200 tracking-tighter uppercase drop-shadow-sm select-none">
             Khazaana
           </span>
           <span className="block text-xs sm:text-xl md:text-5xl font-black text-orange-600 tracking-tighter uppercase -mt-2 sm:-mt-4 md:-mt-8 mix-blend-multiply select-none">
             Khazaana
           </span>
        </div>
        
        {/* Floating Icons - Scaled for mobile */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 text-xs md:text-2xl animate-bounce duration-1000 delay-0">🍕</div>
        <div className="absolute top-1/3 right-1/4 -translate-y-1/2 translate-x-1/2 text-xs md:text-2xl animate-bounce duration-1000 delay-300">🍗</div>
        <div className="absolute bottom-1/4 left-1/3 text-xs md:text-2xl animate-bounce duration-1000 delay-700">🥗</div>
      </div>
    </div>
  );
}
