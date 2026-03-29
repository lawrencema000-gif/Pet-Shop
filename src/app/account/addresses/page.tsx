"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Plus, Pencil, Trash2, Loader2, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";
import { useTranslation } from "react-i18next";

interface Address {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

const EMPTY_FORM: Omit<Address, "id" | "user_id"> = {
  label: "",
  line1: "",
  line2: null,
  city: "",
  state: "",
  zip: "",
  country: "US",
  is_default: false,
};

export default function AddressesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [userId, setUserId] = useState<string>("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchAddresses = async (uid: string) => {
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", uid)
      .order("is_default", { ascending: false });
    setAddresses((data as Address[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/addresses");
        return;
      }

      setUserId(user.id);
      await fetchAddresses(user.id);
      setLoading(false);
    };

    init();
  }, [router]);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setMessage(null);
  };

  const handleEdit = (address: Address) => {
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      is_default: address.is_default,
    });
    setEditingId(address.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) {
      setMessage({ type: "error", text: t('addressesPage.deleteFailed') });
    } else {
      await fetchAddresses(userId);
      setMessage({ type: "success", text: t('addressesPage.deleteSuccess') });
    }
  };

  const handleSetDefault = async (id: string) => {
    // Unset all defaults first
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);

    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await fetchAddresses(userId);
    setMessage({ type: "success", text: t('addressesPage.defaultUpdated') });
  };

  const handleSave = async () => {
    if (!form.label || !form.line1 || !form.city || !form.state || !form.zip) {
      setMessage({ type: "error", text: t('addressesPage.requiredFields') });
      return;
    }

    setSaving(true);
    setMessage(null);

    // If setting as default, unset others first
    if (form.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);
    }

    if (editingId) {
      const { error } = await supabase
        .from("addresses")
        .update({
          label: form.label,
          line1: form.line1,
          line2: form.line2 || null,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
          is_default: form.is_default,
        })
        .eq("id", editingId);

      if (error) {
        setMessage({ type: "error", text: t('addressesPage.updateFailed') });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("addresses").insert({
        user_id: userId,
        label: form.label,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        is_default: form.is_default,
      });

      if (error) {
        setMessage({ type: "error", text: t('addressesPage.addFailed') });
        setSaving(false);
        return;
      }
    }

    await fetchAddresses(userId);
    setMessage({ type: "success", text: editingId ? t('addressesPage.updateSuccess') : t('addressesPage.addSuccess') });
    resetForm();
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('addressesPage.heading')}</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            {t('addressesPage.addAddress')}
          </Button>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm mb-4 ${
            message.type === "success" ? "text-success" : "text-sale"
          }`}
        >
          {message.type === "success" && <Check size={16} />}
          {message.text}
        </div>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="bg-background rounded-md border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? t('addressesPage.editAddress') : t('addressesPage.newAddress')}
          </h2>
          <div className="space-y-4">
            <Input
              label={t('addressesPage.label')}
              placeholder={t('addressesPage.labelPlaceholder')}
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
            <Input
              label={t('addressesPage.line1')}
              placeholder={t('addressesPage.line1Placeholder')}
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
            />
            <Input
              label={t('addressesPage.line2')}
              placeholder={t('addressesPage.line2Placeholder')}
              value={form.line2 || ""}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('addressesPage.city')}
                placeholder={t('addressesPage.city')}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <Input
                label={t('addressesPage.state')}
                placeholder={t('addressesPage.state')}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('addressesPage.zip')}
                placeholder={t('addressesPage.zip')}
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
              <Input
                label={t('addressesPage.country')}
                placeholder={t('addressesPage.country')}
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium text-foreground">{t('addressesPage.setAsDefault')}</span>
            </label>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} loading={saving}>
                {editingId ? t('addressesPage.updateAddress') : t('addressesPage.saveAddress')}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Address Cards */}
      {addresses.length === 0 && !showForm ? (
        <div className="bg-background rounded-md border border-border p-12 text-center">
          <MapPin size={48} className="text-border mx-auto mb-4" />
          <p className="text-muted mb-4">{t('addressesPage.noAddresses')}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            leftIcon={<Plus size={16} />}
          >
            {t('addressesPage.addFirstAddress')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-background rounded-md border border-border p-6 relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{addr.label}</span>
                  {addr.is_default && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                      <Star size={10} fill="currentColor" />
                      {t('addressesPage.default')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-light transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-sale hover:bg-sale/5 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {addr.line1}
                {addr.line2 && <>, {addr.line2}</>}
                <br />
                {addr.city}, {addr.state} {addr.zip}
                <br />
                {addr.country}
              </p>
              {!addr.is_default && (
                <button
                  onClick={() => handleSetDefault(addr.id)}
                  className="mt-3 text-xs text-muted hover:text-accent transition-colors"
                >
                  {t('addressesPage.setAsDefault')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
