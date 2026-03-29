"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/profile");
        return;
      }

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFullName(profile.full_name || "");
        setPhone(profile.phone || "");
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage({ type: "error", text: t('profilePage.saveFailed') });
    } else {
      setMessage({ type: "success", text: t('profilePage.saveSuccess') });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('profilePage.heading')}</h1>

      <div className="bg-background rounded-md border border-border p-6">
        <div className="space-y-4">
          <Input
            label={t('profilePage.email')}
            type="email"
            value={email}
            disabled
            className="bg-surface-light cursor-not-allowed"
          />

          <Input
            label={t('profilePage.fullName')}
            type="text"
            placeholder={t('profilePage.fullNamePlaceholder')}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <Input
            label={t('profilePage.phone')}
            type="tel"
            placeholder={t('profilePage.phonePlaceholder')}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {message && (
            <div
              className={`flex items-center gap-2 text-sm ${
                message.type === "success" ? "text-success" : "text-sale"
              }`}
            >
              {message.type === "success" && <Check size={16} />}
              {message.text}
            </div>
          )}

          <div className="pt-2">
            <Button onClick={handleSave} loading={saving}>
              {t('profilePage.saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
