"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Zap, ScrollText } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

const TRIGGER_TYPES = [
  "order_created",
  "order_shipped",
  "inventory_low",
  "review_submitted",
  "signup",
  "scheduled",
] as const;

type TriggerType = (typeof TRIGGER_TYPES)[number];

interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: TriggerType;
  conditions: Record<string, unknown> | null;
  actions: Record<string, unknown> | null;
  is_enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AutomationLog {
  id: string;
  rule_id: string;
  trigger_type: string;
  affected_count: number;
  status: "success" | "partial" | "failed";
  details: Record<string, unknown> | null;
  created_at: string;
  rule_name?: string;
}

export default function AdminAutomationPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [tab, setTab] = useState<"rules" | "logs">("rules");

  // Rules state
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    name: "",
    description: "",
    trigger_type: "order_created" as TriggerType,
    is_enabled: true,
  });

  // Logs state
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  async function loadRules() {
    const { data } = await supabase
      .from("automation_rules")
      .select("*")
      .order("created_at", { ascending: false });
    setRules((data ?? []) as AutomationRule[]);
    setLoadingRules(false);
  }

  async function loadLogs() {
    const { data } = await supabase
      .from("automation_logs")
      .select("*, automation_rules(name)")
      .order("created_at", { ascending: false })
      .limit(50);

    const mapped = (data ?? []).map((log: Record<string, unknown>) => ({
      ...(log as unknown as AutomationLog),
      rule_name: (log.automation_rules as { name: string } | null)?.name ?? "Unknown",
    }));
    setLogs(mapped);
    setLoadingLogs(false);
  }

  useEffect(() => {
    loadRules();
    loadLogs();
  }, []);

  async function handleCreate() {
    if (!newForm.name.trim()) return;

    const { data, error } = await supabase
      .from("automation_rules")
      .insert({
        name: newForm.name.trim(),
        description: newForm.description.trim() || null,
        trigger_type: newForm.trigger_type,
        conditions: {},
        actions: {},
        is_enabled: newForm.is_enabled,
        run_count: 0,
      })
      .select()
      .single();

    if (error) {
      alert(t("admin.automation.createFailed", { error: error.message, defaultValue: `Failed to create rule: ${error.message}` }));
      return;
    }
    if (data) {
      await logAdminAction("create_automation_rule", "automation_rule", data.id, { name: newForm.name });
      setShowNew(false);
      setNewForm({ name: "", description: "", trigger_type: "order_created", is_enabled: true });
      loadRules();
    }
  }

  async function toggleEnabled(id: string, enabled: boolean) {
    await supabase.from("automation_rules").update({ is_enabled: enabled }).eq("id", id);
    await logAdminAction("toggle_automation_rule", "automation_rule", id, { is_enabled: enabled });
    loadRules();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("automation_rules").delete().eq("id", deleteId);
    await logAdminAction("delete_automation_rule", "automation_rule", deleteId);
    setDeleteId(null);
    loadRules();
  }

  const triggerLabel = (trigger: string) => {
    const labels: Record<string, string> = {
      order_created: t("admin.automation.triggerOrderCreated", { defaultValue: "Order Created" }),
      order_shipped: t("admin.automation.triggerOrderShipped", { defaultValue: "Order Shipped" }),
      inventory_low: t("admin.automation.triggerInventoryLow", { defaultValue: "Inventory Low" }),
      review_submitted: t("admin.automation.triggerReviewSubmitted", { defaultValue: "Review Submitted" }),
      signup: t("admin.automation.triggerSignup", { defaultValue: "Signup" }),
      scheduled: t("admin.automation.triggerScheduled", { defaultValue: "Scheduled" }),
    };
    return labels[trigger] ?? trigger;
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-success/10 text-success",
      partial: "bg-warning/10 text-warning",
      failed: "bg-sale/10 text-sale",
    };
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] ?? "bg-muted/10 text-muted"}`}>
        {status}
      </span>
    );
  };

  if (loaded && !isSuperAdmin && !hasPermission("settings:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">{t("admin.automation.accessRestricted", { defaultValue: "Access Restricted" })}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.automation.noPermission", { defaultValue: "You don't have permission to manage automation rules." })}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.automation.title", { defaultValue: "Automation" })}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.automation.subtitle", { defaultValue: "Manage automation rules and view execution logs." })}</p>
        </div>
        {tab === "rules" && (
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
          >
            <Plus size={16} /> {t("admin.automation.addRule", { defaultValue: "New Rule" })}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-border">
        <button
          onClick={() => setTab("rules")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "rules" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Zap size={15} /> {t("admin.automation.rulesTab", { defaultValue: "Rules" })}
          <span className="text-xs bg-surface px-1.5 py-0.5 rounded-full">{rules.length}</span>
        </button>
        <button
          onClick={() => setTab("logs")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "logs" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <ScrollText size={15} /> {t("admin.automation.logsTab", { defaultValue: "Logs" })}
          <span className="text-xs bg-surface px-1.5 py-0.5 rounded-full">{logs.length}</span>
        </button>
      </div>

      {/* Rules Tab */}
      {tab === "rules" && (
        <>
          {showNew && (
            <div className="bg-white border border-border rounded-lg p-5 mb-4">
              <h3 className="text-sm font-semibold mb-3">{t("admin.automation.newRule", { defaultValue: "New Automation Rule" })}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder={t("admin.automation.namePlaceholder", { defaultValue: "Rule name" })}
                  className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                />
                <select
                  value={newForm.trigger_type}
                  onChange={(e) => setNewForm({ ...newForm, trigger_type: e.target.value as TriggerType })}
                  className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                >
                  {TRIGGER_TYPES.map((tt) => (
                    <option key={tt} value={tt}>{triggerLabel(tt)}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder={t("admin.automation.descriptionPlaceholder", { defaultValue: "Description (optional)" })}
                  className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent md:col-span-1"
                />
                <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newForm.is_enabled}
                    onChange={(e) => setNewForm({ ...newForm, is_enabled: e.target.checked })}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  {t("admin.automation.enabledOnCreate", { defaultValue: "Enabled" })}
                </label>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleCreate} className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">
                  {t("admin.automation.create", { defaultValue: "Create" })}
                </button>
                <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface">
                  {t("admin.automation.cancel", { defaultValue: "Cancel" })}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.nameHeader", { defaultValue: "Name" })}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.triggerHeader", { defaultValue: "Trigger" })}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.statusHeader", { defaultValue: "Status" })}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.runCountHeader", { defaultValue: "Runs" })}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.lastRunHeader", { defaultValue: "Last Run" })}</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {loadingRules ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : rules.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-foreground">{r.name}</div>
                      {r.description && <div className="text-xs text-muted mt-0.5">{r.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                        {triggerLabel(r.trigger_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleEnabled(r.id, !r.is_enabled)}
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.is_enabled ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}
                      >
                        {r.is_enabled
                          ? t("admin.automation.enabled", { defaultValue: "Enabled" })
                          : t("admin.automation.disabled", { defaultValue: "Disabled" })}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-foreground">{r.run_count}</td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {r.last_run_at ? new Date(r.last_run_at).toLocaleString() : "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 hover:bg-sale/10 rounded">
                        <Trash2 size={14} className="text-muted hover:text-sale" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loadingRules && rules.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">{t("admin.automation.noRulesYet", { defaultValue: "No automation rules yet. Create one to get started." })}</div>
            )}
          </div>
        </>
      )}

      {/* Logs Tab */}
      {tab === "logs" && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.ruleNameHeader", { defaultValue: "Rule" })}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.triggerHeader", { defaultValue: "Trigger" })}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.logStatusHeader", { defaultValue: "Status" })}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.affectedHeader", { defaultValue: "Affected" })}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.automation.timestampHeader", { defaultValue: "Timestamp" })}</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                    ))}
                  </tr>
                ))
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-border/50 hover:bg-surface/30">
                  <td className="px-4 py-3 font-medium text-foreground">{log.rule_name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      {triggerLabel(log.trigger_type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(log.status)}</td>
                  <td className="px-4 py-3 text-foreground">{log.affected_count}</td>
                  <td className="px-4 py-3 text-xs text-muted">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loadingLogs && logs.length === 0 && (
            <div className="py-8 text-center text-sm text-muted">{t("admin.automation.noLogsYet", { defaultValue: "No automation logs yet. Logs will appear here when rules are triggered." })}</div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t("admin.automation.deleteRule", { defaultValue: "Delete Rule" })}
        message={t("admin.automation.deleteRuleMessage", { defaultValue: "Are you sure you want to delete this automation rule? This action cannot be undone." })}
        confirmLabel={t("common.delete", { defaultValue: "Delete" })}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
