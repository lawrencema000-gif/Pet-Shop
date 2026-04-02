"use client";

import { useState, useEffect } from "react";
import { Plus, Gift, Eye, ToggleLeft, ToggleRight, Loader2, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import React from "react";

interface GiftCard {
  id: string;
  code: string;
  initial_balance: number;
  current_balance: number;
  currency: string;
  status: "active" | "depleted" | "disabled";
  purchaser_id: string | null;
  recipient_email: string | null;
  recipient_name: string | null;
  personal_message: string | null;
  purchased_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

interface GiftCardTransaction {
  id: string;
  gift_card_id: string;
  order_id: string | null;
  amount: number;
  balance_after: number;
  type: "purchase" | "redemption" | "refund" | "adjustment";
  note: string | null;
  created_at: string;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let seg = "";
    for (let i = 0; i < 4; i++) {
      seg += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(seg);
  }
  return segments.join("-");
}

export default function AdminGiftCardsPage() {
  useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();

  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const [newForm, setNewForm] = useState({
    code: generateCode(),
    initial_balance: "",
    recipient_email: "",
    recipient_name: "",
    personal_message: "",
    expires_at: "",
  });

  async function load() {
    const { data } = await supabase
      .from("gift_cards")
      .select("*")
      .order("created_at", { ascending: false });
    setGiftCards((data ?? []) as GiftCard[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate() {
    if (!newForm.initial_balance) return;

    const balance = parseFloat(newForm.initial_balance);
    if (isNaN(balance) || balance <= 0) {
      alert("Balance must be greater than 0");
      return;
    }
    if (newForm.expires_at && new Date(newForm.expires_at) < new Date()) {
      alert("Expiration date must be in the future");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("gift_cards")
      .insert({
        code: newForm.code,
        initial_balance: balance,
        current_balance: balance,
        currency: "USD",
        status: "active",
        recipient_email: newForm.recipient_email || null,
        recipient_name: newForm.recipient_name || null,
        personal_message: newForm.personal_message || null,
        expires_at: newForm.expires_at || null,
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      alert("Failed to create gift card: " + error.message);
      return;
    }
    if (data) {
      await logAdminAction("create_gift_card", "gift_card", data.id, {
        code: newForm.code,
        initial_balance: balance,
      });
      setShowNew(false);
      setNewForm({
        code: generateCode(),
        initial_balance: "",
        recipient_email: "",
        recipient_name: "",
        personal_message: "",
        expires_at: "",
      });
      load();
    }
  }

  async function toggleStatus(card: GiftCard) {
    const newStatus = card.status === "active" ? "disabled" : "active";
    await supabase
      .from("gift_cards")
      .update({ status: newStatus })
      .eq("id", card.id);
    await logAdminAction("toggle_gift_card", "gift_card", card.id, {
      status: newStatus,
    });
    load();
  }

  async function loadTransactions(cardId: string) {
    if (expandedId === cardId) {
      setExpandedId(null);
      setTransactions([]);
      return;
    }
    setExpandedId(cardId);
    setLoadingTxns(true);
    const { data } = await supabase
      .from("gift_card_transactions")
      .select("*")
      .eq("gift_card_id", cardId)
      .order("created_at", { ascending: false });
    setTransactions((data ?? []) as GiftCardTransaction[]);
    setLoadingTxns(false);
  }

  function statusBadge(status: string) {
    const map: Record<string, string> = {
      active: "bg-success/10 text-success",
      depleted: "bg-muted/10 text-muted",
      disabled: "bg-sale/10 text-sale",
    };
    return map[status] ?? "bg-muted/10 text-muted";
  }

  function txnTypeBadge(type: string) {
    const map: Record<string, string> = {
      purchase: "bg-accent/10 text-accent",
      redemption: "bg-sale/10 text-sale",
      refund: "bg-warning/10 text-warning",
      adjustment: "bg-muted/10 text-muted",
    };
    return map[type] ?? "bg-muted/10 text-muted";
  }

  if (loaded && !isSuperAdmin && !hasPermission("gift_cards:write")) {
    return (
      <div className="text-center py-20">
        <Gift size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">
          Access Restricted
        </h2>
        <p className="text-sm text-muted mt-1">
          You do not have permission to manage gift cards.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Gift Cards
          </h1>
          <p className="text-sm text-muted mt-1">
            {giftCards.length} gift card{giftCards.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
        >
          <Plus size={16} /> New Gift Card
        </button>
      </div>

      {/* Create Form */}
      {showNew && (
        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Create Gift Card</h3>
            <button
              onClick={() => setShowNew(false)}
              className="p-1 hover:bg-surface rounded"
            >
              <X size={16} className="text-muted" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Code
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newForm.code}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-surface font-mono"
                />
                <button
                  onClick={() =>
                    setNewForm({ ...newForm, code: generateCode() })
                  }
                  className="px-2 py-2 text-xs border border-border rounded-md hover:bg-surface"
                  title="Regenerate code"
                >
                  <Gift size={14} className="text-muted" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Initial Balance
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newForm.initial_balance}
                onChange={(e) =>
                  setNewForm({ ...newForm, initial_balance: e.target.value })
                }
                placeholder="50.00"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Expires At
              </label>
              <input
                type="date"
                value={newForm.expires_at}
                onChange={(e) =>
                  setNewForm({ ...newForm, expires_at: e.target.value })
                }
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={newForm.recipient_email}
                onChange={(e) =>
                  setNewForm({ ...newForm, recipient_email: e.target.value })
                }
                placeholder="recipient@email.com"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Recipient Name
              </label>
              <input
                type="text"
                value={newForm.recipient_name}
                onChange={(e) =>
                  setNewForm({ ...newForm, recipient_name: e.target.value })
                }
                placeholder="John Doe"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Personal Message
              </label>
              <input
                type="text"
                value={newForm.personal_message}
                onChange={(e) =>
                  setNewForm({ ...newForm, personal_message: e.target.value })
                }
                placeholder="Happy Birthday!"
                className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Create
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gift Cards Table */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                Balance
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                Recipient
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                Expires
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">
                Status
              </th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-surface rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              giftCards.map((card) => (
                <React.Fragment key={card.id}>
                  <tr className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">
                      {card.code}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">
                        {formatPrice(card.current_balance)}
                      </span>
                      <span className="text-xs text-muted ml-1">
                        / {formatPrice(card.initial_balance)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {card.recipient_name || card.recipient_email ? (
                        <div>
                          {card.recipient_name && (
                            <span className="text-foreground">
                              {card.recipient_name}
                            </span>
                          )}
                          {card.recipient_email && (
                            <span className="block text-xs text-muted">
                              {card.recipient_email}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {card.expires_at
                        ? new Date(card.expires_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(card.status)}`}
                      >
                        {card.status.charAt(0).toUpperCase() +
                          card.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => loadTransactions(card.id)}
                          className="p-1.5 hover:bg-surface rounded"
                          title="View transactions"
                        >
                          <Eye
                            size={14}
                            className={
                              expandedId === card.id
                                ? "text-accent"
                                : "text-muted"
                            }
                          />
                        </button>
                        {card.status !== "depleted" && (
                          <button
                            onClick={() => toggleStatus(card)}
                            className="p-1.5 hover:bg-surface rounded"
                            title={
                              card.status === "active"
                                ? "Disable card"
                                : "Enable card"
                            }
                          >
                            {card.status === "active" ? (
                              <ToggleRight
                                size={14}
                                className="text-success"
                              />
                            ) : (
                              <ToggleLeft size={14} className="text-muted" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Transactions Row */}
                  {expandedId === card.id && (
                    <tr className="border-b border-border/50">
                      <td colSpan={6} className="px-4 py-4 bg-surface/30">
                        {loadingTxns ? (
                          <div className="flex justify-center py-4">
                            <Loader2
                              size={20}
                              className="animate-spin text-accent"
                            />
                          </div>
                        ) : transactions.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold text-muted uppercase mb-2">
                              Transaction History
                            </p>
                            <div className="bg-white rounded-md border border-border divide-y divide-border/50">
                              {transactions.map((txn) => (
                                <div
                                  key={txn.id}
                                  className="flex items-center justify-between px-3 py-2 text-sm"
                                >
                                  <span
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${txnTypeBadge(txn.type)}`}
                                  >
                                    {txn.type.charAt(0).toUpperCase() +
                                      txn.type.slice(1)}
                                  </span>
                                  <span
                                    className={`font-medium ${txn.type === "redemption" ? "text-sale" : "text-success"}`}
                                  >
                                    {txn.type === "redemption" ? "-" : "+"}
                                    {formatPrice(Math.abs(txn.amount))}
                                  </span>
                                  <span className="text-xs text-muted">
                                    Balance: {formatPrice(txn.balance_after)}
                                  </span>
                                  {txn.order_id && (
                                    <span className="font-mono text-xs text-accent">
                                      #{txn.order_id.slice(0, 8)}
                                    </span>
                                  )}
                                  {txn.note && (
                                    <span className="text-xs text-muted truncate max-w-[150px]">
                                      {txn.note}
                                    </span>
                                  )}
                                  <span className="text-xs text-muted">
                                    {new Date(
                                      txn.created_at
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted text-center py-2">
                            No transactions yet for this gift card.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
        {!loading && giftCards.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">
            <Gift size={32} className="mx-auto mb-2 text-muted/50" />
            No gift cards yet. Create your first one above.
          </div>
        )}
      </div>
    </div>
  );
}
