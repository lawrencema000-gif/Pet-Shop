"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Autocomplete from "@/components/search/Autocomplete";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = [
  { label: "Smart Litter Box", href: "/products?q=litter+box" },
  { label: "Water Fountain", href: "/products?q=water+fountain" },
  { label: "Automatic Feeder", href: "/products?q=feeder" },
  { label: "Pet Camera", href: "/products?q=camera" },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const [showPopular, setShowPopular] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setShowPopular(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setShowPopular(!query.trim());
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSelect = (url: string) => {
    onClose();
    router.push(url);
  };

  const handleSubmit = (q: string) => {
    onClose();
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-white"
        >
          <div className="max-w-3xl mx-auto px-6 pt-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Autocomplete
                  autoFocus
                  placeholder="Search products..."
                  value={query}
                  onChange={setQuery}
                  onSelect={handleSelect}
                  onSubmit={handleSubmit}
                />
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                aria-label="Close search"
              >
                <X size={24} />
              </button>
            </div>

            {/* Popular searches — shown when input is empty */}
            {showPopular && (
              <div className="mt-10">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground-muted mb-4">
                  <TrendingUp size={16} />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-foreground bg-surface-light rounded-full hover:bg-surface transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
