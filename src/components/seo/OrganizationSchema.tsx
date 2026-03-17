export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pet Shop",
    url: "https://pet-shop-lac-ten.vercel.app",
    logo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    description: "Smart pet care products for modern pet parents",
    sameAs: [
      "https://facebook.com/petshop",
      "https://instagram.com/petshop",
      "https://twitter.com/petshop",
      "https://youtube.com/@petshop",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@petshop.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
