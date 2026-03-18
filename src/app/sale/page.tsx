import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Spring Sale — Up to 30% Off | PETLIBRO",
  description:
    "Shop our biggest sale of the season. Save up to 30% on smart pet feeders, water fountains, litter boxes, and accessories. Sale ends March 31.",
  keywords: [
    "pet products sale",
    "smart feeder sale",
    "pet discount",
    "spring sale",
  ],
};

function getDiscountPercent(base: number, compare: number): number {
  if (!compare || compare <= base) return 0;
  return Math.round(((compare - base) / compare) * 100);
}

export default async function SalePage() {
  const supabase = createServerSupabaseClient();

  const { data: products } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("status", "active")
    .not("compare_at_price", "is", null)
    .gt("compare_at_price", 0)
    .order("created_at", { ascending: false });

  const saleProducts = (products || []).filter(
    (p) =>
      p.compare_at_price &&
      p.compare_at_price > p.base_price
  );

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Sale</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-sale/5 via-background to-sale/5 py-14 md:py-20">
        <div className="container-main text-center">
          <span className="inline-block rounded-full bg-sale/10 px-4 py-1.5 text-sm font-semibold text-sale">
            Spring Sale Event
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl">
            Up to 30% Off
          </h1>
          <p className="mt-2 text-lg text-foreground md:text-xl">
            Smart Pet Products
          </p>
          <p className="mx-auto mt-4 max-w-xl text-muted">
            Our biggest sale of the season on smart feeders, water fountains,
            litter boxes, and more. Treat your pet to premium tech at
            unbeatable prices.
          </p>
          {/* Urgency */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-sale/30 bg-sale/5 px-5 py-2 text-sm font-medium text-sale">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Sale ends {(() => {
              const endDate = new Date();
              endDate.setDate(endDate.getDate() + 14);
              return endDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            })()}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-surface-light">
        <div className="container-main grid grid-cols-2 gap-4 py-4 md:grid-cols-4">
          {[
            { icon: "🚚", text: "Free Shipping $75+" },
            { icon: "🔄", text: "30-Day Returns" },
            { icon: "🛡️", text: "1-Year Warranty" },
            { icon: "💳", text: "Secure Checkout" },
          ].map((badge) => (
            <div
              key={badge.text}
              className="flex items-center justify-center gap-2 text-sm text-muted"
            >
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="container-main py-12 md:py-16">
        <h2 className="mb-8 text-2xl font-bold text-foreground">
          Sale Products
          {saleProducts.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted">
              ({saleProducts.length} items)
            </span>
          )}
        </h2>

        {saleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {saleProducts.map((product) => {
              const discount = getDiscountPercent(
                product.base_price,
                product.compare_at_price
              );
              const mainImage = product.images?.sort(
                (a: { position: number }, b: { position: number }) =>
                  a.position - b.position
              )[0];

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-premium border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    {mainImage?.url && (
                      <Image
                        src={mainImage.url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 990px) 33vw, 25vw"
                      />
                    )}
                    {discount > 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-sale px-2.5 py-1 text-xs font-bold text-white">
                        -{discount}%
                      </span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-xs text-muted">
                      {product.category?.name}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-2 md:text-base">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-bold text-sale">
                        ${product.base_price.toFixed(2)}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-sm text-muted line-through">
                          ${product.compare_at_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg text-muted">
              No sale items available right now. Check back soon!
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Shop All Products
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
