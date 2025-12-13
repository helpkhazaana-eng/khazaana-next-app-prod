import { Metadata } from 'next';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { getAnalyticsData } from '@/lib/googleSheets';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics | Khazaana Admin',
  description: 'Business intelligence and performance metrics',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8">
        <div className="bg-red-50 p-4 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to Load Analytics</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-6">
          We couldn&apos;t connect to the analytics backend. Please check if the Google Apps Script is deployed correctly and the URL is updated in environment variables.
        </p>
        <div className="text-xs font-mono bg-slate-100 p-4 rounded text-left overflow-auto max-w-lg">
          Error: Connection failed or timed out
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Business Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time insights from Google Sheets</p>
        </div>
        <div className="flex gap-2 text-xs font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-slate-600">
          <span className="w-2 h-2 rounded-full bg-green-500 mt-1 animate-pulse"></span>
          Live Data
        </div>
      </div>

      <AnalyticsDashboard data={data} />
    </div>
  );
}
