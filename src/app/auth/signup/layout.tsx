import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account | Pet and Angels",
  description:
    "Create a Pet and Angels account for a smarter pet care experience. Track orders, save favorites, and get personalized recommendations.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
