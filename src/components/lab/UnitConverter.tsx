"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Equal, Ruler, Scale, Timer } from "lucide-react";
import { AutoTex, TeX, unitTex } from "@/components/math/TeX";

/**
 * محوّل الوحدات — أداة تعليمية عامة (غير منهجية) للتدريب على التحويلات
 * الشائعة: الطول والكتلة والزمن. تُستخدم في المختبر التفاعلي.
 */

type Cat = "length" | "mass" | "time";

const CATS: Record<
  Cat,
  { label: string; icon: typeof Ruler; base: string; units: Record<string, { label: string; factor: number }> }
> = {
  length: {
    label: "الطول",
    icon: Ruler,
    base: "m",
    units: {
      km: { label: "km — كيلومتر", factor: 1000 },
      m: { label: "m — متر", factor: 1 },
      cm: { label: "cm — سنتيمتر", factor: 0.01 },
      mm: { label: "mm — مليمتر", factor: 0.001 },
    },
  },
  mass: {
    label: "الكتلة",
    icon: Scale,
    base: "g",
    units: {
      kg: { label: "kg — كيلوغرام", factor: 1000 },
      g: { label: "g — غرام", factor: 1 },
    },
  },
  time: {
    label: "الزمن",
    icon: Timer,
    base: "s",
    units: {
      h: { label: "h — ساعة", factor: 3600 },
      min: { label: "min — دقيقة", factor: 60 },
      s: { label: "s — ثانية", factor: 1 },
    },
  },
};

function format(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "—";
  if (n !== 0 && (Math.abs(n) >= 1e9 || Math.abs(n) < 1e-6)) return n.toExponential(4);
  const rounded = Math.round(n * 1e6) / 1e6;
  return String(rounded);
}

export function UnitConverter() {
  const [cat, setCat] = useState<Cat>("length");
  const [from, setFrom] = useState("km");
  const [to, setTo] = useState("m");
  const [value, setValue] = useState("2.5");

  const units = CATS[cat].units;

  const result = useMemo(() => {
    const v = parseFloat(value.replace(",", "."));
    if (isNaN(v) || !units[from] || !units[to]) return null;
    return v * units[from].factor / units[to].factor;
  }, [value, from, to, units]);

  function switchCat(c: Cat) {
    setCat(c);
    const keys = Object.keys(CATS[c].units);
    setFrom(keys[0]);
    setTo(keys[1] ?? keys[0]);
  }

  const CatIcon = CATS[cat].icon;

  return (
    <div className="card relative overflow-hidden p-7">
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-[17px] font-black text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.09)]">
              <CatIcon className="h-5 w-5 text-[var(--color-phys)]" />
            </span>
            محوّل الوحدات التعليمي
          </h3>
          <span className="badge-extra">أداة تفاعلية</span>
        </div>

        {/* نوع التحويل */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(Object.keys(CATS) as Cat[]).map((c) => {
            const I = CATS[c].icon;
            return (
              <button
                key={c}
                onClick={() => switchCat(c)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-black transition-all ${
                  cat === c
                    ? "bg-[rgba(60,224,244,0.14)] text-[#8ceeff] shadow-[inset_0_0_0_1px_rgba(60,224,244,0.4)]"
                    : "text-[var(--color-mist)] hover:bg-[rgba(148,178,220,0.07)]"
                }`}
              >
                <I className="h-4 w-4" />
                {CATS[c].label}
              </button>
            );
          })}
        </div>

        {/* المدخلات */}
        <div className="mt-6 grid items-end gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <label className="block">
            <span className="mb-2 block text-[12px] font-black text-[var(--color-mist)]">القيمة</span>
            <input
              dir="ltr"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3 text-center text-[18px] font-black text-[#bfe9ff] outline-none transition-colors focus:border-[rgba(60,224,244,0.6)]"
              placeholder="أدخل قيمة"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[12px] font-black text-[var(--color-mist)]">من وحدة</span>
            <select
              dir="ltr"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3 text-[14px] font-black text-white outline-none focus:border-[rgba(60,224,244,0.6)]"
            >
              {Object.entries(units).map(([k, u]) => (
                <option key={k} value={k} className="bg-[#0b1830]">
                  <AutoTex text={u.label} />
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              const f = from;
              setFrom(to);
              setTo(f);
            }}
            className="grid h-12 w-12 place-items-center justify-self-center rounded-xl border border-[rgba(255,176,58,0.35)] bg-[rgba(255,176,58,0.08)] text-[var(--color-chem)] transition-transform hover:scale-110"
            aria-label="تبديل الوحدتين"
            title="تبديل الوحدتين"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
          <label className="block">
            <span className="mb-2 block text-[12px] font-black text-[var(--color-mist)]">إلى وحدة</span>
            <select
              dir="ltr"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3 text-[14px] font-black text-white outline-none focus:border-[rgba(255,176,58,0.6)]"
            >
              {Object.entries(units).map(([k, u]) => (
                <option key={k} value={k} className="bg-[#0b1830]">
                  <AutoTex text={u.label} />
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl border border-[rgba(60,224,244,0.3)] bg-[rgba(60,224,244,0.07)] px-4 py-3 text-center">
            <span className="mb-1 flex items-center justify-center gap-1 text-[11px] font-black text-[var(--color-mist)]">
              <Equal className="h-3.5 w-3.5" />
              النتيجة
            </span>
            <span dir="ltr" className="block text-[19px] font-black text-[#8ceeff]">
              {result === null ? "—" : <TeX>{`${format(result)}\\,${unitTex(to)}`}</TeX>}
            </span>
          </div>
        </div>

        <p className="mt-5 rounded-xl bg-[rgba(6,14,30,0.55)] px-4 py-3 text-[12.5px] font-bold leading-6 text-[var(--color-mist)]">
          الفكرة: نحوّل القيمة إلى الوحدة الأساسية أولًا ثم إلى الوحدة المطلوبة. مثال:
          <span dir="ltr" className="mx-1 font-black text-[#bfe9ff]"><TeX>{"1\\,\\text{km} = 1000\\,\\text{m}"}</TeX></span>،
          <span dir="ltr" className="mx-1 font-black text-[#bfe9ff]"><TeX>{"1\\,\\text{kg} = 1000\\,\\text{g}"}</TeX></span>،
          <span dir="ltr" className="mx-1 font-black text-[#bfe9ff]"><TeX>{"1\\,\\text{min} = 60\\,\\text{s}"}</TeX></span>.
        </p>
      </div>
    </div>
  );
}
