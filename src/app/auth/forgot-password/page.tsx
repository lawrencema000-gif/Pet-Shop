"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
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
          <div className="bg-background rounded-md shadow-card p-8">
            <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.checkEmail")}
            </h1>
            <p className="text-muted mb-6">
              {t("auth.resetInstructions")}
            </p>
            <Link href="/auth/login">
              <Button variant="outline" fullWidth>
                {t("auth.backToSignIn")}
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
        <div className="bg-background rounded-md shadow-card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.resetPassword")}
            </h1>
            <p className="text-sm text-muted mt-1">
              {t("auth.resetSubtitle")}
            </p>
          </div>

          {error && (
            <div className="bg-sale/10 border border-sale/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-sale">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("auth.emailLabel")}
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {t("auth.sendResetInstructions")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            {t("auth.rememberPassword")}{" "}
            <Link
              href="/auth/login"
              className="font-medium text-foreground hover:underline"
            >
              {t("auth.signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
