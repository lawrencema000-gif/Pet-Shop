"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard";

const STORAGE_KEY = "recently-viewed";

export default function RecentlyViewed() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        const slugs: string[] = JSON.parse(stored);
        if (slugs.length === 0) return;

        const { data } = await supabase
          .from("products")
          .select("*, images:product_images(*), variants:product_variants(*)")
          .in("slug", slugs)
          .eq("status", "active");

        if (!data || data.length === 0) return;

        // Preserve order from localStorage
        const slugOrder = new Map(slugs.map((s, i) => [s, i]));
        const sorted = (data as Product[]).sort(
          (a, b) => (slugOrder.get(a.slug) ?? 99) - (slugOrder.get(b.slug) ?? 99)
        );
        setProducts(sorted);
      } catch {
        // ignore
      }
    };

    fetchRecent();
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <div className="mt-16 relative">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Recently Viewed</h2>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-elevated border border-border flex items-center justify-center hover:bg-surface-light transition-colors -ml-4"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[260px] snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background shadow-elevated border border-border flex items-center justify-center hover:bg-surface-light transition-colors -mr-4"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
