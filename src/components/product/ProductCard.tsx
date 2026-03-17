"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Eye, Star, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [wishlisted, setWishlisted] = useState(false);

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const secondaryImage = product.images?.find(
    (img) => img.id !== primaryImage?.id
  );
  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const price = defaultVariant?.price ?? product.base_price;
  const compareAt = defaultVariant?.compare_at_price ?? product.compare_at_price;
  const discount = compareAt ? getDiscountPercentage(price, compareAt) : 0;

  // Low stock check
  const lowStockVariant = product.variants?.find(
    (v) => v.stock_quantity > 0 && v.stock_quantity < 5
  );

  // Color variants for swatches
  const colorVariants = product.variants?.filter(
    (v) => v.variant_type === "color"
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  return (
    <div className="group relative bg-white rounded-xl transition-shadow hover:shadow-card-hover">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-surface">
          {primaryImage?.url ? (
            <>
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text || product.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 990px) 33vw, 25vw"
                className={`object-cover transition-all duration-500 ${
                  secondaryImage
                    ? "group-hover:opacity-0 group-hover:scale-105"
                    : "group-hover:scale-105"
                }`}
              />
              {secondaryImage && (
                <Image
                  src={secondaryImage.url}
                  alt={secondaryImage.alt_text || product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 990px) 33vw, 25vw"
                  className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="bg-sale text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {discount}% Off
              </span>
            )}
            {product.is_new && (
              <span className="bg-foreground text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                New
              </span>
            )}
            {product.is_best_seller && (
              <span className="bg-accent text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Best Seller
              </span>
            )}
            {price > 75 && (
              <span className="bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Truck className="w-3 h-3" />
                Free Shipping
              </span>
            )}
          </div>

          {/* Wishlist heart */}
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-foreground"
              }`}
            />
          </button>

          {/* Quick View button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium px-4 py-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-white z-10"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>

          {/* Star Rating */}
          {product.rating_count > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.round(product.rating_avg)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted">
                ({product.rating_count})
              </span>
            </div>
          )}

          {product.subtitle && (
            <p className="text-xs text-muted line-clamp-1">{product.subtitle}</p>
          )}

          {/* Color Swatches Preview */}
          {colorVariants && colorVariants.length > 1 && (
            <div className="flex items-center gap-1.5">
              {colorVariants.slice(0, 5).map((v) => (
                <span
                  key={v.id}
                  className="w-3.5 h-3.5 rounded-full border border-border/50"
                  style={{ backgroundColor: v.name.toLowerCase() }}
                  title={v.name}
                />
              ))}
              {colorVariants.length > 5 && (
                <span className="text-xs text-muted">
                  +{colorVariants.length - 5}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{formatPrice(price)}</span>
            {compareAt && compareAt > price && (
              <span className="text-sm text-muted line-through">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>

          {/* Low Stock Warning */}
          {lowStockVariant && (
            <p className="text-xs font-medium text-orange-500">
              Only {lowStockVariant.stock_quantity} left!
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <motion.button
          onClick={handleAddToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full mt-1 bg-accent text-white py-2.5 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-foreground-muted hover:shadow-md"
        >
          Add to Cart
        </motion.button>
      </div>
    </div>
  );
}
