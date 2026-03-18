"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { NavChild, NavLink } from "@/lib/constants";

interface MegaMenuProps {
  categoryLabel: string;
  categoryHref: string;
  items: NavChild[];
  featured?: NavLink["featured"];
  onClose: () => void;
}

export function MegaMenu({ categoryLabel, categoryHref, items, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-background border border-border shadow-sm z-50"
      style={{ minWidth: "240px" }}
      onMouseLeave={onClose}
      role="menu"
    >
      <div className="p-3">
        <div className="flex flex-col">
          {items.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onClose}
              className="px-3 py-2 text-sm text-muted hover:text-foreground hover:bg-surface-light transition-colors"
              role="menuitem"
            >
              {child.label}
            </Link>
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-border">
          <Link
            href={categoryHref}
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
            role="menuitem"
          >
            Shop All {categoryLabel}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
