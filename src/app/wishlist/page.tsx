import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Wishlist | Pet Shop",
  description: "Save your favorite pet products to your wishlist.",
};

export default function WishlistPage() {
  return (
    <main className="container-main py-20 text-center">
      <div className="max-w-md mx-auto">
        <Heart className="w-16 h-16 text-muted/30 mx-auto mb-6" strokeWidth={1.5} />
        <h1 className="text-3xl font-bold mb-3">Your Wishlist</h1>
        <p className="text-muted mb-8">
          Sign in to save your favorites and get notified about price drops.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
        >
          Sign In to Get Started
        </Link>
      </div>
    </main>
  );
}
