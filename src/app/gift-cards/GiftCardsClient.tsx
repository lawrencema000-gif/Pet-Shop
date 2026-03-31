"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Gift,
  CreditCard,
  Send,
  ShoppingBag,
  Check,
  Bell,
} from "lucide-react";

const AMOUNTS = [25, 50, 75, 100];

export default function GiftCardsClient() {
  const [selected, setSelected] = useState(50);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (email) setSubmitted(true);
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Gift Cards</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 via-background to-pink-50 py-14 md:py-20">
        <div className="container-main text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-semibold text-purple-700">
            <Gift className="h-4 w-4" />
            Perfect Gift
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl">
            Give the Gift of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              Happy Pets
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted md:text-lg">
            Let them choose exactly what their pet needs. A Pet and Angels gift card
            is the perfect present for any pet lover.
          </p>
        </div>
      </section>

      {/* Gift Card Selection */}
      <section className="container-main py-12 md:py-16">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Choose an Amount
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelected(amount)}
                className={`relative rounded border-2 p-6 text-center transition-all ${
                  selected === amount
                    ? "border-accent bg-accent/5 shadow-md"
                    : "border-border bg-background hover:border-accent/50"
                }`}
              >
                {selected === amount && (
                  <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                )}
                <CreditCard
                  className={`h-8 w-8 mx-auto mb-3 ${
                    selected === amount ? "text-accent" : "text-muted"
                  }`}
                />
                <span className="text-2xl font-bold text-foreground">
                  ${amount}
                </span>
                <p className="mt-1 text-xs text-muted">Gift Card</p>
              </button>
            ))}
          </div>

          {/* Selected Preview */}
          <div className="mt-10 rounded-md bg-gradient-to-br from-purple-600 to-pink-500 p-8 text-white text-center shadow-sm">
            <Gift className="h-10 w-10 mx-auto mb-3 opacity-80" />
            <p className="text-sm uppercase tracking-wide opacity-80">
              Pet and Angels Gift Card
            </p>
            <p className="text-5xl font-bold mt-2">${selected}</p>
            <p className="mt-3 text-sm opacity-80">
              Valid for all products at Pet and Angels
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-surface-light py-14 md:py-16">
        <div className="container-main">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10 md:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-3xl mx-auto">
            {[
              {
                icon: CreditCard,
                step: "1",
                title: "Choose Amount",
                desc: "Select from $25, $50, $75, or $100 — the perfect amount for any occasion.",
              },
              {
                icon: Send,
                step: "2",
                title: "Send to Recipient",
                desc: "We'll deliver a beautifully designed digital gift card straight to their inbox.",
              },
              {
                icon: ShoppingBag,
                step: "3",
                title: "They Shop",
                desc: "Your recipient can use the gift card on any Pet and Angels product — feeders, fountains, accessories, and more.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <span className="mt-4 inline-block rounded-full bg-accent px-3 py-0.5 text-xs font-bold text-white">
                  Step {item.step}
                </span>
                <h3 className="mt-3 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon + Newsletter */}
      <section className="border-t border-border py-14 md:py-16">
        <div className="container-main max-w-lg mx-auto text-center">
          <div className="rounded border border-amber-200 bg-amber-50 p-6 mb-8">
            <Bell className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-amber-800">
              Gift card purchasing is coming soon!
            </p>
            <p className="mt-1 text-xs text-amber-700">
              Sign up below to be the first to know when gift cards are
              available.
            </p>
          </div>

          <h2 className="text-xl font-bold text-foreground">
            Get Notified When Gift Cards Launch
          </h2>
          <p className="mt-2 text-sm text-muted">
            Be the first to send the gift of happy, healthy pets.
          </p>

          {submitted ? (
            <div
              className="mt-6 rounded-lg bg-success/10 p-4"
            >
              <Check className="h-6 w-6 text-success mx-auto mb-2" />
              <p className="text-sm font-medium text-success">
                You&apos;re on the list! We&apos;ll notify you at{" "}
                <strong>{email}</strong>.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleNotify}
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button
                type="submit"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Notify Me
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
