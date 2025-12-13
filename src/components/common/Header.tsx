'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, UtensilsCrossed, Info, ShoppingCart, History, Search } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false });

export default function Header() {
  const cartCount = useCartCount();
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Restaurants', href: '/restaurants', icon: UtensilsCrossed },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Order History', href: '/history', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 inset-x-0 z-50 hidden md:block px-4 py-4">
        <div className="container-custom max-w-5xl mx-auto">
          <div 
              className="rounded-full border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm px-6 py-3 flex items-center justify-between"
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 min-w-0 mr-8">
              <Image 
                src="/images/logo.png" 
                alt="Khazaana Logo" 
                className="h-10 w-auto flex-shrink-0" 
                width={96} 
                height={96} 
                quality={100}
                priority
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-extrabold text-slate-900 leading-tight truncate tracking-tight">Khazaana</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                  <Link 
                      key={item.href}
                      href={item.href} 
                      className={cn(
                          "flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all text-sm font-bold tracking-wide",
                          pathname === item.href 
                              ? "bg-orange-50 text-orange-700 shadow-sm border border-orange-100/50" 
                              : "text-slate-600 hover:text-orange-600 hover:bg-orange-50/50"
                      )}
                  >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                  </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* Google Translate - Always visible, compact on mobile */}
              <div id="google_translate_element" className="translate-widget"></div>

              <Link 
                href="/notifications"
                className="p-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                aria-label="Notifications"
              >
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                  <History className="w-5 h-5 hidden" /> {/* Hidden History icon was here before? No, wait. */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </div>
              </Link>

              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link 
                href="/cart" 
                id="header-cart-btn" 
                className="relative flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-all shadow-lg shadow-slate-900/20 hover:shadow-xl active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white shadow-sm">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
