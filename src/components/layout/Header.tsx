"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";

export function Header() {
  const { t } = useTranslation();
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openDrawer);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-background border-b border-border transition-shadow duration-200",
          scrolled && "shadow-sm"
        )}
      >
        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 hover:bg-surface-light transition-colors rounded"
                aria-label={t('nav.openMenu')}
              >
                <Menu size={22} />
              </button>
              <Link
                href="/"
                className="flex items-center gap-2"
              >
                <Image
                  src="/logo.png"
                  alt="Pet and Angels"
                  width={36}
                  height={36}
                  className="rounded-full"
                />
                <span className="font-display font-bold tracking-tight text-foreground text-lg lg:text-xl">
                  {SITE_CONFIG.name}
                </span>
              </Link>
            </div>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() =>
                    link.children ? setHoveredNav(link.label) : setHoveredNav(null)
                  }
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "px-3 py-2 text-[13px] font-medium transition-colors hover:text-foreground",
                      link.highlight && link.highlightColor === "red"
                        ? "text-sale font-semibold"
                        : "text-muted",
                      hoveredNav === link.label && link.children && "text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>

                  {hoveredNav === link.label && link.children && (
                    <MegaMenu
                      categoryLabel={link.label}
                      categoryHref={link.href}
                      items={link.children}
                      featured={link.featured}
                      onClose={() => setHoveredNav(null)}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 hover:bg-surface-light transition-colors rounded"
                aria-label={t('nav.search')}
              >
                <Search size={20} />
              </button>
              <Link
                href="/auth/login"
                className="p-2 hover:bg-surface-light transition-colors hidden sm:flex rounded"
                aria-label={t('nav.account')}
              >
                <User size={20} />
              </Link>
              <button
                onClick={openCart}
                className="relative p-2 hover:bg-surface-light transition-colors rounded"
                aria-label={t('nav.cart')}
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-gold rounded-full">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Search modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
