"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowLeftRight, Check, ChevronDown, Equal, Ruler, Scale, Timer } from "lucide-react";
import { TeX, unitTex } from "@/components/math/TeX";

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

/**
 * قائمة اختيار مخصّصة تحلّ محلّ `<select>` الأصلي:
 * - رمز كل وحدة يُعرض بـ KaTeX داخل القائمة نفسها (لا نصًّا عاديًا).
 * - متوافقة مع لوحة المفاتيح وإمكانية الوصول: `combobox`/`listbox` بـ ARIA،
 *   تنقّل بالأسهم/Home/End، اختيار بـ Enter/Space، إغلاق بـ Escape/Tab،
 *   إغلاق بالنقر خارجًا، و`aria-activedescendant` مع بقاء التركيز على الزر.
 * - متجاوبة: لوحة بنفس عرض الزر، بحدّ أقصى للتمرير، وصفوف لمس كبيرة.
 */
function UnitSelect({
  label,
  units,
  value,
  onChange,
  focusClass,
}: {
  label: string;
  units: Record<string, { label: string; factor: number }>;
  value: string;
  onChange: (k: string) => void;
  focusClass: string;
}) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const keys = Object.keys(units);
  const nameOf = (k: string) => units[k].label.split("—")[1]?.trim() ?? units[k].label;

  // إغلاق عند النقر خارج القائمة
  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  // إبقاء الخيار النشط مرئيًا أثناء التنقّل بلوحة المفاتيح
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}::${activeIdx}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeIdx, listId]);

  function openList() {
    setActiveIdx(Math.max(0, keys.indexOf(value)));
    setOpen(true);
  }
  function choose(k: string | undefined) {
    if (!k) return;
    onChange(k);
    setOpen(false);
  }
  function onKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % keys.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + keys.length) % keys.length);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIdx(keys.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(keys[activeIdx]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        dir="ltr"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}::${activeIdx}` : undefined}
        aria-label={label}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-[var(--color-line2)] bg-[rgba(6,14,30,0.7)] px-4 py-3 text-[14px] font-black text-white outline-none transition-colors ${focusClass}`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <TeX>{unitTex(value)}</TeX>
          <span className="truncate text-[12px] font-bold text-[var(--color-mist)]">{nameOf(value)}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-60 overflow-y-auto rounded-xl border border-[var(--color-line2)] bg-[#0b1830] py-1 shadow-2xl"
        >
          {keys.map((k, i) => (
            <li
              key={k}
              id={`${listId}::${i}`}
              role="option"
              aria-selected={k === value}
              onMouseEnter={() => setActiveIdx(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(k)}
              className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-[13px] font-black transition-colors ${
                i === activeIdx
                  ? "bg-[rgba(60,224,244,0.14)] text-[#8ceeff]"
                  : "text-[var(--color-mist)] hover:bg-[rgba(148,178,220,0.07)]"
              }`}
            >
              <span dir="ltr" className="flex items-center gap-2">
                <TeX>{unitTex(k)}</TeX>
                <span className="text-[12px] font-bold">{nameOf(k)}</span>
              </span>
              {k === value && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
          <div className="block">
            <span className="mb-2 block text-[12px] font-black text-[var(--color-mist)]">من وحدة</span>
            <UnitSelect
              label="من وحدة"
              units={units}
              value={from}
              onChange={setFrom}
              focusClass="focus:border-[rgba(60,224,244,0.6)]"
            />
            <span dir="ltr" className="mt-1.5 block text-center text-[12px] font-black text-[#8ceeff]">
              <TeX>{unitTex(from)}</TeX>
            </span>
          </div>
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
          <div className="block">
            <span className="mb-2 block text-[12px] font-black text-[var(--color-mist)]">إلى وحدة</span>
            <UnitSelect
              label="إلى وحدة"
              units={units}
              value={to}
              onChange={setTo}
              focusClass="focus:border-[rgba(255,176,58,0.6)]"
            />
            <span dir="ltr" className="mt-1.5 block text-center text-[12px] font-black text-[#8ceeff]">
              <TeX>{unitTex(to)}</TeX>
            </span>
          </div>
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
