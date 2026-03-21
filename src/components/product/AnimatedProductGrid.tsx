"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/types/product";
import {
  ContainerToggle,
  CellToggle,
} from "@/components/ui/animated-toggle-layout-container";

interface AnimatedProductGridProps {
  products: Product[];
}

export default function AnimatedProductGrid({ products }: AnimatedProductGridProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
    const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
    const price = defaultVariant?.price ?? product.base_price;
    const compareAt = defaultVariant?.compare_at_price ?? product.compare_at_price;
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
    <ContainerToggle>
      {products.map((product) => {
        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
        const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
        const price = defaultVariant?.price ?? product.base_price;
        const compareAt = defaultVariant?.compare_at_price ?? product.compare_at_price;
        const discount = compareAt ? getDiscountPercentage(price, compareAt) : 0;

        return (
          <CellToggle
            key={product.id}
            className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <Link href={`/products/${product.slug}`} className="block">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-surface-light">
                {primaryImage?.url ? (
                  <Image
                    src={primaryImage.url}
                    alt={primaryImage.alt_text || product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 990px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-muted text-sm">
                    No image
                  </div>
                )}

                {discount > 0 && (
                  <span className="absolute top-3 left-3 bg-sale text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    -{discount}%
                  </span>
                )}

                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-0 left-0 right-0 bg-foreground text-white text-sm font-medium py-3 text-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity duration-200"
                >
                  Add to Cart
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-1">
                <h3 className="font-medium text-foreground text-sm leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {formatPrice(price)}
                  </span>
                  {compareAt && compareAt > price && (
                    <span className="text-sm text-muted line-through">
                      {formatPrice(compareAt)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </CellToggle>
        );
      })}
    </ContainerToggle>
  );
}
