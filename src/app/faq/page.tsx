"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ChevronDown, MessageCircle, Truck, RotateCcw, Package, User, ShoppingBag } from "lucide-react";
import { faqSections } from "./faq-data";
import type { FAQItem } from "./faq-data";

const iconMap: Record<string, React.ReactNode> = {
  Truck: <Truck size={20} />,
  RotateCcw: <RotateCcw size={20} />,
  Package: <Package size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  User: <User size={20} />,
};

function AccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-[15px] font-medium text-foreground pr-4 group-hover:text-accent transition-colors">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-muted">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "FAQ" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-muted text-lg">
              Everything you need to know about our products, shipping, and
              support. Can&apos;t find what you&apos;re looking for? Our team is
              here to help.
            </p>
          </div>

          <div className="space-y-10">
            {faqSections.map((section) => (
              <section key={section.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-surface text-foreground">
                    {iconMap[section.iconName]}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>
                <div className="bg-background rounded-premium-lg border border-border px-6">
                  {section.items.map((item) => (
                    <AccordionItem key={item.question} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 text-center bg-surface rounded-2xl p-10">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-background border border-border mb-4">
              <MessageCircle size={24} className="text-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Still need help?
            </h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Our support team is available Monday through Saturday to assist you
              with any questions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
