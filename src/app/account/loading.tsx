import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <Skeleton variant="heading" className="w-40 mb-2" />
      <Skeleton variant="text" className="w-56 mb-8" />

      {/* Profile card */}
      <div className="rounded-lg border border-border p-6 mb-8 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="image" className="!aspect-square w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton variant="text" className="w-40 h-5" />
            <Skeleton variant="text" className="w-56 h-4" />
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <Skeleton variant="heading" className="w-36 h-6 mb-4" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-4 flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton variant="text" className="w-32 h-4" />
              <Skeleton variant="text" className="w-48 h-4" />
            </div>
            <Skeleton variant="text" className="w-20 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
