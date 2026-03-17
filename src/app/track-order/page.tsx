"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Search, Package, Truck, CheckCircle, Clock } from "lucide-react";

interface TrackingResult {
  orderNumber: string;
  status: string;
  steps: { label: string; date: string; completed: boolean }[];
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    // Placeholder: in production, this would call an API
    setResult(null);
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

          <div className="bg-white rounded-xl border border-border p-6 md:p-8 mb-8">
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
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-accent transition-colors"
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
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg bg-white focus:outline-none focus:border-accent transition-colors"
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

          {searched && !result && (
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
            <div className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted">Order</p>
                  <p className="font-semibold text-foreground">
                    {result.orderNumber}
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full">
                  {result.status}
                </span>
              </div>
              <div className="space-y-0">
                {result.steps.map((step, index) => (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          step.completed
                            ? "bg-success text-white"
                            : "bg-surface border border-border text-muted"
                        }`}
                      >
                        {step.completed ? (
                          <CheckCircle size={16} />
                        ) : (
                          <Truck size={14} />
                        )}
                      </div>
                      {index < result.steps.length - 1 && (
                        <div className="w-px flex-1 bg-border my-1" />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className="font-medium text-foreground text-sm">
                        {step.label}
                      </p>
                      <p className="text-xs text-muted">{step.date}</p>
                    </div>
                  </div>
                ))}
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
