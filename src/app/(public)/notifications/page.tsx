'use client';

import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { fetchUserNotifications } from '@/app/actions/get-user-notifications';
import { Bell, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

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
      }
      setLoading(false);
    }

    loadNotifications();
  }, [user, userLoading]);

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
        <Link href="/restaurants" className="btn-primary bg-orange-500 text-white hover:bg-orange-600 px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all inline-block">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container-custom max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 font-medium">Stay updated with your orders</p>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-500 font-medium">You have no new notifications.</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 text-lg">{notification.title}</h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(notification.sentAt), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">{notification.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
