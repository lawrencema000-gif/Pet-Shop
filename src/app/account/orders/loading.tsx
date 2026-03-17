import { Skeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Skeleton variant="text" className="w-8 h-8 rounded" />
        <Skeleton variant="heading" className="w-32" />
      </div>

      {/* Order list */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton variant="text" className="w-36 h-5" />
                <Skeleton variant="text" className="w-28 h-4" />
              </div>
              <Skeleton variant="text" className="w-20 h-7 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Skeleton variant="text" className="w-24 h-4" />
              <Skeleton variant="text" className="w-16 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
