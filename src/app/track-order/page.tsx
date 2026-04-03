"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Package, CheckCircle, Clock, Loader2, Truck, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface OrderResult {
  id: string;
  status: string;
  total: number;
  email: string;
  created_at: string;
  shipping_address: Record<string, string> | null;
  tracking_number: string | null;
  carrier: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export default function TrackOrderPage() {
  const { t } = useTranslation();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    setResult(null);

    // Search by email AND order ID (both must match for security)
    let query = supabase
      .from("orders")
      .select("id, status, total, email, created_at, shipping_address, tracking_number, carrier, tracking_url, shipped_at, delivered_at")
      .eq("email", email.toLowerCase().trim());

    // Match order by ID prefix (first 8 chars) or full UUID
    if (orderNumber.length <= 8) {
      query = query.ilike("id", `${orderNumber.toLowerCase()}%`);
    } else {
      query = query.eq("id", orderNumber.trim());
    }

    const { data } = await query.limit(1).maybeSingle();

    if (data) {
      setResult(data as OrderResult);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Track Order" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-surface border border-border mb-4">
              <Package size={28} className="text-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('trackOrder.heading')}
            </h1>
            <p className="text-muted">
              {t('trackOrder.description')}
            </p>
          </div>

          <div className="bg-background rounded border border-border p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t('trackOrder.orderNumber')}
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t('trackOrder.orderPlaceholder')}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="trackEmail"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  {t('trackOrder.emailAddress')}
                </label>
                <input
                  id="trackEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('trackOrder.emailPlaceholder')}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                <Search size={16} />
                {t('trackOrder.trackButton')}
              </button>
            </form>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-muted" />
            </div>
          )}

          {searched && !loading && !result && (
            <div className="text-center py-10 bg-surface rounded-xl border border-border">
              <Clock size={32} className="mx-auto text-muted mb-3" />
              <h2 className="font-semibold text-foreground mb-2">
                {t('trackOrder.notFound')}
              </h2>
              <p className="text-sm text-muted max-w-sm mx-auto mb-4">
                {t('trackOrder.notFoundDesc')}
              </p>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-accent transition-colors"
              >
                {t('common.contactSupport')}
              </Link>
            </div>
          )}

          {result && (
            <div className="bg-background rounded border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted">{t('trackOrder.orderLabel')}</p>
                  <p className="font-semibold text-foreground">
                    #{result.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full uppercase">
                  {result.status}
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t('trackOrder.totalLabel')}</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(result.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t('trackOrder.orderDate')}</span>
                  <span className="text-foreground">
                    {new Date(result.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{t('trackOrder.emailLabel')}</span>
                  <span className="text-foreground">{result.email}</span>
                </div>
                {/* Shipping & Tracking */}
                {result.tracking_number && (
                  <div className="border-t border-border pt-4 mt-4 space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck size={16} className="text-accent" />
                      <span className="text-sm font-semibold text-foreground">{t('trackOrder.shippingInfo')}</span>
                    </div>
                    {result.carrier && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{t('trackOrder.carrier')}</span>
                        <span className="text-foreground font-medium">{result.carrier}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">{t('trackOrder.trackingNumber')}</span>
                      <span className="text-foreground font-mono text-xs">{result.tracking_number}</span>
                    </div>
                    {result.shipped_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{t('trackOrder.shippedDate')}</span>
                        <span className="text-foreground">
                          {new Date(result.shipped_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    {result.delivered_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted">{t('trackOrder.deliveredDate')}</span>
                        <span className="text-foreground">
                          {new Date(result.delivered_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    )}
                    {result.tracking_url && (
                      <a
                        href={result.tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 transition-colors"
                      >
                        {t('trackOrder.trackPackage')}
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}

                {/* Status indicator */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center shrink-0">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm capitalize">
                        {result.status}
                      </p>
                      <p className="text-xs text-muted">
                        {t('trackOrder.lastUpdated')}{" "}
                        {new Date(result.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-sm text-muted">
              {t('trackOrder.trackingTip')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
