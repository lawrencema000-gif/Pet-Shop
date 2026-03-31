"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, ChevronDown, ChevronUp, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { supabase } from "@/lib/supabase/client";

interface Question {
  id: string;
  body: string;
  status: string;
  answer_count: number;
  created_at: string;
  answers: Answer[];
}

interface Answer {
  id: string;
  body: string;
  is_admin_answer: boolean;
  created_at: string;
}

export default function ProductQA({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase
      .from("questions")
      .select("id, body, status, answer_count, created_at")
      .eq("product_id", productId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setQuestions((data || []) as Question[]);
        setLoading(false);
      });
  }, [productId]);

  const loadAnswers = async (questionId: string) => {
    if (expandedId === questionId) {
      setExpandedId(null);
      return;
    }
    const { data } = await supabase
      .from("question_answers")
      .select("id, body, is_admin_answer, created_at")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true });

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId ? { ...q, answers: (data || []) as Answer[] } : q
      )
    );
    setExpandedId(questionId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newQuestion.trim().length < 10) return;
    setSubmitting(true);

    await supabase.from("questions").insert({
      product_id: productId,
      user_id: user.id,
      body: newQuestion.trim(),
    });

    setSubmitting(false);
    setSubmitted(true);
    setNewQuestion("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="mt-16">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={22} className="text-accent" />
        <h2 className="text-xl font-bold text-foreground">
          Questions & Answers
        </h2>
        {questions.length > 0 && (
          <span className="text-sm text-muted">({questions.length})</span>
        )}
      </div>

      {/* Ask a question */}
      {user ? (
        submitted ? (
          <div className="flex items-center gap-2 text-success text-sm mb-6 p-3 bg-success/10 rounded-lg">
            <CheckCircle size={16} />
            Your question has been submitted and will appear after review.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask a question about this product (min 10 characters)..."
                minLength={10}
                className="flex-1 px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:border-accent bg-background"
              />
              <button
                type="submit"
                disabled={submitting || newQuestion.trim().length < 10}
                className="px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium shrink-0"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Ask
              </button>
            </div>
          </form>
        )
      ) : (
        <p className="text-sm text-muted mb-6">
          <a href="/auth/login" className="text-accent hover:underline">Sign in</a> to ask a question.
        </p>
      )}

      {/* Questions list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-muted" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-lg border border-border">
          <MessageCircle size={32} className="mx-auto text-muted/40 mb-2" />
          <p className="text-sm text-muted">No questions yet. Be the first to ask!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => loadAnswers(q.id)}
                className="w-full text-left px-4 py-3 hover:bg-surface-light transition-colors flex items-start gap-3"
              >
                <span className="text-accent font-bold text-sm mt-0.5">Q</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{q.body}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(q.created_at).toLocaleDateString()} &middot; {q.answer_count} {q.answer_count === 1 ? "answer" : "answers"}
                  </p>
                </div>
                {expandedId === q.id ? <ChevronUp size={16} className="text-muted mt-1" /> : <ChevronDown size={16} className="text-muted mt-1" />}
              </button>

              {expandedId === q.id && q.answers && (
                <div className="border-t border-border bg-surface-light/50">
                  {q.answers.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-muted pl-10">No answers yet.</p>
                  ) : (
                    q.answers.map((a) => (
                      <div key={a.id} className="px-4 py-3 border-t border-border first:border-t-0 flex items-start gap-3">
                        <span className="text-success font-bold text-sm mt-0.5">A</span>
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{a.body}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {a.is_admin_answer && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                <ShieldCheck size={10} /> Official
                              </span>
                            )}
                            <span className="text-xs text-muted">
                              {new Date(a.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
