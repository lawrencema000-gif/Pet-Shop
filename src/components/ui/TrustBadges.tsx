import { Truck, RotateCcw, Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const badges = [
  { icon: Truck, label: "Free Shipping $75+" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: Shield, label: "1-Year Warranty" },
  { icon: Lock, label: "Secure Checkout" },
];

interface TrustBadgesProps {
  layout?: "horizontal" | "vertical";
  className?: string;
}

export function TrustBadges({ layout = "horizontal", className }: TrustBadgesProps) {
  return (
    <div
      className={cn(
        "flex gap-6",
        layout === "horizontal"
          ? "flex-row flex-wrap items-center justify-center"
          : "flex-col items-start",
        className
      )}
    >
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-muted"
        >
          <Icon size={18} className="shrink-0" />
          <span className="text-xs font-medium whitespace-nowrap">{label}</span>
        </div>
      ))}
    </div>
  );
}
