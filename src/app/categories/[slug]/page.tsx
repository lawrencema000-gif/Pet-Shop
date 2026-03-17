import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/product/ProductGrid";
import FilterSidebar from "@/components/product/FilterSidebar";

interface CategoryPageProps {
  params: { slug: string };
  searchParams: {
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  };
}

const PRODUCTS_PER_PAGE = 12;

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | PETLIBRO`,
    description:
      category.description ||
      `Shop ${category.name} - premium smart pet care products.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const supabase = createServerSupabaseClient();

  // Fetch category
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (!category) notFound();

  // Fetch all categories for sidebar
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  // Build product query
  let query = supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)",
      { count: "exact" }
    )
    .eq("status", "active")
    .eq("category_id", category.id);

  // Price filters
  if (searchParams.minPrice) {
    query = query.gte("base_price", parseFloat(searchParams.minPrice));
  }
  if (searchParams.maxPrice) {
    query = query.lte("base_price", parseFloat(searchParams.maxPrice));
  }

  // Sort
  switch (searchParams.sort) {
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
      query = query
        .order("is_best_seller", { ascending: false })
        .order("rating_count", { ascending: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  // Pagination
  const page = parseInt(searchParams.page || "1", 10);
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data: products, count } = await query;
  const totalPages = count ? Math.ceil(count / PRODUCTS_PER_PAGE) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="text-muted mt-2 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-muted mt-1">
          Showing {products?.length ?? 0} of {count ?? 0} products
        </p>
      </div>

      {/* Mobile filter */}
      <div className="lg:hidden mb-6">
        <FilterSidebar categories={categories ?? []} />
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        <FilterSidebar categories={categories ?? []} />

        <div className="flex-1 min-w-0">
          {products && products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-16">
              <p className="text-muted text-lg">No products found.</p>
              <p className="text-sm text-muted mt-2">
                Try adjusting your filters.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              {page > 1 && (
                <Link
                  href={{
                    pathname: `/categories/${params.slug}`,
                    query: { ...searchParams, page: String(page - 1) },
                  }}
                  className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                >
                  Previous
                </Link>
              )}
              <span className="text-sm text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={{
                    pathname: `/categories/${params.slug}`,
                    query: { ...searchParams, page: String(page + 1) },
                  }}
                  className="px-5 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface transition-colors"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
