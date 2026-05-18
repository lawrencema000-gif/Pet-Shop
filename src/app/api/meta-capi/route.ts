import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Meta Conversions API forwarder.
 *
 * Accepts events from the browser (`trackEvent` in src/lib/meta-events.ts) or
 * from internal server code, hashes PII per Meta spec, and forwards to
 * graph.facebook.com. Each call is logged to `capi_event_log` so we can
 * diagnose attribution gaps later.
 *
 * Env:
 *   NEXT_PUBLIC_META_PIXEL_ID   — pixel ID (also used by the browser Pixel)
 *   META_CAPI_ACCESS_TOKEN      — long-lived system-user token from Meta
 *   META_CAPI_TEST_EVENT_CODE   — optional; set during testing to validate
 *                                  events in Meta Events Manager.
 */

export const runtime = "nodejs";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const TEST_CODE = process.env.META_CAPI_TEST_EVENT_CODE;

function sha256(input: string): string {
  return createHash("sha256").update(input.trim().toLowerCase()).digest("hex");
}

interface IncomingEvent {
  event_name: string;
  event_id: string;
  event_time?: number;
  event_source_url?: string;
  user_data?: {
    email?: string;
    phone?: string;
    external_id?: string;
    fbp?: string;
    fbc?: string;
    ip?: string;
    user_agent?: string;
  };
  custom_data?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  // Reject obvious abuse — these endpoints get hammered if exposed
  const ip = getClientIp(req);
  const rl = rateLimit(`capi:${ip}`, 60, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    // Silently succeed when not configured so client code can always call us
    return NextResponse.json({ ok: false, reason: "not_configured" });
  }

  let payload: IncomingEvent;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.event_name || !payload.event_id) {
    return NextResponse.json(
      { error: "event_name and event_id are required" },
      { status: 400 },
    );
  }

  // Hash PII per Meta spec; pass network-level signals unhashed
  const user_data: Record<string, unknown> = {};
  if (payload.user_data?.email) user_data.em = [sha256(payload.user_data.email)];
  if (payload.user_data?.phone) {
    user_data.ph = [sha256(payload.user_data.phone.replace(/\D/g, ""))];
  }
  if (payload.user_data?.external_id) {
    user_data.external_id = [sha256(payload.user_data.external_id)];
  }

  const xff = req.headers.get("x-forwarded-for") || "";
  user_data.client_ip_address =
    payload.user_data?.ip || xff.split(",")[0].trim() || ip;
  user_data.client_user_agent =
    payload.user_data?.user_agent || req.headers.get("user-agent") || "";
  if (payload.user_data?.fbp) user_data.fbp = payload.user_data.fbp;
  if (payload.user_data?.fbc) user_data.fbc = payload.user_data.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: payload.event_name,
        event_time: payload.event_time ?? Math.floor(Date.now() / 1000),
        event_id: payload.event_id,
        action_source: "website",
        event_source_url:
          payload.event_source_url ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "https://www.petandangel.com",
        user_data,
        custom_data: payload.custom_data ?? {},
      },
    ],
  };
  if (TEST_CODE) body.test_event_code = TEST_CODE;

  const url = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`;

  let status = 0;
  let resBody = "";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    status = res.status;
    resBody = await res.text();
  } catch (err) {
    status = 0;
    resBody = err instanceof Error ? err.message : "fetch failed";
  }

  // Log every send — never block on a logging failure
  try {
    const sb = createAdminSupabaseClient();
    await sb.from("capi_event_log").insert({
      event_name: payload.event_name,
      event_id: payload.event_id,
      pixel_id: PIXEL_ID,
      status_code: status,
      response_body: resBody.slice(0, 1000),
      payload: body,
    });
  } catch {
    /* swallow */
  }

  if (status < 200 || status >= 300) {
    return NextResponse.json({ ok: false, status, error: resBody });
  }
  return NextResponse.json({ ok: true });
}
