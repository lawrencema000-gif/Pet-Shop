export default function MediaMentions() {
  const publications = [
    "TechCrunch",
    "Pet Business",
    "Wired",
    "The Dodo",
    "Modern Pet",
  ];

  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <p className="text-sm text-muted text-center uppercase tracking-widest mb-8">
          As Featured In
        </p>

        <div className="flex items-center gap-8 md:gap-12 overflow-x-auto md:overflow-visible md:justify-center scrollbar-hide pb-2 md:pb-0">
          {publications.map((name) => (
            <span
              key={name}
              className="flex-shrink-0 text-lg md:text-xl font-semibold text-foreground/40 select-none whitespace-nowrap grayscale"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
