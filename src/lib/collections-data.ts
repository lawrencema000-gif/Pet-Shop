export interface Collection {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  productSlugs: string[];
  faqs: { question: string; answer: string }[];
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "best-for-apartments",
    title: "Best for Small Spaces",
    description:
      "Compact, quiet smart pet products designed for apartment living. Every item is space-efficient without sacrificing performance.",
    longDescription:
      "Living in a small apartment doesn't mean your pet has to miss out on premium care. We've curated a collection of compact, whisper-quiet smart pet products that fit perfectly in studios, one-bedrooms, and condos. Each product is chosen for its small footprint, low noise level, and high performance — because your pet deserves the best, no matter the square footage.",
    image:
      "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=1200&h=500&fit=crop",
    productSlugs: [
      "granary-smart-camera-feeder",
      "dockstream-2-smart-water-fountain",
      "granary-smart-feeder",
      "dockstream-rfid-water-fountain",
    ],
    faqs: [
      {
        question: "Are these products quiet enough for a studio apartment?",
        answer:
          "Absolutely. Every product in this collection operates below 40 dB — quieter than a library. Our water fountains use brushless DC motors that are virtually silent, and our feeders dispense food with minimal noise.",
      },
      {
        question: "How much space do these products need?",
        answer:
          "Our most compact feeder takes up about the same space as a cereal box. Water fountains have a footprint of roughly 8x8 inches. Even our self-cleaning litter boxes are designed to fit in a closet or bathroom corner.",
      },
      {
        question: "Can I control everything from one app?",
        answer:
          "Yes! All PETLIBRO smart products connect to the PETLIBRO app, giving you a single dashboard to manage feeding schedules, water levels, and litter box status.",
      },
    ],
  },
  {
    slug: "multi-pet-homes",
    title: "Multi-Pet Household Essentials",
    description:
      "Products built for homes with 2+ pets. RFID-enabled feeders, high-capacity fountains, and smart litter boxes that track each pet.",
    longDescription:
      "Managing feeding, hydration, and hygiene for multiple pets is a challenge. This collection features products specifically designed for multi-pet households — from RFID-enabled feeders that ensure each pet gets the right food, to high-capacity water fountains and self-cleaning litter boxes with individual pet tracking. No more food stealing, no more constant refilling, no more guessing who used the litter box.",
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=500&fit=crop",
    productSlugs: [
      "one-rfid-smart-feeder",
      "dockstream-rfid-water-fountain",
      "luma-self-cleaning-litter-box",
      "granary-smart-camera-feeder",
    ],
    faqs: [
      {
        question: "How does the RFID feeder prevent food stealing?",
        answer:
          "Each pet wears a lightweight RFID collar tag. The feeder only opens its lid when it detects the assigned pet's tag, keeping other pets out. This is essential for pets on prescription diets or weight management plans.",
      },
      {
        question: "Can the litter box tell my cats apart?",
        answer:
          "Yes. Smart litter boxes with weight sensors can differentiate between cats and track each one's usage frequency, duration, and weight over time. You'll get individual health insights in the app.",
      },
      {
        question: "How many pets can one water fountain serve?",
        answer:
          "Our 3L+ water fountains comfortably serve 2–4 pets. The app will notify you when water is low, so you always know when to refill.",
      },
    ],
  },
  {
    slug: "new-pet-parent",
    title: "New Pet Parent Starter Kit",
    description:
      "Everything a first-time pet owner needs. Easy to set up, simple to use, and backed by our beginner-friendly guides.",
    longDescription:
      "Congratulations on your new furry family member! Getting started with pet care can feel overwhelming, so we've put together a beginner-friendly collection of smart products that are easy to set up and intuitive to use. Each product comes with step-by-step guides, and our app walks you through everything from initial configuration to daily routines. You'll feel like a pro within a day.",
    image:
      "https://images.unsplash.com/photo-1583337130417-13104dec14c7?w=1200&h=500&fit=crop",
    productSlugs: [
      "granary-smart-feeder",
      "dockstream-2-smart-water-fountain",
      "granary-smart-camera-feeder",
    ],
    faqs: [
      {
        question: "I've never used smart pet products. Are these hard to set up?",
        answer:
          "Not at all! Every product connects to our app with a simple QR code scan. The app guides you through Wi-Fi setup, scheduling, and personalization step by step. Most people are fully set up in under 10 minutes.",
      },
      {
        question: "What if my pet doesn't like the new feeder or fountain?",
        answer:
          "Pets usually take 2–5 days to adjust. We recommend placing the new product next to their current bowl for a few days so they can explore it at their own pace. Our 30-day return policy gives you plenty of time.",
      },
      {
        question: "Do I need all of these products?",
        answer:
          "Start with what matters most to you. A smart feeder is the most popular first purchase — it automates meals and gives you peace of mind when you're away. Add a water fountain and other products as you get comfortable.",
      },
      {
        question: "Is there a warranty?",
        answer:
          "Every PETLIBRO product comes with a 1-year standard warranty. Bundle purchases receive an extended 2-year warranty at no extra cost.",
      },
    ],
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function getAllCollectionSlugs(): string[] {
  return COLLECTIONS.map((c) => c.slug);
}
