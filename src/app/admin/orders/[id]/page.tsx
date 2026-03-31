"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Truck, Check, X as XIcon, Package, Printer,
  MessageSquarePlus, Send, Copy, ExternalLink, DollarSign, Mail,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

interface OrderDetail {
  id: string;
  email: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  shipping_address: Record<string, string> | null;
  coupon_code: string | null;
  notes: string | null;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemDetail {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderNote {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

const CARRIERS = [
  { value: "usps", label: "USPS", urlTemplate: "https://tools.usps.com/go/TrackConfirmAction?tLabels={tracking}" },
  { value: "ups", label: "UPS", urlTemplate: "https://www.ups.com/track?tracknum={tracking}" },
  { value: "fedex", label: "FedEx", urlTemplate: "https://www.fedex.com/fedextrack/?trknbr={tracking}" },
  { value: "dhl", label: "DHL", urlTemplate: "https://www.dhl.com/us-en/home/tracking.html?tracking-id={tracking}" },
  { value: "other", label: "Other", urlTemplate: "" },
];

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItemDetail[]>([]);
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Tracking
  const [showTracking, setShowTracking] = useState(false);
  const [trackCarrier, setTrackCarrier] = useState("");
  const [trackNumber, setTrackNumber] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [savingTracking, setSavingTracking] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const noteInputRef = useRef<HTMLTextAreaElement>(null);

  // Email
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [{ data: ord }, { data: itms }, { data: nts }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase.from("order_items").select("*").eq("order_id", id),
        supabase.from("order_notes").select("*").eq("order_id", id).order("created_at", { ascending: false }),
      ]);
      setOrder(ord);
      setItems(itms ?? []);
      setNotes(nts ?? []);
      if (ord) {
        setTrackCarrier(ord.carrier ?? "");
        setTrackNumber(ord.tracking_number ?? "");
        setTrackUrl(ord.tracking_url ?? "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (error) {
      console.error("Update order status failed:", error.message);
      setUpdating(false);
      return;
    }
    await logAdminAction("update_order_status", "order", id, { from: order.status, to: newStatus });
    setOrder({ ...order, status: newStatus });
    setUpdating(false);
  }

  async function updatePaymentStatus(ps: string) {
    if (!order) return;
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ payment_status: ps }).eq("id", id);
    if (error) {
      console.error("Update payment status failed:", error.message);
      setUpdating(false);
      return;
    }
    await logAdminAction("update_payment_status", "order", id, { from: order.payment_status, to: ps });
    setOrder({ ...order, payment_status: ps });
    setUpdating(false);
  }

  async function saveTracking() {
    if (!order) return;
    setSavingTracking(true);

    // Auto-generate tracking URL from carrier template
    let url = trackUrl;
    if (!url && trackCarrier && trackNumber) {
      const carrier = CARRIERS.find((c) => c.value === trackCarrier);
      if (carrier?.urlTemplate) {
        url = carrier.urlTemplate.replace("{tracking}", encodeURIComponent(trackNumber));
      }
    }

    const { error } = await supabase.from("orders").update({
      carrier: trackCarrier || null,
      tracking_number: trackNumber || null,
      tracking_url: url || null,
    }).eq("id", id);

    if (error) {
      console.error("Save tracking failed:", error.message);
    } else {
      await logAdminAction("update_tracking", "order", id, { carrier: trackCarrier, tracking_number: trackNumber });
      setOrder({ ...order, carrier: trackCarrier || null, tracking_number: trackNumber || null, tracking_url: url || null });
      setTrackUrl(url);
      setShowTracking(false);
    }
    setSavingTracking(false);
  }

  async function addNote() {
    if (!newNote.trim()) return;
    setAddingNote(true);
    const { data, error } = await supabase.from("order_notes").insert({
      order_id: id,
      content: newNote.trim(),
      author_name: "Admin",
    }).select().single();

    if (error) {
      console.error("Add note failed:", error.message);
    } else if (data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }

  async function sendEmail(emailType: "order_confirmation" | "order_shipped") {
    setSendingEmail(true);
    setEmailSent(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ type: emailType, orderId: id }),
      });
      const result = await res.json();
      if (res.ok) {
        setEmailSent(emailType === "order_confirmation" ? t("admin.orders.detail.confirmationEmailSent") : t("admin.orders.detail.shippedEmailSent"));
        setTimeout(() => setEmailSent(null), 4000);
      } else {
        setEmailSent(t("admin.orders.detail.emailFailed", { error: result.error }));
        setTimeout(() => setEmailSent(null), 5000);
      }
    } catch {
      setEmailSent(t("admin.orders.detail.emailSendFailed"));
      setTimeout(() => setEmailSent(null), 5000);
    }
    setSendingEmail(false);
  }

  function copyTracking() {
    if (order?.tracking_number) {
      navigator.clipboard.writeText(order.tracking_number);
    }
  }

  function printInvoice() {
    window.print();
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20"><p className="text-muted">{t("admin.orders.detail.orderNotFound")}</p></div>;
  }

  const addr = order.shipping_address;
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;
  const carrierLabel = CARRIERS.find((c) => c.value === order.carrier)?.label ?? order.carrier;

  const paymentBadgeColor: Record<string, string> = {
    paid: "bg-success/10 text-success",
    unpaid: "bg-surface text-muted",
    refunded: "bg-sale/10 text-sale",
    partially_refunded: "bg-amber-50 text-amber-600",
  };

  return (
    <>
      {/* Screen content — hidden when printing */}
      <div className="print:hidden">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/orders" className="p-2 hover:bg-surface rounded-md transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("admin.orders.detail.orderTitle", { id: id.slice(0, 8) })}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={order.status} />
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${paymentBadgeColor[order.payment_status] ?? paymentBadgeColor.unpaid}`}>
                {order.payment_status.replace("_", " ").toUpperCase()}
              </span>
              <span className="text-xs text-muted">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={printInvoice}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors"
            >
              <Printer size={14} /> {t("admin.orders.detail.invoice")}
            </button>
            {nextStatus && (
              <button
                onClick={() => updateStatus(nextStatus)}
                disabled={updating}
                className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
              >
                {nextStatus === "confirmed" && <Check size={14} />}
                {nextStatus === "shipped" && <Truck size={14} />}
                {nextStatus === "delivered" && <Check size={14} />}
                {t("admin.orders.detail.markAs", { status: nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1) })}
              </button>
            )}
            {order.status !== "cancelled" && (
              <button
                onClick={() => updateStatus("cancelled")}
                disabled={updating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sale border border-sale/30 rounded-md hover:bg-sale/5 transition-colors disabled:opacity-60"
              >
                <XIcon size={14} /> {t("admin.orders.detail.cancel")}
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground">{t("admin.orders.detail.items", { count: items.length })}</h2>
              </div>
              <div className="divide-y divide-border/50">
                {items.map((item) => (
                  <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                      {item.variant_name && <p className="text-xs text-muted">{item.variant_name}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-foreground">{item.quantity} &times; {formatPrice(item.unit_price)}</p>
                      <p className="text-sm font-medium">{formatPrice(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border px-5 py-4 space-y-1.5">
                <div className="flex justify-between text-sm"><span className="text-muted">{t("admin.orders.detail.subtotal")}</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount_amount > 0 && <div className="flex justify-between text-sm"><span className="text-muted">{t("admin.orders.detail.discount")}{order.coupon_code && ` (${order.coupon_code})`}</span><span className="text-success">-{formatPrice(order.discount_amount)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-muted">{t("admin.orders.detail.shipping")}</span><span>{order.shipping_amount === 0 ? t("admin.orders.detail.free") : formatPrice(order.shipping_amount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted">{t("admin.orders.detail.tax")}</span><span>{formatPrice(order.tax_amount)}</span></div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border"><span>{t("admin.orders.detail.total")}</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>

            {/* Shipment Tracking */}
            <div className="bg-white border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package size={15} /> {t("admin.orders.detail.shipmentTracking")}
                </h2>
                <button
                  onClick={() => setShowTracking(!showTracking)}
                  className="text-xs text-accent hover:underline font-medium"
                >
                  {order.tracking_number ? t("admin.orders.detail.edit") : t("admin.orders.detail.addTracking")}
                </button>
              </div>

              {order.tracking_number && !showTracking ? (
                <div className="px-5 py-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted uppercase font-semibold">{t("admin.orders.detail.carrier")}</p>
                      <p className="text-sm text-foreground">{carrierLabel ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted uppercase font-semibold">{t("admin.orders.detail.trackingNumber")}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono text-foreground">{order.tracking_number}</p>
                        <button onClick={copyTracking} className="p-1 hover:bg-surface rounded" title="Copy">
                          <Copy size={12} className="text-muted" />
                        </button>
                        {order.tracking_url && (
                          <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-surface rounded" title="Track">
                            <ExternalLink size={12} className="text-accent" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  {order.shipped_at && (
                    <p className="text-xs text-muted">{t("admin.orders.detail.shippedAt", { date: new Date(order.shipped_at).toLocaleString() })}</p>
                  )}
                  {order.delivered_at && (
                    <p className="text-xs text-muted">{t("admin.orders.detail.deliveredAt", { date: new Date(order.delivered_at).toLocaleString() })}</p>
                  )}
                </div>
              ) : showTracking ? (
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t("admin.orders.detail.carrier")}</label>
                    <select
                      value={trackCarrier}
                      onChange={(e) => {
                        setTrackCarrier(e.target.value);
                        setTrackUrl("");
                      }}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    >
                      <option value="">{t("admin.orders.detail.selectCarrier")}</option>
                      {CARRIERS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">{t("admin.orders.detail.trackingNumber")}</label>
                    <input
                      type="text"
                      value={trackNumber}
                      onChange={(e) => setTrackNumber(e.target.value)}
                      placeholder={t("admin.orders.detail.trackingNumberPlaceholder")}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent font-mono"
                    />
                  </div>
                  {trackCarrier === "other" && (
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">{t("admin.orders.detail.trackingUrlOptional")}</label>
                      <input
                        type="url"
                        value={trackUrl}
                        onChange={(e) => setTrackUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowTracking(false)} className="px-3 py-2 text-sm border border-border rounded-md hover:bg-surface">
                      {t("admin.orders.detail.cancelButton")}
                    </button>
                    <button
                      onClick={saveTracking}
                      disabled={savingTracking}
                      className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60"
                    >
                      {savingTracking ? t("admin.orders.detail.savingTracking") : t("admin.orders.detail.saveTracking")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6 text-center text-sm text-muted">
                  {t("admin.orders.detail.noTrackingYet")}
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div className="bg-white border border-border rounded-lg">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquarePlus size={15} /> {t("admin.orders.detail.adminNotes")}
                </h2>
              </div>
              <div className="px-5 py-4">
                <div className="flex gap-2 mb-4">
                  <textarea
                    ref={noteInputRef}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder={t("admin.orders.detail.addNotePlaceholder")}
                    rows={2}
                    className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addNote();
                    }}
                  />
                  <button
                    onClick={addNote}
                    disabled={addingNote || !newNote.trim()}
                    className="self-end p-2.5 bg-accent text-white rounded-md hover:bg-accent-dark disabled:opacity-40 transition-colors"
                    title={t("admin.orders.detail.addNoteTitle")}
                  >
                    <Send size={14} />
                  </button>
                </div>
                {notes.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-surface/50 rounded-md p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-foreground">{note.author_name}</span>
                          <span className="text-[11px] text-muted">{new Date(note.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted text-center py-2">{t("admin.orders.detail.noNotesYet")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Payment */}
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <DollarSign size={14} /> {t("admin.orders.detail.payment")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{t("admin.orders.detail.status")}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${paymentBadgeColor[order.payment_status] ?? paymentBadgeColor.unpaid}`}>
                    {order.payment_status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">{t("admin.orders.detail.total")}</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 mt-3 pt-3 border-t border-border">
                {order.payment_status !== "paid" && (
                  <button
                    onClick={() => updatePaymentStatus("paid")}
                    disabled={updating}
                    className="flex-1 text-xs font-medium px-2 py-1.5 rounded bg-success/10 text-success hover:bg-success/20 disabled:opacity-60"
                  >
                    {t("admin.orders.detail.markPaid")}
                  </button>
                )}
                {order.payment_status === "paid" && (
                  <button
                    onClick={() => updatePaymentStatus("refunded")}
                    disabled={updating}
                    className="flex-1 text-xs font-medium px-2 py-1.5 rounded bg-sale/10 text-sale hover:bg-sale/20 disabled:opacity-60"
                  >
                    {t("admin.orders.detail.markRefunded")}
                  </button>
                )}
              </div>
            </div>

            {/* Customer */}
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("admin.orders.detail.customer")}</h3>
              <p className="text-sm text-foreground">{order.email}</p>
            </div>

            {/* Email Notifications */}
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Mail size={14} /> {t("admin.orders.detail.sendEmail")}
              </h3>
              {emailSent && (
                <p className={`text-xs mb-2 ${emailSent.startsWith("Failed") ? "text-sale" : "text-success"}`}>
                  {emailSent}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => sendEmail("order_confirmation")}
                  disabled={sendingEmail}
                  className="w-full text-left px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-surface transition-colors disabled:opacity-60"
                >
                  {sendingEmail ? t("admin.orders.detail.sending") : t("admin.orders.detail.sendOrderConfirmation")}
                </button>
                {(order.status === "shipped" || order.status === "delivered") && (
                  <button
                    onClick={() => sendEmail("order_shipped")}
                    disabled={sendingEmail}
                    className="w-full text-left px-3 py-2 text-xs font-medium border border-border rounded-md hover:bg-surface transition-colors disabled:opacity-60"
                  >
                    {sendingEmail ? t("admin.orders.detail.sending") : t("admin.orders.detail.sendShippedNotification")}
                  </button>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {addr && (
              <div className="bg-white border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("admin.orders.detail.shippingAddress")}</h3>
                <div className="text-sm text-muted space-y-0.5">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.state} {addr.zip}</p>
                  <p>{addr.country}</p>
                </div>
              </div>
            )}

            {/* Customer Notes */}
            {order.notes && (
              <div className="bg-white border border-border rounded-lg p-5">
                <h3 className="text-sm font-semibold text-foreground mb-3">{t("admin.orders.detail.customerNotes")}</h3>
                <p className="text-sm text-muted">{order.notes}</p>
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">{t("admin.orders.detail.statusTimeline")}</h3>
              <div className="space-y-3">
                {STATUS_FLOW.map((s, i) => {
                  const reached = currentIdx >= i;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${reached ? "bg-accent text-white" : "bg-surface text-muted"}`}>
                        {reached ? <Check size={12} /> : i + 1}
                      </div>
                      <span className={`text-sm capitalize ${reached ? "text-foreground font-medium" : "text-muted"}`}>
                        {s}
                      </span>
                    </div>
                  );
                })}
                {order.status === "cancelled" && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-sale text-white flex items-center justify-center"><XIcon size={12} /></div>
                    <span className="text-sm text-sale font-medium">{t("admin.orders.cancelled")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only Invoice */}
      <div className="hidden print:block">
        <InvoicePrint order={order} items={items} t={t} />
      </div>
    </>
  );
}

/* ---------- Invoice Print Component ---------- */
function InvoicePrint({
  order,
  items,
  t,
}: {
  order: OrderDetail;
  items: OrderItemDetail[];
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const addr = order.shipping_address;
  return (
    <div className="max-w-[700px] mx-auto p-8 text-black text-sm font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pet and Angels</h1>
          <p className="text-gray-500 text-xs mt-1">Smart Pet Care</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-gray-800">{t("admin.orders.detail.invoiceTitle")}</h2>
          <p className="text-gray-500 text-xs">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Bill To / Ship To */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("admin.orders.detail.billTo")}</p>
          <p className="font-medium">{order.email}</p>
        </div>
        {addr && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{t("admin.orders.detail.shipTo")}</p>
            <p>{addr.line1}</p>
            {addr.line2 && <p>{addr.line2}</p>}
            <p>{addr.city}, {addr.state} {addr.zip}</p>
            <p>{addr.country}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <table className="w-full mb-6">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-2 text-[10px] font-bold text-gray-400 uppercase">{t("admin.orders.detail.invoiceItem")}</th>
            <th className="text-center py-2 text-[10px] font-bold text-gray-400 uppercase w-16">{t("admin.orders.detail.invoiceQty")}</th>
            <th className="text-right py-2 text-[10px] font-bold text-gray-400 uppercase w-24">{t("admin.orders.detail.invoicePrice")}</th>
            <th className="text-right py-2 text-[10px] font-bold text-gray-400 uppercase w-24">{t("admin.orders.detail.invoiceTotal")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-2">
                <p className="font-medium">{item.product_name}</p>
                {item.variant_name && <p className="text-gray-500 text-xs">{item.variant_name}</p>}
              </td>
              <td className="py-2 text-center">{item.quantity}</td>
              <td className="py-2 text-right">{formatPrice(item.unit_price)}</td>
              <td className="py-2 text-right font-medium">{formatPrice(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-1">
          <div className="flex justify-between"><span className="text-gray-500">{t("admin.orders.detail.subtotal")}</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between"><span className="text-gray-500">{t("admin.orders.detail.discount")}</span><span>-{formatPrice(order.discount_amount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-gray-500">{t("admin.orders.detail.shipping")}</span><span>{order.shipping_amount === 0 ? t("admin.orders.detail.free") : formatPrice(order.shipping_amount)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">{t("admin.orders.detail.tax")}</span><span>{formatPrice(order.tax_amount)}</span></div>
          <div className="flex justify-between font-bold text-base pt-2 border-t-2 border-gray-200">
            <span>{t("admin.orders.detail.total")}</span><span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {order.tracking_number && (
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t("admin.orders.detail.invoiceTracking", { number: order.tracking_number, carrier: order.carrier?.toUpperCase() ?? "" })}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>{t("admin.orders.detail.invoiceThankYou")}</p>
        <p className="mt-1">{t("admin.orders.detail.invoiceContact")}</p>
      </div>
    </div>
  );
}
