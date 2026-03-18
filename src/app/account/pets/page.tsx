"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Plus, Pencil, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase/client";

interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: "dog" | "cat" | "other";
  breed: string | null;
  age_years: number | null;
  size: "small" | "medium" | "large" | "xlarge";
  dietary_needs: string | null;
}

const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "other", label: "Other" },
];

const SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "X-Large" },
];

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  other: "🐾",
};

const EMPTY_FORM = {
  name: "",
  species: "dog" as Pet["species"],
  breed: "",
  age_years: "",
  size: "medium" as Pet["size"],
  dietary_needs: "",
};

export default function PetsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [userId, setUserId] = useState("");
  const [tableError, setTableError] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPets = async (uid: string) => {
    const { data, error } = await supabase
      .from("pets")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      setTableError(true);
      return;
    }

    setPets((data as Pet[]) || []);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/pets");
        return;
      }

      setUserId(user.id);
      await fetchPets(user.id);
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

  const handleEdit = (pet: Pet) => {
    setForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || "",
      age_years: pet.age_years?.toString() || "",
      size: pet.size,
      dietary_needs: pet.dietary_needs || "",
    });
    setEditingId(pet.id);
    setShowForm(true);
    setMessage(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pets").delete().eq("id", id);
    if (error) {
      setMessage({ type: "error", text: "Failed to delete pet." });
    } else {
      await fetchPets(userId);
      setMessage({ type: "success", text: "Pet removed." });
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      setMessage({ type: "error", text: "Please enter a name for your pet." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      user_id: userId,
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim() || null,
      age_years: form.age_years ? parseInt(form.age_years) : null,
      size: form.size,
      dietary_needs: form.dietary_needs.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase.from("pets").update(payload).eq("id", editingId);
      if (error) {
        setMessage({ type: "error", text: "Failed to update pet." });
        setSaving(false);
        return;
      }
    } else {
      const { error } = await supabase.from("pets").insert(payload);
      if (error) {
        setMessage({ type: "error", text: "Failed to add pet." });
        setSaving(false);
        return;
      }
    }

    await fetchPets(userId);
    setMessage({ type: "success", text: editingId ? "Pet updated!" : "Pet added!" });
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

  if (tableError) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-6">Pets</h1>
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <PawPrint size={48} className="text-border mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">Pet profiles coming soon!</h2>
          <p className="text-sm text-muted">
            We&apos;re working on bringing pet profiles to your account. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pets</h1>
        {!showForm && (
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            leftIcon={<Plus size={16} />}
          >
            Add Pet
          </Button>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 text-sm mb-4 ${
            message.type === "success" ? "text-success" : "text-sale"
          }`}
        >
          {message.type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {editingId ? "Edit Pet" : "Add a Pet"}
          </h2>
          <div className="space-y-4">
            <Input
              label="Name"
              placeholder="Your pet's name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Species</label>
              <select
                value={form.species}
                onChange={(e) => setForm({ ...form, species: e.target.value as Pet["species"] })}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              >
                {SPECIES_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Breed"
              placeholder="e.g. Golden Retriever"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age (years)"
                type="number"
                placeholder="Age"
                min="0"
                value={form.age_years}
                onChange={(e) => setForm({ ...form, age_years: e.target.value })}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">Size</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value as Pet["size"] })}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground bg-background transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  {SIZE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Dietary Needs</label>
              <textarea
                placeholder="Any special dietary needs or allergies..."
                value={form.dietary_needs}
                onChange={(e) => setForm({ ...form, dietary_needs: e.target.value })}
                rows={3}
                className="w-full border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted bg-background transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} loading={saving}>
                {editingId ? "Update" : "Add"} Pet
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pet Cards */}
      {pets.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-border p-12 text-center">
          <PawPrint size={48} className="text-border mx-auto mb-4" />
          <p className="text-muted mb-4">No pets added yet</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowForm(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Your First Pet
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-2xl">
                    {SPECIES_EMOJI[pet.species] || "🐾"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{pet.name}</h3>
                    <p className="text-xs text-muted capitalize">
                      {pet.species}
                      {pet.breed && ` - ${pet.breed}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(pet)}
                    className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-light transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(pet.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-sale hover:bg-sale/5 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {pet.age_years != null && (
                  <span className="text-xs bg-surface-light text-muted px-2.5 py-1 rounded-full">
                    {pet.age_years} {pet.age_years === 1 ? "year" : "years"} old
                  </span>
                )}
                <span className="text-xs bg-surface-light text-muted px-2.5 py-1 rounded-full capitalize">
                  {pet.size === "xlarge" ? "X-Large" : pet.size}
                </span>
              </div>
              {pet.dietary_needs && (
                <p className="text-xs text-muted mt-3 bg-surface-light rounded-lg p-2.5">
                  <span className="font-medium">Diet:</span> {pet.dietary_needs}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
