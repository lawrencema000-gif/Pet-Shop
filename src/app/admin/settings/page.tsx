"use client";

import { useState, useEffect } from "react";
import { Save, Check, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface SettingsState {
  store_name: string;
  store_currency: string;
  super_admin_emails: string[];
  custom_admin_nav: { label: string; href: string; icon?: string }[];
}

export default function AdminSettingsPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [settings, setSettings] = useState<SettingsState>({
    store_name: "PETLIBRO",
    store_currency: "USD",
    super_admin_emails: [],
    custom_admin_nav: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newNavLabel, setNewNavLabel] = useState("");
  const [newNavHref, setNewNavHref] = useState("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("app_settings").select("key, value");
      const map = new Map((data ?? []).map((d) => [d.key, d.value]));
      setSettings({
        store_name: (map.get("store_name") as string) ?? "PETLIBRO",
        store_currency: (map.get("store_currency") as string) ?? "USD",
        super_admin_emails: (map.get("super_admin_emails") as string[]) ?? [],
        custom_admin_nav: (map.get("custom_admin_nav") as SettingsState["custom_admin_nav"]) ?? [],
      });
      setLoading(false);
    }
    load();
  }, []);

  async function saveSetting(key: string, value: unknown) {
    const { error } = await supabase.from("app_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) { console.error(`Save setting "${key}" failed:`, error.message); return; }
    await logAdminAction("update_setting", "settings", key, { value });
  }

  async function handleSave() {
    setSaving(true);
    await Promise.all([
      saveSetting("store_name", settings.store_name),
      saveSetting("store_currency", settings.store_currency),
      saveSetting("super_admin_emails", settings.super_admin_emails),
      saveSetting("custom_admin_nav", settings.custom_admin_nav),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addAdminEmail() {
    if (!newEmail || settings.super_admin_emails.includes(newEmail)) return;
    setSettings({ ...settings, super_admin_emails: [...settings.super_admin_emails, newEmail] });
    setNewEmail("");
  }

  function removeAdminEmail(email: string) {
    setSettings({ ...settings, super_admin_emails: settings.super_admin_emails.filter((e) => e !== email) });
  }

  function addNavItem() {
    if (!newNavLabel || !newNavHref) return;
    setSettings({
      ...settings,
      custom_admin_nav: [...settings.custom_admin_nav, { label: newNavLabel, href: newNavHref }],
    });
    setNewNavLabel("");
    setNewNavHref("");
  }

  function removeNavItem(idx: number) {
    setSettings({
      ...settings,
      custom_admin_nav: settings.custom_admin_nav.filter((_, i) => i !== idx),
    });
  }

  if (loaded && !isSuperAdmin && !hasPermission("settings:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to manage settings.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted mt-1">Store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
        >
          {saved ? <><Check size={16} /> Saved</> : <><Save size={16} /> {saving ? "Saving..." : "Save All"}</>}
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Store Info */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">Store Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Store Name</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Currency</label>
              <select
                value={settings.store_currency}
                onChange={(e) => setSettings({ ...settings, store_currency: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Super Admin Emails */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Super Admin Emails</h2>
          <p className="text-xs text-muted mb-4">Users with these emails have full admin access regardless of assigned role.</p>
          <div className="space-y-2 mb-3">
            {settings.super_admin_emails.map((email) => (
              <div key={email} className="flex items-center justify-between bg-surface px-3 py-2 rounded-md">
                <span className="text-sm">{email}</span>
                <button onClick={() => removeAdminEmail(email)} className="text-xs text-sale hover:underline">Remove</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdminEmail())}
            />
            <button onClick={addAdminEmail} className="px-3 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">Add</button>
          </div>
        </div>

        {/* Custom Admin Nav (Extensibility) */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">Custom Admin Pages</h2>
          <p className="text-xs text-muted mb-4">Add custom navigation items to the admin sidebar. These will appear at the bottom of the nav.</p>
          {settings.custom_admin_nav.length > 0 && (
            <div className="space-y-2 mb-3">
              {settings.custom_admin_nav.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-surface px-3 py-2 rounded-md">
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted ml-2">{item.href}</span>
                  </div>
                  <button onClick={() => removeNavItem(idx)} className="text-xs text-sale hover:underline">Remove</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNavLabel}
              onChange={(e) => setNewNavLabel(e.target.value)}
              placeholder="Label"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={newNavHref}
              onChange={(e) => setNewNavHref(e.target.value)}
              placeholder="/admin/custom-page"
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
            <button onClick={addNavItem} className="px-3 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}
