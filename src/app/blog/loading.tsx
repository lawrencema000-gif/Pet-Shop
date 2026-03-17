import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Skeleton variant="text" className="w-32 h-4 mb-8" />

      {/* Heading */}
      <Skeleton variant="heading" className="mb-2 w-64" />
      <Skeleton variant="text" className="w-96 mb-8" />

      {/* Featured post skeleton */}
      <div className="mb-12">
        <Skeleton variant="image" className="!aspect-[2/1] w-full rounded-lg mb-4" />
        <Skeleton variant="heading" className="w-2/3 mb-2" />
        <Skeleton variant="text" className="w-full mb-1" />
        <Skeleton variant="text" className="w-3/4" />
      </div>

      {/* Category tabs */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-20 h-9 rounded-full" />
        ))}
      </div>

      {/* Blog grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton variant="image" className="!aspect-[3/2] rounded-lg" />
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="heading" className="w-4/5 h-6" />
            <Skeleton variant="text" className="w-full" />
            <Skeleton variant="text" className="w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
