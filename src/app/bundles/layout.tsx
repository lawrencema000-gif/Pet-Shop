import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bundle & Save | Pet and Angels",
  description:
    "Save up to 25% with Pet and Angels product bundles. Get everything your pet needs in one smart package with free shipping.",
};

export default function BundlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
