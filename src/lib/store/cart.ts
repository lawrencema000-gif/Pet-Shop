"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_ITEM_QUANTITY } from "@/lib/constants";
import type { CartItem, CartState } from "@/types/cart";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: Omit<CartItem, "quantity">, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          (i) => i.id === item.id
        );

        if (existingIndex > -1) {
          const newItems = [...items];
          newItems[existingIndex].quantity = Math.min(
            newItems[existingIndex].quantity + quantity,
            MAX_ITEM_QUANTITY
          );
          set({ items: newItems, isOpen: true });
        } else {
          set({
            items: [
              ...items,
              { ...item, quantity: Math.min(quantity, MAX_ITEM_QUANTITY) },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const clamped = Math.min(quantity, MAX_ITEM_QUANTITY);
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: clamped } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleDrawer: () => set({ isOpen: !get().isOpen }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "pet-shop-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
