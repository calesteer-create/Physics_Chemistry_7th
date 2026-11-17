import type { Metadata } from "next";
import { ClipboardCheck, KeyRound, ListOrdered, ShieldCheck } from "lucide-react";
import { getQuizFull } from "@/content/quiz-bank";
import { RichText } from "@/components/content/RichText";
import { Reveal } from "@/components/ui/Reveal";
import { LogoutButton } from "@/components/teacher/LogoutButton";

export const metadata: Metadata = { title: "منطقة المعلم" };
export const dynamic = "force-dynamic";

const LETTERS = ["أ", "ب", "ج", "د", "هـ"];

export default function TeacherPage() {
  // محمي عبر middleware + تحقق جلسة في الخادم — لا يصل إليه الطالب
  const quizzes = ["quiz-orientation", "quiz-motion-1", "quiz-force-2", "quiz-one-support-3"].map(getQuizFull).filter(Boolean);

  return (
    <div className="container-x py-14">
      <Reveal>
        <div className="card flex flex-col items-start justify-between gap-5 border-[rgba(230,192,122,0.3)] p-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <span className="grid h-13 w-13 place-items-center rounded-2xl bg-gradient-to-br from-[#eecf95] to-[#d3a24a] p-3">
              <ShieldCheck className="h-7 w-7 text-[#251a05]" />
            </span>
            <div>
              <h1 className="text-[26px] font-black text-white md:text-[30px]">منطقة المعلم</h1>
              <p className="mt-1 text-[13px] font-bold text-[var(--color-mist)]">
                الحلول التفصيلية ومفاتيح الإجابة — جلسة نشطة محمية بالخادم
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </Reveal>

      {/* مفاتيح الاختبارات */}
      <Reveal delay={80}>
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-[19px] font-black text-white">
            <KeyRound className="h-5 w-5 text-[var(--color-gold)]" />
            مفاتيح الإجابة والحلول التفصيلية
          </h2>
          <p className="mt-2 text-[13px] font-bold text-[var(--color-mist)]">
            كل سؤال مع إجابته النموذجية وشرح طريقة الحل. تُصنَّف الحلول حسب الدرس والاختبار.
          </p>
        </div>
      </Reveal>

      <div className="mt-6 space-y-8">
        {quizzes.map((quiz) => {
          if (!quiz) return null;
          return (
            <Reveal key={quiz.id} delay={100}>
              <div className="card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] bg-[rgba(230,192,122,0.05)] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="h-5 w-5 text-[var(--color-gold)]" />
                    <h3 className="text-[16.5px] font-black text-white">{quiz.title}</h3>
                  </div>
                  <span className="text-[11.5px] font-black text-[var(--color-mist)]">
                    الدرس المرتبط: {quiz.lessonSlug ?? "—"} • {quiz.questions.length} أسئلة
                  </span>
                </div>
                <div className="divide-y divide-[var(--color-line)]">
                  {quiz.questions.map((q, qi) => {
                    const ans = quiz.answers.find((a) => a.id === q.id);
                    const note = quiz.teacherNotes[qi];
                    let correctLabel = "—";
                    if (ans?.type === "mcq" && q.type === "mcq") {
                      correctLabel = `${LETTERS[ans.correct]}) ${q.options[ans.correct].map((s) => ("t" in s ? s.t : "")).join("")}`;
                    } else if (ans?.type === "tf") {
                      correctLabel = ans.correct ? "صح" : "خطأ";
                    } else if (ans?.type === "fill") {
                      correctLabel = ans.accepted.join(" / ");
                    }
                    return (
                      <div key={q.id} className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(230,192,122,0.12)] text-[12px] font-black text-[var(--color-gold)]">
                            س{qi + 1}
                          </span>
                          <p className="flex-1 text-[14px] font-extrabold leading-8 text-white">
                            <RichText rich={q.prompt} />
                          </p>
                          <span className="rounded-lg bg-[rgba(74,222,128,0.1)] px-3 py-1.5 text-[12px] font-black text-[#b8f5cf]">
                            {correctLabel}
                          </span>
                        </div>
                        {note && (
                          <div className="mt-3 mr-11 rounded-xl border-r-2 border-[rgba(230,192,122,0.5)] bg-[rgba(6,14,30,0.45)] px-4 py-3">
                            <span className="mb-1 flex items-center gap-2 text-[11px] font-black text-[var(--color-gold)]">
                              <ListOrdered className="h-3.5 w-3.5" />
                              شرح الحل التعليمي ({note.ref})
                            </span>
                            <p className="text-[13px] font-bold leading-7 text-[var(--color-mist)]">
                              <RichText rich={note.detail} />
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      {/* أسئلة الكتاب المنهجية */}
      <Reveal delay={140}>
        <div className="card mt-10 border-dashed p-8 text-center">
          <h3 className="text-[17px] font-black text-[var(--color-mist)]">حلول أسئلة الكتاب المدرسي وأنشطته</h3>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] font-bold leading-8 text-[var(--color-dim)]">
            تُضاف هنا حلول أسئلة كل درس منهجي فور ورود صور صفحاته: خطوات الحل بالترتيب، القوانين
            المستخدمة وسبب اختيارها، التعويضات والتحويلات، والأخطاء الشائعة المتوقعة — مصنّفة حسب
            الوحدة والدرس ورقم الصفحة ورقم السؤال ومصدره. أي إجابة غير موثّقة تُعلَّم بـ«بحاجة إلى
            مراجعة» بدل اختراع الحل.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
