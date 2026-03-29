"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import AnimatedProductGrid from "@/components/product/AnimatedProductGrid";
import FilterSidebar from "@/components/product/FilterSidebar";

const PRODUCTS_PER_PAGE = 12;

export default function ProductsPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("category") || undefined;
  const minPriceParam = searchParams.get("minPrice") || undefined;
  const maxPriceParam = searchParams.get("maxPrice") || undefined;
  const sortParam = searchParams.get("sort") || undefined;
  const pageParam = searchParams.get("page") || "1";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [categories, setCategories] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[] | null>(null);
  const [count, setCount] = useState<number>(0);
  const [heading, setHeading] = useState("All Products");

  const page = parseInt(pageParam, 10);
  const totalPages = count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 1;

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");

      setCategories(cats ?? []);

      // Build product query
      let query = supabase
        .from("products")
        .select(
          "*, images:product_images(*), variants:product_variants(*), category:categories(*)",
          { count: "exact" }
        )
        .eq("status", "active");

      // Filter by category
      if (categoryParam) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categoryParam)
          .single();
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const activeCategory = cats?.find((c: any) => c.slug === categoryParam);
        setHeading(activeCategory ? activeCategory.name : "All Products");
      } else {
        setHeading("All Products");
      }

      // Filter by price
      if (minPriceParam) {
        query = query.gte("base_price", parseFloat(minPriceParam));
      }
      if (maxPriceParam) {
        query = query.lte("base_price", parseFloat(maxPriceParam));
      }

      // Sort
      switch (sortParam) {
        case "price-asc":
          query = query.order("base_price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("base_price", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "best-selling":
          query = query.order("is_best_seller", { ascending: false }).order("rating_count", { ascending: false });
          break;
        default:
          query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }

      // Pagination
      const from = (page - 1) * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data: prods, count: total } = await query;
      setProducts(prods);
      setCount(total ?? 0);
    }

    fetchData();
  }, [categoryParam, minPriceParam, maxPriceParam, sortParam, page]);

  const buildQuery = (overrides: Record<string, string>) => {
    const params: Record<string, string> = {};
    if (categoryParam) params.category = categoryParam;
    if (minPriceParam) params.minPrice = minPriceParam;
    if (maxPriceParam) params.maxPrice = maxPriceParam;
    if (sortParam) params.sort = sortParam;
    params.page = pageParam;
    return { ...params, ...overrides };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t('common.home')}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{t('products.breadcrumbProducts')}</span>
      </nav>

      {/* Page heading + count */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{heading}</h1>
          <p className="text-sm text-muted mt-1">
            {t('common.showingXofY', { current: products?.length ?? 0, total: count ?? 0 })}
          </p>
        </div>
        <div className="lg:hidden">
          <FilterSidebar categories={categories} />
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        <FilterSidebar categories={categories} />

        <div className="flex-1 min-w-0">
          {products && products.length > 0 ? (
            <AnimatedProductGrid products={products} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted text-lg">{t('products.noProducts')}</p>
              <p className="text-sm text-muted mt-2">
                {t('products.noProductsDesc')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={{
                    pathname: "/products",
                    query: buildQuery({ page: String(page - 1) }),
                  }}
                  className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                >
                  {t('common.previous')}
                </Link>
              )}
              <span className="text-sm text-muted">
                {t('common.pageXofY', { page, totalPages })}
              </span>
              {page < totalPages && (
                <Link
                  href={{
                    pathname: "/products",
                    query: buildQuery({ page: String(page + 1) }),
                  }}
                  className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                >
                  {t('common.next')}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
