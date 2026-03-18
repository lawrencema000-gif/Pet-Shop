"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-background rounded-premium-lg shadow-card p-8">
            <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check Your Email
            </h1>
            <p className="text-muted mb-6">
              We&apos;ve sent password reset instructions to{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Check your inbox and follow the link to reset your password.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" fullWidth>
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-premium-lg shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Reset Password
            </h1>
            <p className="text-sm text-muted mt-1">
              Enter your email and we&apos;ll send you instructions to reset
              your password.
            </p>
          </div>

          {error && (
            <div className="bg-sale/10 border border-sale/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-sale">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Send Reset Instructions
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
