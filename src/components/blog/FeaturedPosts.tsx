import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/blog-data";

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null;

  const [main, ...side] = posts;

  return (
    <section className="container-main py-12">
      <h2 className="mb-8 text-2xl font-bold text-foreground md:text-3xl">
        Featured Articles
      </h2>
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main featured post */}
        <article className="group lg:col-span-3">
          <Link
            href={`/blog/${main.slug}`}
            className="relative block aspect-[16/10] overflow-hidden rounded-lg"
          >
            <Image
              src={main.image_url}
              alt={main.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 990px) 100vw, 60vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
              <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
                {main.category}
              </span>
              <h3 className="mt-3 text-xl font-bold text-white md:text-3xl leading-tight">
                {main.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-white/80 md:text-base">
                {main.excerpt}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
                <span className="font-medium text-white">{main.author}</span>
                <span aria-hidden="true">&middot;</span>
                <span>{main.read_time} min read</span>
              </div>
            </div>
          </Link>
        </article>

        {/* Side featured posts */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {side.slice(0, 2).map((post) => (
            <article key={post.id} className="group flex-1">
              <Link
                href={`/blog/${post.slug}`}
                className="relative block aspect-[16/10] h-full overflow-hidden rounded-lg"
              >
                <Image
                  src={post.image_url}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 990px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <span className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-white md:text-lg leading-snug">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
                    <span className="font-medium text-white">
                      {post.author}
                    </span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{post.read_time} min read</span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
