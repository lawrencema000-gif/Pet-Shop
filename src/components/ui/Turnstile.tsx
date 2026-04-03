"use client";

import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function Turnstile({ onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const enabled = !!SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!enabled || !containerRef.current || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY!,
      callback: onVerify,
      "expired-callback": onExpire,
      theme: "light",
      size: "normal",
    });
  }, [onVerify, onExpire, enabled]);

  // Auto-verify if Turnstile not configured
  useEffect(() => {
    if (!enabled) {
      onVerify("no-turnstile-configured");
    }
  }, [enabled, onVerify]);

  // Load Turnstile script
  useEffect(() => {
    if (!enabled) return;

    if (window.turnstile) {
      setLoaded(true);
      return;
    }

    const existing = document.querySelector('script[src*="turnstile"]');
    if (existing) {
      window.onTurnstileLoad = () => setLoaded(true);
      return;
    }

    window.onTurnstileLoad = () => setLoaded(true);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [enabled]);

  // Render widget when loaded
  useEffect(() => {
    if (loaded) renderWidget();
  }, [loaded, renderWidget]);

  if (!enabled) return null;

  return <div ref={containerRef} className="my-3" />;
}

export function useTurnstile() {
  const [token, setToken] = useState<string | null>(null);
  const handleVerify = useCallback((t: string) => setToken(t), []);
  const handleExpire = useCallback(() => setToken(null), []);
  return { token, handleVerify, handleExpire, isVerified: !!token };
}
