import machineStyles from "@/components/figures/simple-machines.module.css";
import { SimpleMachinesNotebook } from "@/components/lesson/SimpleMachinesNotebook";
import { SimpleMachinesPlayground } from "@/components/lab/SimpleMachinesPlayground";
import { SimpleMachinesBookQuestions } from "@/components/lesson/SimpleMachinesBookQuestions";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  ClipboardCheck,
  Clock3,
  Compass,
  FileText,
  FlaskConical,
  Landmark,
  Lightbulb,
  ListChecks,
  NotebookPen,
  SearchCheck,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { getLesson, listPublishedLessons } from "@/content/registry";
import type { StageId } from "@/content/types";
import { Blocks } from "@/components/lesson/Blocks";
import { oneSupportNotation, presentOneSupportBlock } from "@/components/lesson/one-support-notation";
import { Notebook } from "@/components/lesson/Notebook";
import { LessonShell, type StageNavItem } from "@/components/lesson/LessonShell";
import { ForcePlayground } from "@/components/lab/ForcePlayground";
import { MotionPlayground } from "@/components/lab/MotionPlayground";
import { OneSupportPlayground } from "@/components/lab/OneSupportPlayground";
import { WorkPowerPlayground } from "@/components/lab/WorkPowerPlayground";
import { PressurePlayground } from "@/components/lab/PressurePlayground";
import { UnitConverter } from "@/components/lab/UnitConverter";
import { ForceBookQuestions } from "@/components/lesson/ForceBookQuestions";
import { OneSupportBookQuestions } from "@/components/lesson/OneSupportBookQuestions";
import { WorkPowerBookQuestions } from "@/components/lesson/WorkPowerBookQuestions";
import { PressureBookQuestions } from "@/components/lesson/PressureBookQuestions";
import { PressureInLiquidsNotebook } from "@/components/lesson/PressureInLiquidsNotebook";
import { PressureInLiquidsBookQuestions, PressureInLiquidsExtraExercises } from "@/components/lesson/PressureInLiquidsExercises";
import { LiquidPressureLabs } from "@/components/lab/LiquidPressureLabs";
import { MotionQuizBookQuestions } from "@/components/lesson/BookQuestions";
import { Reveal } from "@/components/ui/Reveal";
import { EngineerMark } from "@/components/brand/EngineerMark";
import { WhatsAppButton } from "@/components/brand/WhatsAppLink";
import { ENGINEER } from "@/lib/site";

const STAGE_META: Record<StageId | "notebook", { title: string; icon: typeof Compass; desc: string }> = {
  warmup: { title: "التهيئة والاستكشاف", icon: Sparkles, desc: "سؤال يوقظ فضولك ويربط الدرس بما تعرفه" },
  concept: { title: "اكتشف المفهوم", icon: Lightbulb, desc: "الفكرة الجديدة وما ورد عنها في الكتاب" },
  explain: { title: "الشرح التفصيلي", icon: FileText, desc: "شرح موسّع متدرّج وأمثلة محلولة" },
  lab: { title: "المختبر التفاعلي", icon: FlaskConical, desc: "جرّب بنفسك ولاحظ النتائج" },
  check: { title: "افهم وتحقق", icon: SearchCheck, desc: "أسئلة سريعة بتغذية راجعة فورية" },
  apply: { title: "طبّق ما تعلمته", icon: Wrench, desc: "تمارين ومواقف تطبيقية" },
  quiz: { title: "اختبر نفسك", icon: ClipboardCheck, desc: "اختبار الدرس وتسجيل النتيجة" },
  review: { title: "مراجعة الدرس", icon: ListChecks, desc: "نظرة منظمة على كل ما تعلمته" },
  notebook: { title: "دفتر الطالب", icon: NotebookPen, desc: "المحتوى الذي تكتبه بيدك في دفترك الورقي" },
};

export function generateStaticParams() {
  return listPublishedLessons().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  return lesson ? { title: lesson.title } : {};
}

function StageHeader({ meta, idx, notebook }: { meta: (typeof STAGE_META)[keyof typeof STAGE_META]; idx: number; notebook?: boolean }) {
  const Icon = meta.icon;
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${
        notebook
          ? "bg-gradient-to-br from-[#eecf95] to-[#d3a24a] shadow-[0_12px_34px_-12px_rgba(230,192,122,0.55)]"
          : "border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.08)]"
      }`}>
        <Icon className={`h-6.5 w-6.5 ${notebook ? "text-[#251a05]" : "text-[var(--color-phys)]"}`} />
      </span>
      <div>
        <span className={`text-[11.5px] font-black tracking-wide ${notebook ? "text-[var(--color-gold)]" : "text-[var(--color-dim)]"}`}>
          المرحلة {idx + 1} من 9{notebook ? " — المرحلة الأخيرة" : ""}
        </span>
        <h2 className={`text-[24px] font-black md:text-[28px] ${notebook ? "text-[#f4ddab]" : "text-white"}`}>{meta.title}</h2>
        <p className="mt-0.5 text-[12.5px] font-bold text-[var(--color-mist)]">{meta.desc}</p>
      </div>
    </div>
  );
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const stageOrder: (StageId | "notebook")[] = [
    "warmup", "concept", "explain", "lab", "check", "apply", "quiz", "review", "notebook",
  ];

  const isOneSupport = lesson.slug === "forces-on-one-support";
  const navItems: StageNavItem[] = stageOrder.map((id, i) => ({
    id,
    title: STAGE_META[id].title,
    index: i,
    notebook: id === "notebook",
  }));

  // بناء مصفوفة العناصر — كل عنصر يمثّل محتوى تبويب واحد
  const stageElements = stageOrder.map((stageId, idx) => {
    if (stageId === "notebook") {
      return (
        <section key="notebook">
          <StageHeader meta={STAGE_META.notebook} idx={idx} notebook />
          {lesson.slug === "pressure-in-liquids" ? <PressureInLiquidsNotebook/> : lesson.slug === "simple-machines" ? <SimpleMachinesNotebook/> : <Notebook items={lesson.notebook} lessonTitle={lesson.title} notation={isOneSupport ? oneSupportNotation : undefined} />}
          {/* توقيع المهندس */}
          <div className="card mt-10 flex flex-col items-start justify-between gap-5 border-[rgba(230,192,122,0.3)] p-6 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <EngineerMark size={48} />
              <div>
                <span className="block text-[11px] font-bold text-[var(--color-gold)]">أُعدّت هذه التجربة التعليمية وطُوّرت بعناية</span>
                <span className="block text-[16px] font-black text-[#f4ddab]">{ENGINEER.title} سومر شاهين</span>
              </div>
            </div>
            <WhatsAppButton label="استفسار؟ راسل المهندس" className="!py-2.5 text-[13px]" showNumber={false} />
          </div>
        </section>
      );
    }

    const stage = lesson.stages.find((s) => s.id === stageId);
    if (!stage) {
      return (
        <section key={stageId}>
          <StageHeader meta={STAGE_META[stageId]} idx={idx} />
          <div className="card border-dashed p-8 text-center">
            <p className="text-[14px] font-bold text-[var(--color-dim)]">
              محتوى هذه المرحلة سيُضاف عند اكتمال صور الكتاب لهذا الدرس.
            </p>
          </div>
        </section>
      );
    }

    return (
      <section key={stageId}>
        <StageHeader meta={STAGE_META[stageId]} idx={idx} />
        <Blocks blocks={isOneSupport && stageId !== "lab" && stageId !== "quiz"
          ? stage.blocks.map(presentOneSupportBlock) : stage.blocks} />
        {stageId === "lab" && lesson.labWidget === "unit-converter" && (
          <div className="mt-7">
            <UnitConverter />
          </div>
        )}
        {stageId === "lab" && lesson.labWidget === "motion-lab" && (
          <div className="mt-7">
            <MotionPlayground />
          </div>
        )}
        {stageId === "lab" && lesson.labWidget === "force-lab" && (
          <div className="mt-7">
            <ForcePlayground />
          </div>
        )}
        {stageId === "lab" && lesson.labWidget === "one-support-lab" && (
          <div className="mt-7">
            <OneSupportPlayground />
          </div>
        )}
        {stageId === "lab" && lesson.slug === "simple-machines" && <div className="mt-7"><SimpleMachinesPlayground/></div>}
        {stageId === "quiz" && lesson.slug === "simple-machines" && <div className="mt-7"><SimpleMachinesBookQuestions/></div>}
        {stageId === "lab" && lesson.slug === "work-and-power" && (
          <div className="mt-7">
            <WorkPowerPlayground />
          </div>
        )}
        {stageId === "lab" && lesson.labWidget === "pressure-lab" && (
          <div className="mt-7">
            <PressurePlayground />
          </div>
        )}
        {stageId === "lab" && lesson.slug === "pressure-in-liquids" && (
          <div className="mt-7">
            <LiquidPressureLabs />
          </div>
        )}
        {stageId === "check" && lesson.slug === "pressure-in-liquids" && (
          <div className="mt-7">
            <PressureInLiquidsBookQuestions />
          </div>
        )}
        {stageId === "apply" && lesson.slug === "pressure-in-liquids" && (
          <div className="mt-7">
            <PressureInLiquidsExtraExercises />
          </div>
        )}
        {stageId === "quiz" && lesson.slug === "pressure" && (
          <div className="mt-7">
            <PressureBookQuestions />
          </div>
        )}
        {stageId === "quiz" && lesson.slug === "motion-and-rest" && (
          <div className="mt-7">
            <MotionQuizBookQuestions />
          </div>
        )}
        {stageId === "quiz" && lesson.slug === "force-and-motion" && (
          <div className="mt-7">
            <ForceBookQuestions />
          </div>
        )}
        {stageId === "quiz" && lesson.slug === "forces-on-one-support" && (
          <div className="mt-7">
            <OneSupportBookQuestions />
          </div>
        )}
        {stageId === "quiz" && lesson.slug === "work-and-power" && (
          <div className="mt-7">
            <WorkPowerBookQuestions />
          </div>
        )}
        {stageId === "quiz" && lesson.quizId && (
          <div className="card mt-7 flex flex-col items-start justify-between gap-5 border-[rgba(60,224,244,0.3)] p-7 md:flex-row md:items-center">
            <div>
              <h3 className="text-[18px] font-black text-white">اختبار إلكتروني تفاعلي</h3>
              <p className="mt-1.5 text-[13.5px] font-bold leading-7 text-[var(--color-mist)]">
                بالإضافة لأسئلة الكتاب أعلاه، يمكنك خوض اختبار إلكتروني يُصحَّح تلقائياً.
              </p>
            </div>
            <Link href={`/quizzes/${lesson.quizId}`} className="btn btn-phys shrink-0">
              <ClipboardCheck className="h-5 w-5" />
              ابدأ الاختبار الإلكتروني
            </Link>
          </div>
        )}
      </section>
    );
  });

  return (
    <div className={`container-x py-14 ${lesson.slug === "simple-machines" ? machineStyles.lesson : ""}`}>
      {/* ترويسة الدرس */}
      <Reveal>
        <div className="card relative overflow-hidden p-8 md:p-10">
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/units" className="flex items-center gap-1.5 text-[12.5px] font-bold text-[var(--color-mist)] transition-colors hover:text-[#8ceeff]">
                <ArrowRight className="h-4 w-4" />
                الوحدات الدراسية
              </Link>
              <span className="text-[var(--color-dim)]">/</span>
              <span className="rounded-full border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.09)] px-3.5 py-1 text-[11.5px] font-black text-[#8ceeff]">
                {lesson.number}
              </span>
              {!lesson.curricular && (
                <span className="rounded-full border border-[rgba(143,131,255,0.35)] bg-[rgba(143,131,255,0.09)] px-3.5 py-1 text-[11.5px] font-black text-[#cfc7ff]">
                  محتوى تعريفي — غير منهجي
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-dim)]">
                <Clock3 className="h-3.5 w-3.5" />
                {lesson.duration}
              </span>
            </div>
            <h1 className="mt-5 text-[32px] font-black leading-tight text-white md:text-[42px]">{lesson.title}</h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-8 text-[var(--color-mist)]">{lesson.subtitle}</p>

            <div className="mt-7 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.5)] p-5">
                <h2 className="flex items-center gap-2 text-[13.5px] font-black text-[#8ceeff]">
                  <Target className="h-4.5 w-4.5" />
                  أهداف الدرس
                </h2>
                <ul className="mt-3 space-y-2">
                  {lesson.objectives.map((o) => (
                    <li key={o} className="flex items-start gap-2 text-[13px] font-bold leading-7 text-[var(--color-mist)]">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-phys)]" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.5)] p-5">
                <h2 className="flex items-center gap-2 text-[13.5px] font-black text-[var(--color-chem)]">
                  <Landmark className="h-4.5 w-4.5" />
                  مصادر المحتوى
                </h2>
                <ul className="mt-3 space-y-2">
                  {lesson.sources.map((s) => (
                    <li key={s.label} className="text-[13px] font-bold leading-7 text-[var(--color-mist)]">
                      {s.label}
                      {s.pages ? <span className="text-[var(--color-dim)]"> — صفحات {s.pages}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* المراحل (نظام تبويبات) */}
      <div className="mt-14">
        <LessonShell stages={navItems}>
          {stageElements}
        </LessonShell>
      </div>
    </div>
  );
}
