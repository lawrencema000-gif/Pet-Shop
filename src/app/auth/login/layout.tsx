import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | PETLIBRO",
  description:
    "Sign in to your PETLIBRO account to manage orders, track deliveries, and access exclusive offers.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
