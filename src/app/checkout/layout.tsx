import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | Pet and Angels",
  description:
    "Complete your purchase securely. Free shipping on orders over $75. 30-day return policy.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
