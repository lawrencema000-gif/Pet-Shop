"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ArrowRight, Check } from "lucide-react";

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
    <section className="py-20 md:py-28 border-t border-border">
      <div className="container-main">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            Stay Connected
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Get 10% Off Your First Order
          </h2>
          <p className="text-muted mt-4 max-w-md mx-auto leading-relaxed text-sm">
            Join 15,000+ pet parents for exclusive deals, new product alerts,
            and smart pet care tips.
          </p>

          {status === "success" ? (
            <div className="mt-10 inline-flex items-center gap-3 bg-success/10 text-success px-8 py-4 font-medium">
              <Check size={20} />
              Check your inbox for your 10% off code!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-10 flex flex-col sm:flex-row max-w-lg mx-auto gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 px-5 py-4 text-sm border border-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="group inline-flex items-center justify-center gap-2 bg-accent text-white px-8 py-4 text-sm font-semibold hover:bg-accent-dark transition-colors duration-300 disabled:opacity-60 whitespace-nowrap"
              >
                {status === "loading" ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="text-sale text-sm mt-4">
              Something went wrong. Please try again.
            </p>
          )}

          {status !== "success" && (
            <p className="text-muted text-xs mt-4 inline-flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              No spam, ever. Unsubscribe in one click.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
