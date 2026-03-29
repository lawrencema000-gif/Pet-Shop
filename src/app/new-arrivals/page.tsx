"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

export default function NewArrivalsPage() {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [newProducts, setNewProducts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: products } = await supabase
        .from("products")
        .select(
          "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
        )
        .eq("status", "active")
        .eq("is_new", true)
        .order("created_at", { ascending: false });

      setNewProducts(products || []);
    }
    fetchData();
  }, []);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t('common.home')}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{t('newArrivals.heading')}</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-main text-center">
          <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            {t('newArrivals.overline')}
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl">
            {t('newArrivals.heading')}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted md:text-lg">
            {t('newArrivals.description')}
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container-main py-12 md:py-16">
        <h2 className="mb-8 text-2xl font-bold text-foreground">
          {t('newArrivals.latestProducts')}
          {newProducts.length > 0 && (
            <span className="ml-2 text-base font-normal text-muted">
              ({t('newArrivals.itemsCount', { count: newProducts.length })})
            </span>
          )}
        </h2>

        {newProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
            {newProducts.map((product) => {
              const mainImage = product.images?.sort(
                (a: { position: number }, b: { position: number }) =>
                  a.position - b.position
              )[0];

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover"
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
                    <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
                      {t('newArrivals.newBadge')}
                    </span>
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-xs text-muted">
                      {product.category?.name}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-foreground line-clamp-2 md:text-base">
                      {product.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-bold text-foreground">
                        {formatPrice(product.base_price)}
                      </span>
                      {product.compare_at_price &&
                        product.compare_at_price > product.base_price && (
                          <span className="text-sm text-muted line-through">
                            {formatPrice(product.compare_at_price)}
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
              {t('newArrivals.emptyMessage')}
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {t('common.shopAllProducts')}
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
