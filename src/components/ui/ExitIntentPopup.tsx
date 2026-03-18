"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const DISMISS_KEY = "petlibro_exit_popup_dismissed";
const DISMISS_DAYS = 14;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }, []);

  useEffect(() => {
    // Check if dismissed within last 14 days
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed, 10);
      if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) return;
    }

    let fired = false;

    // Desktop: exit intent (mouse leaves viewport top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !fired) {
        fired = true;
        setShow(true);
      }
    };

    // Mobile fallback: 60s timer
    const timer = setTimeout(() => {
      if (!fired) {
        fired = true;
        setShow(true);
      }
    }, 60000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await supabase.from("newsletter_subscribers").insert({ email, source: "exit_popup" });
      setStatus("success");
      setTimeout(dismiss, 2500);
    } catch {
      setStatus("idle");
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="relative bg-white max-w-md w-full p-8 md:p-10 animate-scale-in shadow-luxe">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        {status === "success" ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">
              Check Your Inbox
            </h3>
            <p className="text-sm text-muted mt-2">
              Your 15% discount code is on its way.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-overline tracking-[0.2em] uppercase text-gold block mb-3">
                Exclusive Offer
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                Wait — Don&apos;t Leave
                <br />
                Empty Handed
              </h3>
              <p className="text-sm text-muted mt-3 leading-relaxed">
                Get <span className="font-semibold text-foreground">15% off</span> your
                first order. Join 50,000+ pet parents who chose smarter care.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="w-full px-4 py-3.5 text-sm border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-accent text-white py-3.5 text-sm font-semibold hover:bg-accent-dark transition-colors duration-300 disabled:opacity-60"
              >
                {status === "loading" ? "Claiming..." : "Claim My 15% Discount"}
              </button>
            </form>

            <button
              onClick={dismiss}
              className="block w-full text-center text-xs text-muted mt-4 hover:text-foreground transition-colors"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </>
        )}
      </div>
    </div>
  );
}
