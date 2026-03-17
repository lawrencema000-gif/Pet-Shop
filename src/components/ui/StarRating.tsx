import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
}

export function StarRating({ rating, count, size = 16, className }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const starValue = i + 1;
    if (rating >= starValue) return "full";
    if (rating >= starValue - 0.5) return "half";
    return "empty";
  });

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)}>
      {stars.map((type, i) => (
        <span key={i} className="relative">
          {type === "full" && (
            <Star
              size={size}
              className="fill-amber-400 text-amber-400"
            />
          )}
          {type === "half" && (
            <span className="relative inline-block">
              <Star size={size} className="text-gray-200" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star
                  size={size}
                  className="fill-amber-400 text-amber-400"
                />
              </span>
            </span>
          )}
          {type === "empty" && (
            <Star size={size} className="text-gray-200" />
          )}
        </span>
      ))}
      {count !== undefined && (
        <span className="ml-1 text-sm text-muted">({count})</span>
      )}
    </div>
  );
}
