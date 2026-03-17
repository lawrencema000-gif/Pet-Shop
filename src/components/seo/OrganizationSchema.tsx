export default function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PETLIBRO",
    url: "https://pet-shop-lac-ten.vercel.app",
    logo: "https://pet-shop-lac-ten.vercel.app/logo.png",
    description: "Smart pet care products for modern pet parents",
    sameAs: [
      "https://facebook.com",
      "https://instagram.com",
      "https://twitter.com",
      "https://youtube.com",
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
