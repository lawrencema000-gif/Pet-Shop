"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import { supabase } from "@/lib/supabase/client";
import type { Product, Category } from "@/types/product";

function SuggestedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order")
        .limit(6);
      if (data) setCategories(data as Category[]);
    };
    fetchCategories();
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="px-5 py-2.5 text-sm font-medium text-foreground bg-surface-light rounded-full hover:bg-surface transition-colors"
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

function SearchContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [inputValue, setInputValue] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) {
      setProducts([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const { data } = await supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*)")
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .eq("status", "active")
      .limit(24);

    setProducts((data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    searchProducts(query);
  }, [query, searchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== query) {
        const params = new URLSearchParams();
        if (inputValue.trim()) {
          params.set("q", inputValue.trim());
        }
        router.replace(`/search${params.toString() ? `?${params}` : ""}`);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [inputValue, query, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="relative">
          <Search
            size={22}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t('searchPage.placeholder')}
            autoFocus
            className="w-full border border-border rounded-xl pl-12 pr-4 py-4 text-lg text-foreground placeholder:text-muted bg-background transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {loading && (
            <Loader2
              size={20}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted animate-spin"
            />
          )}
        </div>
      </div>

      {/* Results */}
      {searched && !loading && (
        <p className="text-sm text-muted mb-6">
          {t('searchPage.resultsCount', { count: products.length, query })}
        </p>
      )}

      {searched && !loading && products.length === 0 && (
        <div className="text-center py-16">
          <Search size={48} className="text-border mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('searchPage.noResults')}
          </h2>
          <p className="text-muted max-w-md mx-auto mb-8">
            {t('searchPage.noResultsDesc', { query })}
          </p>
          <SuggestedCategories />
        </div>
      )}

      {products.length > 0 && <ProductGrid products={products} />}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={32} className="animate-spin text-muted" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
