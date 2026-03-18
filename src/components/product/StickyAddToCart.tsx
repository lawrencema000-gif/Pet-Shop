"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, ProductVariant } from "@/types/product";

interface StickyAddToCartProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export default function StickyAddToCart({
  product,
  selectedVariant: _selectedVariant, // eslint-disable-line @typescript-eslint/no-unused-vars
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);

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

  const handleScrollToAdd = () => {
    const target = document.getElementById("add-to-cart-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
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
          className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t border-border shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {product.name}
              </p>
            </div>

            {/* Add to Cart — scrolls to main section for variant selection */}
            <motion.button
              onClick={handleScrollToAdd}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-accent text-white px-6 py-2.5 text-sm font-semibold rounded hover:bg-accent-dark transition-colors shrink-0"
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
