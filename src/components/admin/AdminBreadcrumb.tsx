"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const LABEL_KEYS: Record<string, string> = {
  admin: "dashboard",
  products: "products",
  categories: "categories",
  orders: "orders",
  customers: "customers",
  reviews: "reviews",
  coupons: "coupons",
  newsletter: "newsletter",
  analytics: "analytics",
  content: "content",
  staff: "staff",
  settings: "settings",
  metafields: "metafields",
  new: "new",
  inventory: "inventory",
  collections: "collections",
  returns: "returns",
  chat: "chat",
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const labelKey = LABEL_KEYS[seg];
    const label = labelKey ? t(`admin.breadcrumb.${labelKey}`) : decodeURIComponent(seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label={t("admin.breadcrumb.label")} className="flex items-center gap-1.5 text-xs text-muted mb-6">
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
