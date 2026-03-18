"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Gift } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) throw error;
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="container-main max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
          <Gift className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Get 10% Off Your First Order
        </h2>
        <p className="text-white/70 mt-3 max-w-md mx-auto">
          Plus exclusive deals, new product alerts, and pet care tips delivered
          straight to your inbox.
        </p>

        <p className="text-white/50 text-xs mt-4 mb-8">
          Join 15,000+ pet parents. Unsubscribe anytime.
        </p>

        {status === "success" ? (
          <div className="bg-white/10 rounded-2xl p-6">
            <p className="text-white font-medium text-lg">
              Thanks for subscribing! Check your inbox for your 10% off code.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex max-w-md mx-auto shadow-lg rounded-lg overflow-hidden"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 text-sm focus:outline-none bg-background text-foreground"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-sale text-white px-6 text-sm font-semibold hover:bg-sale/90 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? "..." : "Claim My 10% Off"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-white/80 text-sm mt-3">
            Something went wrong. Please try again.
          </p>
        )}

        {status !== "success" && (
          <p className="text-white/40 text-xs mt-3">
            No spam, ever. Unsubscribe in one click.
          </p>
        )}
      </div>
    </section>
  );
}
