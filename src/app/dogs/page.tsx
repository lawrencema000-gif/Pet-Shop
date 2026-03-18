import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGrid from "@/components/product/ProductGrid";
import SEOBlock from "@/components/category/SEOBlock";

export const metadata: Metadata = {
  title: "Dog Products | PETLIBRO",
  description:
    "Shop smart products for dogs. Automatic feeders, water fountains, and more from PETLIBRO.",
};

export default async function DogsPage() {
  const supabase = createServerSupabaseClient();

  // Fetch categories that relate to dogs
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .or("name.ilike.%dog%,name.ilike.%feeder%,name.ilike.%food%");

  const categoryIds = categories?.map((c) => c.id) || [];

  // Fetch products from those categories
  const { data: products } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("status", "active")
    .in("category_id", categoryIds.length > 0 ? categoryIds : ["__none__"])
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-foreground font-medium">Dogs</span>
      </nav>

      {/* Hero */}
      <div className="relative w-full h-48 sm:h-56 md:h-72 rounded-md overflow-hidden mb-10">
        <Image
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=500&fit=crop&q=80"
          alt="Happy dog"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Smart Products for Happy Dogs
          </h1>
          <p className="text-white/80 mt-2 max-w-xl text-sm md:text-base">
            From automated feeders to hydration stations, keep your dog healthy
            with smart pet technology.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {products && products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">No dog products found.</p>
        </div>
      )}

      {/* Also for Cats */}
      <div className="text-center mt-12">
        <Link
          href="/cats"
          className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-full text-sm font-medium hover:bg-surface transition-colors"
        >
          Also for Cats
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* SEO Block */}
      <SEOBlock
        categoryName="dog products"
        productCount={products?.length ?? 0}
      />
    </div>
  );
}
