"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-20 right-5 z-40 w-10 h-10 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-accent/90 transition-all animate-in fade-in duration-200"
      aria-label="Back to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}
