"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HelpCircle, MessageCircle, Truck, RotateCcw, Shield } from "lucide-react";

export default function SupportPage() {
  const { t } = useTranslation();

  const supportLinks = [
    { icon: HelpCircle, label: t('supportPage.faqLabel'), description: t('supportPage.faqDesc'), href: "/faq" },
    { icon: MessageCircle, label: t('supportPage.contactLabel'), description: t('supportPage.contactDesc'), href: "/contact" },
    { icon: Truck, label: t('supportPage.shippingLabel'), description: t('supportPage.shippingDesc'), href: "/shipping" },
    { icon: RotateCcw, label: t('supportPage.returnsLabel'), description: t('supportPage.returnsDesc'), href: "/returns" },
    { icon: Shield, label: t('supportPage.warrantyLabel'), description: t('supportPage.warrantyDesc'), href: "/warranty" },
  ];

  return (
    <main className="container-main py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-3">{t('supportPage.heading')}</h1>
        <p className="text-muted text-center mb-12">
          {t('supportPage.subheading')}
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {supportLinks.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-4 p-6 rounded-md border border-border bg-background hover:shadow-sm transition-shadow"
            >
              <Icon className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="font-semibold mb-1">{label}</h2>
                <p className="text-sm text-muted">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
