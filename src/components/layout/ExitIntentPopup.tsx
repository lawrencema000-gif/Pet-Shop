"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";

const STORAGE_KEY = "exit_popup_dismissed";
const DISMISS_DAYS = 7;
const MOBILE_DELAY_MS = 45_000;
const CHECKOUT_PATHS = ["/checkout", "/cart/checkout"];

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function markDismissed() {
  localStorage.setItem(STORAGE_KEY, String(Date.now()));
}

function isCheckoutPage(): boolean {
  if (typeof window === "undefined") return false;
  return CHECKOUT_PATHS.some((p) => window.location.pathname.startsWith(p));
}

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || "ontouchstart" in window;
}

export default function ExitIntentPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const triggered = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const show = useCallback(() => {
    if (triggered.current || isDismissed() || isCheckoutPage()) return;
    triggered.current = true;
    setOpen(true);
  }, []);

  const dismiss = useCallback(() => {
    markDismissed();
    setOpen(false);
  }, []);

  // --- Triggers ---
  useEffect(() => {
    if (isDismissed() || isCheckoutPage()) return;

    // Desktop: exit intent via mouseleave on documentElement
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) show();
    };

    if (!isMobile()) {
      document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    }

    // Mobile: show after 45 seconds
    let mobileTimer: ReturnType<typeof setTimeout> | undefined;
    if (isMobile()) {
      mobileTimer = setTimeout(show, MOBILE_DELAY_MS);
    }

    return () => {
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (mobileTimer) clearTimeout(mobileTimer);
    };
  }, [show]);

  // --- Body scroll lock ---
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus the close button when opened for accessibility
      setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // --- Keyboard: Escape to close + focus trap ---
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, dismiss]);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const { error: dbError } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

      if (dbError) {
        // Duplicate is fine — still show the code
        if (dbError.code === "23505") {
          setSuccess(true);
          markDismissed();
          return;
        }
        throw dbError;
      }

      setSuccess(true);
      markDismissed();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Exit discount offer"
            className="relative z-10 w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Close button */}
            <button
              ref={closeRef}
              onClick={dismiss}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-500 hover:text-neutral-800"
              aria-label="Close popup"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>

            <div className="p-8 text-center">
              {!success ? (
                <>
                  {/* Paw icon */}
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-amber-600">
                      <path
                        d="M12 18.5c-2.5 0-5-1.5-5-4 0-1.5 1-3 2.5-4.5C11 8.5 12 7 12 7s1 1.5 2.5 3c1.5 1.5 2.5 3 2.5 4.5 0 2.5-2.5 4-5 4z"
                        fill="currentColor"
                      />
                      <circle cx="7" cy="8" r="2" fill="currentColor" />
                      <circle cx="17" cy="8" r="2" fill="currentColor" />
                      <circle cx="9" cy="4" r="1.5" fill="currentColor" />
                      <circle cx="15" cy="4" r="1.5" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Headline */}
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2 leading-tight">
                    Wait! Here&apos;s 10% Off Your First Order
                  </h2>

                  {/* Subhead */}
                  <p className="text-neutral-600 text-sm mb-6 leading-relaxed">
                    Join 15,000+ pet parents and get exclusive access to deals, new
                    products, and smart pet care tips.
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                      ref={inputRef}
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow bg-white placeholder:text-neutral-400"
                      aria-label="Email address"
                    />

                    {error && (
                      <p className="text-red-500 text-xs" role="alert">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm"
                    >
                      {loading ? "Submitting..." : "Claim My 10% Off"}
                    </button>
                  </form>

                  {/* Decline */}
                  <button
                    onClick={dismiss}
                    className="mt-4 text-xs text-neutral-400 hover:text-neutral-600 transition-colors underline underline-offset-2"
                  >
                    No thanks, I&apos;ll pay full price
                  </button>

                  {/* Privacy */}
                  <p className="mt-3 text-[11px] text-neutral-400">
                    No spam. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                /* Success state */
                <>
                  <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-green-600">
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-neutral-900 mb-1">
                    Your code: <span className="text-amber-600">WELCOME10</span>
                  </h2>

                  <p className="text-neutral-600 text-sm mb-6">
                    Use it at checkout for 10% off your first order
                  </p>

                  <a
                    href="/products"
                    className="inline-block w-full py-3 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors text-sm text-center"
                  >
                    Shop Now
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
