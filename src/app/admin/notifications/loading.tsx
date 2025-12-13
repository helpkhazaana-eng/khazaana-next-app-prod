import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2 rounded" />
              <div className="relative">
                <Skeleton className="h-4 w-4 absolute left-3 top-3.5 rounded-full" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
          ))}
          
          <div className="pt-4">
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
