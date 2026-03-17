import { Skeleton } from "@/components/ui/Skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Skeleton variant="text" className="w-60 h-4 mb-8" />

      {/* Product section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Gallery skeleton */}
        <div className="flex-1 space-y-4">
          <Skeleton variant="image" className="rounded-lg" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="image"
                className="!aspect-square w-16 h-16 rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="w-full lg:w-[440px] shrink-0 space-y-6">
          <Skeleton variant="heading" className="w-4/5" />
          <Skeleton variant="text" className="w-2/3" />
          <Skeleton variant="text" className="w-24 h-6" />
          <Skeleton variant="heading" className="w-32 h-10" />
          <div className="space-y-3">
            <Skeleton variant="text" className="w-20 h-4" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  className="w-20 h-10 rounded-lg"
                />
              ))}
            </div>
          </div>
          <Skeleton variant="text" className="w-full h-14 rounded-lg" />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-16 space-y-6">
        <div className="flex gap-6 border-b border-border pb-3">
          <Skeleton variant="text" className="w-24 h-5" />
          <Skeleton variant="text" className="w-28 h-5" />
          <Skeleton variant="text" className="w-20 h-5" />
        </div>
        <div className="space-y-3">
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>
    </div>
  );
}
