import { supabase } from "./supabase/client";

export async function logAdminAction(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    await supabase.from("audit_log").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details: details ?? {},
    });
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
