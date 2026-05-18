"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { FileText, Plus, Loader2, ExternalLink, Search } from "lucide-react";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { supabase } from "@/lib/supabase/client";

interface Page {
  id: string;
  template: string;
  slug: string;
  h1: string;
  meta_description: string;
  cluster: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  updated_at: string;
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

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-bark-100 text-bark-700",
  published: "bg-moss-100 text-moss-800",
  archived: "bg-clay-100 text-clay-700",
};

export default function AdminSEOPagesIndex() {
  const { hasPermission, loaded } = useStaffPermissions();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("all");
  const [template, setTemplate] = useState<string>("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("seo_pages")
      .select("id, template, slug, h1, meta_description, cluster, status, published_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (status !== "all") query = query.eq("status", status);
    if (template !== "all") query = query.eq("template", template);
    const { data } = await query;
    setPages((data ?? []) as Page[]);
    setLoading(false);
  }, [status, template]);

  useEffect(() => { load(); }, [load]);

  const filtered = q.trim()
    ? pages.filter((p) => p.h1.toLowerCase().includes(q.toLowerCase()) || p.slug.toLowerCase().includes(q.toLowerCase()))
    : pages;

  if (!loaded || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  if (!hasPermission("settings:read")) {
    return <div className="p-8 text-center text-muted">You don&apos;t have permission to view this page.</div>;
  }

  const canEdit = hasPermission("settings:write");

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FileText className="text-accent" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">SEO landing pages</h1>
            <p className="text-sm text-muted mt-0.5">Programmatic content for organic search.</p>
          </div>
        </div>
        {canEdit && (
          <Link
            href="/admin/seo-pages/new"
            className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-full text-sm font-medium"
          >
            <Plus size={14} /> New page
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by title or slug…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-full bg-white"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-full bg-white">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select value={template} onChange={(e) => setTemplate(e.target.value)} className="px-3 py-2 text-sm border border-border rounded-full bg-white">
          <option value="all">All templates</option>
          {TEMPLATES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="mx-auto text-muted/50 mb-2" />
            <p className="text-sm text-muted">No SEO pages yet.</p>
            {canEdit && (
              <Link href="/admin/seo-pages/new" className="inline-flex items-center gap-1 text-sm text-accent mt-3">
                <Plus size={14} /> Create your first page
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium">Title</th>
                <th className="text-left px-4 py-2 font-medium">Template</th>
                <th className="text-left px-4 py-2 font-medium">Cluster</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Updated</th>
                <th className="text-right px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.h1}</p>
                    <p className="font-mono text-[11px] text-muted">/c/{p.template}/{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{TEMPLATES.find((t) => t.value === p.template)?.label ?? p.template}</td>
                  <td className="px-4 py-3 text-muted">{p.cluster ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{new Date(p.updated_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {p.status === "published" && (
                        <a
                          href={`/c/${p.template}/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted hover:text-foreground"
                          title="View live"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {canEdit && (
                        <Link href={`/admin/seo-pages/${p.id}`} className="text-accent text-xs font-medium hover:underline">
                          Edit
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
