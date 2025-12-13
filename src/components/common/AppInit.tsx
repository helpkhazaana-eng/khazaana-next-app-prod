'use client';

import dynamic from 'next/dynamic';

const NotificationManager = dynamic(() => import('./NotificationManager'), { ssr: false });
const MonitoringInit = dynamic(() => import('./MonitoringInit'), { ssr: false });

export default function AppInit() {
  return (
    <>
      <MonitoringInit />
      <NotificationManager />
    </>
  );
}
