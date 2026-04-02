"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Shield, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

interface Segment {
  id: string;
  name: string;
  description: string | null;
  rules: Record<string, unknown> | null;
  logic: string;
  customer_count: number;
  created_at: string;
  updated_at: string;
}

export default function AdminSegmentsPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({ name: "", description: "" });

  async function load() {
    const { data } = await supabase
      .from("customer_segments")
      .select("*")
      .order("created_at", { ascending: false });
    setSegments((data ?? []) as Segment[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!newForm.name.trim()) return;

    const { data, error } = await supabase
      .from("customer_segments")
      .insert({
        name: newForm.name.trim(),
        description: newForm.description.trim() || null,
        rules: {},
        logic: "and",
        customer_count: 0,
      })
      .select()
      .single();

    if (error) {
      alert(t("admin.segments.createFailed", { error: error.message, defaultValue: `Failed to create segment: ${error.message}` }));
      return;
    }
    if (data) {
      await logAdminAction("create_segment", "customer_segment", data.id, { name: newForm.name });
      setShowNew(false);
      setNewForm({ name: "", description: "" });
      load();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("customer_segments").delete().eq("id", deleteId);
    await logAdminAction("delete_segment", "customer_segment", deleteId);
    setDeleteId(null);
    load();
  }

  if (loaded && !isSuperAdmin && !hasPermission("customers:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">{t("admin.segments.accessRestricted", { defaultValue: "Access Restricted" })}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.segments.noPermission", { defaultValue: "You don't have permission to manage customer segments." })}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.segments.title", { defaultValue: "Customer Segments" })}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.segments.segmentCount", { count: segments.length, defaultValue: `${segments.length} segments` })}</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
        >
          <Plus size={16} /> {t("admin.segments.addSegment", { defaultValue: "New Segment" })}
        </button>
      </div>

      {showNew && (
        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">{t("admin.segments.newSegment", { defaultValue: "New Segment" })}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              placeholder={t("admin.segments.namePlaceholder", { defaultValue: "Segment name" })}
              className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
            <input
              type="text"
              value={newForm.description}
              onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
              placeholder={t("admin.segments.descriptionPlaceholder", { defaultValue: "Description (optional)" })}
              className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">
              {t("admin.segments.create", { defaultValue: "Create" })}
            </button>
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface">
              {t("admin.segments.cancel", { defaultValue: "Cancel" })}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.segments.nameHeader", { defaultValue: "Name" })}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.segments.descriptionHeader", { defaultValue: "Description" })}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.segments.customersHeader", { defaultValue: "Customers" })}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.segments.createdHeader", { defaultValue: "Created" })}</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : segments.map((s) => (
              <tr key={s.id} className="border-b border-border/50 hover:bg-surface/30">
                <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                <td className="px-4 py-3 text-muted">{s.description || "\u2014"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1 text-foreground">
                    <Users size={14} className="text-muted" />
                    {s.customer_count}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteId(s.id)} className="p-1.5 hover:bg-sale/10 rounded">
                    <Trash2 size={14} className="text-muted hover:text-sale" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && segments.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">{t("admin.segments.noSegmentsYet", { defaultValue: "No customer segments yet. Create one to get started." })}</div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        title={t("admin.segments.deleteSegment", { defaultValue: "Delete Segment" })}
        message={t("admin.segments.deleteSegmentMessage", { defaultValue: "Are you sure you want to delete this segment? This action cannot be undone." })}
        confirmLabel={t("common.delete", { defaultValue: "Delete" })}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
