'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Utensils, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  className?: string;
  size?: 'sm' | 'md';
}

const LAST_SEEN_KEY = 'khazaana_notifications_last_seen';
const NOTIFICATION_COUNT_KEY = 'khazaana_notification_count';

export default function NotificationBell({ className = '', size = 'md' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for unread notifications
    const checkUnread = () => {
      const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
      const storedCount = localStorage.getItem(NOTIFICATION_COUNT_KEY);
      
      // For demo purposes, show 3 unread if never seen
      if (!lastSeen) {
        setUnreadCount(3);
        return;
      }
      
      // Check if there are new notifications since last seen
      const count = storedCount ? parseInt(storedCount) : 0;
      setUnreadCount(count);
    };
    
    checkUnread();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      checkUnread();
      // Trigger animation on new notification
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    };
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    return () => window.removeEventListener('notificationUpdate', handleNotificationUpdate);
  }, []);

  // Mark as seen when clicking
  const handleClick = () => {
    localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
    localStorage.setItem(NOTIFICATION_COUNT_KEY, '0');
    setUnreadCount(0);
  };

  if (!mounted) {
    return (
      <div className={cn(
        "relative p-2.5 text-slate-600 rounded-full",
        size === 'sm' ? 'p-2' : 'p-2.5',
        className
      )}>
        <Bell className={size === 'sm' ? 'w-5 h-5' : 'w-5 h-5'} />
      </div>
    );
  }

  const hasUnread = unreadCount > 0;

  return (
    <Link 
      href="/notifications"
      onClick={handleClick}
      className={cn(
        "relative group transition-all",
        size === 'sm' ? 'p-2' : 'p-2.5',
        hasUnread 
          ? "text-orange-600 hover:text-orange-700" 
          : "text-slate-600 hover:text-orange-600 hover:bg-orange-50",
        "rounded-full",
        className
      )}
      aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
    >
      {/* Bell Icon with Animation */}
      <div className={cn(
        "relative",
        isAnimating && "animate-bounce"
      )}>
        <Bell className={cn(
          size === 'sm' ? 'w-5 h-5' : 'w-5 h-5',
          hasUnread && "fill-orange-100"
        )} />
        
        {/* Food-themed decoration when has unread */}
        {hasUnread && (
          <>
            {/* Sparkle effect */}
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 animate-pulse" />
            
            {/* Steam/aroma lines animation */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              <span className="w-0.5 h-2 bg-orange-300 rounded-full animate-steam-1 opacity-60"></span>
              <span className="w-0.5 h-1.5 bg-orange-300 rounded-full animate-steam-2 opacity-60"></span>
              <span className="w-0.5 h-2 bg-orange-300 rounded-full animate-steam-3 opacity-60"></span>
            </div>
          </>
        )}
      </div>
      
      {/* Unread Badge - Food plate style */}
      {hasUnread && (
        <span className={cn(
          "absolute flex items-center justify-center",
          "bg-gradient-to-br from-red-500 to-orange-500 text-white",
          "font-bold shadow-lg shadow-red-500/30",
          "border-2 border-white",
          "animate-pulse-subtle",
          size === 'sm' 
            ? "top-0.5 right-0.5 min-w-[16px] h-4 text-[9px] rounded-full px-1"
            : "top-0 right-0 min-w-[18px] h-[18px] text-[10px] rounded-full px-1"
        )}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

// Export a function to trigger notification update from anywhere
export function triggerNotificationUpdate(count: number) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_COUNT_KEY, count.toString());
    window.dispatchEvent(new Event('notificationUpdate'));
  }
}
