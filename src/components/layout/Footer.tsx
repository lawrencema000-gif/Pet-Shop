"use client";

import Link from "next/link";
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
  Mail,
} from "lucide-react";

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

const trustBadges = [
  { icon: Truck, label: "Free Shipping $75+" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: Shield, label: "1-Year Warranty" },
  { icon: Lock, label: "Secure Checkout" },
  { icon: Headphones, label: "24/7 Support" },
];

const paymentMethods = ["Visa", "Mastercard", "Amex", "PayPal", "Apple Pay"];

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
  return (
    <footer className="bg-surface">
      {/* Newsletter Section */}
      <div className="bg-foreground">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mb-4">
              <Mail size={18} className="text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-2">
              Join the Pack &mdash; Get 10% Off Your First Order
            </h2>
            <p className="text-sm text-white/60 mb-6">
              Exclusive deals, new product drops, and smart pet care tips
              delivered to your inbox.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 min-w-0 px-4 py-3 text-sm rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-medium text-foreground bg-white rounded-lg hover:bg-white/90 transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-white/40 mt-3">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-lg font-bold tracking-tight text-foreground">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Smart pet care for modern pet parents. We design connected
              products that keep your pets healthy, happy, and well-fed — even
              when you&apos;re away.
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-white text-muted hover:text-foreground hover:shadow-card transition-all duration-200"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop Links */}
          <FooterLinkColumn title="Shop" links={FOOTER_LINKS.shop} />

          {/* Support Links */}
          <FooterLinkColumn title="Support" links={FOOTER_LINKS.support} />

          {/* Company + Legal Links */}
          <div>
            <FooterLinkColumn title="Company" links={FOOTER_LINKS.company} />
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
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights
            reserved.
          </p>

          <div className="flex items-center gap-3">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 text-[10px] font-medium text-muted bg-white rounded border border-border"
              >
                {method}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors duration-200 group"
            aria-label="Back to top"
          >
            Back to top
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
