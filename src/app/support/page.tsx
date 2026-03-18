import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, MessageCircle, Truck, RotateCcw, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Support | Pet Shop",
  description: "Get help with your Pet Shop orders, products, and more.",
};

const supportLinks = [
  { icon: HelpCircle, label: "FAQ", description: "Find answers to common questions", href: "/faq" },
  { icon: MessageCircle, label: "Contact Us", description: "Reach our support team directly", href: "/contact" },
  { icon: Truck, label: "Shipping & Returns", description: "Shipping policies and return info", href: "/shipping" },
  { icon: RotateCcw, label: "Returns", description: "Start a return or exchange", href: "/returns" },
  { icon: Shield, label: "Warranty", description: "Product warranty information", href: "/warranty" },
];

export default function SupportPage() {
  return (
    <main className="container-main py-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-3">How Can We Help?</h1>
        <p className="text-muted text-center mb-12">
          Find the support you need from our help resources below.
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
