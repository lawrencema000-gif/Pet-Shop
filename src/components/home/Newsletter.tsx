"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
    <section className="py-16 md:py-24 text-center">
      <div className="container-main max-w-xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold">Stay in the Loop</h2>
        <p className="text-muted mt-3 mb-8">
          Get exclusive deals, new product alerts, and pet care tips.
        </p>

        {status === "success" ? (
          <p className="text-success font-medium">
            Thanks for subscribing! Check your inbox for a welcome surprise.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 border border-border rounded-l-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-accent text-white px-6 rounded-r-lg text-sm font-medium hover:bg-foreground-muted transition-colors disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="text-sale text-sm mt-3">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </section>
  );
}
