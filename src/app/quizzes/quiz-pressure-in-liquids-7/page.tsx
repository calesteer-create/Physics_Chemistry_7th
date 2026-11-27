import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardCheck, ListOrdered, ShieldCheck, Timer } from "lucide-react";
import { PressureInLiquidsQuizRunner } from "@/components/quiz/PressureInLiquidsQuizRunner";
import { sanitizePressureInLiquidsQuiz } from "@/content/pressure-in-liquids-quiz";

export const metadata: Metadata = {
  title: "اختبار الدرس الثاني — الضغط في السوائل",
  description: "اختبار مستقل من عشرة أسئلة بثلاثة مستويات، منها ترتيب تفاعلي، بتصحيح محلي وتفسيرات بعد التسليم فقط.",
};

export default function PressureInLiquidsQuizPage() {
  // صفحة الخادم ترسل الأسئلة العامة فقط؛ لا مفاتيح ولا تفسيرات في الحمولة الأولى.
  const quiz = sanitizePressureInLiquidsQuiz();
  return (
    <main className="container-x py-14">
      <Link href="/quizzes" className="mb-6 flex w-fit items-center gap-1.5 text-[12.5px] font-bold text-[var(--color-mist)] transition-colors hover:text-[#8ceeff]">
        <ArrowRight className="h-4 w-4" />
        كل الاختبارات
      </Link>
      <div className="mx-auto mb-9 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="eyebrow"><ClipboardCheck className="h-4 w-4" />اختبار منهجي مستقل</span>
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--color-mist)]">
            <ListOrdered className="h-3.5 w-3.5" />{quiz.questions.length} أسئلة
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] px-3 py-1.5 text-[11.5px] font-bold text-[var(--color-mist)]">
            <Timer className="h-3.5 w-3.5" />نحو {quiz.durationMin} دقيقة
          </span>
        </div>
        <h1 className="mt-4 text-[30px] font-black leading-tight text-white md:text-[38px]">{quiz.title}</h1>
        <p className="mt-3 text-[14.5px] leading-8 text-[var(--color-mist)]">{quiz.description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-[12px] font-bold">
          <span className="flex items-center gap-2 rounded-xl border border-[rgba(60,224,244,0.25)] bg-[rgba(60,224,244,0.05)] px-3.5 py-2 text-[#bdeaf3]">
            <ShieldCheck className="h-4 w-4 text-[var(--color-phys)]" />
            تصحيح محلي بلا خادم أو قاعدة بيانات
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-[rgba(255,176,58,0.25)] bg-[rgba(255,176,58,0.05)] px-3.5 py-2 text-[#ffe4b8]">
            التفسيرات بعد التسليم فقط
          </span>
        </div>
      </div>
      <PressureInLiquidsQuizRunner quiz={quiz} />
    </main>
  );
}
