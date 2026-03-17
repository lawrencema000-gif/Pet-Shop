import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search input skeleton */}
      <div className="max-w-2xl mx-auto mb-12">
        <Skeleton variant="heading" className="w-32 mx-auto mb-6" />
        <Skeleton variant="text" className="h-12 rounded-lg" />
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton variant="image" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}
