"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Bell, Mail, Heart, Newspaper, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";

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

const PREF_ITEMS: { key: keyof Preferences; label: string; description: string; icon: typeof Bell }[] = [
  {
    key: "order_updates",
    label: "Order Updates",
    description: "Get notified about order status changes",
    icon: Bell,
  },
  {
    key: "promotions",
    label: "Promotions",
    description: "Receive deals and exclusive offers",
    icon: Mail,
  },
  {
    key: "pet_care_tips",
    label: "Pet Care Tips",
    description: "Helpful tips for taking care of your pets",
    icon: Heart,
  },
  {
    key: "newsletter",
    label: "Newsletter",
    description: "Monthly newsletter with new products and updates",
    icon: Newspaper,
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    setMessage({ type: "success", text: "Preferences saved!" });
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (confirmed) {
      alert(
        "For security, account deletion requires contacting our support team. Please reach out to us at support@petshop.com."
      );
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
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {/* Notification Preferences */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {PREF_ITEMS.map((item) => {
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
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted">{item.description}</p>
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
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-background rounded-md border border-sale/30 p-6">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={18} className="text-sale" />
          <h2 className="text-lg font-semibold text-sale">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
