import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns & Refunds | PETLIBRO",
  description:
    "30-day hassle-free returns. Learn about our return policy, refund process, and exchanges.",
};

const returnSteps = [
  {
    step: 1,
    title: "Initiate Your Return",
    description:
      "Contact us at support@petlibro.com or visit this page within 30 days of delivery. Include your order number and reason for return.",
  },
  {
    step: 2,
    title: "Receive Your Label",
    description:
      "We'll email you a prepaid return shipping label within 1 business day. Print it and attach it to your package.",
  },
  {
    step: 3,
    title: "Ship It Back",
    description:
      "Pack the item securely in its original packaging with all accessories included. Drop it off at any authorized shipping location.",
  },
  {
    step: 4,
    title: "Get Your Refund",
    description:
      "Once we receive and inspect the return, your refund will be processed within 5-7 business days to your original payment method.",
  },
];

const nonReturnableItems = [
  "Opened food products and treats",
  "Used litter box liners and waste bags",
  "Opened filter packs and consumable accessories",
  "Personalized or custom-engraved items",
  "Gift cards",
  "Items marked as final sale",
];

export default function ReturnsPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Returns & Refunds" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Returns & Refunds
            </h1>
            <p className="text-muted text-lg">
              We want you and your pets to love every purchase. If something
              isn&apos;t right, our hassle-free return process makes it easy to
              get a refund or exchange.
            </p>
          </div>

          <div className="bg-surface rounded-md p-6 md:p-8 flex items-start gap-4 mb-10">
            <div className="p-2.5 rounded-lg bg-background border border-border shrink-0">
              <RotateCcw size={22} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1">
                30-Day Return Window
              </h2>
              <p className="text-sm text-muted">
                You have 30 days from the date of delivery to return most items
                for a full refund. Items must be in their original condition with
                all packaging and accessories.
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Condition Requirements
            </h2>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">Unused & complete</strong>{" "}
                  — Items must include all original parts, manuals,
                  accessories, and packaging.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">
                    Electronics in original sealed packaging
                  </strong>{" "}
                  — Smart feeders, fountains, and litter boxes must be
                  unopened for a full refund. Opened electronics may be subject
                  to a 15% restocking fee.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">No damage</strong> — Items
                  must be free from pet hair, scratches, water damage, or signs
                  of use.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              How It Works
            </h2>
            <div className="space-y-0">
              {returnSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    {index < returnSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <RefreshCw size={20} />
              Exchanges
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                Want a different size, color, or product? We&apos;re happy to
                process an exchange. When contacting our team, let us know what
                you&apos;d like instead and we&apos;ll handle the rest.
              </p>
              <p>
                If the replacement item costs more, we&apos;ll charge the
                difference. If it costs less, we&apos;ll refund the balance.
                Exchange shipments are sent via standard shipping at no extra
                cost.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle size={20} />
              Non-Returnable Items
            </h2>
            <p className="text-sm text-muted mb-4">
              For hygiene and safety reasons, the following items cannot be
              returned or exchanged:
            </p>
            <ul className="space-y-2">
              {nonReturnableItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <ArrowRight size={14} className="text-border shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-surface rounded-md p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Need to start a return?
            </h2>
            <p className="text-sm text-muted mb-5">
              Our team will guide you through every step of the process.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
