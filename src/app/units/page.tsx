import Link from "next/link";
import type { Metadata } from "next";
import { BookMarked, ChevronLeft, FlaskConical, Flame, Hourglass, Lock, PlayCircle, Route, Sparkles, Zap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { listPublishedLessons, units } from "@/content/registry";

export const metadata: Metadata = { title: "الوحدات الدراسية" };

const UNIT_ACCENTS = [
  { bg: "from-[rgba(60,224,244,0.12)] to-[rgba(60,224,244,0.03)]", border: "border-[rgba(60,224,244,0.35)]", text: "text-[#8ceeff]", icon: Zap, badge: "bg-[rgba(60,224,244,0.14)] text-[#8ceeff] border-[rgba(60,224,244,0.3)]" },
  { bg: "from-[rgba(255,176,58,0.12)] to-[rgba(255,176,58,0.03)]", border: "border-[rgba(255,176,58,0.35)]", text: "text-[#ffd9a0]", icon: FlaskConical, badge: "bg-[rgba(255,176,58,0.14)] text-[#ffd9a0] border-[rgba(255,176,58,0.3)]" },
  { bg: "from-[rgba(248,113,113,0.12)] to-[rgba(248,113,113,0.03)]", border: "border-[rgba(248,113,113,0.35)]", text: "text-[#fca5a5]", icon: Flame, badge: "bg-[rgba(248,113,113,0.14)] text-[#fca5a5] border-[rgba(248,113,113,0.3)]" },
  { bg: "from-[rgba(143,131,255,0.12)] to-[rgba(143,131,255,0.03)]", border: "border-[rgba(143,131,255,0.35)]", text: "text-[#cfc7ff]", icon: Sparkles, badge: "bg-[rgba(143,131,255,0.14)] text-[#cfc7ff] border-[rgba(143,131,255,0.3)]" },
];

export default function UnitsPage() {
  const orientationLessons = listPublishedLessons().filter((l) => !l.curricular);

  return (
    <div className="container-x py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="eyebrow">
            <Route className="h-4 w-4" />
            خريطة المنهاج
          </span>
          <h1 className="mt-5 text-[34px] font-black text-white md:text-[44px]">الوحدات الدراسية</h1>
          <p className="mt-4 text-[15px] leading-9 text-[var(--color-mist)]">
            أربع وحدات تغطي منهاج الفيزياء والكيمياء للصف السابع. الدروس تُبنى درسًا بعد درس من صور الكتاب — كل درس منشور تستطيع فتحه فورًا.
          </p>
        </div>
      </Reveal>

      {/* الدرس التعريفي */}
      {orientationLessons.length > 0 && (
        <Reveal delay={80}>
          <div className="mt-10">
            <h2 className="flex items-center gap-2 text-[16px] font-black text-[var(--color-mist)]">
              <PlayCircle className="h-4.5 w-4.5 text-[var(--color-phys)]" />
              قبل المنهاج — ابدأ من هنا
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {orientationLessons.map((l) => (
                <Link key={l.slug} href={`/lessons/${l.slug}`} className="card card-hover group block p-6">
                  <span className="rounded-full bg-[rgba(143,131,255,0.12)] px-3 py-1 text-[11px] font-black text-[#cfc7ff] border border-[rgba(143,131,255,0.3)]">{l.number}</span>
                  <h3 className="mt-3 text-[18px] font-black text-white group-hover:text-[#8ceeff] transition-colors">{l.title}</h3>
                  <p className="mt-1.5 text-[12.5px] font-bold leading-7 text-[var(--color-mist)]">{l.subtitle}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-[12.5px] font-black text-[var(--color-phys)]">ادخل الدرس <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" /></span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* الوحدات المنهجية */}
      <div className="mt-14 space-y-8">
        {units.map((unit, ui) => {
          const accent = UNIT_ACCENTS[ui % UNIT_ACCENTS.length];
          const Icon = accent.icon;
          const publishedCount = unit.lessons.filter((l) => l.status === "published").length;
          const totalCount = unit.lessons.length;

          return (
            <Reveal key={unit.slug} delay={ui * 80}>
              <div className={`card overflow-hidden ${accent.border}`}>
                {/* رأس الوحدة */}
                <div className={`bg-gradient-to-l ${accent.bg} px-7 py-6`}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className={`grid h-14 w-14 place-items-center rounded-2xl border ${accent.border} bg-[rgba(6,14,30,0.4)]`}>
                        <Icon className={`h-7 w-7 ${accent.text}`} />
                      </span>
                      <div>
                        <span className="text-[11.5px] font-black text-[var(--color-dim)]">الوحدة {unit.order}</span>
                        <h2 className={`text-[24px] font-black ${accent.text} md:text-[28px]`}>{unit.title}</h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-black ${accent.badge}`}>
                        {publishedCount}/{totalCount} دروس منشورة
                      </span>
                      {unit.status === "pending" && (
                        <span className="flex items-center gap-1.5 rounded-full border border-[var(--color-line2)] px-3 py-1.5 text-[11px] font-bold text-[var(--color-dim)]">
                          <Hourglass className="h-3.5 w-3.5" />
                          قيد الإعداد
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 max-w-2xl text-[13.5px] font-bold leading-8 text-[var(--color-mist)]">{unit.description}</p>
                </div>

                {/* قائمة الدروس */}
                <div className="divide-y divide-[var(--color-line)]">
                  {unit.lessons.map((lesson, li) => {
                    const open = lesson.status === "published";
                    return open ? (
                      <Link
                        key={lesson.slug}
                        href={`/lessons/${lesson.slug}`}
                        className="group flex items-center gap-4 px-7 py-4 transition-colors hover:bg-[rgba(148,178,220,0.04)]"
                      >
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${accent.border} bg-[rgba(6,14,30,0.3)] text-[12px] font-black ${accent.text}`}>
                          {li + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-[15px] font-black text-white transition-colors group-hover:text-[#8ceeff]">{lesson.title}</h3>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[10.5px] font-black ${accent.badge}`}>
                          <PlayCircle className="mr-1 inline h-3 w-3" />
                          متاح
                        </span>
                        <ChevronLeft className="h-4 w-4 text-[var(--color-dim)] transition-transform group-hover:-translate-x-1" />
                      </Link>
                    ) : (
                      <div key={lesson.slug} className="flex items-center gap-4 px-7 py-4 opacity-55">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.3)] text-[12px] font-black text-[var(--color-dim)]">
                          {li + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-[15px] font-black text-[var(--color-mist)]">{lesson.title}</h3>
                        </div>
                        <span className="flex items-center gap-1.5 rounded-full border border-dashed border-[var(--color-line2)] px-3 py-1 text-[10.5px] font-bold text-[var(--color-dim)]">
                          <Lock className="h-3 w-3" />
                          بانتظار صور الكتاب
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
