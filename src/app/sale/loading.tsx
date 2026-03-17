import { Skeleton } from "@/components/ui/Skeleton";

export default function SaleLoading() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <div className="container-main py-3">
          <Skeleton variant="text" className="w-32 h-4" />
        </div>
      </div>

      {/* Hero banner */}
      <div className="bg-surface-light py-12">
        <div className="container-main text-center space-y-4">
          <Skeleton variant="heading" className="w-72 mx-auto h-10" />
          <Skeleton variant="text" className="w-96 mx-auto" />
        </div>
      </div>

      {/* Product grid */}
      <div className="container-main py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton variant="image" />
              <Skeleton variant="text" className="w-3/4" />
              <div className="flex gap-2">
                <Skeleton variant="text" className="w-16 h-5" />
                <Skeleton variant="text" className="w-16 h-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
