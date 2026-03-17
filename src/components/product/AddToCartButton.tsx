"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import type { Product, ProductVariant } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function AddToCartButton({
  product,
  selectedVariant,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const price = selectedVariant?.price ?? product.base_price;
  const compareAt =
    selectedVariant?.compare_at_price ?? product.compare_at_price;

  const handleAdd = () => {
    setStatus("loading");
    setTimeout(() => {
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
      setStatus("success");
      setTimeout(() => setStatus("idle"), 1500);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center border border-border rounded-lg w-fit">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-3 hover:bg-surface transition-colors rounded-l-lg"
          aria-label="Decrease quantity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="px-5 py-3 text-sm font-medium min-w-[3rem] text-center tabular-nums">
          {quantity}
        </span>
        <button
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-3 hover:bg-surface transition-colors rounded-r-lg"
          aria-label="Increase quantity"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Add to Cart */}
      <motion.button
        onClick={handleAdd}
        disabled={status === "loading"}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 text-lg font-semibold rounded-lg transition-colors",
          status === "success"
            ? "bg-success text-white"
            : "bg-accent text-white hover:bg-foreground-muted"
        )}
      >
        <AnimatePresence mode="wait">
          {status === "loading" && (
            <motion.span
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Loader2 className="w-5 h-5 animate-spin" />
            </motion.span>
          )}
          {status === "success" && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Added to Cart
            </motion.span>
          )}
          {status === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
