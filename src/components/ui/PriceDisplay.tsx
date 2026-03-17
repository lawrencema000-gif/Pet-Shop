import { cn } from "@/lib/utils";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { Badge } from "./Badge";

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { price: "text-sm font-semibold", compare: "text-xs" },
  md: { price: "text-lg font-bold", compare: "text-sm" },
  lg: { price: "text-2xl font-bold", compare: "text-base" },
};

export function PriceDisplay({
  price,
  compareAtPrice,
  className,
  size = "md",
}: PriceDisplayProps) {
  const discount =
    compareAtPrice ? getDiscountPercentage(price, compareAtPrice) : 0;
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      <span
        className={cn(
          styles.price,
          compareAtPrice && discount > 0 ? "text-sale" : "text-foreground"
        )}
      >
        {formatPrice(price)}
      </span>
      {compareAtPrice && discount > 0 && (
        <>
          <span
            className={cn(
              styles.compare,
              "text-muted line-through"
            )}
          >
            {formatPrice(compareAtPrice)}
          </span>
          <Badge variant="sale">-{discount}%</Badge>
        </>
      )}
    </div>
  );
}
