import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart | PETLIBRO",
  description:
    "Review the items in your cart and proceed to checkout. Free shipping on orders over $75.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
