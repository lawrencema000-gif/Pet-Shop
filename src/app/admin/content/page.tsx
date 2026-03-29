"use client";

import { FileText, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

export default function AdminContentPage() {
  const { t } = useTranslation();
  const { isSuperAdmin, hasPermission, loaded } = useStaffPermissions();

  if (loaded && !isSuperAdmin && !hasPermission("content:read")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Shield size={48} className="text-muted mb-4" />
        <h2 className="text-lg font-semibold text-foreground">{t("admin.content.accessRestricted")}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.content.noPermission")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.content.title")}</h1>
        <p className="text-sm text-muted mt-1">{t("admin.content.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Blog Posts */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t("admin.content.blogPosts")}</h2>
              <p className="text-xs text-muted">{t("admin.content.blogDescription")}</p>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            {t("admin.content.blogCodeNote")}
          </p>
          <Link href="/blog" target="_blank" className="text-sm text-accent hover:underline">
            {t("admin.content.viewBlog")}
          </Link>
        </div>

        {/* Guides */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
              <BookOpen size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">{t("admin.content.guides")}</h2>
              <p className="text-xs text-muted">{t("admin.content.guidesDescription")}</p>
            </div>
          </div>
          <p className="text-sm text-muted mb-4">
            {t("admin.content.guidesCodeNote")}
          </p>
          <Link href="/guides" target="_blank" className="text-sm text-accent hover:underline">
            {t("admin.content.viewGuides")}
          </Link>
        </div>
      </div>

      {/* Extensibility Note */}
      <div className="mt-8 bg-gold-light/50 border border-gold/20 rounded-lg p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">{t("admin.content.extensibility")}</h3>
        <p className="text-sm text-muted">
          {t("admin.content.extensibilityDescription")}
        </p>
      </div>
    </div>
  );
}
