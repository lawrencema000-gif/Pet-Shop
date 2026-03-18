"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-accent text-white py-2.5 text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-center min-h-[20px]">
        <span className="tracking-wide text-center">
          <span className="gold-shimmer font-semibold">Free Express Shipping</span>
          {" "}on Orders $75+ &nbsp;·&nbsp; Shop Now →
        </span>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/15 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
