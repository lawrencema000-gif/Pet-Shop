import Image from "next/image";
import Link from "next/link";

const stats = [
  { value: "50K+", label: "Happy Pets" },
  { value: "4.8★", label: "Average Rating" },
  { value: "30+", label: "Smart Products" },
];

export default function BrandStory() {
  return (
    <section className="container-main py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Image */}
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden fade-in">
          <Image
            src="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=600&fit=crop"
            alt="Pet parent with their dog"
            fill
            sizes="(max-width: 750px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Text */}
        <div className="space-y-5 slide-up">
          <p className="text-sm uppercase tracking-wider text-muted">
            Our Story
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Designed by Pet Parents, for Pet Parents
          </h2>
          <p className="text-muted leading-relaxed">
            We started PETLIBRO because we believed pet care could be smarter.
            As pet parents ourselves, we know the worry of leaving your furry
            friend at home. That&apos;s why we build connected, intelligent
            products that give you peace of mind and keep your pets healthy and
            happy.
          </p>
          <p className="text-muted leading-relaxed">
            Every product is rigorously tested, vet-approved, and designed with
            both aesthetics and functionality in mind. Because your pets deserve
            the best — and so do you.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:opacity-70 transition-opacity"
          >
            Learn More &rarr;
          </Link>

          {/* Stats row */}
          <div className="flex gap-8 pt-6 border-t border-border">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
