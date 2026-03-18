"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "All Products", href: "/products" },
  { label: "Feeders", href: "/categories/pet-feeders" },
  { label: "Fountains", href: "/categories/water-fountains" },
  { label: "Litter Boxes", href: "/categories/litter-boxes" },
  { label: "Accessories", href: "/categories/accessories" },
];

export default function StickyTab() {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border shadow-sm transition-transform duration-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-1 h-12 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setActiveTab(i)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2",
                i === activeTab
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-foreground"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
