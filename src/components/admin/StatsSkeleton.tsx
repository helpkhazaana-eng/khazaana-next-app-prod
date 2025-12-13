import { ShoppingBag, TrendingUp, Users, FileText } from 'lucide-react';

export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Restaurants Skeleton */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 w-32 bg-slate-100 rounded mb-2 animate-pulse"></div>
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Active Orders Skeleton */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
          <div className="h-6 w-20 bg-slate-100 rounded-full animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 w-24 bg-slate-100 rounded mb-2 animate-pulse"></div>
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Total Users Skeleton */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 w-32 bg-slate-100 rounded mb-2 animate-pulse"></div>
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Pending Updates Skeleton */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 w-32 bg-slate-100 rounded mb-2 animate-pulse"></div>
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
