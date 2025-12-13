import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="space-y-8 pb-10">
        {/* Header Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 mb-2 rounded" />
              <Skeleton className="h-8 w-32 rounded" />
            </div>
          ))}
        </div>

        {/* Revenue Chart Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <Skeleton className="h-7 w-64 mb-6 rounded" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Dishes Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Skeleton className="h-7 w-48 mb-6 rounded" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Top Restaurants Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Skeleton className="h-7 w-56 mb-6 rounded" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Peak Ordering Times Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Skeleton className="h-7 w-48 mb-6 rounded" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>

          {/* Top Users Skeleton */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <Skeleton className="h-7 w-52 mb-6 rounded" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <div className="space-y-1 flex flex-col items-end">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
