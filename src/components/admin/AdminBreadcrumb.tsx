"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABEL_MAP: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  categories: "Categories",
  orders: "Orders",
  customers: "Customers",
  reviews: "Reviews",
  coupons: "Coupons",
  newsletter: "Newsletter",
  analytics: "Analytics",
  content: "Content",
  staff: "Staff",
  settings: "Settings",
  metafields: "Metafields",
  new: "New",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = LABEL_MAP[seg] ?? decodeURIComponent(seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Admin breadcrumb" className="flex items-center gap-1.5 text-xs text-muted mb-6">
      <Link href="/admin" className="hover:text-foreground transition-colors">
        <Home size={14} />
      </Link>
      {crumbs.slice(1).map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRight size={12} className="text-border" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
