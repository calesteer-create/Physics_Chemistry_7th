"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, HelpCircle, RotateCcw, XCircle } from "lucide-react";
import type { Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";

export function InlineCheck({ question, options, correct, explain }: { question: Rich; options: ReactNode[]; correct: number; explain: Rich }) {
  const [selected, setSelected] = useState<number | null>(null);
  const letters = ["أ","ب","ج","د","هـ"];
  const revealed = selected !== null;
  const isRight = revealed && selected === correct;

  return (
    <div className="card overflow-hidden border-[rgba(167,139,250,0.2)]">
      <div className="flex items-center gap-2 border-b border-[var(--color-line)] bg-[var(--color-vio-lt)] px-5 py-3">
        <HelpCircle className="h-4.5 w-4.5 text-[var(--color-vio)]" />
        <span className="text-[12.5px] font-black text-[var(--color-vio)]">افهم وتحقق</span>
      </div>
      <div className="p-5">
        <p className="text-[15px] font-extrabold leading-8 text-white"><RichText rich={question} /></p>
        <div className="mt-4 grid gap-2.5">
          {options.map((opt, i) => {
            const state = !revealed ? "idle" : i === correct ? "correct" : i === selected ? "wrong" : "dim";
            return (
              <button key={i} disabled={revealed} onClick={() => setSelected(i)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-right text-[14px] font-bold transition-all ${
                  state === "correct" ? "border-[rgba(52,211,153,0.4)] bg-[var(--color-success-lt)] text-[#6ee7b7]"
                  : state === "wrong" ? "border-[rgba(248,113,113,0.4)] bg-[var(--color-error-lt)] text-[#fca5a5]"
                  : state === "dim" ? "border-[var(--color-line)] text-[var(--color-dim)] opacity-50"
                  : "border-[var(--color-line2)] text-[var(--color-fog)] hover:border-[var(--color-vio)] hover:bg-[var(--color-vio-lt)]"
                }`}>
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[12px] font-black ${
                  state === "correct" ? "bg-[var(--color-success)] text-white"
                  : state === "wrong" ? "bg-[var(--color-error)] text-white"
                  : "bg-[rgba(148,178,220,0.08)] text-[var(--color-mist)]"
                }`}>{letters[i]}</span>
                {opt}
                {state === "correct" && <CheckCircle2 className="mr-auto h-5 w-5" />}
                {state === "wrong" && <XCircle className="mr-auto h-5 w-5" />}
              </button>
            );
          })}
        </div>
        {revealed && (
          <div className={`mt-4 rounded-xl border px-4 py-3.5 text-[14px] font-bold leading-8 ${
            isRight ? "border-[rgba(52,211,153,0.3)] bg-[var(--color-success-lt)] text-[#a7f3d0]"
                    : "border-[rgba(251,191,36,0.3)] bg-[var(--color-gold-lt)] text-[#fde68a]"
          }`}>
            <span className="mb-1 block text-[12px] font-black">{isRight ? "✓ صحيح — لماذا؟" : "✗ الصحيح معلّم بالأخضر:"}</span>
            <RichText rich={explain} />
            <button onClick={() => setSelected(null)} className="mt-3 flex items-center gap-1.5 rounded-lg border border-[var(--color-line2)] px-3 py-1.5 text-[11.5px] font-black text-[var(--color-mist)] hover:text-white">
              <RotateCcw className="h-3.5 w-3.5" />جرّب مرة أخرى
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
