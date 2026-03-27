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
  type LucideIcon,
} from "lucide-react";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useAuth } from "@/lib/supabase/auth-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  perm?: string;
  superOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products", perm: "products:read" },
  { href: "/admin/inventory", icon: Warehouse, label: "Inventory", perm: "products:read" },
  { href: "/admin/categories", icon: FolderOpen, label: "Categories", perm: "categories:read" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders", perm: "orders:read" },
  { href: "/admin/returns", icon: RotateCcw, label: "Returns", perm: "orders:read" },
  { href: "/admin/customers", icon: Users, label: "Customers", perm: "customers:read" },
  { href: "/admin/reviews", icon: MessageSquare, label: "Reviews", perm: "reviews:read" },
  { href: "/admin/chat", icon: MessageCircle, label: "Chat" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons", perm: "coupons:read" },
  { href: "/admin/newsletter", icon: Mail, label: "Newsletter", perm: "newsletter:read" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics", perm: "analytics:read" },
  { href: "/admin/content", icon: FileText, label: "Content", perm: "content:read" },
  { href: "/admin/staff", icon: UserCog, label: "Staff", superOnly: true },
  { href: "/admin/settings", icon: Settings, label: "Settings", perm: "settings:read" },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { isSuperAdmin, hasPermission, roleName } = useStaffPermissions();
  const { profile, signOut } = useAuth();

  const filteredNav = useMemo(() => {
    if (isSuperAdmin) return navItems;
    return navItems.filter((item) => {
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
          PETLIBRO
        </Link>
        <span className="ml-2 text-[10px] font-semibold text-accent bg-accent-light px-1.5 py-0.5 rounded">
          Admin
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
                  {item.label}
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
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted hover:text-sale hover:bg-sale/5 rounded-md transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
