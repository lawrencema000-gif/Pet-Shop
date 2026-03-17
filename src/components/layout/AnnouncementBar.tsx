"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const message = `Free shipping on orders over $${SITE_CONFIG.freeShippingThreshold} in the U.S.`;

  return (
    <div className="relative bg-accent text-white py-2 text-xs font-medium overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="mx-8">
            {message}
          </span>
        ))}
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={14} />
      </button>
    </div>
  );
}
