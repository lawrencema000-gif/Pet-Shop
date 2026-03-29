"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  X,
  Star,
  Check,
  Minus,
  Plus,
  Truck,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useTranslation } from "react-i18next";
import type { Product } from "@/types/product";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const MAX_COMPARE = 4;

export default function CompareClient() {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Read slugs from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slugs = params.get("products")?.split(",").filter(Boolean) || [];
    if (slugs.length > 0) {
      fetchProductsBySlugs(slugs);
    } else {
      setLoading(false);
    }
  }, []);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchProductsBySlugs(slugs: string[]) {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select(
        "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
      )
      .in("slug", slugs)
      .eq("status", "active");
    setProducts(data || []);
    setLoading(false);
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const { data } = await supabase
      .from("products")
      .select(
        "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
      )
      .eq("status", "active")
      .ilike("name", `%${query}%`)
      .limit(6);
    const existing = products.map((p) => p.id);
    setSearchResults((data || []).filter((p) => !existing.includes(p.id)));
  }

  function addProduct(product: Product) {
    if (products.length >= MAX_COMPARE) return;
    const updated = [...products, product];
    setProducts(updated);
    updateURL(updated);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  }

  function removeProduct(id: string) {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    updateURL(updated);
  }

  function updateURL(prods: Product[]) {
    const slugs = prods.map((p) => p.slug).join(",");
    const url = slugs ? `?products=${slugs}` : "";
    window.history.replaceState(null, "", `/compare${url}`);
  }

  function handleAddToCart(product: Product) {
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
    const defaultVariant =
      product.variants?.find((v) => v.is_default) || product.variants?.[0];
    addItem({
      id: defaultVariant?.id ?? product.id,
      product_id: product.id,
      variant_id: defaultVariant?.id ?? null,
      name: product.name,
      variant_name: defaultVariant?.name ?? null,
      price: defaultVariant?.price ?? product.base_price,
      compare_at_price:
        defaultVariant?.compare_at_price ?? product.compare_at_price ?? null,
      image_url: primaryImage?.url ?? "",
      slug: product.slug,
    });
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent" />
        <p className="mt-4 text-muted">{t('compare.loadingProducts')}</p>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t('compare.home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('compare.heading')}</span>
        </nav>
      </div>

      <section className="container-main py-10 md:py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            {t('compare.heading')}
          </h1>
          <p className="mt-2 text-muted max-w-xl mx-auto">
            {t('compare.subtitle', { max: MAX_COMPARE })}
          </p>
        </div>

        {/* Search / Add Product */}
        {products.length < MAX_COMPARE && (
          <div className="max-w-md mx-auto mb-10 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder={t('compare.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  handleSearch(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                className="w-full rounded-lg border border-border bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
              {showSearch && searchResults.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 z-20 mt-1 rounded border border-border bg-background shadow-sm overflow-hidden"
                >
                  {searchResults.map((product) => {
                    const img =
                      product.images?.find((i) => i.is_primary) ||
                      product.images?.[0];
                    return (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-surface transition-colors"
                      >
                        {img?.url && (
                          <Image
                            src={img.url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted">
                            {formatPrice(product.base_price)}
                          </p>
                        </div>
                        <Plus className="h-4 w-4 text-accent shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
          </div>
        )}

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border rounded-xl">
            <Search className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">
              {t('compare.emptyTitle')}
            </h2>
            <p className="mt-2 text-muted max-w-sm mx-auto">
              {t('compare.emptyDesc', { max: MAX_COMPARE })}
            </p>
          </div>
        )}

        {/* Comparison Table */}
        {products.length > 0 && (
          <div className="overflow-x-auto -mx-4 px-4">
            <div
              className="min-w-[600px]"
              style={{
                display: "grid",
                gridTemplateColumns: `180px repeat(${products.length}, 1fr)`,
              }}
            >
              {/* Header Row — Product Cards */}
              <div className="sticky left-0 z-10 bg-background" />
              {products.map((product) => {
                const img =
                  product.images?.find((i) => i.is_primary) ||
                  product.images?.[0];
                return (
                  <div
                    key={product.id}
                    className="p-4 text-center border-b border-border relative"
                  >
                    <button
                      onClick={() => removeProduct(product.id)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-surface hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label={t('compare.remove')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {img?.url && (
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <Image
                          src={img.url}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-sm font-semibold text-foreground hover:text-accent transition-colors line-clamp-2"
                    >
                      {product.name}
                    </Link>
                  </div>
                );
              })}

              {/* Price Row */}
              <div className="sticky left-0 z-10 bg-surface-light px-4 py-3 flex items-center font-semibold text-sm text-foreground border-b border-border">
                {t('compare.price')}
              </div>
              {products.map((p) => (
                <div
                  key={`price-${p.id}`}
                  className="px-4 py-3 text-center border-b border-border"
                >
                  <span className="font-bold text-foreground">
                    {formatPrice(p.base_price)}
                  </span>
                  {p.compare_at_price && p.compare_at_price > p.base_price && (
                    <span className="ml-2 text-sm text-muted line-through">
                      {formatPrice(p.compare_at_price)}
                    </span>
                  )}
                </div>
              ))}

              {/* Rating Row */}
              <div className="sticky left-0 z-10 bg-background px-4 py-3 flex items-center font-semibold text-sm text-foreground border-b border-border">
                {t('compare.rating')}
              </div>
              {products.map((p) => (
                <div
                  key={`rating-${p.id}`}
                  className="px-4 py-3 text-center border-b border-border"
                >
                  {p.rating_count > 0 ? (
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < Math.round(p.rating_avg)
                                ? "fill-amber-400 text-amber-400"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted">
                        ({p.rating_count})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted">{t('compare.noReviews')}</span>
                  )}
                </div>
              ))}

              {/* Category Row */}
              <div className="sticky left-0 z-10 bg-surface-light px-4 py-3 flex items-center font-semibold text-sm text-foreground border-b border-border">
                {t('compare.category')}
              </div>
              {products.map((p) => (
                <div
                  key={`cat-${p.id}`}
                  className="px-4 py-3 text-center text-sm text-muted border-b border-border"
                >
                  {p.category?.name || "—"}
                </div>
              ))}

              {/* Features Row */}
              <div className="sticky left-0 z-10 bg-background px-4 py-3 flex items-start font-semibold text-sm text-foreground border-b border-border">
                {t('compare.features')}
              </div>
              {products.map((p) => (
                <div
                  key={`feat-${p.id}`}
                  className="px-4 py-3 border-b border-border"
                >
                  {p.features && p.features.length > 0 ? (
                    <ul className="space-y-1.5">
                      {p.features.slice(0, 5).map((f, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-xs text-muted"
                        >
                          <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted">—</span>
                  )}
                </div>
              ))}

              {/* In Stock Row */}
              <div className="sticky left-0 z-10 bg-surface-light px-4 py-3 flex items-center font-semibold text-sm text-foreground border-b border-border">
                {t('compare.inStock')}
              </div>
              {products.map((p) => {
                const inStock = p.variants?.some(
                  (v) => v.stock_quantity > 0
                );
                return (
                  <div
                    key={`stock-${p.id}`}
                    className="px-4 py-3 text-center border-b border-border"
                  >
                    {inStock !== false ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                        <Check className="h-4 w-4" /> {t('compare.yes')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-muted">
                        <Minus className="h-4 w-4" /> {t('compare.outOfStock')}
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Free Shipping Row */}
              <div className="sticky left-0 z-10 bg-background px-4 py-3 flex items-center font-semibold text-sm text-foreground border-b border-border">
                {t('compare.freeShipping')}
              </div>
              {products.map((p) => (
                <div
                  key={`ship-${p.id}`}
                  className="px-4 py-3 text-center border-b border-border"
                >
                  {p.base_price >= 75 ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                      <Truck className="h-4 w-4" /> {t('compare.yes')}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">{t('compare.no')}</span>
                  )}
                </div>
              ))}

              {/* Add to Cart Row */}
              <div className="sticky left-0 z-10 bg-surface-light px-4 py-3" />
              {products.map((p) => (
                <div
                  key={`cart-${p.id}`}
                  className="px-4 py-4 text-center bg-surface-light"
                >
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="w-full rounded bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
                  >
                    {t('compare.addToCart')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Another */}
        {products.length > 0 && products.length < MAX_COMPARE && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setShowSearch(true);
                document
                  .querySelector<HTMLInputElement>(
                    'input[placeholder*="Search"]'
                  )
                  ?.focus();
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-border px-5 py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('compare.addAnother', { current: products.length, max: MAX_COMPARE })}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
