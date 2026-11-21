import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardCheck, Hourglass, ListOrdered, ShieldCheck, Timer } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { listQuizzesMeta } from "@/content/quiz-bank";

export const metadata: Metadata = { title: "الاختبارات" };

export default function QuizzesPage() {
  const quizzes = [...listQuizzesMeta(), {id:"quiz-simple-machines-5", title:"اختبار الدرس الخامس — الآلات البسيطة", curricular:true, durationMin:20, count:10, lessonSlug:"simple-machines"}, {id:"quiz-unit-1", title:"اختبار الوحدة الأولى الشامل — الحركة والتحريك", curricular:true, durationMin:50, count:30, lessonSlug:null}];

  return (
    <div className="container-x py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="eyebrow">
            <ClipboardCheck className="h-4 w-4" />
            التقييم والتغذية الراجعة
          </span>
          <h1 className="mt-5 text-[34px] font-black text-white md:text-[44px]">منطقة الاختبارات</h1>
          <p className="mt-4 text-[15px] leading-9 text-[var(--color-mist)]">
            لكل درس اختباره الخاص؛ وعند اكتمال وحدة كاملة يُضاف اختبار شامل لها. أسئلة متنوعة —
            اختيار من متعدد، صح وخطأ، إكمال. الاختبارات الجديدة تُصحّح محلياً مع تفسير بعد التسليم؛ أما الاختبارات السابقة فتبقى بآلية التسليم الحالية.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {quizzes.map((q, i) => (
          <Reveal key={q.id} delay={i * 70}>
            <Link href={`/quizzes/${q.id}`} className="card card-hover group flex h-full flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.09)] px-3.5 py-1 text-[11.5px] font-black text-[#8ceeff]">
                  {q.curricular ? "اختبار منهجي" : "اختبار تعريفي"}
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-dim)]">
                  <Timer className="h-3.5 w-3.5" />
                  {q.durationMin} دقائق
                </span>
              </div>
              <h3 className="mt-4 text-[20px] font-black text-white transition-colors group-hover:text-[#8ceeff]">
                {q.title}
              </h3>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="flex items-center gap-2 text-[12.5px] font-bold text-[var(--color-mist)]">
                  <ListOrdered className="h-4 w-4" />
                  {q.count} أسئلة متنوعة
                </span>
                <span className="inline-flex items-center gap-2 text-[13px] font-black text-[var(--color-phys)]">
                  ابدأ الاختبار
                  <span className="transition-transform group-hover:-translate-x-1">←</span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}

        <Reveal delay={140}>
          <div className="card flex h-full flex-col items-start justify-center border-dashed p-7 opacity-75">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(255,176,58,0.09)]">
              <Hourglass className="h-5.5 w-5.5 text-[var(--color-chem)]" />
            </span>
            <h3 className="mt-4 text-[17px] font-black text-[var(--color-mist)]">اختبارات الدروس المنهجية</h3>
            <p className="mt-2 text-[13px] font-bold leading-7 text-[var(--color-dim)]">
              تُنشأ تلقائيًا مع كل درس يرد من صور الكتاب، واختبار الوحدة الشامل يُبنى بعد اكتمال
              دروسها فقط.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal delay={200}>
        <div className="mt-10 flex items-center gap-3 rounded-2xl border border-[rgba(230,192,122,0.3)] bg-[rgba(230,192,122,0.05)] px-5 py-4">
          <ShieldCheck className="h-5.5 w-5.5 shrink-0 text-[var(--color-gold)]" />
          <p className="text-[13px] font-bold leading-7 text-[var(--color-mist)]">
            مفاتيح الإجابة لا تصل إلى متصفحك أصلًا: الأسئلة تُرسل بدون إجابات، والتصحيح يجري في
            الخادم، ولا ترى الحل إلا بعد تسليم الاختبار. الحلول التفصيلية الكاملة محفوظة في منطقة
            المعلم المحمية.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
