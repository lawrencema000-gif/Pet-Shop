import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import {
  blogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog-data";
import BlogCard from "@/components/blog/BlogCard";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | PETLIBRO Blog`,
    description: post.excerpt,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author],
      images: [{ url: post.image_url, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image_url],
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(params.slug, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image_url,
    datePublished: post.published_at,
    author: {
      "@type": "Person",
      name: post.author,
      jobTitle: post.author_role,
    },
    publisher: {
      "@type": "Organization",
      name: "PETLIBRO",
      url: "https://pet-shop.vercel.app",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://pet-shop.vercel.app/blog/${post.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/blog"
            className="transition-colors hover:text-foreground"
          >
            Blog
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-foreground">{post.title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="container-narrow py-10 md:py-14">
        {/* Header */}
        <header>
          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition-opacity hover:opacity-80"
          >
            {post.category}
          </Link>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="font-medium text-foreground-muted">
              {post.author}
            </span>
            <span aria-hidden="true">&middot;</span>
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span aria-hidden="true">&middot;</span>
            <span>{post.read_time} min read</span>
          </div>
        </header>

        {/* Featured Image */}
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 750px) 100vw, 768px"
            priority
          />
        </div>

        {/* Article Body */}
        <div
          className="prose-article mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-10 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-surface-light px-3 py-1 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Share */}
        <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
          <span className="text-sm font-medium text-foreground">Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://pet-shop.vercel.app/blog/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
            aria-label="Share on Twitter"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://pet-shop.vercel.app/blog/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
            aria-label="Share on Facebook"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.07 1.373.14v3.34c-.149-.016-.408-.024-.601-.024-1.7 0-2.36.645-2.36 2.325v1.777h3.32l-.57 3.667h-2.75v8.353C19.396 23.187 24 18.134 24 12.011 24 5.384 18.627 0 12 0S0 5.384 0 12.011c0 5.234 3.406 9.717 8.131 11.28.349.077.727.119 .97.4z" />
            </svg>
          </a>
          <button
            onClick={undefined}
            className="rounded-full border border-border p-2 text-muted transition-colors hover:border-accent hover:text-foreground"
            aria-label="Copy link"
            title="Copy link to clipboard"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </button>
        </div>

        {/* Author Box */}
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-border bg-surface-light p-5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
            {post.author
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.author}</p>
            <p className="text-sm text-muted">{post.author_role}</p>
            <p className="mt-1 text-sm text-muted">
              Contributing writer at PETLIBRO, sharing expert insights on pet
              health, nutrition, and modern pet care technology.
            </p>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Blog
          </Link>
        </div>
      </article>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="border-t border-border bg-surface-light py-14">
          <div className="container-main">
            <h2 className="mb-8 text-2xl font-bold text-foreground">
              Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <BlogCard key={p.id} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
