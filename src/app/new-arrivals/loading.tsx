import { Skeleton } from "@/components/ui/Skeleton";

export default function NewArrivalsLoading() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <div className="container-main py-3">
          <Skeleton variant="text" className="w-40 h-4" />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-surface-light py-12">
        <div className="container-main text-center space-y-4">
          <Skeleton variant="heading" className="w-56 mx-auto h-10" />
          <Skeleton variant="text" className="w-80 mx-auto" />
        </div>
      </div>

      {/* Product grid */}
      <div className="container-main py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="relative">
                <Skeleton variant="image" />
              </div>
              <Skeleton variant="text" className="w-3/4" />
              <Skeleton variant="text" className="w-1/2 h-5" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
