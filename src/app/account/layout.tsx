"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  MapPin,
  Package,
  PawPrint,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useTranslation } from "react-i18next";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  const NAV_ITEMS = [
    { href: "/account", label: t('account.dashboard'), icon: LayoutDashboard },
    { href: "/account/profile", label: t('account.profile'), icon: User },
    { href: "/account/addresses", label: t('account.addresses'), icon: MapPin },
    { href: "/account/orders", label: t('account.orders'), icon: Package },
    { href: "/account/pets", label: t('petsPage.heading'), icon: PawPrint },
    { href: "/account/settings", label: t('account.settings'), icon: Settings },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/account") return pathname === "/account";
    return pathname.startsWith(href);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Mobile: horizontal scroll tabs */}
      <nav className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max pb-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  isActive(item.href)
                    ? "bg-accent text-white"
                    : "bg-surface-light text-muted hover:text-foreground hover:bg-surface"
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-accent-light text-accent transition-colors"
            >
              <Shield size={16} />
              {t('nav.admin')}
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap bg-surface-light text-muted hover:text-sale hover:bg-sale/5 transition-colors"
          >
            <LogOut size={16} />
            {t('common.signOut')}
          </button>
        </div>
      </nav>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <nav className="sticky top-24 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-accent text-white"
                      : "text-muted hover:text-foreground hover:bg-surface-light"
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && (
              <>
                <div className="border-t border-border my-3" />
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-accent hover:bg-accent-light transition-colors"
                >
                  <Shield size={18} />
                  {t('nav.adminPanel')}
                </Link>
              </>
            )}
            <div className="border-t border-border my-3" />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-medium text-muted hover:text-sale hover:bg-sale/5 transition-colors"
            >
              <LogOut size={18} />
              {t('common.signOut')}
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
