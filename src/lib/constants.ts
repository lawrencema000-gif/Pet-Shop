export const SITE_CONFIG = {
  name: "PETLIBRO",
  description: "Smart pet care products for modern pet parents",
  url: "https://pet-shop.vercel.app",
  freeShippingThreshold: 75,
};

export const NAV_LINKS = [
  {
    label: "Flash Sale",
    href: "/products?sale=true",
    highlight: true,
  },
  {
    label: "Litter Boxes",
    href: "/categories/litter-boxes",
    isNew: true,
    children: [
      { label: "Luma Smart Litter Box", href: "/products/luma-smart-litter-box", badge: "New" },
      { label: "Litter Box Accessories", href: "/categories/litter-boxes?type=accessories" },
    ],
  },
  {
    label: "Fountains",
    href: "/categories/water-fountains",
    children: [
      { label: "Dockstream 2 Smart Fountain", href: "/products/dockstream-2-smart-fountain", badge: "Best Seller" },
      { label: "All Fountains", href: "/categories/water-fountains" },
    ],
  },
  {
    label: "Feeders",
    href: "/categories/pet-feeders",
    children: [
      { label: "Smart Camera Feeder", href: "/products/granary-smart-camera-feeder" },
      { label: "RFID Smart Feeder", href: "/products/one-rfid-smart-feeder" },
      { label: "Wet Food Feeder", href: "/products/polar-smart-wet-food-feeder" },
      { label: "All Feeders", href: "/categories/pet-feeders" },
    ],
  },
  {
    label: "Accessories",
    href: "/categories/accessories",
  },
];

export const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Feeders", href: "/categories/pet-feeders" },
    { label: "Fountains", href: "/categories/water-fountains" },
    { label: "Litter Boxes", href: "/categories/litter-boxes" },
    { label: "Accessories", href: "/categories/accessories" },
  ],
  support: [
    { label: "Help Center", href: "/support" },
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
};

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    text: "The smart feeder has been a game-changer for my cats. I can monitor their eating habits from anywhere!",
    product: "Granary Smart Camera Feeder",
  },
  {
    id: 2,
    name: "James K.",
    rating: 5,
    text: "Best water fountain I've ever bought. The app integration is seamless and my dog loves it.",
    product: "Dockstream 2 Smart Fountain",
  },
  {
    id: 3,
    name: "Emily R.",
    rating: 5,
    text: "The Luma litter box is worth every penny. No more scooping and the self-cleaning is whisper quiet.",
    product: "Luma Smart Litter Box",
  },
  {
    id: 4,
    name: "Michael T.",
    rating: 4,
    text: "Excellent build quality. The RFID feeder ensures each of my cats gets their own food.",
    product: "One RFID Smart Feeder",
  },
];
