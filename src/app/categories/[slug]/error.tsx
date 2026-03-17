"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Category error:", error);
  }, [error]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            Failed to load category
          </h2>
          <p className="text-muted">
            We couldn&apos;t load this category. Please try again.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-sm text-red-500 mt-2 font-mono bg-red-50 rounded p-3 text-left break-all">
              {error.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
