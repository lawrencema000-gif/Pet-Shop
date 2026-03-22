"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/auth-provider";
import type { StaffRole } from "@/types/admin";

const DEFAULT_SUPER_EMAILS = ["lawrence.ma000@gmail.com"];

let cachedSuperEmails: string[] | null = null;

export function useStaffPermissions() {
  const { profile } = useAuth();
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const [superAdminEmails, setSuperAdminEmails] = useState<string[]>(
    cachedSuperEmails ?? DEFAULT_SUPER_EMAILS
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile?.staff_role_id) {
      setStaffRole(null);
      setLoaded(true);
      return;
    }
    supabase
      .from("staff_roles")
      .select("id, name, description, permissions, is_system, created_at")
      .eq("id", profile.staff_role_id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Failed to load staff role:", error);
        setStaffRole(data as StaffRole | null);
        setLoaded(true);
      });
  }, [profile?.staff_role_id]);

  useEffect(() => {
    if (cachedSuperEmails) return;
    supabase
      .from("app_settings")
      .select("value")
      .eq("key", "super_admin_emails")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("Failed to load super admin emails:", error);
        const emails = Array.isArray(data?.value)
          ? (data.value as string[])
          : DEFAULT_SUPER_EMAILS;
        cachedSuperEmails = emails;
        setSuperAdminEmails(emails);
      });
  }, []);

  const userEmail = profile?.email ?? "";

  const isSuperAdmin = useMemo(
    () => !!profile && superAdminEmails.includes(userEmail),
    [profile, superAdminEmails, userEmail]
  );

  const permissions = useMemo<string[]>(
    () => staffRole?.permissions ?? [],
    [staffRole]
  );

  const hasWildcard = permissions.includes("*");

  function hasPermission(perm: string): boolean {
    if (isSuperAdmin) return true;
    if (hasWildcard) return true;
    return permissions.includes(perm);
  }

  function hasAnyPermission(...perms: string[]): boolean {
    return perms.some((p) => hasPermission(p));
  }

  return {
    staffRole,
    isSuperAdmin,
    permissions,
    hasPermission,
    hasAnyPermission,
    loaded,
    roleName: staffRole?.name ?? (isSuperAdmin ? "Super Admin" : "Admin"),
  };
}
