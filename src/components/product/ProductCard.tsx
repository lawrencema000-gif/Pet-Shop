"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const price = defaultVariant?.price ?? product.base_price;
  const compareAt = defaultVariant?.compare_at_price ?? product.compare_at_price;
  const discount = compareAt ? getDiscountPercentage(price, compareAt) : 0;

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

  return (
    <div className="group relative bg-white rounded-xl transition-shadow hover:shadow-card-hover">
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-surface">
          {primaryImage?.url ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 990px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-medium text-foreground text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="text-xs text-muted line-clamp-1">{product.subtitle}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{formatPrice(price)}</span>
            {compareAt && compareAt > price && (
              <span className="text-sm text-muted line-through">
                {formatPrice(compareAt)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <div className="px-4 pb-4">
        <button
          onClick={handleAddToCart}
          className="w-full mt-1 bg-accent text-white py-2.5 text-sm font-medium hover:bg-foreground-muted transition-colors rounded-lg"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
