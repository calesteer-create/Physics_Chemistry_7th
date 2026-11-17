"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";

export interface StageNavItem {
  id: string;
  title: string;
  index: number;
  notebook?: boolean;
}

/**
 * هيكل الدرس — نظام تبويبات (Tabs) وليس تمريرًا سرديًا:
 * شريط جانبي بالمراحل + أزرار «السابق / التالي» + حفظ تقدم تلقائي.
 */
export function LessonShell({
  slug,
  stages,
  children,
}: {
  slug: string;
  stages: StageNavItem[];
  /** يجب أن يكون children مصفوفة عناصر بنفس ترتيب stages */
  children: ReactNode;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [maxSeen, setMaxSeen] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSaved = useRef(-1);
  const contentRef = useRef<HTMLDivElement>(null);

  const active = stages[activeIdx] ?? stages[0];
  const childrenArr = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];
    return arr;
  }, [children]);

  const progressPct = useMemo(
    () => Math.round(((maxSeen + 1) / stages.length) * 100),
    [maxSeen, stages.length],
  );

  const go = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(idx, stages.length - 1));
    setActiveIdx(clamped);
    setMaxSeen((m) => Math.max(m, clamped));
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [stages.length]);

  // حفظ التقدم (مهدّد)
  useEffect(() => {
    if (maxSeen === lastSaved.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      lastSaved.current = maxSeen;
      const notebook = stages.find((s) => s.notebook);
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonSlug: slug,
          stageIndex: maxSeen,
          notebookViewed: notebook ? maxSeen >= notebook.index : false,
        }),
      }).catch(() => {});
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [maxSeen, slug, stages]);

  const isFirst = activeIdx === 0;
  const isLast = activeIdx === stages.length - 1;

  return (
    <div ref={contentRef} className="scroll-mt-24">
      <div className="grid items-start gap-8 lg:grid-cols-[272px_minmax(0,1fr)]">
        {/* شريط المراحل الجانبي */}
        <aside className="sticky top-28 hidden lg:block">
          <div className="card p-4">
            <div className="mb-3 px-2">
              <div className="flex items-center justify-between text-[11.5px] font-black text-[var(--color-mist)]">
                <span>مراحل الدرس</span>
                <span dir="ltr">{progressPct}%</span>
              </div>
              <div className="bar mt-2">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <nav className="space-y-1" aria-label="مراحل الدرس">
              {stages.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => go(i)}
                  className={`stage-link w-full text-right ${active.id === s.id ? "active" : ""}`}
                >
                  <span className={`dot ${s.notebook ? "gold" : ""}`}>
                    {s.notebook ? <NotebookPen className="h-3.5 w-3.5" /> : s.index + 1}
                  </span>
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* المحتوى */}
        <div className="min-w-0">
          {/* التبويب النشط */}
          <div key={active.id} className="animate-in fade-in duration-300">
            {childrenArr[activeIdx]}
          </div>

          {/* أزرار التنقل */}
          <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-line)] bg-[rgba(6,14,30,0.4)] px-6 py-5">
            {!isFirst ? (
              <button onClick={() => go(activeIdx - 1)} className="btn btn-ghost !text-[13px]">
                <ArrowRight className="h-4.5 w-4.5" />
                المرحلة السابقة: {stages[activeIdx - 1]?.title}
              </button>
            ) : <span />}
            <span className="hidden text-[12px] font-black text-[var(--color-dim)] md:block">
              {activeIdx + 1} / {stages.length}
            </span>
            {!isLast ? (
              <button onClick={() => go(activeIdx + 1)} className="btn btn-phys !text-[13px]">
                المرحلة التالية: {stages[activeIdx + 1]?.title}
                <ArrowLeft className="h-4.5 w-4.5" />
              </button>
            ) : (
              <span className="rounded-xl bg-gradient-to-l from-[#fbbf24] to-[#d97706] px-5 py-3 text-[13px] font-black text-[#1c1000]">
                أنهيت جميع المراحل ✓
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
            {stages.map((s, i) => (
              <button key={s.id} onClick={() => go(i)}
                className={`rounded-lg px-3 py-2 text-[11.5px] font-black border transition-all ${
                  active.id === s.id
                    ? s.notebook ? "bg-[var(--color-gold)] text-[#1c1000] border-[var(--color-gold)]"
                                 : "bg-[var(--color-phys-lt)] text-[#8ceeff] border-[rgba(60,224,244,0.3)]"
                    : "border-[var(--color-line)] text-[var(--color-mist)] hover:border-[var(--color-phys)]"
                }`}>
                {s.notebook ? "📒" : i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
