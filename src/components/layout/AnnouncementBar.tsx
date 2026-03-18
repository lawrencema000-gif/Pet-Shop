"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ANNOUNCEMENT_MESSAGES } from "@/lib/constants";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMessage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENT_MESSAGES.length);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(nextMessage, 4000);
    return () => clearInterval(interval);
  }, [visible, nextMessage]);

  if (!visible) return null;

  return (
    <div className="relative bg-accent text-white py-2.5 text-xs font-medium overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-center min-h-[20px]">
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="tracking-wide text-center"
          >
            {ANNOUNCEMENT_MESSAGES[currentIndex]}
          </motion.span>
        </AnimatePresence>
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
