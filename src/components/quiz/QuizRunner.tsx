"use client";

import { useMemo, useState } from "react";
import { Award, CheckCircle2, ClipboardList, RotateCcw, Send, Timer, XCircle } from "lucide-react";
import type { QuizPublic } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { FigureBlock } from "@/components/figures";

type Answers = Record<string, number | boolean | string | undefined>;

interface FeedbackItem {
  id: string;
  correct: boolean;
}

interface Result {
  score: number;
  total: number;
  feedback: FeedbackItem[];
  saved: boolean;
}

const LETTERS = ["أ", "ب", "ج", "د", "هـ"];

export function QuizRunner({ quiz }: { quiz: QuizPublic }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const answeredCount = useMemo(
    () => quiz.questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length,
    [answers, quiz.questions],
  );
  const complete = answeredCount === quiz.questions.length;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "fail");
      setResult({ score: data.score, total: data.total, feedback: data.feedback, saved: data.saved });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("تعذّر تسليم الاختبار. تحقق من اتصالك وحاول مجددًا.");
    } finally {
      setSubmitting(false);
    }
  }

  function retry() {
    setAnswers({});
    setResult(null);
    setError(null);
  }

  /* ---------- شاشة النتيجة ---------- */
  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    const passed = pct >= 60;
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card relative overflow-hidden p-10 text-center">
          <div className={`absolute inset-x-0 top-0 h-1.5 ${passed ? "bg-gradient-to-l from-[#4ade80] to-[var(--color-phys)]" : "bg-gradient-to-l from-[var(--color-chem)] to-[#f87171]"}`} />
          <Award className={`mx-auto h-14 w-14 ${passed ? "text-[#4ade80]" : "text-[var(--color-chem)]"}`} />
          <h2 className="mt-4 text-[28px] font-black text-white">
            {passed ? "أحسنت! نتيجة رائعة" : "محاولة جيدة — راجع النقاط أدناه"}
          </h2>
          <p className="mt-2 text-[14px] font-bold text-[var(--color-mist)]">
            {result.saved ? "سُجّلت محاولتك في ملفك الشخصي." : "سجّل اسمك في منطقة الطالب لتحفظ نتائجك تلقائيًا."}
          </p>

          <div className="mx-auto mt-8 grid max-w-md grid-cols-3 gap-4">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.5)] p-4">
              <div className="text-[26px] font-black text-[#8ceeff]" dir="ltr">
                {result.score}/{result.total}
              </div>
              <div className="mt-1 text-[11.5px] font-bold text-[var(--color-mist)]">إجابات صحيحة</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.5)] p-4">
              <div className="text-[26px] font-black text-[#ffd9a0]" dir="ltr">
                {pct}%
              </div>
              <div className="mt-1 text-[11.5px] font-bold text-[var(--color-mist)]">النسبة المئوية</div>
            </div>
            <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.5)] p-4">
              <div className="text-[26px] font-black text-[#cfc7ff]" dir="ltr">
                {result.total - result.score}
              </div>
              <div className="mt-1 text-[11.5px] font-bold text-[var(--color-mist)]">تحتاج مراجعة</div>
            </div>
          </div>
        </div>

        {/* التغذية الراجعة */}
        <h3 className="mt-10 flex items-center gap-2 text-[19px] font-black text-white">
          <ClipboardList className="h-5 w-5 text-[var(--color-phys)]" />
          نتيجة كل إجابة
        </h3>
        <div className="mt-5 space-y-4">
          {quiz.questions.map((q, i) => {
            const fb = result.feedback.find((f) => f.id === q.id);
            if (!fb) return null;
            return (
              <div key={q.id} className={`card border-r-4 p-6 ${fb.correct ? "border-r-[#4ade80]" : "border-r-[#f87171]"}`}>
                <div className="flex items-start gap-3">
                  {fb.correct ? (
                    <CheckCircle2 className="mt-1 h-5.5 w-5.5 shrink-0 text-[#4ade80]" />
                  ) : (
                    <XCircle className="mt-1 h-5.5 w-5.5 shrink-0 text-[#f87171]" />
                  )}
                  <div className="flex-1">
                    <p className="text-[14.5px] font-extrabold leading-8 text-white">
                      <span className="ml-2 text-[var(--color-dim)]">س{i + 1}.</span>
                      <RichText rich={q.prompt} />
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button onClick={retry} className="btn btn-ghost">
            <RotateCcw className="h-5 w-5" />
            أعد المحاولة
          </button>
          {quiz.lessonSlug && (
            <a href={`/lessons/${quiz.lessonSlug}`} className="btn btn-phys">
              <RotateCcw className="h-5 w-5" />
              عُد إلى الدرس وراجع
            </a>
          )}
        </div>
      </div>
    );
  }

  /* ---------- شاشة الاختبار ---------- */
  return (
    <div className="mx-auto max-w-3xl pb-32">
      <div className="space-y-6">
        {quiz.questions.map((q, qi) => (
          <div key={q.id} className="card p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[rgba(0,229,255,0.15)] text-[14px] font-black text-[var(--color-phys)] border border-[rgba(0,229,255,0.3)] shadow-neon-phys">
                س{qi + 1}
              </span>
              <div className="flex-1">
                <p className="text-[17px] font-black leading-relaxed text-white">
                  <RichText rich={q.prompt} />
                </p>
                {q.figure && (
                  <div className="mt-4 max-w-lg">
                    <FigureBlock figure={q.figure} />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              {q.type === "mcq" && (
                <div className="grid gap-2.5">
                  {q.options.map((opt, oi) => {
                    const sel = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-right text-[13.5px] font-bold transition-all ${
                          sel
                            ? "border-[rgba(60,224,244,0.55)] bg-[rgba(60,224,244,0.1)] text-[#d9f7ff]"
                            : "border-[var(--color-line2)] text-[var(--color-mist)] hover:bg-[rgba(148,178,220,0.06)] hover:text-white"
                        }`}
                      >
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11.5px] font-black ${sel ? "bg-[rgba(60,224,244,0.25)]" : "bg-[rgba(148,178,220,0.1)]"}`}>
                          {LETTERS[oi]}
                        </span>
                        <RichText rich={opt} />
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "tf" && (
                <div className="flex gap-3">
                  {[
                    { v: true, label: "صح" },
                    { v: false, label: "خطأ" },
                  ].map(({ v, label }) => {
                    const sel = answers[q.id] === v;
                    return (
                      <button
                        key={label}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: v }))}
                        className={`flex-1 rounded-xl border px-4 py-3.5 text-[15px] font-black transition-all ${
                          sel
                            ? "border-[rgba(60,224,244,0.55)] bg-[rgba(60,224,244,0.1)] text-[#d9f7ff]"
                            : "border-[var(--color-line2)] text-[var(--color-mist)] hover:bg-[rgba(148,178,220,0.06)]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {q.type === "fill" && (
                <input
                  type="text"
                  value={(answers[q.id] as string) ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder={q.placeholder ?? "اكتب إجابتك"}
                  className="w-full rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3.5 text-[15px] font-bold text-white outline-none transition-colors placeholder:text-[var(--color-dim)] focus:border-[rgba(60,224,244,0.6)]"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* شريط التسليم */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[rgba(6,12,26,0.88)] backdrop-blur-xl">
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <Timer className="h-5 w-5 text-[var(--color-chem)]" />
            <span className="text-[13px] font-black text-[var(--color-mist)]">
              أجبت عن {answeredCount} من {quiz.questions.length}
            </span>
            <div className="bar hidden w-40 md:block">
              <span style={{ width: `${(answeredCount / quiz.questions.length) * 100}%` }} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {error && <span className="text-[12.5px] font-bold text-[#f87171]">{error}</span>}
            <button onClick={submit} disabled={!complete || submitting} className="btn btn-phys disabled:cursor-not-allowed disabled:opacity-40">
              <Send className="h-4.5 w-4.5" />
              {submitting ? "جارٍ التصحيح…" : "سلّم الاختبار"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
