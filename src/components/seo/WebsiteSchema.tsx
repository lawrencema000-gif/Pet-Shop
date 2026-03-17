export default function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "PETLIBRO",
    url: "https://pet-shop-lac-ten.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target:
        "https://pet-shop-lac-ten.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
