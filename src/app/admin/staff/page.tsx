"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { logAdminAction } from "@/lib/audit-log";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ALL_PERMISSIONS, type StaffRole } from "@/types/admin";
import { useTranslation } from "react-i18next";

interface AdminUser {
  id: string;
  full_name: string | null;
  role: string;
  staff_role_id: string | null;
  created_at: string;
}

type Tab = "members" | "roles";

export default function AdminStaffPage() {
  const { t } = useTranslation();
  const { isSuperAdmin } = useStaffPermissions();
  const [tab, setTab] = useState<Tab>("members");
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRole, setShowNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", description: "", permissions: [] as string[] });
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);

  async function load() {
    const [{ data: adminData }, { data: roleData }] = await Promise.all([
      supabase.from("profiles").select("id, full_name, role, staff_role_id, created_at").eq("role", "admin"),
      supabase.from("staff_roles").select("*").order("created_at"),
    ]);
    setAdmins(adminData ?? []);
    setRoles((roleData ?? []) as StaffRole[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function assignRole(userId: string, roleId: string | null) {
    const { error } = await supabase.from("profiles").update({ staff_role_id: roleId }).eq("id", userId);
    if (error) { console.error("Assign role failed:", error.message); return; }
    await logAdminAction("assign_role", "profile", userId, { staff_role_id: roleId });
    load();
  }

  async function revokeAdmin() {
    if (!revokeId) return;
    const { error } = await supabase.from("profiles").update({ role: "customer", staff_role_id: null }).eq("id", revokeId);
    if (error) { console.error("Revoke admin failed:", error.message); return; }
    await logAdminAction("revoke_admin", "profile", revokeId);
    setRevokeId(null);
    load();
  }

  async function createRole() {
    if (!newRole.name) return;
    const { data, error } = await supabase.from("staff_roles").insert({
      name: newRole.name,
      description: newRole.description || null,
      permissions: newRole.permissions,
      is_system: false,
    }).select().single();
    if (error) { console.error("Create role failed:", error.message); return; }
    if (data) {
      await logAdminAction("create_role", "staff_role", data.id, { name: newRole.name });
      setShowNewRole(false);
      setNewRole({ name: "", description: "", permissions: [] });
      load();
    }
  }

  async function deleteRole() {
    if (!deleteRoleId) return;
    const { error } = await supabase.from("staff_roles").delete().eq("id", deleteRoleId);
    if (error) { console.error("Delete role failed:", error.message); return; }
    await logAdminAction("delete_role", "staff_role", deleteRoleId);
    setDeleteRoleId(null);
    load();
  }

  function togglePermission(perm: string) {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">{t("admin.staff.accessRestricted")}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.staff.noPermission")}</p>
      </div>
    );
  }

  const tabs = [
    { key: "members" as Tab, label: t("admin.staff.staffMembersTab", { count: admins.length }) },
    { key: "roles" as Tab, label: t("admin.staff.rolesTab", { count: roles.length }) },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.staff.title")}</h1>
        <p className="text-sm text-muted mt-1">{t("admin.staff.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.key}
            onClick={() => setTab(tabItem.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === tabItem.key ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {/* Members Tab */}
      {tab === "members" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.staff.nameHeader")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.staff.roleHeader")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.staff.joinedHeader")}</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {[1, 2, 3, 4].map((j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{admin.full_name ?? "\u2014"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={admin.staff_role_id ?? ""}
                      onChange={(e) => assignRole(admin.id, e.target.value || null)}
                      className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:border-accent"
                    >
                      <option value="">{t("admin.staff.noRole")}</option>
                      {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(admin.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setRevokeId(admin.id)} className="text-xs text-sale hover:underline">{t("admin.staff.revoke")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && admins.length === 0 && <div className="py-8 text-center text-sm text-muted">{t("admin.staff.noAdminUsers")}</div>}
        </div>
      )}

      {/* Roles Tab */}
      {tab === "roles" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowNewRole(true)} className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-accent-dark">
              <Plus size={14} /> {t("admin.staff.newRole")}
            </button>
          </div>

          {/* New Role Form */}
          {showNewRole && (
            <div className="bg-white border border-border rounded-lg p-5 mb-4">
              <h3 className="text-sm font-semibold mb-3">{t("admin.staff.createRole")}</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <input type="text" value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder={t("admin.staff.roleNamePlaceholder")} className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
                <input type="text" value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} placeholder={t("admin.staff.descriptionPlaceholder")} className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              </div>
              <p className="text-xs font-semibold text-muted uppercase mb-2">{t("admin.staff.permissions")}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {ALL_PERMISSIONS.map((perm) => (
                  <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={newRole.permissions.includes(perm)} onChange={() => togglePermission(perm)} className="rounded border-border" />
                    <span className="text-xs">{perm}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={createRole} className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark"><Save size={14} className="inline mr-1" />{t("admin.staff.createButton")}</button>
                <button onClick={() => setShowNewRole(false)} className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface">{t("admin.staff.cancel")}</button>
              </div>
            </div>
          )}

          {/* Existing Roles */}
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="bg-white border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{role.name}</h3>
                    {role.description && <p className="text-xs text-muted">{role.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {role.is_system && <span className="text-[10px] font-semibold bg-accent-light text-accent px-1.5 py-0.5 rounded">{t("admin.staff.system")}</span>}
                    {!role.is_system && (
                      <>
                        <button
                          onClick={() => {
                            if (editingRoleId === role.id) {
                              // Save
                              supabase.from("staff_roles").update({ permissions: editingPermissions }).eq("id", role.id).then(() => {
                                setRoles((prev) => prev.map((r) => r.id === role.id ? { ...r, permissions: editingPermissions } : r));
                                setEditingRoleId(null);
                                logAdminAction("update_role_permissions", "staff_role", role.id);
                              });
                            } else {
                              setEditingRoleId(role.id);
                              setEditingPermissions([...role.permissions]);
                            }
                          }}
                          className="px-2 py-1 text-[10px] font-medium border border-border rounded hover:bg-surface transition-colors"
                        >
                          {editingRoleId === role.id ? "Save" : "Edit"}
                        </button>
                        {editingRoleId === role.id && (
                          <button onClick={() => setEditingRoleId(null)} className="px-2 py-1 text-[10px] font-medium text-muted hover:text-foreground">Cancel</button>
                        )}
                        <button onClick={() => setDeleteRoleId(role.id)} className="p-1.5 hover:bg-sale/10 rounded">
                          <Trash2 size={14} className="text-muted hover:text-sale" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editingRoleId === role.id ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 w-full mt-2">
                      {ALL_PERMISSIONS.map((perm) => (
                        <label key={perm} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingPermissions.includes(perm)}
                            onChange={() => setEditingPermissions((prev) =>
                              prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
                            )}
                            className="rounded border-border"
                          />
                          {perm}
                        </label>
                      ))}
                    </div>
                  ) : role.permissions.includes("*") ? (
                    <span className="text-[10px] font-medium bg-gold-light text-gold px-1.5 py-0.5 rounded">{t("admin.staff.allPermissions")}</span>
                  ) : (
                    role.permissions.map((p) => (
                      <span key={p} className="text-[10px] font-medium bg-surface text-muted px-1.5 py-0.5 rounded">{p}</span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!revokeId} title={t("admin.staff.revokeAdminAccess")} message={t("admin.staff.revokeAdminMessage")} confirmLabel={t("admin.staff.revoke")} variant="danger" onConfirm={revokeAdmin} onCancel={() => setRevokeId(null)} />
      <ConfirmDialog isOpen={!!deleteRoleId} title={t("admin.staff.deleteRole")} message={t("admin.staff.deleteRoleMessage")} confirmLabel={t("common.delete")} variant="danger" onConfirm={deleteRole} onCancel={() => setDeleteRoleId(null)} />
    </div>
  );
}
