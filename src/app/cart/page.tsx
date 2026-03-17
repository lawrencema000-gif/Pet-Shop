"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { cn, formatPrice } from "@/lib/utils";
import { SITE_CONFIG, SHIPPING_COST, TAX_RATE } from "@/lib/constants";
import { CouponField } from "@/components/cart/CouponField";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const freeShipping = subtotal >= SITE_CONFIG.freeShippingThreshold;
  const shipping = freeShipping ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax - discount;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
        <ShoppingBag size={64} className="text-border mb-6" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted mb-8 max-w-md">
          Looks like you haven&apos;t added any products yet. Browse our
          collection and find something for your furry friend.
        </p>
        <Link href="/products">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        Shopping Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items */}
        <div className="flex-1">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 md:gap-6 py-6 border-b border-border"
              >
                {/* Image */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative w-24 h-24 md:w-28 md:h-28 flex-shrink-0 bg-surface-light rounded-lg overflow-hidden"
                >
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 96px, 112px"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium text-foreground hover:underline line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variant_name && (
                      <p className="text-sm text-muted mt-0.5">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-surface-light transition-colors rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-surface-light transition-colors rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-muted hover:text-sale transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mt-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:w-96">
          <div className="bg-surface-light rounded-xl p-6 lg:sticky lg:top-8">
            <h2 className="text-lg font-bold text-foreground mb-6">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span
                  className={cn(
                    "font-medium",
                    freeShipping ? "text-success" : "text-foreground"
                  )}
                >
                  {freeShipping ? "Free" : formatPrice(SHIPPING_COST)}
                </span>
              </div>
              {!freeShipping && (
                <p className="text-xs text-muted">
                  Free shipping on orders over{" "}
                  {formatPrice(SITE_CONFIG.freeShippingThreshold)}
                </p>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Estimated Tax</span>
                <span className="font-medium text-foreground">
                  {formatPrice(tax)}
                </span>
              </div>
              {discount > 0 && couponCode && (
                <div className="flex justify-between text-success">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <CouponField
                subtotal={subtotal}
                onApply={(discountAmount, code) => {
                  setDiscount(discountAmount);
                  setCouponCode(code);
                }}
                onRemove={() => {
                  setDiscount(0);
                  setCouponCode(null);
                }}
              />
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-base font-bold text-foreground">
                  Total
                </span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              <Link href="/checkout">
                <Button fullWidth size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
