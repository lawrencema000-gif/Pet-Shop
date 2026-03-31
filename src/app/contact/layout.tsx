import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Pet and Angels",
  description:
    "Get in touch with the Pet and Angels support team. We typically respond within 24 hours. Email, phone, and contact form available.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
