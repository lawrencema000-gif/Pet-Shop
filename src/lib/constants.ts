export const SHIPPING_COST = 5.99;
export const FREE_SHIPPING_THRESHOLD = 75;
export const TAX_RATE = 0.08;
export const MAX_ITEM_QUANTITY = 10;

export const SITE_CONFIG = {
  name: "Pet and Angels",
  description: "Smart pet care products for modern pet parents",
  url: "https://pet-shop-lac-ten.vercel.app",
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

export interface NavChild {
  label: string;
  href: string;
  badge?: string;
}

export interface NavLink {
  label: string;
  href: string;
  highlight?: boolean;
  highlightColor?: "red" | "accent";
  isNew?: boolean;
  children?: NavChild[];
  featured?: {
    title: string;
    description: string;
    image: string;
    href: string;
    cta: string;
  };
}

export const NAV_LINKS: NavLink[] = [
  {
    label: "Shop All",
    href: "/products",
  },
  {
    label: "New Arrivals",
    href: "/products?sort=newest",
    highlight: true,
    highlightColor: "accent",
  },
  {
    label: "Sale",
    href: "/products?sale=true",
    highlight: true,
    highlightColor: "red",
  },
];

export const ANNOUNCEMENT_MESSAGES = [
  "Free shipping on orders $75+",
  "30-Day Easy Returns",
  "1-Year Warranty on Smart Devices",
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Smart Feeders", href: "/categories/pet-feeders" },
    { label: "Water Fountains", href: "/categories/water-fountains" },
    { label: "Litter Boxes", href: "/categories/litter-boxes" },
    { label: "Accessories", href: "/categories/accessories" },
    { label: "New Arrivals", href: "/products?sort=newest" },
    { label: "Best Sellers", href: "/products?sort=best-selling" },
    { label: "Sale", href: "/products?sale=true" },
  ],
  support: [
    { label: "Help Center", href: "/support" },
    { label: "FAQ", href: "/faq" },
    { label: "Track Order", href: "/track-order" },
    { label: "Shipping & Returns", href: "/shipping" },
    { label: "Warranty", href: "/warranty" },
    { label: "Contact Us", href: "/contact" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    initials: "SM",
    color: "bg-rose-500",
    rating: 5,
    text: "The smart feeder has been an absolute game-changer for my two cats. I travel frequently for work, and being able to monitor their eating habits from anywhere gives me so much peace of mind. The HD camera is crystal clear and the portion control is incredibly precise.",
    product: "Granary Smart Camera Feeder",
    productHref: "/products/granary-smart-camera-feeder",
    verified: true,
  },
  {
    id: 2,
    name: "James K.",
    initials: "JK",
    color: "bg-blue-500",
    rating: 5,
    text: "Best water fountain I've ever bought, hands down. My golden retriever used to barely drink enough water, but since we got the Dockstream 2 he's always hydrated. The app integration is seamless and the 5-stage filtration keeps the water pristine. Ultra-quiet too!",
    product: "Dockstream 2 Smart Fountain",
    productHref: "/products/dockstream-2-smart-fountain",
    verified: true,
  },
  {
    id: 3,
    name: "Emily R.",
    initials: "ER",
    color: "bg-success",
    rating: 5,
    text: "The Luma litter box is worth every single penny. I was skeptical about self-cleaning litter boxes after trying cheaper options, but this one is on another level. Whisper-quiet operation, the app notifications are super helpful, and my apartment has never smelled better. My cat took to it immediately.",
    product: "Luma Smart Litter Box",
    productHref: "/products/luma-smart-litter-box",
    verified: true,
  },
  {
    id: 4,
    name: "Michael T.",
    initials: "MT",
    color: "bg-amber-500",
    rating: 4,
    text: "Excellent build quality and the RFID technology actually works perfectly. I have three cats and each one gets exactly the right food. No more food stealing! Setup was straightforward and customer support was incredibly helpful when I had questions about the app.",
    product: "One RFID Smart Feeder",
    productHref: "/products/one-rfid-smart-feeder",
    verified: true,
  },
  {
    id: 5,
    name: "Lisa D.",
    initials: "LD",
    color: "bg-purple-500",
    rating: 5,
    text: "We bought the Complete Care Set bundle and it was the best decision. Everything connects through one app, the quality is premium, and our pets are healthier and happier. The savings on the bundle made it a no-brainer. Already recommended to all my pet parent friends!",
    product: "Complete Care Set Bundle",
    productHref: "/bundles",
    verified: true,
  },
  {
    id: 6,
    name: "David W.",
    initials: "DW",
    color: "bg-cyan-500",
    rating: 5,
    text: "I was spending a fortune on replacement filters for my old fountain. The Dockstream filters last so much longer and the water quality is noticeably better. My vet even commented on how well-hydrated my cat has been at her last checkup. This product pays for itself.",
    product: "Dockstream 2 Smart Fountain",
    productHref: "/products/dockstream-2-smart-fountain",
    verified: true,
  },
];
