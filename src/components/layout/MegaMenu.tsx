"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface MegaMenuChild {
  label: string;
  href: string;
  badge?: string;
}

interface MegaMenuProps {
  items: MegaMenuChild[];
  onClose: () => void;
}

export function MegaMenu({ items, onClose }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg border border-border p-4 min-w-[240px] z-50"
      onMouseLeave={onClose}
    >
      <div className="flex flex-col gap-1">
        {items.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-foreground hover:bg-surface-light transition-colors"
          >
            <span>{child.label}</span>
            {child.badge && (
              <Badge
                variant={
                  child.badge === "New"
                    ? "new"
                    : child.badge === "Best Seller"
                    ? "popular"
                    : "default"
                }
              >
                {child.badge}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
