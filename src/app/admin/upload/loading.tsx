import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-56 rounded-md" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="space-y-6">
          {/* Restaurant Select Skeleton */}
          <div>
            <Skeleton className="h-4 w-32 mb-2 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          {/* File Upload Skeleton */}
          <div>
            <Skeleton className="h-4 w-28 mb-2 rounded" />
            <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-200 border-dashed rounded-xl bg-slate-50">
              <div className="space-y-2 flex flex-col items-center w-full">
                <Skeleton className="h-16 w-16 rounded-full mb-2" />
                <div className="flex flex-col items-center gap-1 w-full">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-3 w-32 mt-2 rounded" />
              </div>
            </div>
          </div>

          {/* Info Box Skeleton */}
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <Skeleton className="h-4 w-40 mb-2 rounded bg-blue-200" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-full rounded bg-blue-200" />
              <Skeleton className="h-3 w-3/4 rounded bg-blue-200" />
            </div>
          </div>

          {/* Submit Button Skeleton */}
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
