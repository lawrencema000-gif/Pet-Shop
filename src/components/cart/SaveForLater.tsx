"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCartStore } from "@/lib/store/cart";
import { useAuth } from "@/lib/supabase/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "saved-for-later";

function getLocalItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalItems(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function SaveForLater() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = useCartStore((s) => s.addItem);

  // Load items: from DB if logged in, localStorage if guest
  useEffect(() => {
    if (!user) {
      setItems(getLocalItems());
      return;
    }

    supabase
      .from("saved_for_later")
      .select("product_id, variant_id, products(name, slug, base_price, images:product_images(url, is_primary)), variants:product_variants(id, name, price)")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) { setItems(getLocalItems()); return; }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: CartItem[] = data.map((row: any) => {
          const product = row.products;
          const variant = row.variants;
          const primaryImage = product?.images?.find((i: { is_primary: boolean }) => i.is_primary) || product?.images?.[0];
          return {
            id: variant?.id ?? row.product_id,
            product_id: row.product_id,
            variant_id: row.variant_id ?? null,
            name: product?.name ?? "",
            variant_name: variant?.name ?? null,
            price: variant?.price ?? product?.base_price ?? 0,
            compare_at_price: null,
            image_url: primaryImage?.url ?? "",
            slug: product?.slug ?? "",
            quantity: 1,
          };
        });
        setItems(mapped);
      });
  }, [user]);

  // Listen for localStorage changes from cart (guest mode)
  useEffect(() => {
    const onStorage = () => { if (!user) setItems(getLocalItems()); };
    window.addEventListener("saved-for-later-updated", onStorage);
    return () => window.removeEventListener("saved-for-later-updated", onStorage);
  }, [user]);

  const moveToCart = useCallback(
    async (item: CartItem) => {
      const { quantity, ...rest } = item;
      addItem(rest, quantity);
      // Remove from saved
      if (user) {
        await supabase
          .from("saved_for_later")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", item.product_id);
      }
      const updated = items.filter((i) => i.id !== item.id);
      setItems(updated);
      setLocalItems(updated);
    },
    [addItem, user, items]
  );

  const removeItem = useCallback(
    async (item: CartItem) => {
      if (user) {
        await supabase
          .from("saved_for_later")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", item.product_id);
      }
      const updated = items.filter((i) => i.id !== item.id);
      setItems(updated);
      setLocalItems(updated);
    },
    [user, items]
  );

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
        {t("saveForLater.title", { count: items.length })}
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
                aria-label={t("saveForLater.moveToCartAria")}
                title={t("saveForLater.moveToCart")}
              >
                <ShoppingCart size={16} />
              </button>
              <button
                onClick={() => removeItem(item)}
                className="p-1.5 text-muted hover:text-sale transition-colors"
                aria-label={t("saveForLater.removeAria")}
                title={t("saveForLater.remove")}
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
