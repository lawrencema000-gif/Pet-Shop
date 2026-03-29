"use client";

import { useTranslation } from "react-i18next";
import ProductCard from "./ProductCard";
import type { Product } from "@/types/product";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  const { t } = useTranslation();
  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8">
        {t("common.youMayAlsoLike")}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="min-w-[240px] max-w-[280px] shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
