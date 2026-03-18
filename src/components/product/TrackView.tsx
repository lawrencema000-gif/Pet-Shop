"use client";

import { useEffect } from "react";

interface TrackViewProps {
  slug: string;
}

const STORAGE_KEY = "recently-viewed";
const MAX_ITEMS = 8;

export default function TrackView({ slug }: TrackViewProps) {
  useEffect(() => {
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
  }, [slug]);

  return null;
}
