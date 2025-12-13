import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 mb-2 rounded-lg" />
          <Skeleton className="h-6 w-64 rounded-md" />
        </div>
        <Skeleton className="h-9 w-40 rounded-full" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[140px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2 rounded" />
              <Skeleton className="h-8 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Actions & Status */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Global Status Skeleton */}
            <div className="bg-slate-900 rounded-3xl p-8 h-[180px] relative overflow-hidden">
                <div className="flex justify-between h-full">
                    <div className="space-y-4 w-2/3">
                        <Skeleton className="h-8 w-48 bg-slate-800" />
                        <Skeleton className="h-4 w-full bg-slate-800" />
                        <Skeleton className="h-4 w-3/4 bg-slate-800" />
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-2">
                        <Skeleton className="h-4 w-24 bg-slate-800" />
                        <Skeleton className="h-9 w-28 rounded-xl bg-slate-800" />
                    </div>
                </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div>
                <Skeleton className="h-7 w-32 mb-6 rounded" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[160px]">
                        <Skeleton className="h-12 w-12 rounded-2xl mb-4" />
                        <Skeleton className="h-6 w-32 mb-2 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                      </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Column - Pending Drafts Skeleton */}
        <div className="space-y-6">
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 h-full min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-7 w-40 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="p-4 rounded-2xl border border-slate-100 h-[120px] flex flex-col justify-between">
                            <div className="flex justify-between">
                                <Skeleton className="h-5 w-32 rounded" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-24 rounded" />
                            <Skeleton className="h-9 w-full rounded-xl" />
                        </div>
                    ))}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
}
