"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { faqSections } from "@/app/faq/faq-data";

const topFAQs = [
  faqSections[0].items[0], // How long does shipping take?
  faqSections[0].items[1], // Do you offer free shipping?
  faqSections[1].items[0], // What is your return policy?
  faqSections[2].items[3], // Is the PETLIBRO app free?
];

export default function FAQPreview() {
  const accordionItems = topFAQs.map((faq) => ({
    title: faq.question,
    content: faq.answer,
  }));

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-muted text-center mb-8">
          Quick answers to common questions about our products and services.
        </p>

        <Accordion items={accordionItems} />

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline transition-colors"
          >
            View All FAQs
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
