'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Home, UtensilsCrossed, Info, ShoppingCart, History, Search } from 'lucide-react';
import { useCartCount } from '@/hooks/useCartCount';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { LanguageToggleCompact } from '@/components/LanguageToggle';
import NotificationBell from '@/components/common/NotificationBell';

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
            <div className="flex items-center gap-3 flex-shrink-0">
              <LanguageToggleCompact />
              
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <NotificationBell />
              
              <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
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
