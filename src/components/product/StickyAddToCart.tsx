"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product, ProductVariant } from "@/types/product";

interface StickyAddToCartProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function StickyAddToCart({
  product,
  selectedVariant,
}: StickyAddToCartProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const price = selectedVariant?.price ?? product.base_price;
  const compareAt =
    selectedVariant?.compare_at_price ?? product.compare_at_price;

  useEffect(() => {
    const target = document.getElementById("add-to-cart-section");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: selectedVariant?.id ?? product.id,
        product_id: product.id,
        variant_id: selectedVariant?.id ?? null,
        name: product.name,
        variant_name: selectedVariant?.name ?? null,
        price,
        compare_at_price: compareAt ?? null,
        image_url: selectedVariant?.image_url ?? primaryImage?.url ?? "",
        slug: product.slug,
      });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-lg border-t border-border shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            {/* Product Info */}
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-semibold text-foreground truncate">
                {product.name}
              </p>
              <p className="text-sm font-bold text-accent">
                {formatPrice(price)}
              </p>
            </div>

            {/* Mobile: Price only */}
            <div className="flex-1 min-w-0 sm:hidden">
              <p className="text-sm font-bold text-accent">
                {formatPrice(price)}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center border border-border rounded-lg shrink-0">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-2 hover:bg-surface transition-colors rounded-l-lg"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-2 hover:bg-surface transition-colors rounded-r-lg"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart */}
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 text-sm font-semibold rounded-lg hover:bg-foreground-muted transition-colors shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
