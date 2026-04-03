export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Pet and Angels",
    url: "https://www.petandangel.com",
    logo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    description: "Smart pet care products for modern pet parents",
    sameAs: [
      "https://facebook.com/petandangels",
      "https://instagram.com/petandangels",
      "https://twitter.com/petandangels",
      "https://youtube.com/@petandangels",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@petandangel.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
