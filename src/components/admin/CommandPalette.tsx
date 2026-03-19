"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, ShoppingBag, Users, FileText, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  label: string;
  description?: string;
  href: string;
  type: "page" | "product" | "order" | "customer";
}

const ADMIN_PAGES: SearchResult[] = [
  { id: "dash", label: "Dashboard", href: "/admin", type: "page" },
  { id: "prods", label: "Products", href: "/admin/products", type: "page" },
  { id: "cats", label: "Categories", href: "/admin/categories", type: "page" },
  { id: "ords", label: "Orders", href: "/admin/orders", type: "page" },
  { id: "custs", label: "Customers", href: "/admin/customers", type: "page" },
  { id: "revs", label: "Reviews", href: "/admin/reviews", type: "page" },
  { id: "coups", label: "Coupons", href: "/admin/coupons", type: "page" },
  { id: "news", label: "Newsletter", href: "/admin/newsletter", type: "page" },
  { id: "anal", label: "Analytics", href: "/admin/analytics", type: "page" },
  { id: "cont", label: "Content", href: "/admin/content", type: "page" },
  { id: "staff", label: "Staff", href: "/admin/staff", type: "page" },
  { id: "sett", label: "Settings", href: "/admin/settings", type: "page" },
];

const TYPE_ICONS = {
  page: FileText,
  product: Package,
  order: ShoppingBag,
  customer: Users,
};

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults(ADMIN_PAGES);
        return;
      }

      setLoading(true);
      const lower = q.toLowerCase();

      // Filter admin pages
      const pageResults = ADMIN_PAGES.filter((p) =>
        p.label.toLowerCase().includes(lower)
      );

      // Search products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug")
        .ilike("name", `%${q}%`)
        .limit(5);

      const productResults: SearchResult[] = (products ?? []).map((p) => ({
        id: p.id,
        label: p.name,
        description: `Product · ${p.slug}`,
        href: `/admin/products/${p.id}`,
        type: "product",
      }));

      // Search orders
      const { data: orders } = await supabase
        .from("orders")
        .select("id, email, total, status")
        .or(`email.ilike.%${q}%,id.eq.${q.length === 36 ? q : "00000000-0000-0000-0000-000000000000"}`)
        .limit(5);

      const orderResults: SearchResult[] = (orders ?? []).map((o) => ({
        id: o.id,
        label: `Order ${o.id.slice(0, 8)}...`,
        description: `${o.email} · $${o.total}`,
        href: `/admin/orders/${o.id}`,
        type: "order",
      }));

      // Search customers
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .ilike("full_name", `%${q}%`)
        .eq("role", "customer")
        .limit(5);

      const customerResults: SearchResult[] = (profiles ?? []).map((p) => ({
        id: p.id,
        label: p.full_name ?? "Unknown",
        description: "Customer",
        href: `/admin/customers/${p.id}`,
        type: "customer",
      }));

      setResults([...pageResults, ...productResults, ...orderResults, ...customerResults]);
      setActiveIndex(0);
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults(ADMIN_PAGES);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  function navigate(result: SearchResult) {
    router.push(result.href);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-lg shadow-luxe border border-border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, products, orders..."
            className="flex-1 h-12 text-sm text-foreground placeholder:text-muted bg-transparent outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted hover:text-foreground">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {loading && (
            <div className="px-4 py-3 text-sm text-muted">Searching...</div>
          )}
          {!loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No results found
            </div>
          )}
          {!loading &&
            results.map((result, i) => {
              const Icon = TYPE_ICONS[result.type];
              return (
                <button
                  key={result.id}
                  onClick={() => navigate(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === activeIndex ? "bg-accent-light" : "hover:bg-surface"
                  )}
                >
                  <Icon size={16} className="text-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {result.label}
                    </p>
                    {result.description && (
                      <p className="text-xs text-muted truncate">
                        {result.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted">
          <span><kbd className="font-mono bg-surface px-1 py-0.5 rounded">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono bg-surface px-1 py-0.5 rounded">↵</kbd> Open</span>
          <span><kbd className="font-mono bg-surface px-1 py-0.5 rounded">esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
