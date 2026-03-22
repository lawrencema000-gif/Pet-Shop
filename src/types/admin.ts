export type AdminRole = "customer" | "admin";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: AdminRole;
  is_banned: boolean;
  staff_role_id: string | null;
  created_at: string;
}

export interface StaffRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AppSetting {
  key: string;
  value: unknown;
  updated_at: string;
}

export const ALL_PERMISSIONS = [
  "products:read",
  "products:write",
  "orders:read",
  "orders:write",
  "customers:read",
  "customers:write",
  "analytics:read",
  "reviews:read",
  "reviews:write",
  "coupons:read",
  "coupons:write",
  "categories:read",
  "categories:write",
  "newsletter:read",
  "newsletter:write",
  "settings:read",
  "settings:write",
  "staff:read",
  "staff:write",
  "content:read",
  "content:write",
  "chat:read",
  "chat:write",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];
