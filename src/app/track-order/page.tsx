"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Package, CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface OrderResult {
  id: string;
  status: string;
  total: number;
  email: string;
  created_at: string;
  shipping_address: Record<string, string> | null;
}

export default function TrackOrderPage() {
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

    const { data } = await supabase
      .from("orders")
      .select("id, status, total, email, created_at, shipping_address")
      .eq("email", email.toLowerCase())
      .or(`id.eq.${orderNumber}`)
      .limit(1)
      .maybeSingle();

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
              Track Your Order
            </h1>
            <p className="text-muted">
              Enter your order number and the email address used at checkout to
              see the latest status of your delivery.
            </p>
          </div>

          <div className="bg-background rounded-premium border border-border p-6 md:p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Order Number
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. PL-2024-78342"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="trackEmail"
                  className="block text-sm font-medium text-foreground mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="trackEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email used at checkout"
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
              >
                <Search size={16} />
                Track Order
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
                No order found
              </h2>
              <p className="text-sm text-muted max-w-sm mx-auto mb-4">
                We couldn&apos;t find an order matching that information. Please
                double-check your order number and email, or contact our support
                team for help.
              </p>
              <Link
                href="/contact"
                className="text-sm font-medium text-foreground underline underline-offset-2 hover:text-accent transition-colors"
              >
                Contact Support
              </Link>
            </div>
          )}

          {result && (
            <div className="bg-background rounded-premium border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted">Order</p>
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
                  <span className="text-muted">Total</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(result.total)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Order Date</span>
                  <span className="text-foreground">
                    {new Date(result.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Email</span>
                  <span className="text-foreground">{result.email}</span>
                </div>
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
                        Last updated{" "}
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
              You can also find tracking information in the confirmation email
              sent when your order shipped. Check your inbox or spam folder for
              an email from orders@petlibro.com.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
