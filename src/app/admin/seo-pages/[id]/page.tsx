"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Save, ArrowLeft, ExternalLink, Trash2, Plus } from "lucide-react";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { supabase } from "@/lib/supabase/client";

interface Page {
  id?: string;
  template: string;
  slug: string;
  h1: string;
  meta_title: string;
  meta_description: string;
  body_html: string;
  hero_image_url: string;
  og_image: string;
  author_slug: string;
  target_keywords: string[];
  product_slugs: string[];
  faq_schema: { question: string; answer: string }[];
  cluster: string;
  related_slugs: string[];
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at?: string;
}

interface Author {
  slug: string;
  name: string;
}

const TEMPLATES = [
  { value: "best", label: "Best Of" },
  { value: "buying-guide", label: "Buying Guide" },
  { value: "compare", label: "Comparison" },
  { value: "gift-guide", label: "Gift Guide" },
  { value: "how-to", label: "How-To" },
  { value: "under", label: "Under Budget" },
  { value: "tools", label: "Tools" },
];

const EMPTY: Page = {
  template: "best",
  slug: "",
  h1: "",
  meta_title: "",
  meta_description: "",
  body_html: "",
  hero_image_url: "",
  og_image: "",
  author_slug: "pet-and-angels-team",
  target_keywords: [],
  product_slugs: [],
  faq_schema: [],
  cluster: "",
  related_slugs: [],
  status: "draft",
  published_at: null,
};

export default function SEOPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { hasPermission, loaded } = useStaffPermissions();
  const [page, setPage] = useState<Page>(EMPTY);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: authorsData }, pageRes] = await Promise.all([
      supabase.from("seo_authors").select("slug, name"),
      isNew
        ? Promise.resolve({ data: null })
        : supabase.from("seo_pages").select("*").eq("id", id).single(),
    ]);
    setAuthors((authorsData ?? []) as Author[]);
    if (!isNew && pageRes.data) {
      const p = pageRes.data;
      setPage({
        ...EMPTY,
        ...p,
        target_keywords: Array.isArray(p.target_keywords) ? p.target_keywords : [],
        product_slugs: Array.isArray(p.product_slugs) ? p.product_slugs : [],
        related_slugs: Array.isArray(p.related_slugs) ? p.related_slugs : [],
        faq_schema: Array.isArray(p.faq_schema) ? p.faq_schema : [],
        cluster: p.cluster ?? "",
        meta_title: p.meta_title ?? "",
        hero_image_url: p.hero_image_url ?? "",
        og_image: p.og_image ?? "",
        author_slug: p.author_slug ?? "pet-and-angels-team",
      });
    }
    setLoading(false);
  }, [id, isNew]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!page.slug || !page.h1 || !page.meta_description || !page.body_html) {
      setMessage("slug, h1, meta_description, and body_html are required");
      return;
    }
    setSaving(true);
    setMessage(null);
    const row = {
      template: page.template,
      slug: page.slug.trim().toLowerCase(),
      h1: page.h1,
      meta_title: page.meta_title || null,
      meta_description: page.meta_description,
      body_html: page.body_html,
      hero_image_url: page.hero_image_url || null,
      og_image: page.og_image || null,
      author_slug: page.author_slug || null,
      target_keywords: page.target_keywords,
      product_slugs: page.product_slugs,
      faq_schema: page.faq_schema,
      cluster: page.cluster || null,
      related_slugs: page.related_slugs,
      status: page.status,
      published_at:
        page.status === "published" && !page.published_at
          ? new Date().toISOString()
          : page.published_at,
    };

    if (isNew) {
      const { data, error } = await supabase.from("seo_pages").insert(row).select("id").single();
      setSaving(false);
      if (error) { setMessage(`Save failed: ${error.message}`); return; }
      router.replace(`/admin/seo-pages/${data.id}`);
    } else {
      const { error } = await supabase.from("seo_pages").update(row).eq("id", id);
      setSaving(false);
      if (error) { setMessage(`Save failed: ${error.message}`); return; }
      setMessage("Saved");
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function remove() {
    if (!confirm("Delete this page permanently? This cannot be undone.")) return;
    setDeleting(true);
    const { error } = await supabase.from("seo_pages").delete().eq("id", id);
    setDeleting(false);
    if (error) { setMessage(`Delete failed: ${error.message}`); return; }
    router.replace("/admin/seo-pages");
  }

  if (!loaded || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }
  if (!hasPermission("settings:write")) {
    return <div className="p-8 text-center text-muted">You don&apos;t have permission to edit SEO pages.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <Link href="/admin/seo-pages" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} /> All SEO pages
        </Link>
        {!isNew && page.status === "published" && (
          <a
            href={`/c/${page.template}/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent"
          >
            <ExternalLink size={12} /> View live
          </a>
        )}
      </div>

      <h1 className="text-2xl font-bold text-foreground mb-1">
        {isNew ? "New SEO landing page" : "Edit SEO landing page"}
      </h1>
      <p className="text-sm text-muted mb-6">
        URL preview: <code className="font-mono">/c/{page.template}/{page.slug || "your-slug"}</code>
      </p>

      {message && (
        <div className={`rounded-lg px-4 py-2 text-sm mb-4 ${message === "Saved" ? "bg-moss-50 border border-moss-200 text-moss-800" : "bg-clay-50 border border-clay-200 text-clay-800"}`}>
          {message}
        </div>
      )}

      <div className="space-y-6">
        {/* Core */}
        <Card title="Core">
          <Row>
            <Field label="Template">
              <select value={page.template} onChange={(e) => setPage({ ...page, template: e.target.value })} className="input">
                {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Slug *">
              <input
                type="text"
                value={page.slug}
                onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-") })}
                placeholder="best-automatic-cat-feeders"
                className="input font-mono"
              />
            </Field>
            <Field label="Status">
              <select value={page.status} onChange={(e) => setPage({ ...page, status: e.target.value as Page["status"] })} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </Row>
          <Field label="H1 (page title for humans) *">
            <input type="text" value={page.h1} onChange={(e) => setPage({ ...page, h1: e.target.value })} placeholder="The 8 Best Automatic Cat Feeders for Picky Eaters (2026)" className="input" />
          </Field>
          <Row>
            <Field label="Meta title (≤60 chars)">
              <input type="text" value={page.meta_title} onChange={(e) => setPage({ ...page, meta_title: e.target.value })} maxLength={70} className="input" />
              <p className="text-[10px] text-muted mt-0.5">{page.meta_title.length}/60 — empty falls back to H1</p>
            </Field>
            <Field label="Cluster (topic group)">
              <input type="text" value={page.cluster} onChange={(e) => setPage({ ...page, cluster: e.target.value })} placeholder="Cat Feeding" className="input" />
            </Field>
          </Row>
          <Field label="Meta description (≤155 chars) *">
            <textarea
              value={page.meta_description}
              onChange={(e) => setPage({ ...page, meta_description: e.target.value })}
              maxLength={170}
              rows={2}
              className="input"
            />
            <p className="text-[10px] text-muted mt-0.5">{page.meta_description.length}/155</p>
          </Field>
        </Card>

        {/* Author + images */}
        <Card title="Byline & images">
          <Row>
            <Field label="Author (E-E-A-T byline)">
              <select value={page.author_slug} onChange={(e) => setPage({ ...page, author_slug: e.target.value })} className="input">
                <option value="">— No byline —</option>
                {authors.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
              </select>
            </Field>
            <Field label="Hero image URL">
              <input type="url" value={page.hero_image_url} onChange={(e) => setPage({ ...page, hero_image_url: e.target.value })} placeholder="https://…" className="input" />
            </Field>
            <Field label="OG image URL (social)">
              <input type="url" value={page.og_image} onChange={(e) => setPage({ ...page, og_image: e.target.value })} placeholder="https://… (1200×630)" className="input" />
            </Field>
          </Row>
        </Card>

        {/* Body */}
        <Card title="Body content (HTML)">
          <p className="text-xs text-muted mb-2">Write semantic HTML. Use &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;a&gt;, &lt;img&gt;. Tailwind <code>prose</code> styling is applied.</p>
          <textarea
            value={page.body_html}
            onChange={(e) => setPage({ ...page, body_html: e.target.value })}
            rows={20}
            className="input font-mono text-xs"
          />
        </Card>

        {/* Features sidebar */}
        <Card title="Featured products (sidebar order)">
          <p className="text-xs text-muted mb-2">One product slug per line. The order here is the order in the sidebar (#1, #2, …).</p>
          <textarea
            value={page.product_slugs.join("\n")}
            onChange={(e) => setPage({ ...page, product_slugs: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            rows={5}
            className="input font-mono text-xs"
            placeholder="intelligent-automatic-cat-litter-box&#10;automatic-pet-ball-launcher"
          />
        </Card>

        {/* FAQ */}
        <Card title="FAQs (renders to page + JSON-LD FAQPage schema)">
          <div className="space-y-2 mb-3">
            {page.faq_schema.map((f, i) => (
              <div key={i} className="bg-sand-50 border border-border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-muted">Q{i + 1}</span>
                  <button
                    onClick={() => setPage({ ...page, faq_schema: page.faq_schema.filter((_, j) => j !== i) })}
                    className="text-clay-600 hover:text-clay-700"
                    aria-label="Remove FAQ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={f.question}
                  onChange={(e) => {
                    const next = [...page.faq_schema];
                    next[i] = { ...next[i], question: e.target.value };
                    setPage({ ...page, faq_schema: next });
                  }}
                  placeholder="Question"
                  className="input"
                />
                <textarea
                  value={f.answer}
                  onChange={(e) => {
                    const next = [...page.faq_schema];
                    next[i] = { ...next[i], answer: e.target.value };
                    setPage({ ...page, faq_schema: next });
                  }}
                  placeholder="Answer"
                  rows={2}
                  className="input"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setPage({ ...page, faq_schema: [...page.faq_schema, { question: "", answer: "" }] })}
            className="inline-flex items-center gap-1 text-sm text-accent"
          >
            <Plus size={14} /> Add FAQ
          </button>
        </Card>

        {/* SEO meta */}
        <Card title="SEO meta">
          <Field label="Target keywords (one per line — for internal tracking, not rendered)">
            <textarea
              value={page.target_keywords.join("\n")}
              onChange={(e) => setPage({ ...page, target_keywords: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={3}
              className="input"
            />
          </Field>
          <Field label="Related page slugs (internal links — same template, one slug per line)">
            <textarea
              value={page.related_slugs.join("\n")}
              onChange={(e) => setPage({ ...page, related_slugs: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              rows={3}
              className="input font-mono text-xs"
            />
          </Field>
        </Card>

        {/* Save */}
        <div className="flex items-center justify-between gap-3 sticky bottom-0 bg-background border-t border-border py-4 -mx-4 lg:-mx-8 px-4 lg:px-8 z-10">
          {!isNew ? (
            <button
              onClick={remove}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 text-sm text-clay-700 hover:text-clay-800 font-medium disabled:opacity-60"
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Delete page
            </button>
          ) : <span />}
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-1.5 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {isNew ? "Create page" : "Save changes"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: var(--accent, #4f46e5);
        }
      `}</style>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h2 className="font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
