import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  blogPosts,
  getFeaturedPosts,
  BLOG_CATEGORIES,
} from "@/lib/blog-data";
import BlogCard from "@/components/blog/BlogCard";
import FeaturedPosts from "@/components/blog/FeaturedPosts";

export const metadata: Metadata = {
  title: "Pet Care Blog | Pet and Angels",
  description:
    "Expert tips, guides, and insights for modern pet parents. Learn about pet nutrition, smart feeders, hydration, health, and the latest in pet tech.",
  keywords: [
    "pet care blog",
    "pet health tips",
    "smart pet feeder guide",
    "cat water fountain",
    "pet nutrition",
  ],
  openGraph: {
    title: "Pet Care Blog | Pet and Angels",
    description:
      "Expert tips, guides, and insights for modern pet parents.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: { category?: string };
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const activeCategory = searchParams.category || "All";
  const featured = getFeaturedPosts();

  const filteredPosts =
    activeCategory === "All"
      ? blogPosts
      : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Blog</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-surface py-12 md:py-16">
        <div className="container-main text-center">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl">
            Pet Care Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">
            Expert tips, guides, and insights for modern pet parents
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {activeCategory === "All" && <FeaturedPosts posts={featured} />}

      {/* Category Filters */}
      <section className="container-main py-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <Link
            href="/blog"
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === "All"
                ? "border-accent bg-accent text-white"
                : "border-border bg-background text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            All
          </Link>
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blog?category=${encodeURIComponent(cat)}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-background text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* All Posts Grid */}
      <section className="container-main pb-16">
        <h2 className="mb-6 text-xl font-bold text-foreground md:text-2xl">
          {activeCategory === "All" ? "All Articles" : activeCategory}
        </h2>
        {filteredPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-muted">
            No articles found in this category yet. Check back soon!
          </p>
        )}
      </section>
    </>
  );
}
