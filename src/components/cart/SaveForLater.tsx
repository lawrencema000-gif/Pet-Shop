"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "saved-for-later";

function getSavedItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setSavedItems(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function SaveForLater() {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    setItems(getSavedItems());
  }, []);

  // Listen for storage changes from other components (e.g. cart store saveForLater)
  useEffect(() => {
    const onStorage = () => setItems(getSavedItems());
    window.addEventListener("saved-for-later-updated", onStorage);
    return () => window.removeEventListener("saved-for-later-updated", onStorage);
  }, []);

  const moveToCart = useCallback(
    (item: CartItem) => {
      const { quantity, ...rest } = item;
      addItem(rest, quantity);
      const updated = getSavedItems().filter((i) => i.id !== item.id);
      setSavedItems(updated);
      setItems(updated);
    },
    [addItem]
  );

  const removeItem = useCallback((id: string) => {
    const updated = getSavedItems().filter((i) => i.id !== id);
    setSavedItems(updated);
    setItems(updated);
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
        Saved for Later ({items.length})
      </h3>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 p-3 bg-surface-light rounded-lg"
          >
            <Link
              href={`/products/${item.slug}`}
              className="relative w-14 h-14 flex-shrink-0 rounded-md overflow-hidden bg-surface"
            >
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {item.name}
              </p>
              <p className="text-sm text-muted">{formatPrice(item.price)}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => moveToCart(item)}
                className="p-1.5 text-accent hover:text-accent/80 transition-colors"
                aria-label="Move to cart"
                title="Move to Cart"
              >
                <ShoppingCart size={16} />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1.5 text-muted hover:text-sale transition-colors"
                aria-label="Remove saved item"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
