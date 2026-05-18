"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/meta-events";

interface TrackViewProps {
  slug: string;
  productId?: string;
  name?: string;
  price?: number;
  currency?: string;
}

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

export default function TrackView({ slug, productId, name, price, currency = "USD" }: TrackViewProps) {
  useEffect(() => {
    // Recently-viewed history
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const slugs: string[] = stored ? JSON.parse(stored) : [];
      const filtered = slugs.filter((s) => s !== slug);
      filtered.unshift(slug);
      const trimmed = filtered.slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // localStorage unavailable
    }

    // Meta ViewContent
    if (productId) {
      trackEvent("ViewContent", {
        content_ids: [productId],
        content_name: name,
        content_type: "product",
        value: price,
        currency,
      });
    }
  }, [slug, productId, name, price, currency]);

  return null;
}
