import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | PETLIBRO",
  description:
    "Get in touch with the PETLIBRO support team. We typically respond within 24 hours. Email, phone, and contact form available.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
