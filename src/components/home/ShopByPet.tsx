import Image from "next/image";
import Link from "next/link";

const pets = [
  {
    name: "Shop for Dogs",
    image:
      "https://images.unsplash.com/photo-1534361960057-19889db9621e?w=800",
    href: "/categories/dogs",
    cta: "Explore Dog Products",
  },
  {
    name: "Shop for Cats",
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop",
    href: "/categories/cats",
    cta: "Explore Cat Products",
  },
];

export default function ShopByPet() {
  return (
    <section className="container-main py-16">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 fade-in">
        Shop by Pet Type
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {pets.map((pet) => (
          <div key={pet.name} className="slide-up">
            <Link
              href={pet.href}
              className="group relative block overflow-hidden rounded-lg aspect-[3/2]"
            >
              <Image
                src={pet.image}
                alt={pet.name}
                fill
                sizes="(max-width: 750px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl md:text-3xl font-bold">{pet.name}</h3>
                <span className="inline-block mt-2 text-sm font-medium opacity-90 group-hover:opacity-100 transition-opacity">
                  {pet.cta} &rarr;
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
