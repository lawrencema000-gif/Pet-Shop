import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getCollectionBySlug,
  getAllCollectionSlugs,
} from "@/lib/collections-data";
import ProductGrid from "@/components/product/ProductGrid";

interface CollectionPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllCollectionSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: CollectionPageProps): Promise<Metadata> {
  const collection = getCollectionBySlug(params.slug);
  if (!collection) return { title: "Collection Not Found | Pet and Angels" };
  return {
    title: `${collection.title} | Pet and Angels`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = getCollectionBySlug(params.slug);
  if (!collection) notFound();

  // Fetch products by slugs
  const supabase = createServerSupabaseClient();
  const { data: products } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("status", "active")
    .in("slug", collection.productSlugs);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{collection.title}</span>
        </nav>
      </div>

      {/* Hero Banner */}
      <section className="relative h-64 md:h-80 bg-surface overflow-hidden">
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-main pb-8 md:pb-12">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            {collection.title}
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl md:text-lg">
            {collection.description}
          </p>
        </div>
      </section>

      {/* Description */}
      <section className="container-main py-10 md:py-14">
        <p className="max-w-3xl text-muted leading-relaxed">
          {collection.longDescription}
        </p>
      </section>

      {/* Products */}
      <section className="container-main pb-12 md:pb-16">
        <h2 className="text-2xl font-bold text-foreground mb-8">
          Products in This Collection
          {products && products.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted">
              ({products.length} items)
            </span>
          )}
        </h2>
        {products && products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-muted">
              Products in this collection are coming soon.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </section>

      {/* FAQ */}
      {collection.faqs.length > 0 && (
        <section className="border-t border-border bg-surface-light py-12 md:py-16">
          <div className="container-main max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {collection.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-lg border border-border bg-background overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-surface/50 transition-colors [&::-webkit-details-marker]:hidden">
                    {faq.question}
                    <ChevronDown className="h-4 w-4 text-muted shrink-0 ml-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
