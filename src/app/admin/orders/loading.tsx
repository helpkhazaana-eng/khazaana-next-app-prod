import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-40 mb-2 rounded-lg" />
          <Skeleton className="h-5 w-64 rounded-md" />
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters & Search Skeleton */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <Skeleton className="h-10 w-full md:w-96 rounded-xl" />
          <div className="flex gap-2 w-full md:w-auto items-center">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>

        {/* Orders Table Skeleton */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Table Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex gap-4">
                {[...Array(7)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-20 rounded" />
                ))}
              </div>
              
              {/* Table Body */}
              <div className="divide-y divide-slate-100">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <Skeleton className="h-5 w-16 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-32 rounded" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                    <Skeleton className="h-6 w-24 rounded-lg" />
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-20 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                    <Skeleton className="h-8 w-28 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
