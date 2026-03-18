"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface AutocompleteProps {
  onSelect?: (url: string) => void;
  onSubmit?: (query: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

interface ProductResult {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  image_url: string | null;
}

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
}

export default function Autocomplete({
  onSelect,
  onSubmit,
  autoFocus = false,
  placeholder = "Search products...",
  value: controlledValue,
  onChange: controlledOnChange,
}: AutocompleteProps) {
  const [internalValue, setInternalValue] = useState("");
  const query = controlledValue !== undefined ? controlledValue : internalValue;
  const setQuery = controlledOnChange || setInternalValue;

  const [products, setProducts] = useState<ProductResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const totalItems = products.length + categories.length;

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setCategories([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select("id, name, slug, base_price, images:product_images(url, is_primary)")
          .ilike("name", `%${query.trim()}%`)
          .eq("status", "active")
          .limit(5),
        supabase
          .from("categories")
          .select("id, name, slug")
          .ilike("name", `%${query.trim()}%`)
          .limit(3),
      ]);

      const mappedProducts: ProductResult[] = (prodRes.data || []).map((p: Record<string, any>) => {
        const primaryImg = p.images?.find((img: Record<string, any>) => img.is_primary);
        const imgUrl = primaryImg?.url || p.images?.[0]?.url || null;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          base_price: p.base_price,
          image_url: imgUrl,
        };
      });

      setProducts(mappedProducts);
      setCategories((catRes.data as CategoryResult[]) || []);
      setIsOpen(mappedProducts.length > 0 || (catRes.data || []).length > 0);
      setActiveIndex(-1);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Autofocus
  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const navigateTo = useCallback(
    (url: string) => {
      setIsOpen(false);
      if (onSelect) {
        onSelect(url);
      } else {
        router.push(url);
      }
    },
    [onSelect, router]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      if (onSubmit) {
        onSubmit(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < products.length) {
        navigateTo(`/products/${products[activeIndex].slug}`);
      } else {
        const catIdx = activeIndex - products.length;
        navigateTo(`/categories/${categories[catIdx].slug}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hasResults = products.length > 0 || categories.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-10 py-4 text-lg border border-border rounded-xl bg-surface-light focus:outline-none focus:border-accent focus:bg-white transition-colors"
        />
        {loading && (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted animate-spin"
          />
        )}
      </form>

      <AnimatePresence>
        {isOpen && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-xl shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
          >
            {/* Products section */}
            {products.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider bg-surface-light">
                  Products
                </div>
                {products.map((product, idx) => (
                  <button
                    key={product.id}
                    onClick={() => navigateTo(`/products/${product.slug}`)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      activeIndex === idx ? "bg-surface-light" : "hover:bg-surface-light/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-surface-light overflow-hidden shrink-0 relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-border" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted">${product.base_price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Categories section */}
            {categories.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider bg-surface-light">
                  Categories
                </div>
                {categories.map((cat, idx) => {
                  const itemIdx = products.length + idx;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => navigateTo(`/categories/${cat.slug}`)}
                      onMouseEnter={() => setActiveIndex(itemIdx)}
                      className={`w-full px-4 py-3 text-left text-sm font-medium text-foreground transition-colors ${
                        activeIndex === itemIdx ? "bg-surface-light" : "hover:bg-surface-light/50"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
