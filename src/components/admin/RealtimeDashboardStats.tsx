'use client';

import { useRealtimeDashboard } from '@/hooks/useRealtimeDashboard';
import { ShoppingBag, TrendingUp, Users, FileText, RefreshCw } from 'lucide-react';

interface RealtimeDashboardStatsProps {
  totalRestaurants: number;
  newDraftRestaurantsCount: number;
  pendingCount: number;
  // Fallback values from server-side fetch (Google Sheets)
  fallbackTotalUsers?: number;
}

export default function RealtimeDashboardStats({ 
  totalRestaurants, 
  newDraftRestaurantsCount, 
  pendingCount,
  fallbackTotalUsers = 0
}: RealtimeDashboardStatsProps) {
  const { stats, loading, error, lastUpdate } = useRealtimeDashboard();

  // Format last update time
  const formatLastUpdate = () => {
    if (!lastUpdate) return '';
    return lastUpdate.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-2">
      {/* Live indicator */}
      <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
        {loading ? (
          <span className="flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Connecting...
          </span>
        ) : error ? (
          <span className="text-red-500">⚠️ Connection error</span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live • Updated {formatLastUpdate()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Restaurants */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-sm">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                {newDraftRestaurantsCount > 0 && (
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">+{newDraftRestaurantsCount} New</span>
                )}
            </div>
            <div className="relative z-10">
              <p className="text-slate-600 text-sm font-semibold tracking-wide">Total Restaurants</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{totalRestaurants}</h3>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
        </div>

        {/* Active Orders - REALTIME */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                    <TrendingUp className="w-6 h-6" />
                </div>
                {!loading && stats.activeOrders > 0 ? (
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Live
                    </span>
                ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      {loading ? '...' : 'No Active'}
                    </span>
                )}
            </div>
            <div className="relative z-10">
              <p className="text-slate-600 text-sm font-semibold tracking-wide">Active Orders</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                {loading ? (
                  <span className="inline-block w-8 h-8 bg-slate-200 rounded animate-pulse"></span>
                ) : (
                  stats.activeOrders
                )}
              </h3>
              {!loading && (
                <p className="text-xs text-slate-500 mt-1">
                  {stats.pendingOrders} pending • {stats.confirmedOrders} confirmed
                </p>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
        </div>

        {/* Today's Orders - REALTIME */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all group relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                    <Users className="w-6 h-6" />
                </div>
                {!loading && stats.todayOrders > 0 && (
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full border border-purple-200">
                    ₹{stats.todayRevenue.toLocaleString('en-IN')}
                  </span>
                )}
            </div>
            <div className="relative z-10">
              <p className="text-slate-600 text-sm font-semibold tracking-wide">Today's Orders</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                {loading ? (
                  <span className="inline-block w-8 h-8 bg-slate-200 rounded animate-pulse"></span>
                ) : (
                  stats.todayOrders
                )}
              </h3>
              {!loading && (
                <p className="text-xs text-slate-500 mt-1">
                  Total: {stats.totalOrders} orders • ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </p>
              )}
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
        </div>

        {/* Pending Updates */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 hover:border-red-200 hover:shadow-lg transition-all group relative overflow-hidden">
            {pendingCount > 0 && <div className="absolute top-0 right-0 w-20 h-20 bg-red-500 blur-3xl opacity-10 -mr-10 -mt-10"></div>}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${pendingCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                    <FileText className="w-6 h-6" />
                </div>
                {pendingCount > 0 && <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full border border-red-200">Action Needed</span>}
            </div>
            <div className="relative z-10">
              <p className="text-slate-600 text-sm font-semibold tracking-wide">Pending Updates</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{pendingCount}</h3>
            </div>
        </div>
      </div>
    </div>
  );
}
