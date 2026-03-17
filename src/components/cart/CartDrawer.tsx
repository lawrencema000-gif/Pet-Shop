"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeDrawer}
      title={`Cart (${totalItems})`}
      side="right"
    >
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
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Subtotal</span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-xs text-muted">
              Shipping and taxes calculated at checkout.
            </p>
            <Button fullWidth size="lg">
              Checkout
            </Button>
            <button
              onClick={closeDrawer}
              className="w-full text-center text-sm text-muted hover:text-foreground underline transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
