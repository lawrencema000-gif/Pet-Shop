"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, Search, AlertTriangle, ArrowUpDown,
  History, Settings2, RefreshCw, Download,
  Plus, Minus, Save,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { exportCsv } from "@/lib/csv-export";

interface VariantStock {
  id: string;
  name: string;
  variant_type: string;
  sku: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  product_id: string;
  product_name: string;
  product_status: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  variant_id: string | null;
  movement_type: string;
  quantity: number;
  stock_after: number;
  reference_type: string | null;
  reference_id: string | null;
  notes: string;
  created_at: string;
}

type Tab = "overview" | "history" | "settings";

export default function InventoryPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [variants, setVariants] = useState<VariantStock[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);
  const [editReason, setEditReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [defaultThreshold, setDefaultThreshold] = useState(10);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadVariants = useCallback(async () => {
    const { data: vars } = await supabase
      .from("product_variants")
      .select("id, name, variant_type, sku, stock_quantity, low_stock_threshold, product_id")
      .order("stock_quantity", { ascending: true });

    if (!vars || vars.length === 0) {
      setVariants([]);
      setLoading(false);
      return;
    }

    const productIds = Array.from(new Set(vars.map((v) => v.product_id)));
    const { data: products } = await supabase
      .from("products")
      .select("id, name, status")
      .in("id", productIds);

    const nameMap = new Map(products?.map((p) => [p.id, { name: p.name, status: p.status }]) ?? []);

    setVariants(
      vars.map((v) => ({
        ...v,
        product_name: nameMap.get(v.product_id)?.name ?? "Unknown",
        product_status: nameMap.get(v.product_id)?.status ?? "draft",
      }))
    );
    setLoading(false);
  }, []);

  const loadMovements = useCallback(async () => {
    const { data } = await supabase
      .from("stock_movements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setMovements(data ?? []);
  }, []);

  useEffect(() => {
    loadVariants();
  }, [loadVariants]);

  useEffect(() => {
    if (activeTab === "history") loadMovements();
  }, [activeTab, loadMovements]);

  // Stats
  const totalVariants = variants.length;
  const outOfStock = variants.filter((v) => v.stock_quantity === 0).length;
  const lowStock = variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= v.low_stock_threshold).length;
  const healthy = totalVariants - outOfStock - lowStock;

  // Filtered + searched
  const filtered = variants.filter((v) => {
    if (filter === "out" && v.stock_quantity > 0) return false;
    if (filter === "low" && (v.stock_quantity === 0 || v.stock_quantity > v.low_stock_threshold)) return false;
    if (search) {
      const q = search.toLowerCase();
      return v.product_name.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || (v.sku?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  async function adjustStock(variantId: string) {
    const variant = variants.find((v) => v.id === variantId);
    if (!variant) return;

    const diff = editQty - variant.stock_quantity;
    if (diff === 0) {
      setEditingId(null);
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("product_variants")
      .update({ stock_quantity: editQty })
      .eq("id", variantId);

    if (error) {
      console.error("Stock update failed:", error.message);
      setSaving(false);
      return;
    }

    // Log the movement
    await supabase.from("stock_movements").insert({
      product_id: variant.product_id,
      variant_id: variantId,
      movement_type: "adjust",
      quantity: diff,
      stock_after: editQty,
      reference_type: "manual",
      notes: editReason || `Manual adjustment: ${variant.stock_quantity} → ${editQty}`,
    });

    await logAdminAction("adjust_stock", "product_variant", variantId, {
      product: variant.product_name,
      variant: variant.name,
      from: variant.stock_quantity,
      to: editQty,
      reason: editReason,
    });

    setEditingId(null);
    setEditReason("");
    setSaving(false);
    await loadVariants();
  }

  function startEdit(v: VariantStock) {
    setEditingId(v.id);
    setEditQty(v.stock_quantity);
    setEditReason("");
  }

  async function saveDefaultThreshold() {
    setSavingSettings(true);
    // Update all variants that still have the old default
    const { error } = await supabase
      .from("product_variants")
      .update({ low_stock_threshold: defaultThreshold })
      .eq("low_stock_threshold", 10); // only update those at default

    if (!error) {
      await logAdminAction("update_inventory_settings", "settings", undefined, { default_threshold: defaultThreshold });
      await loadVariants();
    }
    setSavingSettings(false);
  }

  function handleExport() {
    exportCsv(
      "inventory",
      ["Product", "Variant", "SKU", "Stock", "Threshold", "Status"],
      variants.map((v) => [v.product_name, v.name, v.sku, v.stock_quantity, v.low_stock_threshold, v.product_status])
    );
  }

  function stockBadge(qty: number, threshold: number) {
    if (qty === 0) return "bg-sale/10 text-sale";
    if (qty <= threshold) return "bg-amber-50 text-amber-600";
    return "bg-success/10 text-success";
  }

  function stockLabel(qty: number, threshold: number) {
    if (qty === 0) return t("admin.inventory.stockOutOfStock");
    if (qty <= threshold) return t("admin.inventory.stockLowStock");
    return t("admin.inventory.stockInStock");
  }

  const movementColor: Record<string, string> = {
    receive: "text-success",
    sale: "text-sale",
    adjust: "text-accent",
    return: "text-purple-600",
    initial: "text-muted",
  };

  const tabs = [
    { key: "overview" as const, label: t("admin.inventory.tabOverview"), icon: Package },
    { key: "history" as const, label: t("admin.inventory.tabHistory"), icon: History },
    { key: "settings" as const, label: t("admin.inventory.tabSettings"), icon: Settings2 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.inventory.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.inventory.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
            <Download size={14} /> {t("admin.inventory.exportCsv")}
          </button>
          <button onClick={() => { setLoading(true); loadVariants(); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
            <RefreshCw size={14} /> {t("admin.inventory.refresh")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button onClick={() => setFilter("all")} className={`bg-white border rounded-lg p-4 text-left transition-colors ${filter === "all" ? "border-accent" : "border-border"}`}>
          <p className="text-xs text-muted font-semibold uppercase">{t("admin.inventory.totalVariants")}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{totalVariants}</p>
        </button>
        <button onClick={() => setFilter("all")} className={`bg-white border rounded-lg p-4 text-left transition-colors ${filter === "all" && !search ? "border-accent" : "border-border"}`}>
          <p className="text-xs text-success font-semibold uppercase">{t("admin.inventory.inStock")}</p>
          <p className="text-2xl font-bold text-success mt-1">{healthy}</p>
        </button>
        <button onClick={() => setFilter("low")} className={`bg-white border rounded-lg p-4 text-left transition-colors ${filter === "low" ? "border-amber-400" : "border-border"}`}>
          <p className="text-xs text-amber-600 font-semibold uppercase">{t("admin.inventory.lowStock")}</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{lowStock}</p>
        </button>
        <button onClick={() => setFilter("out")} className={`bg-white border rounded-lg p-4 text-left transition-colors ${filter === "out" ? "border-sale" : "border-border"}`}>
          <p className="text-xs text-sale font-semibold uppercase">{t("admin.inventory.outOfStock")}</p>
          <p className="text-2xl font-bold text-sale mt-1">{outOfStock}</p>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div>
          <div className="mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.inventory.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnProduct")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnVariant")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnSku")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                    <span className="inline-flex items-center gap-1"><ArrowUpDown size={11} /> {t("admin.inventory.columnStock")}</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnThreshold")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnStatus")}</th>
                  <th className="px-4 py-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3"><div className="h-4 w-32 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-20 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-12 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-12 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"><div className="h-4 w-16 bg-surface rounded animate-pulse" /></td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted">
                      {search || filter !== "all" ? t("admin.inventory.noMatchingVariants") : t("admin.inventory.noVariantsFound")}
                    </td>
                  </tr>
                ) : (
                  filtered.map((v) => (
                    <tr key={v.id} className="border-b border-border/50 hover:bg-surface/30">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/products/${v.product_id}`} className="text-sm font-medium text-foreground hover:text-accent">
                          {v.product_name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted">{v.name}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-muted">{v.sku ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        {editingId === v.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => setEditQty(Math.max(0, editQty - 1))} className="p-1 border border-border rounded hover:bg-surface">
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min={0}
                              value={editQty}
                              onChange={(e) => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 px-2 py-1 text-sm text-center border border-border rounded focus:outline-none focus:border-accent"
                            />
                            <button onClick={() => setEditQty(editQty + 1)} className="p-1 border border-border rounded hover:bg-surface">
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-foreground">{v.stock_quantity}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-muted">{v.low_stock_threshold}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${stockBadge(v.stock_quantity, v.low_stock_threshold)}`}>
                          {stockLabel(v.stock_quantity, v.low_stock_threshold)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {editingId === v.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => adjustStock(v.id)}
                              disabled={saving}
                              className="p-1.5 bg-accent text-white rounded hover:bg-accent-dark disabled:opacity-60"
                              title={t("admin.inventory.saveAction")}
                            >
                              <Save size={12} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 border border-border rounded hover:bg-surface"
                              title={t("admin.inventory.cancelAction")}
                            >
                              <span className="text-xs">✕</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(v)}
                            className="text-xs text-accent hover:underline font-medium"
                          >
                            {t("admin.inventory.adjustAction")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Inline reason input when editing */}
          {editingId && (
            <div className="mt-3 flex items-center gap-3 bg-surface/50 rounded-lg p-3">
              <span className="text-xs text-muted whitespace-nowrap">{t("admin.inventory.reasonLabel")}</span>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder={t("admin.inventory.reasonPlaceholder")}
                className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnDate")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnType")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnChange")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnAfter")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnReference")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.inventory.columnNotes")}</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">
                      {t("admin.inventory.noMovements")}
                    </td>
                  </tr>
                ) : (
                  movements.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="px-4 py-2.5 text-xs text-muted whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-semibold capitalize ${movementColor[m.movement_type] ?? "text-muted"}`}>
                          {m.movement_type}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-sm font-bold ${m.quantity > 0 ? "text-success" : "text-sale"}`}>
                          {m.quantity > 0 ? "+" : ""}{m.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-foreground">{m.stock_after}</td>
                      <td className="px-4 py-2.5 text-xs text-muted">
                        {m.reference_type && (
                          <span className="bg-surface px-1.5 py-0.5 rounded">
                            {m.reference_type}{m.reference_id ? `: ${m.reference_id.slice(0, 8)}` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted max-w-[200px] truncate">{m.notes}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div className="max-w-lg">
          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("admin.inventory.defaultThresholdTitle")}</h3>
              <p className="text-xs text-muted mb-3">
                {t("admin.inventory.defaultThresholdDescription")}
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min={1}
                  value={defaultThreshold}
                  onChange={(e) => setDefaultThreshold(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                />
                <button
                  onClick={saveDefaultThreshold}
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60"
                >
                  <Save size={14} /> {savingSettings ? t("admin.inventory.savingSettings") : t("admin.inventory.applyToAll")}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground mb-1">{t("admin.inventory.autoHideTitle")}</h3>
              <p className="text-xs text-muted">
                {t("admin.inventory.autoHideDescription")}
              </p>
              <div className="mt-3 flex items-center gap-2 bg-success/10 text-success rounded-lg px-3 py-2">
                <AlertTriangle size={14} />
                <span className="text-xs font-medium">{t("admin.inventory.autoHideActive")}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
