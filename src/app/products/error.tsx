"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Products error:", error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Failed to load products
          </h2>
          <p className="text-muted">
            We couldn&apos;t load the product catalog. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-red-500 mt-2 font-mono bg-red-50 rounded p-3 text-left break-all">
              {error.message}
            </p>
          )}
        </div>
        <Button onClick={reset} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
