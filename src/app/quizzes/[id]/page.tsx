import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ClipboardCheck, Lightbulb, ListOrdered, ShieldCheck, Timer } from "lucide-react";
import { getQuizFull, sanitizeQuiz } from "@/content/quiz-bank";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const quiz = getQuizFull(id);
  return quiz ? { title: quiz.title } : {};
}

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = getQuizFull(id);
  if (!quiz) notFound();

  // تعقيم: تُرسل الأسئلة فقط — بلا إجابات ولا شروح
  const safe = sanitizeQuiz(quiz);

  return (
    <div className="container-x py-14">
      <Reveal>
        <div className="mx-auto mb-10 max-w-3xl">
          <Link href="/quizzes" className="flex w-fit items-center gap-1.5 text-[12.5px] font-bold text-[var(--color-mist)] transition-colors hover:text-[#8ceeff]">
            <ArrowRight className="h-4 w-4" />
            كل الاختبارات
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="eyebrow">
              <ClipboardCheck className="h-4 w-4" />
              {quiz.curricular ? "اختبار منهجي" : "اختبار تعريفي"}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--color-mist)]">
              <ListOrdered className="h-3.5 w-3.5" />
              {quiz.questions.length} أسئلة
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--color-mist)]">
              <Timer className="h-3.5 w-3.5" />
              نحو {quiz.durationMin} دقائق
            </span>
          </div>
          <h1 className="mt-4 text-[30px] font-black text-white md:text-[38px]">{quiz.title}</h1>
          <p className="mt-3 text-[14.5px] leading-8 text-[var(--color-mist)]">{quiz.description}</p>
          <div className="mt-5 flex flex-wrap gap-3 text-[12px] font-bold">
            <span className="flex items-center gap-2 rounded-xl border border-[rgba(60,224,244,0.25)] bg-[rgba(60,224,244,0.05)] px-3.5 py-2 text-[#bdeaf3]">
              <ShieldCheck className="h-4 w-4 text-[var(--color-phys)]" />
              تُقبل الإجابات المكتملة دون عرض درجة الاختبار
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-[rgba(255,176,58,0.25)] bg-[rgba(255,176,58,0.05)] px-3.5 py-2 text-[#ffe4b8]">
              <Lightbulb className="h-4 w-4 text-[var(--color-chem)]" />
              لا تُحفظ المحاولة حالياً؛ الحلول التفصيلية في منطقة المعلم
            </span>
          </div>
        </div>
      </Reveal>

      <QuizRunner quiz={safe} />
    </div>
  );
}
