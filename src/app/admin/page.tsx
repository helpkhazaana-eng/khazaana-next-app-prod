import Link from 'next/link';
import { Upload, ExternalLink, FileSpreadsheet, AlertCircle, Clock, FileText, CheckCircle2, TrendingUp, Users, ShoppingBag, Store } from 'lucide-react';
import { RESTAURANT_TIMINGS } from '@/data/restaurants';
import { getAllRestaurants, getDraftRestaurants } from '@/lib/restaurant-manager';
import { hasDraft } from '@/lib/data-access';
import { getSystemConfig } from '@/lib/system-config';
import SystemControls from '@/components/admin/SystemControls';
import DashboardStats from '@/components/admin/DashboardStats';
import StatsSkeleton from '@/components/admin/StatsSkeleton';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin Dashboard | Khazaana',
};

export default async function AdminDashboard() {
  const liveRestaurants = await getAllRestaurants();
  const newDraftRestaurants = await getDraftRestaurants();
  const systemConfig = await getSystemConfig();
  
  // Check for menu drafts on live restaurants
  const liveRestaurantsWithDrafts = await Promise.all(
    liveRestaurants.map(async (r) => {
      const hasPendingDraft = await hasDraft(r.id);
      return { ...r, hasPendingDraft };
    })
  );

  const pendingMenuUpdates = liveRestaurantsWithDrafts.filter(r => r.hasPendingDraft);
  const pendingCount = pendingMenuUpdates.length + newDraftRestaurants.length;
  const totalRestaurants = liveRestaurants.length;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-2 text-lg">
            Welcome back, <span className="text-orange-600 font-bold">Askin Ali</span>
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 text-sm font-medium text-slate-600">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            System Operational
        </div>
      </div>

      {/* Stats Grid with Suspense */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats 
          totalRestaurants={totalRestaurants}
          newDraftRestaurantsCount={newDraftRestaurants.length}
          pendingCount={pendingCount}
        />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Actions & Status */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* System Controls (New) */}
            <SystemControls initialConfig={systemConfig} />
            
            {/* Global Status */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -mr-16 -mt-16"></div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-orange-400" />
                                Operations Status
                            </h3>
                            <p className="text-slate-300 max-w-lg leading-relaxed">
                                Restaurants are currently configured to operate from <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{RESTAURANT_TIMINGS.opensAt}</span> to <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{RESTAURANT_TIMINGS.closesAt}</span>.
                            </p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</span>
                            <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-4 py-2 rounded-xl border border-green-500/30 font-bold text-sm backdrop-blur-sm">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                </span>
                                Online
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link href="/admin/upload" className="group">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/10 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-orange-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Menu</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Update existing menus or add new items via CSV upload.</p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/admin/restaurants/new" className="group">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-emerald-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Add Restaurant</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Onboard a new restaurant partner to the platform.</p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/admin/offers" className="group">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/10 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                              <ExternalLink className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Manage Offers</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Configure promotional campaigns and discount codes.</p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/admin/analytics" className="group">
                      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 transition-all h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-purple-50 w-24 h-24 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                              <FileSpreadsheet className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">View Data</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">Access raw data, logs, and analytics.</p>
                        </div>
                      </div>
                    </Link>
                </div>
            </div>
        </div>

        {/* Right Column - Pending Drafts */}
        <div className="space-y-6">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Pending Reviews</h2>
                    <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                        {pendingCount} Pending
                    </span>
                </div>

                {pendingCount > 0 ? (
                    <div className="space-y-4">
                        {/* New Restaurants Drafts */}
                        {newDraftRestaurants.map(r => (
                            <div key={r.id} className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-slate-900">{r.name}</h3>
                                    <span className="flex items-center gap-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                      <Store className="w-3 h-3" /> New
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium mb-4">
                                    <Clock className="w-3 h-3" />
                                    <span>Pending Activation</span>
                                </div>
                                <Link 
                                    href={`/admin/preview/${r.id}`}
                                    className="block w-full text-center bg-white text-emerald-600 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-600 hover:text-white transition-all border border-emerald-200"
                                >
                                    Review & Activate
                                </Link>
                            </div>
                        ))}

                        {/* Menu Updates Drafts */}
                        {pendingMenuUpdates.map(r => (
                            <div key={r.id} className="p-4 rounded-2xl bg-orange-50 border border-orange-100 hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-slate-900">{r.name}</h3>
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-orange-700 font-medium mb-4">
                                    <Clock className="w-3 h-3" />
                                    <span>Menu Update Pending</span>
                                </div>
                                <Link 
                                    href={`/admin/preview/${r.id}`}
                                    className="block w-full text-center bg-white text-orange-600 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-orange-600 hover:text-white transition-all border border-orange-200"
                                >
                                    Review & Publish
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="font-bold text-slate-900">All Caught Up!</h3>
                        <p className="text-sm text-slate-500 mt-2">No pending menu updates to review.</p>
                    </div>
                )}
             </div>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="flex items-center gap-2 text-xs text-slate-400 px-4">
        <AlertCircle className="w-4 h-4" />
        <p>Data is stored in JSON format. Updates are ephemeral in preview environments.</p>
      </div>
    </div>
  );
}
