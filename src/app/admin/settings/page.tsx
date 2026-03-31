"use client";

import { useState, useEffect } from "react";
import { Save, Check, Shield, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

interface ShippingRule {
  name: string;
  rate: number;
  min_order: number | null;  // null = no minimum
  max_order: number | null;  // null = no maximum
  enabled: boolean;
}

interface ShippingSettings {
  free_shipping_threshold: number | null;  // null = no free shipping
  default_rate: number;
  rules: ShippingRule[];
  tax_rate: number;  // percentage, e.g. 8.25
  tax_enabled: boolean;
}

interface SettingsState {
  store_name: string;
  store_currency: string;
  super_admin_emails: string[];
  custom_admin_nav: { label: string; href: string; icon?: string }[];
  shipping: ShippingSettings;
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [settings, setSettings] = useState<SettingsState>({
    store_name: "Pet and Angels",
    store_currency: "USD",
    super_admin_emails: [],
    custom_admin_nav: [],
    shipping: {
      free_shipping_threshold: 75,
      default_rate: 5.99,
      rules: [],
      tax_rate: 0,
      tax_enabled: false,
    },
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
        store_name: (map.get("store_name") as string) ?? "Pet and Angels",
        store_currency: (map.get("store_currency") as string) ?? "USD",
        super_admin_emails: (map.get("super_admin_emails") as string[]) ?? [],
        custom_admin_nav: (map.get("custom_admin_nav") as SettingsState["custom_admin_nav"]) ?? [],
        shipping: (map.get("shipping") as ShippingSettings) ?? {
          free_shipping_threshold: 75,
          default_rate: 5.99,
          rules: [],
          tax_rate: 0,
          tax_enabled: false,
        },
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
      saveSetting("shipping", settings.shipping),
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
        <h2 className="text-lg font-semibold text-foreground">{t("admin.settings.accessRestricted")}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.settings.noPermission")}</p>
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
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.settings.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.settings.subtitle")}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
        >
          {saved ? <><Check size={16} /> {t("admin.settings.saved")}</> : <><Save size={16} /> {saving ? t("admin.settings.saving") : t("admin.settings.saveAll")}</>}
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Store Info */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("admin.settings.storeInformation")}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.settings.storeName")}</label>
              <input
                type="text"
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.settings.currency")}</label>
              <select
                value={settings.store_currency}
                onChange={(e) => setSettings({ ...settings, store_currency: e.target.value })}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (&euro;)</option>
                <option value="GBP">GBP (&pound;)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & Tax */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-foreground">{t("admin.settings.shippingAndTax")}</h2>
          </div>
          <div className="space-y-5">
            {/* Default Flat Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.settings.defaultShippingRate")}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.shipping.default_rate}
                    onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, default_rate: Math.max(0, parseFloat(e.target.value) || 0) } })}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                  />
                </div>
                <p className="text-xs text-muted mt-1">{t("admin.settings.defaultShippingHelp")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.settings.freeShippingOver")}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={settings.shipping.free_shipping_threshold ?? ""}
                    onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, free_shipping_threshold: e.target.value ? parseFloat(e.target.value) : null } })}
                    placeholder={t("admin.settings.disabled")}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                  />
                </div>
                <p className="text-xs text-muted mt-1">{t("admin.settings.freeShippingHelp")}</p>
              </div>
            </div>

            {/* Shipping preview */}
            <div className="bg-surface/50 rounded-md p-4">
              <p className="text-xs font-semibold text-muted uppercase mb-2">{t("admin.settings.customerSees")}</p>
              <div className="space-y-1 text-sm text-foreground">
                <p>{t("admin.settings.standardShipping")} <span className="font-medium">${settings.shipping.default_rate.toFixed(2)}</span></p>
                {settings.shipping.free_shipping_threshold ? (
                  <p className="text-success">{t("admin.settings.freeShippingOnOrders")} <span className="font-medium">${settings.shipping.free_shipping_threshold.toFixed(2)}</span></p>
                ) : (
                  <p className="text-muted">{t("admin.settings.freeShippingDisabled")}</p>
                )}
              </div>
            </div>

            {/* Custom shipping rules */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">{t("admin.settings.customShippingRules")}</label>
                <button
                  onClick={() => setSettings({
                    ...settings,
                    shipping: {
                      ...settings.shipping,
                      rules: [...settings.shipping.rules, { name: "Express", rate: 12.99, min_order: null, max_order: null, enabled: true }],
                    },
                  })}
                  className="text-xs text-accent hover:underline"
                >
                  {t("admin.settings.addRule")}
                </button>
              </div>
              {settings.shipping.rules.length === 0 ? (
                <p className="text-xs text-muted">{t("admin.settings.noCustomRules")}</p>
              ) : (
                <div className="space-y-2">
                  {settings.shipping.rules.map((rule, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-surface/50 px-3 py-2.5 rounded-md">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => {
                          const rules = [...settings.shipping.rules];
                          rules[idx] = { ...rules[idx], enabled: e.target.checked };
                          setSettings({ ...settings, shipping: { ...settings.shipping, rules } });
                        }}
                        className="rounded border-border"
                      />
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => {
                          const rules = [...settings.shipping.rules];
                          rules[idx] = { ...rules[idx], name: e.target.value };
                          setSettings({ ...settings, shipping: { ...settings.shipping, rules } });
                        }}
                        className="flex-1 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent"
                        placeholder={t("admin.settings.ruleNamePlaceholder")}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={rule.rate}
                          onChange={(e) => {
                            const rules = [...settings.shipping.rules];
                            rules[idx] = { ...rules[idx], rate: Math.max(0, parseFloat(e.target.value) || 0) };
                            setSettings({ ...settings, shipping: { ...settings.shipping, rules } });
                          }}
                          className="w-20 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted">Min $</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={rule.min_order ?? ""}
                          onChange={(e) => {
                            const rules = [...settings.shipping.rules];
                            rules[idx] = { ...rules[idx], min_order: e.target.value ? parseFloat(e.target.value) : null };
                            setSettings({ ...settings, shipping: { ...settings.shipping, rules } });
                          }}
                          placeholder={t("admin.settings.minPlaceholder")}
                          className="w-20 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const rules = settings.shipping.rules.filter((_, i) => i !== idx);
                          setSettings({ ...settings, shipping: { ...settings.shipping, rules } });
                        }}
                        className="text-xs text-sale hover:underline shrink-0"
                      >
                        {t("admin.settings.remove")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <hr className="border-border" />

            {/* Tax */}
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shipping.tax_enabled}
                  onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, tax_enabled: e.target.checked } })}
                  className="rounded border-border"
                />
                <span className="font-medium text-foreground">{t("admin.settings.enableTax")}</span>
              </label>
              {settings.shipping.tax_enabled && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.settings.taxRate")}</label>
                  <div className="relative w-40">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.shipping.tax_rate}
                      onChange={(e) => setSettings({ ...settings, shipping: { ...settings.shipping, tax_rate: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) } })}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>
                  </div>
                  <p className="text-xs text-muted mt-1">{t("admin.settings.taxRateHelp")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Super Admin Emails */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">{t("admin.settings.superAdminEmails")}</h2>
          <p className="text-xs text-muted mb-4">{t("admin.settings.superAdminHelp")}</p>
          <div className="space-y-2 mb-3">
            {settings.super_admin_emails.map((email) => (
              <div key={email} className="flex items-center justify-between bg-surface px-3 py-2 rounded-md">
                <span className="text-sm">{email}</span>
                <button onClick={() => removeAdminEmail(email)} className="text-xs text-sale hover:underline">{t("admin.settings.remove")}</button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={t("admin.settings.emailPlaceholder")}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAdminEmail())}
            />
            <button onClick={addAdminEmail} className="px-3 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">{t("admin.settings.add")}</button>
          </div>
        </div>

        {/* Custom Admin Nav (Extensibility) */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-foreground mb-2">{t("admin.settings.customAdminPages")}</h2>
          <p className="text-xs text-muted mb-4">{t("admin.settings.customAdminHelp")}</p>
          {settings.custom_admin_nav.length > 0 && (
            <div className="space-y-2 mb-3">
              {settings.custom_admin_nav.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-surface px-3 py-2 rounded-md">
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted ml-2">{item.href}</span>
                  </div>
                  <button onClick={() => removeNavItem(idx)} className="text-xs text-sale hover:underline">{t("admin.settings.remove")}</button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNavLabel}
              onChange={(e) => setNewNavLabel(e.target.value)}
              placeholder={t("admin.settings.labelPlaceholder")}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={newNavHref}
              onChange={(e) => setNewNavHref(e.target.value)}
              placeholder={t("admin.settings.hrefPlaceholder")}
              className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
            <button onClick={addNavItem} className="px-3 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">{t("admin.settings.add")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
