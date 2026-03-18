"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Truck,
  RotateCcw,
  Send,
  CheckCircle,
} from "lucide-react";

const subjectOptions = [
  "Product Question",
  "Order Status",
  "Shipping Inquiry",
  "Return or Exchange",
  "Warranty Claim",
  "Technical Support",
  "Feedback / Suggestion",
  "Other",
];

const quickHelpLinks = [
  {
    icon: HelpCircle,
    title: "FAQ",
    description: "Find answers to common questions",
    href: "/faq",
  },
  {
    icon: Truck,
    title: "Shipping Info",
    description: "Delivery times and tracking",
    href: "/shipping",
  },
  {
    icon: RotateCcw,
    title: "Returns",
    description: "Start a return or exchange",
    href: "/returns",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      timestamp: new Date().toISOString(),
    };
    // For demo purposes, messages are logged to console
    console.log("Contact form submission:", data);
    setSubmitted(true);
  }

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Contact Us" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Have a question about our products or need help with an order?
              We&apos;re here to help and typically respond within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl">
              <div className="p-3 rounded-full bg-background border border-border mb-3">
                <Mail size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Email Us</h3>
              <a
                href="mailto:support@petlibro.com"
                className="text-sm text-muted hover:text-foreground transition-colors"
              >
                support@petlibro.com
              </a>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl">
              <div className="p-3 rounded-full bg-background border border-border mb-3">
                <Phone size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Call Us</h3>
              <p className="text-sm text-muted">(888) 555-PETS</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl">
              <div className="p-3 rounded-full bg-background border border-border mb-3">
                <Clock size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                Business Hours
              </h3>
              <p className="text-sm text-muted">
                Mon - Fri: 9 AM - 6 PM EST
                <br />
                Sat: 10 AM - 4 PM EST
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-premium-lg border border-border p-6 md:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Send Us a Message
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-success/10 mb-4">
                      <CheckCircle size={32} className="text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Message Sent
                    </h3>
                    <p className="text-muted text-sm max-w-sm mx-auto">
                      Thank you for reaching out. Our team will review your
                      message and get back to you within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder="Your name"
                          className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          Email Address
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="" disabled>
                          Select a topic
                        </option>
                        {subjectOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-2.5 text-sm border border-border rounded-premium bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
                    >
                      <Send size={16} />
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Quick Help
              </h2>
              <div className="space-y-3">
                {quickHelpLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border hover:border-foreground/20 hover:shadow-card transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-surface text-foreground shrink-0">
                      <link.icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground text-sm group-hover:text-accent transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-muted mt-0.5">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
