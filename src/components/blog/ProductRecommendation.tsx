"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at_price?: number;
  image_url: string;
  rating: number;
  review_count: number;
}

interface ProductRecommendationProps {
  slugs: string[];
}

export default function ProductRecommendation({
  slugs,
}: ProductRecommendationProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slugs || slugs.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(
            "id, slug, name, price, compare_at_price, image_url, rating, review_count"
          )
          .in("slug", slugs)
          .limit(3);

        if (!error && data && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // Silently fail — don't show recommendations if fetch fails
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [slugs]);

  if (loading || products.length === 0) return null;

  return (
    <div className="my-10 rounded-xl border border-border bg-surface-light p-6">
      <h3 className="mb-4 text-lg font-bold text-foreground">
        Recommended Products
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-card-hover"
          >
            <div className="relative aspect-square overflow-hidden bg-surface">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-3">
              <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-accent transition-colors">
                {product.name}
              </h4>
              {/* Star rating */}
              <div className="mt-1.5 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs text-muted">
                  ({product.review_count})
                </span>
              </div>
              {/* Price */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {product.compare_at_price &&
                  product.compare_at_price > product.price && (
                    <span className="text-xs text-muted line-through">
                      ${product.compare_at_price.toFixed(2)}
                    </span>
                  )}
              </div>
              <span className="mt-2 inline-block text-xs font-medium text-accent group-hover:underline">
                View Product
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
