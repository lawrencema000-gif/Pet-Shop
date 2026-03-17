import { cn } from "@/lib/utils";

type SkeletonVariant = "text" | "heading" | "image" | "card";

interface SkeletonProps {
  variant?: SkeletonVariant;
  className?: string;
}

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 w-full rounded",
  heading: "h-8 w-3/4 rounded",
  image: "aspect-square w-full rounded-lg",
  card: "h-80 w-full rounded-lg",
};

export function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface",
        variantStyles[variant],
        className
      )}
    />
  );
}
