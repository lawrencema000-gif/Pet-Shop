import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog-data";

interface BlogCardProps {
  post: BlogPost;
  variant?: "default" | "large";
}

export default function BlogCard({ post, variant = "default" }: BlogCardProps) {
  const isLarge = variant === "large";

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/10] overflow-hidden"
      >
        <Image
          src={post.image_url}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            isLarge
              ? "(max-width: 750px) 100vw, 60vw"
              : "(max-width: 640px) 100vw, (max-width: 990px) 50vw, 33vw"
          }
        />
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
          {post.category}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <Link href={`/blog/${post.slug}`}>
          <h3
            className={`font-semibold text-foreground transition-colors group-hover:text-muted ${
              isLarge ? "text-xl md:text-2xl" : "text-base md:text-lg"
            } leading-snug`}
          >
            {post.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-muted leading-relaxed">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted">
          <span className="font-medium text-foreground-muted">
            {post.author}
          </span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{post.read_time} min read</span>
        </div>
      </div>
    </article>
  );
}
