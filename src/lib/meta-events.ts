/**
 * Meta Pixel + CAPI helper.
 *
 * Each user-side event call (fires the browser Pixel) is paired with a
 * server-side CAPI call via the same `eventId`. Meta deduplicates by
 * `eventId`, so we get the union of both signals — recovering the
 * ~30-40% of events the browser pixel loses to iOS ATT, private browsing,
 * and ad-blockers.
 *
 * Typical flow (from a client component):
 *   import { trackEvent } from "@/lib/meta-events";
 *   trackEvent("ViewContent", { content_ids: [productId], value: 49.99, currency: "USD" });
 *
 * For Purchase events that happen on the server (Stripe webhook), call the
 * CAPI endpoint directly:
 *   await fetch("/api/meta-capi", { method: "POST", body: JSON.stringify({ ... }) })
 */

type EventName =
  | "ViewContent"
  | "AddToCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Search"
  | "Subscribe";

export interface MetaEventCustomData {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: "product" | "product_group";
  contents?: { id: string; quantity: number; item_price?: number }[];
  num_items?: number;
  order_id?: string;
  search_string?: string;
}

export interface MetaEventUserData {
  email?: string;
  phone?: string;
  external_id?: string;
}

function uuid(): string {
  // RFC4122 v4-ish — good enough for dedup correlation.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/**
 * Track a Meta event from the client. Fires the browser Pixel AND posts to
 * the /api/meta-capi server endpoint with the same event_id for dedup.
 */
export function trackEvent(
  eventName: EventName,
  customData: MetaEventCustomData = {},
  userData: MetaEventUserData = {},
): void {
  if (typeof window === "undefined") return;

  const eventId = uuid();
  const eventTime = Math.floor(Date.now() / 1000);

  // Browser Pixel
  if (window.fbq) {
    window.fbq("track", eventName, customData, { eventID: eventId });
  }

  // Server CAPI — fire-and-forget. We pass fbp / fbc cookies so Meta can
  // attribute back to the original ad click.
  const fbp = getCookie("_fbp");
  const fbc = getCookie("_fbc");

  void fetch("/api/meta-capi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_time: eventTime,
      event_source_url: typeof location !== "undefined" ? location.href : undefined,
      user_data: {
        ...userData,
        fbp,
        fbc,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      },
      custom_data: customData,
    }),
  }).catch(() => {
    /* CAPI is best-effort — never block the user */
  });
}
