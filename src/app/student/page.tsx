import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import {
  Award,
  BadgeCheck,
  BookOpenCheck,
  Flame,
  History,
  Lightbulb,
  NotebookPen,
  Route,
  Sparkles,
  TrendingUp,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { getDb } from "@/db";
import { lessonProgress, quizAttempts } from "@/db/schema";
import { getCurrentStudent } from "@/lib/student";
import { getLessonMeta, listPublishedLessons } from "@/content/registry";
import { listQuizzesMeta } from "@/content/quiz-bank";
import { Reveal } from "@/components/ui/Reveal";
import { StudentProfileForm } from "@/components/student/ProfileForm";

export const metadata: Metadata = { title: "منطقة الطالب" };
export const dynamic = "force-dynamic";

export default async function StudentPage() {
  const student = await getCurrentStudent();

  /* ---------- حالة عدم التسجيل ---------- */
  if (!student) {
    return (
      <div className="container-x py-20">
        <Reveal>
          <div className="mx-auto max-w-xl text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.08)]">
              <UserRoundPlus className="h-8 w-8 text-[var(--color-phys)]" />
            </span>
            <h1 className="mt-6 text-[30px] font-black text-white md:text-[38px]">منطقة الطالب</h1>
            <p className="mt-4 text-[14.5px] leading-8 text-[var(--color-mist)]">
              أنشئ ملفك الشخصي باسمك فقط — بلا كلمات مرور ولا تعقيد — لتحفظ تقدمك في الدروس
              ونتائج اختباراتك، وتتابع رحلتك من مكان ما توقفت.
            </p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <StudentProfileForm />
        </Reveal>
        <Reveal delay={200}>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-3">
            {[
              { icon: TrendingUp, t: "نسبة تقدم محفوظة", d: "مراحل كل درس تُحفَظ تلقائيًا أثناء تنقلك" },
              { icon: History, t: "سجل المحاولات", d: "كل محاولة اختبار بنتيجتها وتاريخها" },
              { icon: Lightbulb, t: "توصيات حقيقية", d: "اقتراحات مراجعة مبنية على نتائجك الفعلية" },
            ].map((c) => (
              <div key={c.t} className="card p-5 text-center">
                <c.icon className="mx-auto h-6 w-6 text-[var(--color-chem)]" />
                <h3 className="mt-3 text-[14px] font-black text-white">{c.t}</h3>
                <p className="mt-1.5 text-[12px] font-bold leading-6 text-[var(--color-mist)]">{c.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    );
  }

  /* ---------- بيانات الطالب ---------- */
  const lessons = listPublishedLessons();
  const [progressRows, attemptRows] = await Promise.all([
    getDb().select().from(lessonProgress).where(eq(lessonProgress.studentId, student.id)),
    getDb().select().from(quizAttempts).where(eq(quizAttempts.studentId, student.id)).orderBy(desc(quizAttempts.createdAt)).limit(20),
  ]);

  const quizMeta = listQuizzesMeta();
  const bestByQuiz = new Map<string, { score: number; total: number }>();
  for (const a of attemptRows) {
    const prev = bestByQuiz.get(a.quizId);
    const pctA = a.score / a.total;
    const pctP = prev ? prev.score / prev.total : -1;
    if (!prev || pctA > pctP) bestByQuiz.set(a.quizId, { score: a.score, total: a.total });
  }

  const lessonsDone = progressRows.filter((p) => p.notebookViewed).length;
  const overallPct = lessons.length
    ? Math.round(progressRows.reduce((acc, p) => acc + Math.min(100, ((p.stageIndex + 1) / 9) * 100), 0) / lessons.length)
    : 0;
  const points = Array.from(bestByQuiz.values()).reduce((acc, b) => acc + Math.round((b.score / b.total) * 100), 0);

  const badges = [
    { icon: Sparkles, label: "الانطلاقة", ok: true, hint: "أنشأت ملفك الشخصي" },
    { icon: Flame, label: "المثابر", ok: attemptRows.length >= 3, hint: "ثلاث محاولات اختبار" },
    { icon: Award, label: "المتقن", ok: Array.from(bestByQuiz.values()).some((b) => b.score === b.total), hint: "علامة كاملة في اختبار" },
    { icon: NotebookPen, label: "صاحب الدفتر", ok: progressRows.some((p) => p.notebookViewed), hint: "وصلت إلى دفتر الطالب" },
  ];

  const recommendations: { text: string; href: string; cta: string }[] = [];
  for (const [quizId, best] of bestByQuiz) {
    const pct = best.score / best.total;
    const meta = quizMeta.find((q) => q.id === quizId);
    if (pct < 0.8 && meta?.lessonSlug) {
      recommendations.push({
        text: `أفضل نتيجة لك في «${meta.title}» هي ${Math.round(pct * 100)}٪. يُنصح بإعادة دراسة الدرس ثم إعادة المحاولة.`,
        href: `/lessons/${meta.lessonSlug}`,
        cta: "راجع الدرس",
      });
    }
  }
  for (const l of lessons) {
    const p = progressRows.find((r) => r.lessonSlug === l.slug);
    if (!p) {
      recommendations.push({ text: `لم تبدأ «${l.title}» بعد.`, href: `/lessons/${l.slug}`, cta: "ابدأ الآن" });
    } else if (!p.notebookViewed) {
      recommendations.push({
        text: `في «${l.title}» وصلت إلى المرحلة ${p.stageIndex + 1} من 9 — أكمل حتى دفتر الطالب ودوّنه يدويًا.`,
        href: `/lessons/${l.slug}`,
        cta: "أكمل الدرس",
      });
    }
  }

  return (
    <div className="container-x py-14">
      {/* الترويسة */}
      <Reveal>
        <div className="card relative overflow-hidden p-8">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.08)]">
                <UserRound className="h-7 w-7 text-[var(--color-phys)]" />
              </span>
              <div>
                <span className="text-[12px] font-bold text-[var(--color-mist)]">أهلًا بك مجددًا</span>
                <h1 className="text-[26px] font-black text-white md:text-[32px]">{student.name}</h1>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-[24px] font-black text-[#8ceeff]" dir="ltr">{points}</div>
                <div className="text-[11px] font-bold text-[var(--color-mist)]">نقطة</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-black text-[#ffd9a0]" dir="ltr">{attemptRows.length}</div>
                <div className="text-[11px] font-bold text-[var(--color-mist)]">محاولة اختبار</div>
              </div>
              <div className="text-center">
                <div className="text-[24px] font-black text-[#f4ddab]" dir="ltr">{overallPct}%</div>
                <div className="text-[11px] font-bold text-[var(--color-mist)]">تقدم عام</div>
              </div>
            </div>
          </div>
          <div className="relative mt-6">
            <div className="bar">
              <span style={{ width: `${overallPct}%` }} />
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          {/* الدروس والتقدم */}
          <Reveal delay={80}>
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-black text-white">
                <Route className="h-5 w-5 text-[var(--color-phys)]" />
                دروسك وتقدمك
              </h2>
              <div className="mt-5 space-y-3">
                {lessons.map((l) => {
                  const p = progressRows.find((r) => r.lessonSlug === l.slug);
                  const pct = p ? Math.round(((p.stageIndex + 1) / 9) * 100) : 0;
                  return (
                    <Link
                      key={l.slug}
                      href={`/lessons/${l.slug}`}
                      className="flex items-center gap-4 rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.4)] px-5 py-4 transition-colors hover:border-[rgba(60,224,244,0.35)]"
                    >
                      <BookOpenCheck className={`h-5.5 w-5.5 shrink-0 ${p?.notebookViewed ? "text-[#4ade80]" : "text-[var(--color-phys)]"}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[14px] font-black text-white">{l.title}</span>
                          <span className="text-[12px] font-black text-[var(--color-mist)]" dir="ltr">{pct}%</span>
                        </div>
                        <div className="bar mt-2">
                          <span style={{ width: `${pct}%` }} />
                        </div>
                        <span className="mt-1.5 block text-[11.5px] font-bold text-[var(--color-dim)]">
                          {p ? (p.notebookViewed ? "اكتمل — وصلت إلى دفتر الطالب" : `المرحلة ${p.stageIndex + 1} من 9 — أكمل من حيث توقفت`) : "لم يبدأ بعد"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* سجل المحاولات */}
          <Reveal delay={120}>
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-black text-white">
                <History className="h-5 w-5 text-[var(--color-chem)]" />
                سجل محاولات الاختبارات
              </h2>
              {attemptRows.length === 0 ? (
                <p className="mt-4 rounded-xl border border-dashed border-[var(--color-line2)] px-4 py-6 text-center text-[13px] font-bold text-[var(--color-dim)]">
                  لا محاولات بعد — أنجز اختبار الدرس التعريفي لتبدأ سجلك
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--color-line)]">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>الاختبار</th>
                        <th>النتيجة</th>
                        <th>النسبة</th>
                        <th>التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attemptRows.map((a) => {
                        const meta = quizMeta.find((q) => q.id === a.quizId);
                        const pct = Math.round((a.score / a.total) * 100);
                        return (
                          <tr key={a.id}>
                            <td className="font-bold">{meta?.title ?? a.quizId}</td>
                            <td dir="ltr" className="text-center font-black">{a.score}/{a.total}</td>
                            <td>
                              <span className={`font-black ${pct >= 80 ? "text-[#4ade80]" : pct >= 60 ? "text-[#ffd9a0]" : "text-[#f87171]"}`} dir="ltr">
                                {pct}%
                              </span>
                            </td>
                            <td className="text-[12.5px] text-[var(--color-mist)]" dir="ltr">
                              {new Date(a.createdAt).toLocaleDateString("ar-SY", { year: "numeric", month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <div className="space-y-8">
          {/* الشارات */}
          <Reveal delay={100}>
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-black text-white">
                <Award className="h-5 w-5 text-[var(--color-gold)]" />
                شاراتك
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.label}
                    className={`rounded-2xl border p-4 text-center transition-all ${
                      b.ok
                        ? "border-[rgba(230,192,122,0.45)] bg-[rgba(230,192,122,0.07)]"
                        : "border-[var(--color-line)] opacity-40 grayscale"
                    }`}
                  >
                    <b.icon className={`mx-auto h-7 w-7 ${b.ok ? "text-[var(--color-gold)]" : "text-[var(--color-dim)]"}`} />
                    <div className="mt-2 text-[13px] font-black text-white">{b.label}</div>
                    <div className="mt-1 text-[10.5px] font-bold text-[var(--color-mist)]">{b.hint}</div>
                    {b.ok && <BadgeCheck className="mx-auto mt-1.5 h-4 w-4 text-[#4ade80]" />}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* التوصيات */}
          <Reveal delay={140}>
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-[17px] font-black text-white">
                <Lightbulb className="h-5 w-5 text-[var(--color-chem)]" />
                توصيات مبنية على نتائجك
              </h2>
              {recommendations.length === 0 ? (
                <p className="mt-4 rounded-xl bg-[rgba(74,222,128,0.06)] px-4 py-4 text-[13px] font-bold leading-7 text-[#b8f5cf]">
                  ممتاز — أنجزت كل المتاح حاليًا. عند وصول الدروس المنهجية ستجد خطة متابعتك هنا.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {recommendations.map((r, i) => (
                    <li key={i} className="rounded-xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.4)] p-4">
                      <p className="text-[13px] font-bold leading-7 text-[var(--color-mist)]">{r.text}</p>
                      <Link href={r.href} className="mt-2 inline-flex items-center gap-2 text-[12.5px] font-black text-[var(--color-phys)] hover:text-[#8ceeff]">
                        {r.cta}
                        <span>←</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
