import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-10 w-48 mb-2 rounded-lg" />
          <Skeleton className="h-6 w-72 rounded-md" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      {/* Restaurants Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden h-[380px] flex flex-col">
            {/* Image Skeleton */}
            <Skeleton className="h-48 w-full" />
            
            <div className="p-5 flex flex-col flex-1">
              {/* Header */}
              <div className="flex justify-between items-start mb-2">
                <Skeleton className="h-6 w-40 rounded" />
                <Skeleton className="h-6 w-12 rounded-full" />
              </div>
              
              {/* Meta */}
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50 mt-auto mb-4">
                <div>
                  <Skeleton className="h-3 w-16 mb-1 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1 rounded" />
                  <Skeleton className="h-5 w-12 rounded" />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
