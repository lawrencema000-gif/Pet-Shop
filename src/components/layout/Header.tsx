"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, Heart, HelpCircle, Package } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { useCartStore } from "@/lib/store/cart";
import { MegaMenu } from "./MegaMenu";
import { MobileNav } from "./MobileNav";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";

export function Header() {
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
          "sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300",
          scrolled && "shadow-elevated"
        )}
      >
        {/* Utility bar */}
        <div className="hidden lg:block border-b border-border/50 bg-surface-light/50">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="flex items-center justify-end gap-5 h-8 text-[11px] text-muted">
              <Link
                href="/track-order"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Package size={12} />
                Track Order
              </Link>
              <Link
                href="/support"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <HelpCircle size={12} />
                Help
              </Link>
            </div>
          </div>
        </div>

        {/* Main header */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              scrolled ? "h-14" : "h-16"
            )}
          >
            {/* Left: Hamburger (mobile) + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-surface-light transition-colors"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <Link
                href="/"
                className={cn(
                  "font-bold tracking-tight text-foreground transition-all duration-300",
                  scrolled ? "text-lg" : "text-xl lg:text-2xl"
                )}
              >
                {SITE_CONFIG.name}
              </Link>
            </div>

            {/* Center: Desktop nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
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
                      "px-3 py-2 text-[13px] font-medium rounded-lg transition-colors hover:bg-surface-light",
                      link.highlight && link.highlightColor === "red"
                        ? "text-sale font-semibold hover:bg-red-50"
                        : link.highlight && link.highlightColor === "accent"
                        ? "text-accent font-semibold"
                        : "text-foreground-muted",
                      hoveredNav === link.label && link.children && "bg-surface-light"
                    )}
                  >
                    {link.label}
                    {link.isNew && (
                      <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold text-white bg-success rounded-full leading-none">
                        NEW
                      </span>
                    )}
                  </Link>

                  <AnimatePresence>
                    {hoveredNav === link.label && link.children && (
                      <MegaMenu
                        categoryLabel={link.label}
                        categoryHref={link.href}
                        items={link.children}
                        featured={link.featured}
                        onClose={() => setHoveredNav(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center gap-0.5">
              <Link
                href="/quiz"
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent text-white text-[13px] font-medium hover:bg-accent-dark transition-colors mr-1"
              >
                <HelpCircle size={14} />
                Help Me Choose
              </Link>
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-light hover:bg-surface text-muted hover:text-foreground transition-colors text-sm"
                aria-label="Search"
              >
                <Search size={16} />
                <span className="hidden sm:inline text-[13px]">Search</span>
              </button>
              <Link
                href="/wishlist"
                className="p-2 rounded-lg hover:bg-surface-light transition-colors hidden sm:flex"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <Link
                href="/auth/login"
                className="p-2 rounded-lg hover:bg-surface-light transition-colors hidden sm:flex"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              <button
                onClick={openCart}
                className="relative p-2 rounded-lg hover:bg-surface-light transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-bold text-white bg-accent rounded-full ring-2 ring-background">
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
