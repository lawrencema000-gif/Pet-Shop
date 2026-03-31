"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "cookie-consent-accepted";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so it doesn't flash on initial load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, "essential-only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-background border border-border rounded-xl shadow-lg p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground mb-1">
              We use cookies
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              We use cookies to improve your experience, analyze site traffic, and personalize content.
              By clicking &quot;Accept All&quot;, you consent to our use of cookies.{" "}
              <Link href="/privacy" className="underline hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
          <button
            onClick={handleDecline}
            className="p-1 text-muted hover:text-foreground transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent/90 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="px-5 py-2 border border-border text-xs font-semibold text-foreground rounded-lg hover:bg-surface transition-colors"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
