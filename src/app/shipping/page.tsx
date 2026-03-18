import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Truck, Package, Clock, Globe, Info } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | PETLIBRO",
  description:
    "Free shipping on orders over $75. Learn about our shipping methods, delivery times, and tracking options.",
};

const shippingMethods = [
  {
    method: "Standard Shipping",
    time: "5 - 7 business days",
    cost: "$5.99",
    note: "Free on orders over $75",
  },
  {
    method: "Express Shipping",
    time: "2 - 3 business days",
    cost: "$12.99",
    note: "",
  },
  {
    method: "Overnight Delivery",
    time: "1 business day",
    cost: "$24.99",
    note: "Order by 2 PM EST",
  },
];

export default function ShippingPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Shipping Policy" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Shipping Policy
            </h1>
            <p className="text-muted text-lg">
              We work hard to get your order to you as quickly as possible.
              Enjoy free standard shipping on all orders over $75.
            </p>
          </div>

          <div className="bg-surface rounded-md p-6 md:p-8 flex items-start gap-4 mb-10">
            <div className="p-2.5 rounded-lg bg-background border border-border shrink-0">
              <Truck size={22} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1">
                Free Shipping on Orders Over $75
              </h2>
              <p className="text-sm text-muted">
                All orders totaling $75 or more qualify for free standard
                shipping within the contiguous United States. No promo code
                needed — the discount is applied automatically at checkout.
              </p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Package size={20} />
              Shipping Methods & Rates
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded overflow-hidden">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      Method
                    </th>
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      Delivery Time
                    </th>
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shippingMethods.map((row) => (
                    <tr
                      key={row.method}
                      className="border-t border-border"
                    >
                      <td className="py-3.5 px-5 text-foreground font-medium">
                        {row.method}
                        {row.note && (
                          <span className="block text-xs text-muted mt-0.5">
                            {row.note}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-muted">{row.time}</td>
                      <td className="py-3.5 px-5 text-foreground font-medium">
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={20} />
              Processing Times
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                Orders are processed within <strong className="text-foreground">1-2 business days</strong> after
                payment is confirmed. During high-volume periods such as product
                launches or holiday seasons, processing may take up to 3
                business days.
              </p>
              <p>
                Orders placed after 2 PM EST or on weekends and holidays will
                begin processing the next business day. You&apos;ll receive a
                confirmation email with your tracking number once your order
                ships.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info size={20} />
              Order Tracking
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                Every order includes tracking. Once your order has been shipped,
                you will receive an email with your tracking number and a link to
                follow your package in real time.
              </p>
              <p>
                You can also track your order anytime by visiting our{" "}
                <Link
                  href="/track-order"
                  className="text-foreground underline underline-offset-2 hover:text-accent transition-colors"
                >
                  Order Tracking page
                </Link>{" "}
                and entering your order number and email address.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe size={20} />
              International Shipping
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                We currently ship to the <strong className="text-foreground">United States</strong> and{" "}
                <strong className="text-foreground">Canada</strong>. Canadian orders are subject to
                applicable customs duties and taxes, which are the
                responsibility of the recipient.
              </p>
              <p>
                International delivery times typically range from 7-14 business
                days depending on customs processing. We are actively expanding
                our shipping reach — subscribe to our newsletter for updates.
              </p>
            </div>
          </section>

          <div className="bg-surface rounded-md p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Questions about your shipment?
            </h2>
            <p className="text-sm text-muted mb-5">
              Our support team is happy to help with any shipping inquiries.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:border-foreground transition-colors"
              >
                Track My Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
