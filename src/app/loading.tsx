import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-16">
      {/* Hero banner skeleton */}
      <Skeleton variant="image" className="!aspect-[3/1] w-full rounded-none" />

      {/* Trust strip */}
      <div className="max-w-7xl mx-auto px-4 flex justify-center gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-32 h-6" />
        ))}
      </div>

      {/* Shop by Pet section */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Skeleton variant="heading" className="mx-auto w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3 text-center">
              <Skeleton variant="image" className="!aspect-square rounded-full mx-auto w-32 h-32" />
              <Skeleton variant="text" className="w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>

      {/* Category cards */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Skeleton variant="heading" className="mx-auto w-56" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))}
        </div>
      </div>

      {/* Best sellers */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Skeleton variant="heading" className="mx-auto w-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="image" />
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2 h-5" />
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto space-y-4 text-center">
          <Skeleton variant="heading" className="mx-auto w-64" />
          <Skeleton variant="text" className="mx-auto w-80" />
          <Skeleton variant="text" className="mx-auto w-72 h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
