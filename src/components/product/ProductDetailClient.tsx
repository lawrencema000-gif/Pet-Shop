"use client";

import StickyAddToCart from "./StickyAddToCart";
import type { Product } from "@/types/product";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const defaultVariant =
    product.variants?.find((v) => v.is_default) || product.variants?.[0];

  return <StickyAddToCart product={product} selectedVariant={defaultVariant ?? null} />;
}
