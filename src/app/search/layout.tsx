import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Products | PETLIBRO",
  description:
    "Search our full catalog of smart pet feeders, water fountains, litter boxes, and accessories.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
