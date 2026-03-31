"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
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
import { Turnstile, useTurnstile } from "@/components/ui/Turnstile";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const { token: turnstileToken, handleVerify, handleExpire } = useTurnstile();

  const subjectOptions = [
    { value: "Product Question", label: t('contact.subjectProductQuestion') },
    { value: "Order Status", label: t('contact.subjectOrderStatus') },
    { value: "Shipping Inquiry", label: t('contact.subjectShippingInquiry') },
    { value: "Return or Exchange", label: t('contact.subjectReturnExchange') },
    { value: "Warranty Claim", label: t('contact.subjectWarrantyClaim') },
    { value: "Technical Support", label: t('contact.subjectTechnicalSupport') },
    { value: "Feedback / Suggestion", label: t('contact.subjectFeedback') },
    { value: "Other", label: t('contact.subjectOther') },
  ];

  const quickHelpLinks = [
    {
      icon: HelpCircle,
      title: t('contact.quickHelpFaqTitle'),
      description: t('contact.quickHelpFaqDesc'),
      href: "/faq",
    },
    {
      icon: Truck,
      title: t('contact.quickHelpShippingTitle'),
      description: t('contact.quickHelpShippingDesc'),
      href: "/shipping",
    },
    {
      icon: RotateCcw,
      title: t('contact.quickHelpReturnsTitle'),
      description: t('contact.quickHelpReturnsDesc'),
      href: "/returns",
    },
  ];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!turnstileToken) return;
    setSending(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      type: "contact",
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Still show success to user — email failure shouldn't block UX
    }
    setSending(false);
    setSubmitted(true);
  }

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('contact.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('contact.heading')}
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl">
              <div className="p-3 rounded-full bg-background border border-border mb-3">
                <Mail size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{t('contact.emailUsTitle')}</h3>
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
              <h3 className="font-semibold text-foreground mb-1">{t('contact.callUsTitle')}</h3>
              <p className="text-sm text-muted">(888) 555-PETS</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-surface rounded-xl">
              <div className="p-3 rounded-full bg-background border border-border mb-3">
                <Clock size={20} className="text-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">
                {t('contact.businessHoursTitle')}
              </h3>
              <p className="text-sm text-muted">
                {t('contact.businessHoursWeekday')}
                <br />
                {t('contact.businessHoursSaturday')}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-10">
            <div className="lg:col-span-3">
              <div className="bg-background rounded-md border border-border p-6 md:p-8">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  {t('contact.sendMessageTitle')}
                </h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center p-3 rounded-full bg-success/10 mb-4">
                      <CheckCircle size={32} className="text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {t('contact.messageSentTitle')}
                    </h3>
                    <p className="text-muted text-sm max-w-sm mx-auto">
                      {t('contact.messageSentDesc')}
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
                          {t('contact.fullNameLabel')}
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          placeholder={t('contact.fullNamePlaceholder')}
                          className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-foreground mb-1.5"
                        >
                          {t('contact.emailLabel')}
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          placeholder={t('contact.emailPlaceholder')}
                          className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors"
                        />
                        <p className="text-xs text-muted mt-1">{t('contact.emailHint')}</p>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        {t('contact.subjectLabel')}
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        defaultValue=""
                        className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors appearance-none"
                      >
                        <option value="" disabled>
                          {t('contact.subjectPlaceholder')}
                        </option>
                        {subjectOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-foreground mb-1.5"
                      >
                        {t('contact.messageLabel')}
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder={t('contact.messagePlaceholder')}
                        className="w-full px-4 py-2.5 text-sm border border-border rounded bg-background focus:outline-none focus:border-accent transition-colors resize-none"
                      />
                    </div>

                    <Turnstile onVerify={handleVerify} onExpire={handleExpire} />

                    <button
                      type="submit"
                      disabled={sending || !turnstileToken}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-60"
                    >
                      <Send size={16} />
                      {sending ? t('contact.sending') : t('contact.sendButton')}
                    </button>
                    <p className="text-xs text-muted mt-2">{t('contact.responseTime')}</p>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {t('contact.quickHelpTitle')}
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
