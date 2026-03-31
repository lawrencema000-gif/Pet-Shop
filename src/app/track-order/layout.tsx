import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order | Pet and Angels",
  description:
    "Track the status of your Pet and Angels order. Enter your order number and email to see delivery updates.",
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
