export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PETLIBRO",
    url: "https://pet-shop-lac-ten.vercel.app",
    logo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    description: "Smart pet care products for modern pet parents",
    sameAs: [
      "https://facebook.com/petlibro",
      "https://instagram.com/petlibro",
      "https://twitter.com/petlibro",
      "https://youtube.com/@petlibro",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@petlibro.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
