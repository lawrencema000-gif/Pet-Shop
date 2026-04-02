"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

interface QuestionRow {
  id: string;
  body: string;
  status: "pending" | "published" | "rejected";
  answer_count: number;
  created_at: string;
  product_name: string;
  user_name: string | null;
}



const PAGE_SIZE = 20;

export default function AdminQAPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  // Expanded row state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    action: "published" | "rejected";
  } | null>(null);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("questions")
      .select(
        "id, body, status, answer_count, created_at, product:products(name), user:profiles(full_name)",
        { count: "exact" }
      );

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setQuestions(
      (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        body: r.body as string,
        status: r.status as "pending" | "published" | "rejected",
        answer_count: r.answer_count as number,
        created_at: r.created_at as string,
        product_name: (r.product as Record<string, string>)?.name ?? "Unknown",
        user_name: (r.user as Record<string, string>)?.full_name ?? null,
      }))
    );
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  function toggleExpand(questionId: string) {
    setExpandedId(expandedId === questionId ? null : questionId);
  }

  async function handleStatusChange() {
    if (!confirmAction) return;
    const { id, action } = confirmAction;
    const { error } = await supabase
      .from("questions")
      .update({ status: action })
      .eq("id", id);
    if (error) {
      console.error("Status update failed:", error.message);
      return;
    }
    await logAdminAction(
      action === "published" ? "approve_question" : "reject_question",
      "question",
      id
    );
    setConfirmAction(null);
    fetchQuestions();
  }



  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle size={10} /> Published
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-sale bg-sale/10 px-2 py-0.5 rounded-full">
            <XCircle size={10} /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Pending
          </span>
        );
    }
  };

  const columns: Column<QuestionRow>[] = [
    {
      key: "body",
      label: t("admin.qa.questionLabel", "Question"),
      render: (row) => (
        <div className="max-w-[350px]">
          <p className="text-sm text-foreground truncate">{row.body}</p>
          <p className="text-xs text-muted mt-0.5">
            {row.user_name ?? "Anonymous"} &middot;{" "}
            {new Date(row.created_at).toLocaleDateString()}
          </p>
        </div>
      ),
    },
    {
      key: "product_name",
      label: t("admin.qa.productLabel", "Product"),
      render: (row) => (
        <span className="text-sm text-muted">{row.product_name}</span>
      ),
    },
    {
      key: "status",
      label: t("admin.qa.statusLabel", "Status"),
      render: (row) => statusBadge(row.status),
    },
    {
      key: "answer_count",
      label: t("admin.qa.answersLabel", "Answers"),
      render: (row) => (
        <span className="text-sm text-muted">{row.answer_count ?? 0}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-40",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === "pending" && (
            <>
              <button
                onClick={() =>
                  setConfirmAction({ id: row.id, action: "published" })
                }
                className="p-1.5 hover:bg-success/10 rounded text-success"
                title="Approve"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() =>
                  setConfirmAction({ id: row.id, action: "rejected" })
                }
                className="p-1.5 hover:bg-sale/10 rounded text-sale"
                title="Reject"
              >
                <XCircle size={14} />
              </button>
            </>
          )}
          {row.status === "rejected" && (
            <button
              onClick={() =>
                setConfirmAction({ id: row.id, action: "published" })
              }
              className="p-1.5 hover:bg-success/10 rounded text-success"
              title="Approve"
            >
              <CheckCircle size={14} />
            </button>
          )}
          {row.status === "published" && (
            <button
              onClick={() =>
                setConfirmAction({ id: row.id, action: "rejected" })
              }
              className="p-1.5 hover:bg-sale/10 rounded text-sale"
              title="Reject"
            >
              <XCircle size={14} />
            </button>
          )}
          <button
            onClick={() => toggleExpand(row.id)}
            className="p-1.5 hover:bg-surface rounded text-muted"
            title="Toggle answers"
          >
            {expandedId === row.id ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        </div>
      ),
    },
  ];

  if (loaded && !isSuperAdmin && !hasPermission("qa:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">
          {t("admin.qa.accessRestricted", "Access Restricted")}
        </h2>
        <p className="text-sm text-muted mt-1">
          {t("admin.qa.noPermission", "You don't have permission to manage Q&A.")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("admin.qa.title", "Questions & Answers")}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t("admin.qa.totalQuestions", { count: total, defaultValue: `${total} questions` })}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          <option value="">{t("admin.qa.allStatuses", "All Statuses")}</option>
          <option value="pending">{t("admin.qa.pending", "Pending")}</option>
          <option value="published">{t("admin.qa.published", "Published")}</option>
          <option value="rejected">{t("admin.qa.rejected", "Rejected")}</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={questions}
        loading={loading}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        emptyTitle={t("admin.qa.noQuestionsFound", "No questions found")}
      />

      <ConfirmDialog
        isOpen={!!confirmAction}
        title={
          confirmAction?.action === "published"
            ? t("admin.qa.approveQuestion", "Approve Question")
            : t("admin.qa.rejectQuestion", "Reject Question")
        }
        message={
          confirmAction?.action === "published"
            ? t(
                "admin.qa.approveMessage",
                "This question will be visible to all customers."
              )
            : t(
                "admin.qa.rejectMessage",
                "This question will be hidden from customers."
              )
        }
        confirmLabel={
          confirmAction?.action === "published"
            ? t("admin.qa.approve", "Approve")
            : t("admin.qa.reject", "Reject")
        }
        variant={confirmAction?.action === "published" ? "danger" : "danger"}
        onConfirm={handleStatusChange}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
