import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty | PETLIBRO",
  description:
    "PETLIBRO warranty coverage details. 1-year warranty on electronics and 6-month warranty on accessories.",
};

const coverageTiers = [
  {
    category: "Smart Electronics",
    duration: "1 Year",
    items: [
      "Smart feeders (Granary, One RFID, Polar)",
      "Smart water fountains (Dockstream series)",
      "Luma Smart Litter Box",
      "Integrated cameras and sensors",
    ],
  },
  {
    category: "Accessories & Parts",
    duration: "6 Months",
    items: [
      "Replacement bowls and trays",
      "Power adapters and cables",
      "Mechanical components (pumps, motors)",
      "App-connected accessories",
    ],
  },
];

const coveredIssues = [
  "Defects in materials or workmanship",
  "Malfunctioning electronics under normal use",
  "Motor or pump failure not caused by misuse",
  "Software bugs affecting core device function",
  "Display or indicator malfunctions",
];

const notCoveredIssues = [
  "Damage from misuse, abuse, or unauthorized modification",
  "Normal wear and tear including scratches and cosmetic damage",
  "Damage caused by pets chewing, scratching, or knocking over the product",
  "Water damage from submersion (non-waterproof components)",
  "Consumable parts such as filters, desiccant pads, and liners",
  "Products purchased from unauthorized resellers",
];

const claimSteps = [
  {
    step: 1,
    title: "Gather Your Information",
    description:
      "Have your order number, product serial number, and a brief description of the issue ready. Photos or a short video of the defect are helpful.",
  },
  {
    step: 2,
    title: "Contact Our Warranty Team",
    description:
      "Email warranty@petlibro.com or reach out through our Contact page. Our team typically responds within 1 business day.",
  },
  {
    step: 3,
    title: "Diagnosis & Resolution",
    description:
      "Our team may walk you through troubleshooting steps. If the issue is confirmed as a warranty defect, we'll arrange a replacement or repair at no cost to you.",
  },
  {
    step: 4,
    title: "Receive Your Replacement",
    description:
      "Approved claims are fulfilled within 5-10 business days. We cover return shipping for defective products within the warranty period.",
  },
];

export default function WarrantyPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Warranty" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Warranty Policy
            </h1>
            <p className="text-muted text-lg">
              Every PETLIBRO product is built to last. We stand behind the
              quality of our products with comprehensive warranty coverage.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Shield size={20} />
              Coverage Overview
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {coverageTiers.map((tier) => (
                <div
                  key={tier.category}
                  className="bg-surface rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      {tier.category}
                    </h3>
                    <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full">
                      {tier.duration}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {tier.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <ArrowRight
                          size={14}
                          className="text-border shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What&apos;s Covered
            </h2>
            <div className="space-y-2.5">
              {coveredIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="text-success shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-muted">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              What&apos;s Not Covered
            </h2>
            <div className="space-y-2.5">
              {notCoveredIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-3">
                  <XCircle
                    size={18}
                    className="text-sale shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-muted">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              How to File a Claim
            </h2>
            <div className="space-y-0">
              {claimSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    {index < claimSteps.length - 1 && (
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

          <div className="bg-surface rounded-2xl p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Need to file a warranty claim?
            </h2>
            <p className="text-sm text-muted mb-5">
              Our warranty team is here to help resolve any product issues
              quickly.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Contact Warranty Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
