"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { FOOTER_LINKS, SITE_CONFIG } from "@/lib/constants";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Truck,
  RotateCcw,
  Shield,
  Lock,
  Headphones,
  ArrowUp,
} from "lucide-react";


function FooterLinkColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-5">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function Footer() {
  const { t } = useTranslation();

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com/petlibro", label: t('footer.facebook') },
    { icon: Instagram, href: "https://instagram.com/petlibro", label: t('footer.instagram') },
    { icon: Twitter, href: "https://twitter.com/petlibro", label: t('footer.twitter') },
    { icon: Youtube, href: "https://youtube.com/@petlibro", label: t('footer.youtube') },
  ];

  const trustBadges = [
    { icon: Truck, label: t('footer.freeShipping') },
    { icon: RotateCcw, label: t('footer.thirtyDayReturns') },
    { icon: Shield, label: t('footer.oneYearWarranty') },
    { icon: Lock, label: t('footer.secureCheckout') },
    { icon: Headphones, label: t('footer.twentyFourSevenSupport') },
  ];

  const paymentMethods = [
    t('footer.visa'),
    t('footer.mastercard'),
    t('footer.amex'),
    t('footer.paypal'),
    t('footer.applePay'),
  ];

  return (
    <footer className="bg-surface">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Image src="/logo.jpg" alt="Pet and Angels" width={32} height={32} className="rounded-full" />
              <span className="text-lg font-display font-bold tracking-tight text-foreground">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded bg-background text-muted hover:text-accent transition-colors duration-200"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <FooterLinkColumn title={t('footer.shop')} links={FOOTER_LINKS.shop} />

          {/* Support Links */}
          <FooterLinkColumn title={t('footer.support')} links={FOOTER_LINKS.support} />

          {/* Company + Legal Links */}
          <div>
            <FooterLinkColumn title={t('footer.company')} links={FOOTER_LINKS.company} />
            <div className="mt-6 pt-6 border-t border-border/60">
              <ul className="flex flex-col gap-3">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-xs text-muted hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-muted"
              >
                <Icon size={16} className="shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. {t('common.allRightsReserved')}
          </p>

          <div className="flex items-center gap-3">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 text-[10px] font-medium text-muted bg-background rounded border border-border"
              >
                {method}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors duration-200 group"
            aria-label={t('common.backToTop')}
          >
            {t('common.backToTop')}
            <ArrowUp
              size={14}
              className="transition-transform duration-200 group-hover:-translate-y-0.5"
            />
          </button>
        </div>
      </div>
    </footer>
  );
}
