import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import WhyChooseSection from "@/components/product/WhyChooseSection";
import ProductDetailClient from "@/components/product/ProductDetailClient";
import TrackView from "@/components/product/TrackView";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import HowItWorks from "@/components/product/HowItWorks";
import BenefitsSection from "@/components/product/BenefitsSection";
import FrequentlyBoughtTogether from "@/components/product/FrequentlyBoughtTogether";
import ProductFAQ from "@/components/product/ProductFAQ";
import type { Review } from "@/types/product";

interface ProductPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, subtitle")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | PETLIBRO`,
    description:
      product.subtitle ||
      product.description?.slice(0, 160) ||
      `Shop ${product.name} at PETLIBRO.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createServerSupabaseClient();

  // Fetch product with relations
  const { data: product } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  // Fetch reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("product_id", product.id)
    .order("created_at", { ascending: false });

  // Fetch related products
  const { data: relatedProducts } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("status", "active")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(8);

  const defaultVariant =
    product.variants?.find(
      (v: { is_default: boolean }) => v.is_default
    ) || product.variants?.[0];
  const price = defaultVariant?.price ?? product.base_price;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.subtitle,
    image: product.images?.[0]?.url,
    brand: {
      "@type": "Brand",
      name: "PETLIBRO",
    },
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          {product.category && (
            <>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="text-foreground font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product section: gallery + info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex-1 min-w-0">
            <ProductGallery images={product.images ?? []} />
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-[440px] shrink-0">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <ProductTabs
            product={product}
            reviews={(reviews as Review[]) ?? []}
          />
        </div>

        {/* How It Works */}
        <HowItWorks />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether
          productId={product.id}
          categoryId={product.category_id}
        />

        {/* Product FAQ */}
        <ProductFAQ productName={product.name} />

        {/* Why Choose This Product */}
        <WhyChooseSection />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>

      {/* Track page view for recently viewed */}
      <TrackView slug={product.slug} />

      {/* Sticky Add to Cart Bar */}
      <ProductDetailClient product={product} />
    </>
  );
}
