"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Bell, Mail, Heart, Newspaper, AlertTriangle, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";

interface Preferences {
  order_updates: boolean;
  promotions: boolean;
  pet_care_tips: boolean;
  newsletter: boolean;
}

const DEFAULT_PREFS: Preferences = {
  order_updates: true,
  promotions: false,
  pet_care_tips: true,
  newsletter: false,
};

const PREF_KEYS: { key: keyof Preferences; labelKey: string; descKey: string; icon: typeof Bell }[] = [
  {
    key: "order_updates",
    labelKey: "settingsPage.orderUpdates",
    descKey: "settingsPage.orderUpdatesDesc",
    icon: Bell,
  },
  {
    key: "promotions",
    labelKey: "settingsPage.promotions",
    descKey: "settingsPage.promotionsDesc",
    icon: Mail,
  },
  {
    key: "pet_care_tips",
    labelKey: "settingsPage.petCareTips",
    descKey: "settingsPage.petCareTipsDesc",
    icon: Heart,
  },
  {
    key: "newsletter",
    labelKey: "settingsPage.newsletter",
    descKey: "settingsPage.newsletterDesc",
    icon: Newspaper,
  },
];

export default function SettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/settings");
        return;
      }

      // Load from localStorage
      const stored = localStorage.getItem("pet-shop-preferences");
      if (stored) {
        try {
          setPrefs(JSON.parse(stored));
        } catch {
          // ignore parse errors
        }
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const handleToggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setMessage(null);
  };

  const handleSave = () => {
    localStorage.setItem("pet-shop-preferences", JSON.stringify(prefs));
    setMessage({ type: "success", text: t('settingsPage.preferencesSaved') });
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(t('settingsPage.deleteConfirm'));
    if (confirmed) {
      alert(t('settingsPage.deleteContactSupport'));
    }
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
      <h1 className="text-2xl font-bold text-foreground mb-6">{t('settingsPage.heading')}</h1>

      {/* Notification Preferences */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('settingsPage.notificationPreferences')}</h2>
        <div className="space-y-4">
          {PREF_KEYS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-light rounded-lg flex items-center justify-center">
                    <Icon size={18} className="text-muted" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t(item.labelKey)}</p>
                    <p className="text-xs text-muted">{t(item.descKey)}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    prefs[item.key] ? "bg-accent" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      prefs[item.key] ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {message && (
          <div
            className={`flex items-center gap-2 text-sm mt-4 ${
              message.type === "success" ? "text-success" : "text-sale"
            }`}
          >
            <Check size={16} />
            {message.text}
          </div>
        )}

        <div className="pt-4">
          <Button onClick={handleSave}>{t('settingsPage.savePreferences')}</Button>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-muted" />
          <h2 className="text-lg font-semibold text-foreground">{t('settingsPage.changePassword')}</h2>
        </div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setPwMessage(null);
            if (newPassword.length < 6) {
              setPwMessage({ type: "error", text: t('auth.passwordMinLength') });
              return;
            }
            if (newPassword !== confirmPassword) {
              setPwMessage({ type: "error", text: t('settingsPage.passwordMismatch') });
              return;
            }
            setPwLoading(true);
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            setPwLoading(false);
            if (error) {
              setPwMessage({ type: "error", text: error.message });
            } else {
              setPwMessage({ type: "success", text: t('settingsPage.passwordChanged') });
              setNewPassword("");
              setConfirmPassword("");
            }
          }}
          className="space-y-4 max-w-md"
        >
          <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-1">{t('settingsPage.newPassword')}</label>
            <input
              type={showNewPw ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('settingsPage.newPasswordPlaceholder')}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-accent bg-background pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute right-3 top-[34px] text-muted hover:text-foreground"
              tabIndex={-1}
            >
              {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('settingsPage.confirmPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('settingsPage.confirmPasswordPlaceholder')}
              required
              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-accent bg-background"
            />
          </div>
          {pwMessage && (
            <p className={`text-sm ${pwMessage.type === "success" ? "text-success" : "text-sale"}`}>
              {pwMessage.text}
            </p>
          )}
          <Button type="submit" loading={pwLoading}>{t('settingsPage.updatePassword')}</Button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-background rounded-md border border-sale/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-sale" />
          <h2 className="text-lg font-semibold text-sale">{t('settingsPage.dangerZone')}</h2>
        </div>
        <p className="text-sm text-muted mb-4">
          {t('settingsPage.dangerZoneDesc')}
        </p>
        <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
          {t('settingsPage.deleteAccount')}
        </Button>
      </div>
    </div>
  );
}
