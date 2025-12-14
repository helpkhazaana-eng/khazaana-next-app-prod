'use client';

import Link from 'next/link';
import { MapPin, Search } from 'lucide-react';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LanguageToggleCompact } from '@/components/LanguageToggle';
import NotificationBell from '@/components/common/NotificationBell';

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false });

export default function MobileHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-50 block md:hidden bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all duration-200">
        <div className="flex flex-col gap-3 px-4 py-3">
          
          {/* Top Row: Location + Profile/Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                  <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">Home</span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-400">
                          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate leading-tight">
                      Aurangabad, West Bengal 742201
                  </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LanguageToggleCompact />
              <NotificationBell size="sm" />
            </div>
          </div>

          {/* Bottom Row: Search Bar */}
          <button 
            onClick={() => setIsSearchOpen(true)} 
            className="relative group w-full text-left"
          >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
              </div>
              <div className="w-full bg-slate-100 border border-transparent text-slate-600 text-sm rounded-xl py-2.5 pl-10 pr-4 shadow-sm group-hover:border-orange-200 group-hover:bg-white transition-all">
                  Search for "Biryani"
              </div>
          </button>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
