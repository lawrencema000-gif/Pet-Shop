"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Minus, Plus, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/types/product";

interface QuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickView({ product, isOpen, onClose }: QuickViewProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const defaultVariantIdx = product.variants?.findIndex((v) => v.is_default) ?? 0;
  const variant = product.variants?.[selectedVariant >= 0 ? selectedVariant : defaultVariantIdx] ?? product.variants?.[0];
  const price = variant?.price ?? product.base_price;
  const compareAt = variant?.compare_at_price ?? product.compare_at_price;
  const discount = compareAt ? getDiscountPercentage(price, compareAt) : 0;

  const images = product.images?.sort((a, b) => a.display_order - b.display_order) ?? [];
  const currentImage = images[selectedImage] ?? images[0];

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(defaultVariantIdx >= 0 ? defaultVariantIdx : 0);
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [isOpen, defaultVariantIdx]);

  // Body scroll lock + escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKey);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  const handleAddToCart = () => {
    addItem({
      id: variant?.id ?? product.id,
      product_id: product.id,
      variant_id: variant?.id ?? null,
      name: product.name,
      variant_name: variant?.name ?? null,
      price,
      compare_at_price: compareAt ?? null,
      image_url: currentImage?.url ?? "",
      slug: product.slug,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
          >
            <div className="bg-background rounded-premium-xl shadow-modal max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-surface-light transition-colors"
                aria-label="Close quick view"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Image side */}
                <div className="relative bg-surface p-6">
                  <div className="relative aspect-square rounded-premium-lg overflow-hidden bg-surface-light">
                    {currentImage?.url ? (
                      <Image
                        src={currentImage.url}
                        alt={currentImage.alt_text || product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted text-sm">
                        No image
                      </div>
                    )}

                    {/* Badges */}
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-sale text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                        {discount}% Off
                      </span>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {images.length > 1 && (
                    <div className="flex gap-2 mt-4 justify-center">
                      {images.slice(0, 5).map((img, i) => (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(i)}
                          className={`relative w-14 h-14 rounded-premium overflow-hidden border-2 transition-colors ${
                            selectedImage === i
                              ? "border-accent"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <Image
                            src={img.url}
                            alt={img.alt_text || ""}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info side */}
                <div className="p-6 md:p-8 flex flex-col">
                  <h2 className="text-heading-sm font-bold text-foreground mb-2">
                    {product.name}
                  </h2>

                  {product.subtitle && (
                    <p className="text-body-sm text-muted mb-3">{product.subtitle}</p>
                  )}

                  {/* Rating */}
                  {product.rating_count > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.round(product.rating_avg)
                                ? "fill-amber-400 text-amber-400"
                                : "text-border"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted">
                        ({product.rating_count} reviews)
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-heading font-bold text-foreground">
                      {formatPrice(price)}
                    </span>
                    {compareAt && compareAt > price && (
                      <span className="text-body text-muted line-through">
                        {formatPrice(compareAt)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-sm font-semibold text-sale">
                        Save {formatPrice(compareAt! - price)}
                      </span>
                    )}
                  </div>

                  {/* Variant selector */}
                  {product.variants && product.variants.length > 1 && (
                    <div className="mb-5">
                      <p className="text-body-sm font-medium text-foreground mb-2">
                        {product.variants[0]?.variant_type === "color" ? "Color" : "Option"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((v, i) => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(i)}
                            className={`px-3 py-1.5 text-sm rounded-premium border transition-colors ${
                              selectedVariant === i
                                ? "border-accent bg-accent-light text-accent font-medium"
                                : "border-border text-foreground-muted hover:border-accent/50"
                            }`}
                          >
                            {v.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="mb-5">
                    <p className="text-body-sm font-medium text-foreground mb-2">Quantity</p>
                    <div className="inline-flex items-center border border-border rounded-premium">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="p-2.5 hover:bg-surface-light transition-colors rounded-l-premium"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-sm font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="p-2.5 hover:bg-surface-light transition-colors rounded-r-premium"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add to cart */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-premium font-medium text-sm hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md mb-3"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart — {formatPrice(price * quantity)}
                  </button>

                  {/* Free shipping note */}
                  {price * quantity >= 75 && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-accent font-medium mb-3">
                      <Truck className="w-3.5 h-3.5" />
                      Free shipping on this order
                    </div>
                  )}

                  {/* View full details */}
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="group flex items-center justify-center gap-1.5 text-sm font-medium text-foreground-muted hover:text-accent transition-colors mt-auto pt-4 border-t border-border"
                  >
                    View Full Details
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
