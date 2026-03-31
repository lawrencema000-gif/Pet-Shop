"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-provider";

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);
    setWishlistIds(new Set((data || []).map((w) => w.product_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) return;

      const isWishlisted = wishlistIds.has(productId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.delete(productId);
        else next.add(productId);
        return next;
      });

      if (isWishlisted) {
        await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("wishlists")
          .insert({ user_id: user.id, product_id: productId });
      }
    },
    [user, wishlistIds]
  );

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  return { wishlistIds, loading, toggle, isWishlisted, refresh: fetchWishlist };
}
