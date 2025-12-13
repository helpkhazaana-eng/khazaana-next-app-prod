import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Offers Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[280px] p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-48 mb-2 rounded" />
              <Skeleton className="h-4 w-full mb-4 rounded" />
              
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center mt-4">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
