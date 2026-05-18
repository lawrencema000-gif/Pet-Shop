"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingBag,
  Users,
  MessageSquare,
  MessageCircle,
  Ticket,
  Mail,
  BarChart3,
  FileText,
  UserCog,
  Settings,
  LogOut,
  Warehouse,
  RotateCcw,
  Layers,
  Store,
  Gift,
  ShieldAlert,
  AlertOctagon,
  HelpCircle,
  Send,
  UsersRound,
  Zap,
  Truck,
  Megaphone,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useAuth } from "@/lib/supabase/auth-provider";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface NavItem {
  href: string;
  icon: LucideIcon;
  labelKey: string;
  perm?: string;
  superOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/admin/products", icon: Package, labelKey: "products", perm: "products:read" },
  { href: "/admin/inventory", icon: Warehouse, labelKey: "inventory", perm: "products:read" },
  { href: "/admin/collections", icon: Layers, labelKey: "collections", perm: "products:read" },
  { href: "/admin/categories", icon: FolderOpen, labelKey: "categories", perm: "categories:read" },
  { href: "/admin/orders", icon: ShoppingBag, labelKey: "orders", perm: "orders:read" },
  { href: "/admin/returns", icon: RotateCcw, labelKey: "returns", perm: "orders:read" },
  { href: "/admin/customers", icon: Users, labelKey: "customers", perm: "customers:read" },
  { href: "/admin/reviews", icon: MessageSquare, labelKey: "reviews", perm: "reviews:read" },
  { href: "/admin/chat", icon: MessageCircle, labelKey: "chat" },
  { href: "/admin/coupons", icon: Ticket, labelKey: "coupons", perm: "coupons:read" },
  { href: "/admin/gift-cards", icon: Gift, labelKey: "giftCards", perm: "coupons:read" },
  { href: "/admin/newsletter", icon: Mail, labelKey: "newsletter", perm: "newsletter:read" },
  { href: "/admin/email-campaigns", icon: Send, labelKey: "emailCampaigns", perm: "newsletter:read" },
  { href: "/admin/segments", icon: UsersRound, labelKey: "segments", perm: "customers:read" },
  { href: "/admin/qa", icon: HelpCircle, labelKey: "qa", perm: "reviews:read" },
  { href: "/admin/fraud", icon: ShieldAlert, labelKey: "fraud", perm: "orders:read" },
  { href: "/admin/chargebacks", icon: AlertOctagon, labelKey: "chargebacks", perm: "orders:read" },
  { href: "/admin/automation", icon: Zap, labelKey: "automation", perm: "settings:read" },
  { href: "/admin/analytics", icon: BarChart3, labelKey: "analytics", perm: "analytics:read" },
  { href: "/admin/blog", icon: FileText, labelKey: "blog", perm: "content:read" },
  { href: "/admin/seo-bridge", icon: Zap, labelKey: "seoBridge", perm: "settings:read" },
  { href: "/admin/suppliers", icon: Truck, labelKey: "suppliers", perm: "settings:read" },
  { href: "/admin/fulfillment", icon: Package, labelKey: "fulfillment", perm: "orders:read" },
  { href: "/admin/subscriptions", icon: Send, labelKey: "subscriptions", perm: "orders:read" },
  { href: "/admin/shipping-rates", icon: Truck, labelKey: "shipping-rates", perm: "settings:read" },
  { href: "/admin/email-templates", icon: Mail, labelKey: "email-templates", perm: "settings:read" },
  { href: "/admin/affiliates", icon: Megaphone, labelKey: "affiliates", perm: "settings:read" },
  { href: "/admin/membership", icon: Crown, labelKey: "membership", perm: "settings:read" },
  { href: "/admin/seo-pages", icon: FileText, labelKey: "seoPages", perm: "settings:read" },
  { href: "/admin/staff", icon: UserCog, labelKey: "staff", superOnly: true },
  { href: "/admin/settings", icon: Settings, labelKey: "settings", perm: "settings:read" },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { isSuperAdmin, hasPermission, roleName } = useStaffPermissions();
  const { profile, signOut } = useAuth();
  const { t } = useTranslation();

  const filteredNav = useMemo(() => {
    if (isSuperAdmin) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => {
      if (item.superOnly) return false;
      if (item.perm) return hasPermission(item.perm);
      return true;
    });
  }, [isSuperAdmin, hasPermission]);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-border">
        <Link href="/admin" className="font-display font-bold text-xl text-foreground tracking-tight" onClick={onClose}>
          Pet and Angels
        </Link>
        <span className="ml-2 text-[10px] font-semibold text-accent bg-accent-light px-1.5 py-0.5 rounded">
          {t("admin.sidebar.admin")}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                    active
                      ? "bg-accent text-white"
                      : "text-muted hover:text-foreground hover:bg-surface"
                  )}
                >
                  <Icon size={18} className={active ? "text-white" : ""} />
                  {t(`admin.sidebar.${item.labelKey}`)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info + sign out */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-bold">
            {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {profile?.full_name ?? "Admin"}
            </p>
            <p className="text-xs text-muted truncate">{roleName}</p>
          </div>
        </div>
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-accent hover:bg-accent-light rounded-md transition-colors"
        >
          <Store size={16} />
          {t("admin.sidebar.backToStore")}
        </Link>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-sale hover:bg-sale/5 rounded-md transition-colors"
        >
          <LogOut size={16} />
          {t("admin.sidebar.signOut")}
        </button>
      </div>
    </aside>
  );
}
