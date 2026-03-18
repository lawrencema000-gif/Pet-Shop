import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "sale" | "new" | "popular" | "bundle" | "limited";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-accent text-white",
  sale: "bg-sale text-white",
  new: "bg-accent-light text-accent",
  popular: "bg-highlight text-foreground",
  bundle: "bg-warning/15 text-warning",
  limited: "bg-sale/10 text-sale",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
