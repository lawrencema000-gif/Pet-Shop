"use client";

import { useState, useMemo } from "react";
import { Truck, RotateCcw, Shield, Share2 } from "lucide-react";
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

  // Stock status
  const stockQuantity = selectedVariant?.stock_quantity ?? 99;
  const stockStatus =
    stockQuantity === 0
      ? "out"
      : stockQuantity < 5
      ? "low"
      : "in";

  // Delivery estimate (5-7 business days from now)
  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);
  const formatDeliveryDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
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

      {/* Rating + Share */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {product.rating_count > 0 && (
            <>
              <StarRating rating={product.rating_avg} />
              <a
                href="#reviews"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                ({product.rating_count} reviews)
              </a>
            </>
          )}
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            stockStatus === "in"
              ? "bg-success"
              : stockStatus === "low"
              ? "bg-orange-400"
              : "bg-red-500"
          }`}
        />
        <span
          className={`text-sm font-medium ${
            stockStatus === "in"
              ? "text-success"
              : stockStatus === "low"
              ? "text-orange-500"
              : "text-red-500"
          }`}
        >
          {stockStatus === "in"
            ? "In Stock"
            : stockStatus === "low"
            ? `Low Stock — Only ${stockQuantity} left!`
            : "Out of Stock"}
        </span>
      </div>

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
      <div className="pt-2" id="add-to-cart-section">
        <AddToCartButton
          product={product}
          selectedVariant={selectedVariant ?? null}
        />
      </div>

      {/* Delivery Estimate */}
      <div className="flex items-center gap-2 text-sm text-muted">
        <Truck className="w-4 h-4 text-accent" />
        <span>
          Estimated delivery:{" "}
          <span className="font-medium text-foreground">
            {formatDeliveryDate(deliveryStart)} - {formatDeliveryDate(deliveryEnd)}
          </span>
        </span>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
        <div className="flex flex-col items-center text-center gap-2 py-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Truck className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xs font-medium text-foreground">Free Shipping</span>
          <span className="text-[10px] text-muted">Orders over $75</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 py-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <RotateCcw className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xs font-medium text-foreground">30-Day Returns</span>
          <span className="text-[10px] text-muted">Hassle-free</span>
        </div>
        <div className="flex flex-col items-center text-center gap-2 py-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent" />
          </div>
          <span className="text-xs font-medium text-foreground">1-Year Warranty</span>
          <span className="text-[10px] text-muted">Full coverage</span>
        </div>
      </div>
    </div>
  );
}
