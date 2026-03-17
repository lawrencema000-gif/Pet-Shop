"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { NavChild, NavLink } from "@/lib/constants";

interface MegaMenuProps {
  categoryLabel: string;
  categoryHref: string;
  items: NavChild[];
  featured?: NavLink["featured"];
  onClose: () => void;
}

export function MegaMenu({ categoryLabel, categoryHref, items, featured, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-border/80 z-50 overflow-hidden"
      style={{ minWidth: featured ? "520px" : "280px" }}
      onMouseLeave={onClose}
      role="menu"
    >
      <div className={featured ? "grid grid-cols-[1fr_220px]" : ""}>
        {/* Left: Subcategory links */}
        <div className="p-4">
          {/* Quick links */}
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border/50">
            <Link
              href={`${categoryHref}?sort=newest`}
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/70 transition-colors"
              role="menuitem"
            >
              <Sparkles size={12} />
              New Arrivals
            </Link>
            <Link
              href={`${categoryHref}?sort=best-selling`}
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent/70 transition-colors"
              role="menuitem"
            >
              <TrendingUp size={12} />
              Best Sellers
            </Link>
          </div>

          {/* Category items */}
          <div className="flex flex-col gap-0.5">
            {items.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                onClick={onClose}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground-muted hover:bg-surface-light hover:text-foreground transition-colors group"
                role="menuitem"
              >
                <span className="font-medium">{child.label}</span>
                {child.badge && (
                  <Badge
                    variant={
                      child.badge === "New"
                        ? "new"
                        : child.badge === "Best Seller"
                        ? "popular"
                        : "default"
                    }
                    className="text-[10px] px-2 py-0.5"
                  >
                    {child.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Shop All link */}
          <div className="mt-3 pt-3 border-t border-border/50">
            <Link
              href={categoryHref}
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-accent hover:text-accent/70 transition-colors group"
              role="menuitem"
            >
              Shop All {categoryLabel}
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Right: Featured promo card */}
        {featured && (
          <div className="bg-surface-light/60 p-4 flex flex-col justify-center border-l border-border/50">
            <div className="rounded-lg bg-surface overflow-hidden mb-3 relative w-full h-28">
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="220px"
                className="object-cover"
              />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              {featured.title}
            </h4>
            <p className="text-xs text-muted mb-3 leading-relaxed">
              {featured.description}
            </p>
            <Link
              href={featured.href}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-accent px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors w-fit"
              role="menuitem"
            >
              {featured.cta}
              <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
