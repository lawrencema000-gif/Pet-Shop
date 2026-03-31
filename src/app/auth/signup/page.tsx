"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";
import { Turnstile, useTurnstile } from "@/components/ui/Turnstile";

export default function SignUpPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const { token: turnstileToken, handleVerify, handleExpire } = useTurnstile();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    if (!tosAccepted) {
      setError("Please accept the Terms of Service.");
      return;
    }

    if (!turnstileToken) {
      setError("Please complete the verification.");
      return;
    }

    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        email,
      });

      if (profileError) {
        console.error("Profile upsert failed:", profileError.message);
      }

      // Auto-confirmed — user has a session, redirect to account
      if (data.session) {
        router.push("/account");
        return;
      }
    }

    // Fallback: if email confirmation is re-enabled later
    setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="bg-background rounded-md shadow-sm p-8">
            <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.accountCreated")}
            </h1>
            <p className="text-muted mb-6">
              {t("auth.welcomeMessage")}
            </p>
            <Link href="/auth/login">
              <Button fullWidth>
                {t("auth.signIn")}
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
        <div className="bg-background rounded-md shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {t("auth.createAccount")}
            </h1>
            <p className="text-sm text-muted mt-1">
              {t("auth.joinSubtitle")}
            </p>
          </div>

          <button
            onClick={handleGoogleSignUp}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-6 py-3 text-sm font-medium text-foreground hover:bg-surface-light transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.continueWithGoogle")}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted">{t("auth.or")}</span>
            </div>
          </div>

          {error && (
            <div className="bg-sale/10 border border-sale/20 rounded-lg p-3 mb-6">
              <p className="text-sm text-sale">{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              label={t("auth.fullNameLabel")}
              placeholder={t("auth.namePlaceholder")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label={t("auth.emailLabel")}
              type="email"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label={t("auth.passwordLabel")}
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.passwordHint")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <p className="text-xs text-muted mt-1">{t("auth.mustBe6Chars")}</p>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-1 rounded border-border"
              />
              <span className="text-xs text-muted">
                I agree to the{" "}
                <Link href="/terms" className="text-foreground underline" target="_blank">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-foreground underline" target="_blank">Privacy Policy</Link>
              </span>
            </label>

            <Turnstile onVerify={handleVerify} onExpire={handleExpire} />

            <Button type="submit" fullWidth size="lg" loading={loading}>
              {t("auth.createAccount")}
            </Button>
          </form>
          <p className="text-xs text-muted text-center mt-3">{t("auth.freeForever")}</p>

          <p className="text-center text-sm text-muted mt-6">
            {t("auth.haveAccount")}{" "}
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
