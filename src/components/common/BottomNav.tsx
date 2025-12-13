'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, UtensilsCrossed, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Food', href: '/restaurants', icon: Search },
    { name: 'Orders', href: '/history', icon: UtensilsCrossed },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive ? "text-orange-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {isActive && (
                <span className="absolute -top-[1px] w-8 h-[2px] bg-orange-600 rounded-full" />
              )}
              <item.icon className={cn("w-6 h-6", isActive && "fill-current opacity-20 stroke-[2.5px]", !isActive && "stroke-[1.5px]")} />
              {/* Overlay icon for active state to get the filled look plus stroke */}
              {isActive && <item.icon className="w-6 h-6 absolute top-[11px] stroke-[2px] fill-none" />}
              
              <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
