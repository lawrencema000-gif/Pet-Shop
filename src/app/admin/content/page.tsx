"use client";

import { FileText, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

export default function AdminContentPage() {
  const { isSuperAdmin, hasPermission, loaded } = useStaffPermissions();

  if (loaded && !isSuperAdmin && !hasPermission("content:read")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={48} className="text-muted mb-4" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to view content management.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Content</h1>
        <p className="text-sm text-muted mt-1">Manage your store&apos;s content</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Blog Posts */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Blog Posts</h2>
              <p className="text-xs text-muted">Manage your blog articles</p>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            Blog posts are currently managed via code in <code className="text-xs bg-surface px-1 py-0.5 rounded">lib/blog-data.ts</code>.
            A database-backed blog editor is planned for a future update.
          </p>
          <Link href="/blog" target="_blank" className="text-sm text-accent hover:underline">
            View Blog →
          </Link>
        </div>

        {/* Guides */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <BookOpen size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Guides</h2>
              <p className="text-xs text-muted">Pet care guides and tutorials</p>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            Guides are managed via <code className="text-xs bg-surface px-1 py-0.5 rounded">lib/guides-data.ts</code>.
            Database-backed guide management coming soon.
          </p>
          <Link href="/guides" target="_blank" className="text-sm text-accent hover:underline">
            View Guides →
          </Link>
        </div>
      </div>

      {/* Extensibility Note */}
      <div className="mt-8 bg-gold-light/50 border border-gold/20 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Extensibility</h3>
        <p className="text-sm text-muted">
          This content management section is designed to be extended. New content types
          (FAQs, landing pages, announcements) can be added by creating new database tables
          and admin pages. Use the Settings → Custom Nav feature to add new admin sections dynamically.
        </p>
      </div>
    </div>
  );
}
