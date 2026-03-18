"use client";
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accent focus:text-white focus:px-6 focus:py-3 focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
