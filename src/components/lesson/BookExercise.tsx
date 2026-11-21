"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, ChevronUp, Eye, EyeOff, Lightbulb, AlertTriangle, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import type { Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";

/* ═══════════════ سؤال عام مع حل قابل للإظهار ═══════════════ */
export function BookExercise({
  number,
  title,
  question,
  hint,
  solution,
  color = "phys",
  accent,
  children,
}: {
  number: string;
  title?: string;
  question: Rich;
  hint?: Rich;
  solution: Rich;
  color?: "phys" | "chem" | "vio" | "gold";
  /** لون تجميلي اختياري (hex) يضمن تبايناً كافياً على الخلفية الفاتحة.
   *  عند إهماله يبقى المظهر الافتراضي لكل الدروس الأخرى كما هو تماماً. */
  accent?: string;
  children?: ReactNode;
}) {
  const [showHint, setShowHint] = useState(false);
  const [showSol, setShowSol] = useState(false);

  const palette: Record<string, { accent: string; bg: string; border: string; glow: string }> = {
    phys: { accent: "#00e5ff", bg: "rgba(0,229,255,0.04)", border: "rgba(0,229,255,0.25)", glow: "shadow-[0_0_30px_-10px_rgba(0,229,255,0.3)]" },
    chem: { accent: "#ffab40", bg: "rgba(255,171,64,0.04)", border: "rgba(255,171,64,0.25)", glow: "shadow-[0_0_30px_-10px_rgba(255,171,64,0.3)]" },
    vio:  { accent: "#b388ff", bg: "rgba(179,136,255,0.04)", border: "rgba(179,136,255,0.25)", glow: "shadow-[0_0_30px_-10px_rgba(179,136,255,0.3)]" },
    gold: { accent: "#ffd740", bg: "rgba(255,215,64,0.04)", border: "rgba(255,215,64,0.25)", glow: "shadow-[0_0_30px_-10px_rgba(255,215,64,0.3)]" },
  };
  const base = palette[color];
  const p = accent
    ? { ...base, accent, bg: `${accent}0d`, border: `${accent}55` }
    : base;
  /* عند تمرير accent (الدرس الرابع فقط) نستخدم ألواناً داكنة كافية للتباين
     على الخلفية الفاتحة. بدون accent يبقى كل شيء كما هو تماماً. */
  const hintInk = accent ? "#785618" : "#ffd740";
  const solInk = accent ? "#0f6b52" : "#00e676";

  return (
    <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 ${showSol ? p.glow : ""}`}
         style={{ background: `linear-gradient(135deg, ${p.bg}, transparent)`, border: `1.5px solid ${p.border}` }}>
      {/* الشريط الجانبي الملوّن */}
      <div className="absolute top-0 right-0 bottom-0 w-1.5 rounded-r-full" style={{ background: p.accent }} />

      {/* رأس السؤال */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[16px] font-black"
               style={{ background: `${p.accent}22`, color: p.accent, border: `2px solid ${p.border}` }}>
            {number}
          </div>
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-[11px] font-black tracking-wider uppercase mb-1" style={{ color: p.accent }}>
                {title}
              </h4>
            )}
            <div className="whitespace-pre-line text-[15.5px] font-bold leading-9 text-white"
                 style={accent ? { color: "#1a2438" } : undefined}>
              <RichText rich={question} />
            </div>
          </div>
        </div>

        {children && <div className="mt-4 mr-16">{children}</div>}
      </div>

      {/* أزرار التلميح والحل */}
      <div className="flex items-center gap-2 px-6 py-3" style={{ borderTop: `1px solid ${p.border}` }}>
        {hint && (
          <button onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-[12.5px] font-black transition-all hover:scale-[1.02]"
                  style={accent
                    ? { color: hintInk, background: "rgba(138,90,0,0.07)", border: "1px solid rgba(138,90,0,0.28)" }
                    : { color: "#ffd740", background: "rgba(255,215,64,0.08)", border: "1px solid rgba(255,215,64,0.2)" }}>
            <Lightbulb className="h-4 w-4" />
            {showHint ? "إخفاء التلميح" : "تلميح"}
          </button>
        )}
        <button onClick={() => setShowSol(!showSol)}
                className="flex items-center gap-2 rounded-xl px-5 py-2 text-[12.5px] font-black transition-all hover:scale-[1.02]"
                style={accent
                  ? {
                      color: showSol ? "#ffffff" : solInk,
                      background: showSol ? solInk : "rgba(15,107,82,0.07)",
                      border: `1px solid ${showSol ? solInk : "rgba(15,107,82,0.28)"}`,
                    }
                  : {
                      color: showSol ? "#111" : "#00e676",
                      background: showSol ? "#00e676" : "rgba(0,230,118,0.08)",
                      border: `1px solid ${showSol ? "#00e676" : "rgba(0,230,118,0.25)"}`,
                    }}>
          {showSol ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showSol ? "إخفاء الحل" : "إظهار الحل التفصيلي"}
        </button>
      </div>

      {/* التلميح */}
      {showHint && hint && (
        <div className="mx-6 mb-3 rounded-2xl p-4" style={{ background: "rgba(255,215,64,0.06)", border: "1px solid rgba(255,215,64,0.15)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4" style={{ color: hintInk }} />
            <span className="text-[12px] font-black" style={{ color: hintInk }}>تلميح</span>
          </div>
          <div className="text-[14px] font-bold leading-8 text-[#fff3c4]"
               style={accent ? { color: "#785618" } : undefined}>
            <RichText rich={hint} />
          </div>
        </div>
      )}

      {/* الحل التفصيلي */}
      {showSol && (
        <div className="mx-4 mb-4 rounded-2xl p-5" style={{ background: "rgba(0,230,118,0.05)", border: "1px solid rgba(0,230,118,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5" style={{ color: solInk }} />
            <span className="text-[13px] font-black" style={{ color: solInk }}>الحل التفصيلي</span>
          </div>
          <div className="whitespace-pre-line text-[15px] font-bold leading-10 text-[#c8ffd4]"
               style={accent ? { color: "#12645d" } : undefined}>
            <RichText rich={solution} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ سؤال صح / خطأ تفاعلي ═══════════════ */
export function TrueFalseExercise({
  number,
  statement,
  isTrue,
  correction,
}: {
  number: string;
  statement: Rich;
  isTrue: boolean;
  correction: Rich;
}) {
  const [answered, setAnswered] = useState<boolean | null>(null);
  const isCorrect = answered === isTrue;

  return (
    <div className="relative rounded-2xl overflow-hidden transition-all"
         style={{
           background: answered !== null
             ? isCorrect ? "rgba(0,230,118,0.04)" : "rgba(255,82,82,0.04)"
             : "rgba(179,136,255,0.03)",
           border: `1.5px solid ${answered !== null ? isCorrect ? "rgba(0,230,118,0.3)" : "rgba(255,82,82,0.3)" : "rgba(179,136,255,0.2)"}`,
         }}>
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[13px] font-black"
                style={{ background: "rgba(179,136,255,0.12)", color: "#b388ff", border: "1.5px solid rgba(179,136,255,0.3)" }}>
            {number}
          </span>
          <p className="flex-1 text-[15px] font-bold leading-8 text-white">
            <RichText rich={statement} />
          </p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="flex items-center gap-3">
          {["صح", "خطأ"].map((label, i) => {
            const val = i === 0;
            const selected = answered === val;
            const right = selected && isCorrect;
            const wrong = selected && !isCorrect;
            return (
              <button key={label} onClick={() => { if (answered === null) setAnswered(val); }}
                      disabled={answered !== null}
                      className={`flex-1 rounded-xl py-3 text-[14px] font-black transition-all ${
                        right ? "bg-[rgba(0,230,118,0.2)] text-[#00e676] border-2 border-[rgba(0,230,118,0.5)] scale-[1.02]"
                        : wrong ? "bg-[rgba(255,82,82,0.2)] text-[#ff5252] border-2 border-[rgba(255,82,82,0.5)]"
                        : answered !== null && !selected ? "opacity-40 border border-[var(--color-line)]"
                        : "border-2 border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[rgba(179,136,255,0.4)] hover:text-white"
                      }`}>
                {label === "صح" ? "✓ " : "✗ "}{label}
                {right && <CheckCircle2 className="inline h-4 w-4 mr-2" />}
                {wrong && <XCircle className="inline h-4 w-4 mr-2" />}
              </button>
            );
          })}
        </div>

        {answered !== null && (
          <div className={`mt-4 rounded-2xl p-4 ${isCorrect ? "bg-[rgba(0,230,118,0.06)] border border-[rgba(0,230,118,0.2)]" : "bg-[rgba(255,171,64,0.06)] border border-[rgba(255,171,64,0.2)]"}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect
                ? <><CheckCircle2 className="h-4 w-4 text-[#00e676]" /><span className="text-[12px] font-black text-[#00e676]">أحسنت! إجابتك صحيحة</span></>
                : <><AlertTriangle className="h-4 w-4 text-[#ffab40]" /><span className="text-[12px] font-black text-[#ffab40]">إجابة خاطئة — إليك التصحيح:</span></>
              }
            </div>
            <div className="text-[14px] font-bold leading-9 text-[#d4e3f7]">
              <RichText rich={correction} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
