"use client";

import { useState, useMemo } from "react";
import { StarRating } from "@/components/ui/StarRating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import VariantSelector from "./VariantSelector";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "@/types/product";

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const defaultVariant =
    product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState(
    defaultVariant?.id ?? ""
  );

  const selectedVariant = product.variants?.find(
    (v) => v.id === selectedVariantId
  );

  const price = selectedVariant?.price ?? product.base_price;
  const compareAt =
    selectedVariant?.compare_at_price ?? product.compare_at_price;

  // Group variants by type
  const variantGroups = useMemo(() => {
    if (!product.variants?.length) return {};
    const groups: Record<string, typeof product.variants> = {};
    for (const v of product.variants) {
      const type = v.variant_type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(v);
    }
    return groups;
  }, [product]);

  const typeLabels: Record<string, string> = {
    color: "Color",
    bundle: "Bundle",
    style: "Style",
    size: "Size",
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="mt-1 text-muted text-base">{product.subtitle}</p>
        )}
      </div>

      {/* Rating */}
      {product.rating_count > 0 && (
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating_avg} />
          <a
            href="#reviews"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            ({product.rating_count} reviews)
          </a>
        </div>
      )}

      {/* Price */}
      <PriceDisplay
        price={price}
        compareAtPrice={compareAt}
        size="lg"
      />

      {/* Variants */}
      {Object.entries(variantGroups).map(([type, variants]) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">
            {typeLabels[type] || type}
            {selectedVariant && selectedVariant.variant_type === type && (
              <span className="font-normal text-muted ml-2">
                {selectedVariant.name}
              </span>
            )}
          </h4>
          <VariantSelector
            variants={variants}
            selectedId={selectedVariantId}
            onSelect={setSelectedVariantId}
            type={type}
          />
        </div>
      ))}

      {/* Features */}
      {product.features?.length > 0 && (
        <ul className="space-y-2 border-t border-border pt-6">
          {product.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      )}

      {/* Add to Cart */}
      <div className="pt-2">
        <AddToCartButton
          product={product}
          selectedVariant={selectedVariant ?? null}
        />
      </div>
    </div>
  );
}
