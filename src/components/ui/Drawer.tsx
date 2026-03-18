"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  className?: string;
  role?: string;
  "aria-modal"?: boolean;
  "aria-label"?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = "right",
  className,
  role,
  "aria-modal": ariaModal,
  "aria-label": ariaLabel,
}: DrawerProps) {
  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const slideVariants = {
    hidden: {
      x: side === "right" ? "100%" : "-100%",
    },
    visible: {
      x: 0,
      transition: { type: "spring" as const, damping: 30, stiffness: 300 },
    },
    exit: {
      x: side === "right" ? "100%" : "-100%",
      transition: { type: "spring" as const, damping: 30, stiffness: 300 },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role={role}
            aria-modal={ariaModal as boolean | "true" | "false" | undefined}
            aria-label={ariaLabel}
            className={cn(
              "fixed top-0 z-50 h-full w-full max-w-md bg-background shadow-xl flex flex-col",
              side === "right" ? "right-0" : "left-0",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="ml-auto p-1 rounded-lg hover:bg-surface-light transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
