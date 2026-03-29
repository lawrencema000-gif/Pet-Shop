"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

interface FeaturedRevealCardsProps {
  products: Product[];
}

export default function FeaturedRevealCards({ products }: FeaturedRevealCardsProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);

  if (!products.length) return null;

  return (
    <section className="py-24 md:py-32 bg-surface-light">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            {t('featured.overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('featured.heading')}
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
            {t('featured.description')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {products.slice(0, 4).map((product) => {
            const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
            const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
            const price = defaultVariant?.price ?? product.base_price;
            const compareAt = defaultVariant?.compare_at_price ?? product.compare_at_price;
            return (
              <Link key={product.id} href={`/products/${product.slug}`}>
                <ProductRevealCard
                  name={product.name}
                  price={formatPrice(price)}
                  originalPrice={compareAt && compareAt > price ? formatPrice(compareAt) : undefined}
                  image={primaryImage?.url || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop"}
                  description={product.description || t('featured.defaultDesc')}
                  rating={product.rating_avg || 4.5}
                  reviewCount={product.rating_count || 0}
                  onAdd={() => {
                    addItem({
                      id: defaultVariant?.id ?? product.id,
                      product_id: product.id,
                      variant_id: defaultVariant?.id ?? null,
                      name: product.name,
                      variant_name: defaultVariant?.name ?? null,
                      price,
                      compare_at_price: compareAt ?? null,
                      image_url: primaryImage?.url ?? "",
                      slug: product.slug,
                    });
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
