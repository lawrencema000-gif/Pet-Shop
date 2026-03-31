"use client";

import { Accordion } from "@/components/ui/Accordion";

interface ProductFAQProps {
  productName: string;
}

export default function ProductFAQ({ productName }: ProductFAQProps) {
  const items = [
    {
      title: `How do I set up ${productName}?`,
      content:
        "Setting up is quick and easy. Download the Pet and Angels app, follow the step-by-step guide, and you'll be ready in under 5 minutes. The app walks you through Wi-Fi pairing, calibration, and scheduling.",
    },
    {
      title: "What warranty does this product have?",
      content:
        "All Pet and Angels smart products come with a 1-year warranty covering manufacturing defects and hardware malfunctions. Extended warranty options are available at checkout for additional peace of mind.",
    },
    {
      title: "Is this product easy to clean?",
      content:
        "Yes! All removable parts are dishwasher-safe and the unit can be disassembled without any tools. We recommend a quick rinse every week and a deep clean once a month for optimal performance.",
    },
    {
      title: "Can I control this with my phone?",
      content:
        "Yes, the Pet and Angels app (iOS & Android) lets you control all features remotely, set schedules, receive notifications, and monitor usage. The app also supports multiple devices and family sharing.",
    },
  ];

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl">
        <Accordion items={items} />
      </div>
    </section>
  );
}
