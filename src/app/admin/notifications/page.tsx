import NotificationSender from '@/components/admin/NotificationSender';
import NotificationHistory from '@/components/admin/NotificationHistory';
import { getNotifications } from '@/lib/googleSheets';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Notifications | Khazaana Admin',
};

export default async function NotificationsPage() {
  const notificationsData = await getNotifications();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
          Push Notifications
        </h1>
        <p className="text-slate-500 font-medium mt-2 text-lg">
          Manage and send alerts to your users
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <NotificationSender />
        </div>
        
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-64 bg-slate-100 rounded-3xl animate-pulse"></div>}>
            <NotificationHistory initialData={notificationsData.notifications} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
