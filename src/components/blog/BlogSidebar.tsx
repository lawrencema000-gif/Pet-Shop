"use client";

import { useState } from "react";
import Link from "next/link";
import {
  blogPosts,
  getFeaturedPosts,
  BLOG_CATEGORIES,
} from "@/lib/blog-data";
import { supabase } from "@/lib/supabase/client";

function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const cat of BLOG_CATEGORIES) {
    counts[cat] = blogPosts.filter((p) => p.category === cat).length;
  }
  return counts;
}

export default function BlogSidebar() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const categoryCounts = getCategoryCounts();
  const popular = getFeaturedPosts().slice(0, 3);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim() });

      if (error) {
        // If duplicate, still show success
        if (error.code === "23505") {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } else {
        setStatus("success");
      }
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <aside className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Categories
        </h3>
        <ul className="space-y-2">
          {BLOG_CATEGORIES.map((cat) => (
            <li key={cat}>
              <Link
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-light hover:text-foreground"
              >
                <span>{cat}</span>
                <span className="rounded-full bg-surface-light px-2 py-0.5 text-xs text-muted">
                  {categoryCounts[cat] || 0}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Popular Articles */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Popular Articles
        </h3>
        <ul className="space-y-3">
          {popular.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <p className="text-sm font-medium text-foreground transition-colors group-hover:text-accent line-clamp-2">
                  {post.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {post.read_time} min read
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Newsletter */}
      <div className="rounded-lg border border-border bg-surface-light p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted">
          Newsletter
        </h3>
        <p className="mb-3 text-sm text-foreground-muted">
          Get the latest pet care tips delivered to your inbox.
        </p>
        <form onSubmit={handleSubscribe} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-md bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {status === "success" && (
          <p className="mt-2 text-xs text-success">
            Thanks for subscribing!
          </p>
        )}
        {status === "error" && (
          <p className="mt-2 text-xs text-red-500">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </aside>
  );
}
