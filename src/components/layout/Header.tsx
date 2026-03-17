"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
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

  const totalItems = useCartStore((s) => s.totalItems());
  const openCart = useCartStore((s) => s.openDrawer);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
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
                className="text-xl font-bold tracking-tight text-foreground"
              >
                {SITE_CONFIG.name}
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
                      "px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-surface-light",
                      link.highlight
                        ? "text-sale hover:bg-red-50"
                        : "text-foreground-muted"
                    )}
                  >
                    {link.label}
                  </Link>

                  <AnimatePresence>
                    {hoveredNav === link.label && link.children && (
                      <MegaMenu
                        items={link.children}
                        onClose={() => setHoveredNav(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right: Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
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
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-sale rounded-full">
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
