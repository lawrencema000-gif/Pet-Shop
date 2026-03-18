"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Lock } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import FocusTrap from "@/components/ui/FocusTrap";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/constants";

export function CartDrawer() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min(
    100,
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100
  );

  const estimatedShipping = hasFreeShipping ? 0 : SHIPPING_COST;
  const estimatedTax = subtotal * TAX_RATE;
  const estimatedTotal = subtotal + estimatedShipping + estimatedTax;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      title={`Cart (${totalItems})`}
      side="right"
      role="dialog"
      aria-modal={true}
      aria-label="Shopping cart"
    >
      <FocusTrap active={isOpen} onEscape={closeDrawer}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
          <ShoppingBag size={48} className="text-border mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">
            Your cart is empty
          </p>
          <p className="text-sm text-muted mb-6">
            Add some products to get started.
          </p>
          <Button variant="primary" onClick={closeDrawer}>
            Continue Shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Free Shipping Progress Bar */}
          <div className="px-6 py-3 bg-surface/50 border-b border-border">
            {hasFreeShipping ? (
              <p className="text-sm text-success font-medium text-center">
                You&apos;ve earned free shipping!
              </p>
            ) : (
              <p className="text-sm text-muted text-center">
                You&apos;re{" "}
                <span className="font-semibold text-foreground">
                  {formatPrice(amountToFreeShipping)}
                </span>{" "}
                away from free shipping!
              </p>
            )}
            <div className="mt-2 h-2 bg-border/50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${shippingProgress}%`,
                  backgroundColor: hasFreeShipping ? "var(--color-success, #16a34a)" : "#f59e0b",
                }}
              />
            </div>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-border last:border-0"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeDrawer}
                    className="relative w-20 h-20 flex-shrink-0 bg-surface-light rounded-lg overflow-hidden"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={closeDrawer}
                      className="text-sm font-medium text-foreground hover:underline line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    {item.variant_name && (
                      <p className="text-xs text-muted mt-0.5">
                        {item.variant_name}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-surface-light transition-colors rounded-l-lg"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-surface-light transition-colors rounded-r-lg"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-muted hover:text-sale transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Browse More */}
            <div className="mt-6 pt-6 border-t border-border text-center">
              <Link
                href="/products"
                onClick={closeDrawer}
                className="text-sm font-medium text-accent hover:underline"
              >
                Browse more products
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 space-y-3">
            {/* Order Summary Lines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Shipping</span>
                <span
                  className={`font-medium ${
                    hasFreeShipping ? "text-success" : "text-foreground"
                  }`}
                >
                  {hasFreeShipping ? "FREE" : formatPrice(estimatedShipping)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Est. Tax</span>
                <span className="font-medium text-foreground">
                  {formatPrice(estimatedTax)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm font-semibold text-foreground">
                  Estimated Total
                </span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>
            </div>

            {/* Secure Checkout */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure Checkout — SSL Encrypted</span>
            </div>

            <Button
              fullWidth
              size="lg"
              onClick={() => {
                closeDrawer();
                router.push("/checkout");
              }}
            >
              Checkout
            </Button>

            {/* Payment Method Icons */}
            <div className="flex items-center justify-center gap-2">
              {["Visa", "Mastercard", "Amex", "PayPal"].map((method) => (
                <span
                  key={method}
                  className="text-[10px] font-medium text-muted bg-surface px-2 py-1 rounded border border-border"
                >
                  {method}
                </span>
              ))}
            </div>

            <button
              onClick={closeDrawer}
              className="w-full text-center text-sm text-muted hover:text-foreground underline transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
      </FocusTrap>
    </Drawer>
  );
}
