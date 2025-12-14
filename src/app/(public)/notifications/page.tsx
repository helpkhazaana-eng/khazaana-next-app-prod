'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { fetchUserNotifications } from '@/app/actions/get-user-notifications';
import { Bell, Calendar, Loader2, CheckCheck, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

const READ_NOTIFICATIONS_KEY = 'khazaana_read_notifications';

interface Notification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  status: string;
}

export default function UserNotificationsPage() {
  const { user, loading: userLoading } = useCurrentUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Load read notification IDs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (stored) {
      try {
        setReadIds(new Set(JSON.parse(stored)));
      } catch {
        setReadIds(new Set());
      }
    }
  }, []);

  useEffect(() => {
    async function loadNotifications() {
      if (userLoading) return;
      
      if (!user?.phone) {
        setLoading(false);
        return;
      }

      // Use phone number as User ID (format: USR-PHONE)
      const userId = `USR-${user.phone}`;
      const result = await fetchUserNotifications(userId);
      
      if (result.success) {
        setNotifications(result.notifications);
        
        // Update unread count in localStorage for NotificationBell
        const storedRead = localStorage.getItem(READ_NOTIFICATIONS_KEY);
        const readSet = storedRead ? new Set(JSON.parse(storedRead)) : new Set();
        const unreadCount = result.notifications.filter(n => !readSet.has(n.id)).length;
        localStorage.setItem('khazaana_notification_count', unreadCount.toString());
      }
      setLoading(false);
    }

    loadNotifications();
  }, [user, userLoading]);

  const markAsRead = (id: string) => {
    const newReadIds = new Set(readIds);
    newReadIds.add(id);
    setReadIds(newReadIds);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...newReadIds]));
    
    // Update unread count
    const unreadCount = notifications.filter(n => !newReadIds.has(n.id)).length;
    localStorage.setItem('khazaana_notification_count', unreadCount.toString());
  };

  const markAllAsRead = () => {
    const allIds = new Set(notifications.map(n => n.id));
    setReadIds(allIds);
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...allIds]));
    localStorage.setItem('khazaana_notification_count', '0');
    localStorage.setItem('khazaana_notifications_last_seen', new Date().toISOString());
  };

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  if (userLoading || loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading notifications...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <Bell className="w-8 h-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Notifications</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Please place an order to register your account and receive updates.
        </p>
        <Link href="/restaurants" className="inline-flex items-center justify-center bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
              <p className="text-sm text-slate-500 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
          </div>
          
          {notifications.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-medium">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const isUnread = !readIds.has(notification.id);
              return (
                <div 
                  key={notification.id} 
                  onClick={() => markAsRead(notification.id)}
                  className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer ${
                    isUnread 
                      ? 'border-orange-200 bg-orange-50/30 ring-1 ring-orange-100' 
                      : 'border-slate-100'
                  }`}
                >
                  {/* Left accent bar */}
                  <div className={`absolute top-0 left-0 w-1 h-full ${isUnread ? 'bg-orange-500' : 'bg-slate-200'}`}></div>
                  
                  {/* Unread indicator dot */}
                  {isUnread && (
                    <div className="absolute top-4 right-4">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2 pr-6">
                    <h3 className={`font-bold text-lg ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </h3>
                  </div>
                  <p className={`leading-relaxed mb-3 ${isUnread ? 'text-slate-700' : 'text-slate-500'}`}>
                    {notification.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(notification.sentAt), 'MMM d, h:mm a')}
                    </span>
                    {isUnread && (
                      <span className="text-xs text-orange-600 font-bold bg-orange-100 px-2 py-1 rounded-lg">
                        New
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
