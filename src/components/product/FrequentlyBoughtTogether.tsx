"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/store/cart";
import { useTranslatedProducts } from "@/hooks/useTranslatedProduct";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  images: { url: string; alt_text: string | null; display_order: number }[];
}

interface FrequentlyBoughtTogetherProps {
  productId: string;
  categoryId: string;
}

export default function FrequentlyBoughtTogether({
  productId,
  categoryId,
}: FrequentlyBoughtTogetherProps) {
  const { t } = useTranslation();
  const [rawSuggestions, setRawSuggestions] = useState<Product[]>([]);
  const suggestions = useTranslatedProducts(rawSuggestions);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    async function fetchSuggestions() {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, base_price, images:product_images(url, alt_text, display_order)")
        .eq("status", "active")
        .eq("category_id", categoryId)
        .neq("id", productId)
        .order("rating_count", { ascending: false })
        .limit(3);

      if (data && data.length > 0) {
        setRawSuggestions(data as unknown as Product[]);
      }
    }
    fetchSuggestions();
  }, [productId, categoryId]);

  if (suggestions.length === 0) return null;

  const bundlePrice = suggestions.reduce((sum, p) => sum + p.base_price, 0);

  const handleAddAll = () => {
    suggestions.forEach((product) => {
      const imageUrl =
        product.images?.sort((a, b) => a.display_order - b.display_order)[0]
          ?.url || "/images/placeholder.jpg";
      addItem({
        id: product.id,
        product_id: product.id,
        variant_id: null,
        name: product.name,
        variant_name: null,
        price: product.base_price,
        compare_at_price: null,
        image_url: imageUrl,
        slug: product.slug,
      });
    });
  };

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        {t("common.frequentlyBoughtTogether")}
      </h2>
      <div className="flex flex-col lg:flex-row items-center gap-6 p-6 border border-border rounded-lg bg-background">
        {/* Product thumbnails */}
        <div className="flex flex-wrap items-center justify-center gap-4 flex-1">
          {suggestions.map((product, i) => {
            const imageUrl =
              product.images?.sort(
                (a, b) => a.display_order - b.display_order
              )[0]?.url || "/images/placeholder.jpg";
            return (
              <div key={product.id} className="flex items-center gap-4">
                {i > 0 && (
                  <Plus className="w-5 h-5 text-muted shrink-0" />
                )}
                <Link
                  href={`/products/${product.slug}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="relative w-24 h-24 rounded-md overflow-hidden bg-surface border border-border group-hover:border-accent transition-colors">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <span className="text-xs text-foreground font-medium text-center line-clamp-2 max-w-[100px]">
                    {product.name}
                  </span>
                  <span className="text-xs text-muted">
                    ${product.base_price.toFixed(2)}
                  </span>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bundle price + CTA */}
        <div className="flex flex-col items-center gap-3 lg:border-l lg:border-border lg:pl-6">
          <div className="text-center">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">
              {t("common.bundlePrice")}
            </p>
            <p className="text-2xl font-bold text-foreground">
              ${bundlePrice.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleAddAll}
            className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-full text-sm font-semibold transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {t("common.addAllToCart")}
          </button>
        </div>
      </div>
    </section>
  );
}
