import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogPostLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Skeleton variant="text" className="w-60 h-4 mb-8" />

      {/* Category + date */}
      <div className="flex gap-3 mb-4">
        <Skeleton variant="text" className="w-20 h-5 rounded-full" />
        <Skeleton variant="text" className="w-28 h-5" />
      </div>

      {/* Title */}
      <Skeleton variant="heading" className="w-full h-10 mb-2" />
      <Skeleton variant="heading" className="w-2/3 h-10 mb-6" />

      {/* Author */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton variant="image" className="!aspect-square w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton variant="text" className="w-32 h-4" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>

      {/* Featured image */}
      <Skeleton variant="image" className="!aspect-[2/1] w-full rounded-lg mb-8" />

      {/* Content paragraphs */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="text" className={i % 3 === 2 ? "w-4/5" : "w-full"} />
        ))}
      </div>

      {/* Related posts */}
      <div className="mt-16 space-y-6">
        <Skeleton variant="heading" className="w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="image" className="!aspect-[3/2] rounded-lg" />
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
