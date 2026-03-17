import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb skeleton */}
      <Skeleton variant="text" className="w-40 h-4 mb-8" />

      {/* Heading skeleton */}
      <Skeleton variant="heading" className="mb-2" />
      <Skeleton variant="text" className="w-48 h-4 mb-8" />

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-64 shrink-0 space-y-6">
          <Skeleton variant="text" className="h-10" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-5 w-3/4" />
            ))}
          </div>
          <div className="flex gap-2">
            <Skeleton variant="text" className="h-10 flex-1" />
            <Skeleton variant="text" className="h-10 flex-1" />
          </div>
        </div>

        {/* Grid skeleton */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="image" />
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2 h-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
