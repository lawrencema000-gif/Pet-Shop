import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "sale" | "new" | "popular";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-accent",
  sale: "bg-sale",
  new: "bg-success",
  popular: "bg-foreground",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 text-xs font-medium text-white rounded-full",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
