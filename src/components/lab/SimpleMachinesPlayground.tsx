"use client";
import { useEffect, useRef, useState } from "react";
import { TeX } from "@/components/math/TeX";
import {
  Arrow,
  InclineDiagram,
  Load,
  MachineScene,
  MathLabel,
  ML,
  PulleyDiagram,
  ScrewDiagram,
  Support,
  WheelDiagram,
} from "@/components/figures/simple-machines-figures";
import {
  inclineState,
  leverState,
  pulleyState,
  screwAdvance,
  wheelState,
} from "@/lib/simple-machines-model";
import styles from "@/components/figures/simple-machines.module.css";
const names = [
  "الرافعة",
  "البكرات",
  "المستوى المائل",
  "البرغي",
  "العجلة والمحور",
];
function Control({
  label,
  value,
  min,
  max,
  step = 1,
  change,
  unit = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  change: (n: number) => void;
  unit?: string;
}) {
  return (
    <label className={styles.control}>
      {label}
      <span dir="ltr">
        <input
          aria-label={`${label} — قيمة`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => {
            if (e.target.value !== "")
              change(Math.max(min, Math.min(max, Number(e.target.value))));
          }}
        />{" "}
        <TeX>{unit}</TeX>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => change(+e.target.value)}
      />
    </label>
  );
}
export function SimpleMachinesPlayground() {
  const [tab, setTab] = useState(0);
  return (
    <div className={styles.scope}>
      <div className={styles.actions} role="group" aria-label="اختر المختبر">
        {names.map((n, i) => (
          <button
            key={n}
            className={`${styles.button} ${tab === i ? styles.selected : ""}`}
            aria-pressed={tab === i}
            onClick={() => setTab(i)}
          >
            {n}
          </button>
        ))}
      </div>
      <Experiment key={tab} tab={tab} />
    </div>
  );
}
function Experiment({ tab }: { tab: number }) {
  const [f1, S1] = useState(100),
    [f2, S2] = useState(200),
    [d1, D1] = useState(6),
    [d2, D2] = useState(3),
    [load, L] = useState(100),
    [mode, M] = useState<"fixed" | "moving" | "combined">("moving"),
    [height, H] = useState(3),
    [length, Len] = useState(6),
    [pitch, Pitch] = useState(10),
    [radius, R] = useState(12),
    [axle, A] = useState(3),
    [effort, E] = useState(20),
    [reduced, Reduced] = useState(false),
    [prediction, P] = useState(""),
    [progress, T] = useState(0),
    [running, Run] = useState(false),
    [revealed, Reveal] = useState(false);
  const progressRef = useRef(0);
  useEffect(() => {
    if (!running) return;
    let handle = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      if (previous === undefined) previous = now;
      const elapsed = Math.min(0.08, (now - previous) / 1000);
      previous = now;
      progressRef.current = Math.min(1, progressRef.current + elapsed / 3);
      T(progressRef.current);
      if (progressRef.current >= 1) {
        Run(false);
        return;
      }
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [running]);
  function reset() {
    Run(false);
    progressRef.current = 0;
    T(0);
    Reveal(false);
    P("");
  }
  function mutate(set: (n: number) => void, n: number) {
    reset();
    set(n);
  }
  const lv = leverState(f1, d1, f2, d2),
    pu = pulleyState(load, 2 * progress, mode),
    inc = inclineState(load, height, length),
    wh = wheelState(radius, axle, effort);
  const c = (
    label: string,
    value: number,
    min: number,
    max: number,
    set: (n: number) => void,
    unit = "",
    step = 1,
  ) => (
    <Control
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      change={(n) => mutate(set, n)}
      unit={unit}
    />
  );
  const question =
    tab === 0
      ? "أي طرف سيهبط، أم ستتزن الرافعة؟"
      : tab === 1
        ? "هل الجهد أقل من المقاومة أم مساوٍ لها في التكوين المختار؟"
        : tab === 2
          ? "ماذا يحدث لقوة الجهد عند زيادة طول المنحدر مع ثبات الارتفاع؟"
          : tab === 3
            ? "أي البرغيين يتقدم أقل في الدورة: المتقارب الأسنان أم المتباعد؟"
            : "ماذا يحدث للفائدة الآلية عند تكبير العجلة مع ثبات المحور؟";
  const options =
    tab === 0
      ? ["الطرف الأيسر", "اتزان", "الطرف الأيمن"]
      : tab === 1
        ? ["أقل من المقاومة", "مساوٍ للمقاومة"]
        : tab === 2
          ? ["تقل", "تبقى نفسها", "تزداد"]
          : tab === 3
            ? ["المتقارب الأسنان", "المتباعد الأسنان"]
            : ["تزداد", "تبقى نفسها", "تنقص"];
  const correct =
    tab === 0
      ? lv.balanced
        ? "اتزان"
        : lv.angle > 0
          ? "الطرف الأيمن"
          : "الطرف الأيسر"
      : tab === 1
        ? pu.strands === 2
          ? "أقل من المقاومة"
          : "مساوٍ للمقاومة"
        : tab === 2
          ? "تقل"
          : tab === 3
            ? "المتقارب الأسنان"
            : "تزداد";
  return (
    <section className={styles.panel} aria-label={`مختبر ${names[tab]}`}>
      <h3 className={styles.heading}>مختبر {names[tab]} — توقّع، جرّب، فسّر</h3>
      <p className={styles.note}>
        {tab === 0
          ? "نهمل وزن الرافعة والاحتكاك. الميل يوضح الطرف الغالب نوعياً، وليس حساباً لتسارع الدوران."
          : tab === 1
            ? "نهمل الاحتكاك ووزن البكرات والحبل، والرفع دون تغير السرعة. عدد الفروع الحاملة في الرسم هو أساس النتيجة، لا عدد البكرات."
            : tab === 2
              ? "نرفع الحمل نفسه إلى الارتفاع نفسه، ونهمل الاحتكاك. الحسابات تشغّل النموذج ولا تضيف قانوناً مطلوباً للحفظ."
              : tab === 3
                ? "مقارنة نوعية لبراغٍ بسيطة: تقارب الأسنان يؤدي إلى تقدم أقل خلال الدورة الواحدة."
                : "الجهد عند حافة العجلة والقوة الناتجة عند المحور، في النموذج المثالي."}
      </p>
      <div className={styles.controls}>
        {tab === 0 ? (
          <>
            {c("القوة اليسرى", f1, 10, 300, S1, "\\mathrm{N}", 10)}
            {c("ذراع القوة اليسرى", d1, 1, 8, D1, "\\mathrm{cm}")}
            {c("القوة اليمنى", f2, 10, 300, S2, "\\mathrm{N}", 10)}
            {c("ذراع القوة اليمنى", d2, 1, 8, D2, "\\mathrm{cm}")}
          </>
        ) : tab === 1 ? (
          <>
            {c("مقاومة الحمل", load, 40, 400, L, "\\mathrm{N}", 20)}
            <label className={styles.control}>
              تكوين البكرات
              <select
                className={styles.button}
                value={mode}
                onChange={(e) => {
                  reset();
                  M(e.target.value as typeof mode);
                }}
              >
                <option value="fixed">ثابتة — فرع حامل واحد</option>
                <option value="moving">متحركة — فرعان حاملان</option>
                <option value="combined">ثابتة ومتحركة — فرعان حاملان</option>
              </select>
            </label>
          </>
        ) : tab === 2 ? (
          <>
            {c("ثقل الحمل", load, 50, 400, L, "\\mathrm{N}", 10)}
            {c(
              "ارتفاع المنصة",
              height,
              1,
              4,
              (n) => {
                H(n);
                if (length <= n) Len(n + 1);
              },
              "\\mathrm{m}",
            )}
            {c("طول المنحدر", length, height + 1, 12, Len, "\\mathrm{m}")}
          </>
        ) : tab === 3 ? (
          c("تباعد الأسنان النسبي", pitch, 6, 18, Pitch)
        ) : (
          <>
            {c(
              "نصف قطر العجلة",
              radius,
              8,
              18,
              (n) => {
                R(n);
                if (axle >= n) A(n - 1);
              },
              "\\mathrm{cm}",
            )}
            {c("نصف قطر المحور", axle, 2, 6, A, "\\mathrm{cm}")}
            {c("قوة الجهد", effort, 10, 100, E, "\\mathrm{N}", 10)}
          </>
        )}
      </div>
      {tab === 0 ? (
        <MachineScene title="رافعة متغيرة القوتين والذراعين">
          <g transform={`rotate(${lv.angle * progress} 160 145)`}>
            <path
              d={`M${160 - d1 * 15} 145H${160 + d2 * 15}`}
              stroke="#7c5f36"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <Load x={160 - d1 * 15} y={172} />
            <Load x={160 + d2 * 15} y={172} />
            <Arrow x1={160 - d1 * 15} y1={147} x2={160 - d1 * 15} y2={202} />
            <Arrow x1={160 + d2 * 15} y1={147} x2={160 + d2 * 15} y2={202} />
          </g>
          <Support x={160} y={153} />
          <MathLabel x={78} y={40} tex={`${f1}\\times${d1}`} />
          <MathLabel x={240} y={40} tex={`${f2}\\times${d2}`} />
          <ML x={160} y={255}>
            يسار ← الارتكاز → يمين
          </ML>
        </MachineScene>
      ) : tab === 1 ? (
        <PulleyDiagram mode={mode} progress={progress} />
      ) : tab === 2 ? (
        <div className={styles.grid}>
          <InclineDiagram height={height} length={length} progress={progress} />
          <MachineScene title="رفع مباشر إلى الارتفاع نفسه">
            <path d="M55 240H270" stroke="#566c7b" strokeWidth="4" />
            <Load x={160} y={215 - progress * 120} />
            <Arrow x1={210} y1={210} x2={210} y2={85} color="#23608f" />
            <ML x={160} y={35}>
              الرفع المباشر
            </ML>
            <MathLabel x={95} y={120} tex={`${load}\\,\\mathrm{N}`} />
          </MachineScene>
        </div>
      ) : tab === 3 ? (
        <div className={styles.grid}>
          <figure>
            <figcaption>البرغي القابل للتحكم</figcaption>
            <ScrewDiagram pitch={pitch} turns={progress} />
          </figure>
          <figure>
            <figcaption>مرجع للمقارنة: أسنان متباعدة</figcaption>
            <ScrewDiagram pitch={18} turns={progress} />
          </figure>
        </div>
      ) : (
        <WheelDiagram radius={radius * 5} axle={axle * 5} turns={progress} />
      )}
      <fieldset>
        <legend className={styles.heading}>{question}</legend>
        <div className={styles.actions}>
          {options.map((o) => (
            <button
              key={o}
              disabled={running || revealed}
              className={`${styles.button} ${prediction === o ? styles.selected : ""}`}
              aria-pressed={prediction === o}
              onClick={() => P(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </fieldset>
      <label className={styles.control}>
        <span>
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => {
              reset();
              Reduced(e.target.checked);
            }}
          />{" "}
          حركة مخففة: عرض النتيجة النهائية مباشرة
        </span>
      </label>
      <div className={styles.actions}>
        <button
          className={styles.button}
          disabled={!prediction || progress >= 1}
          onClick={() => {
            Reveal(true);
            if (
              reduced ||
              window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
              progressRef.current = 1;
              T(1);
              Run(false);
            } else Run(!running);
          }}
        >
          {running
            ? "إيقاف مؤقت"
            : progress > 0
              ? "متابعة التجربة"
              : "شغّل التجربة"}
        </button>
        <button className={styles.button} onClick={reset}>
          إعادة الضبط
        </button>
      </div>
      <progress
        aria-label="تقدم التجربة"
        value={progress}
        max={1}
        style={{ width: "100%" }}
      />
      {revealed && (
        <div className={styles.result} aria-live="polite">
          <strong>
            {prediction === correct ? "توقعك صحيح." : "راجع توقعك."} النتيجة:{" "}
            {correct}.
          </strong>
          {tab === 0 ? (
            <>
              <p>
                نقارن حاصل ضرب كل قوة بذراعها. الأكبر يهبط، والتساوي يعني
                الاتزان.
              </p>
              <TeX
                block
              >{`${f1}\\times${d1}=${lv.left},\\qquad ${f2}\\times${d2}=${lv.right}`}</TeX>
              <p>
                جرّب قيم الكتاب: القوة اليسرى 10 وذراعها 6، واليمنى 20 وذراعها 3.
              </p>
            </>
          ) : tab === 1 ? (
            <>
              <TeX
                block
              >{`F=\\frac{${load}}{${pu.strands}}=${pu.effort}\\,\\mathrm{N}`}</TeX>
              <p>
                الفروع الحاملة: {pu.strands === 1 ? "فرع واحد" : "فرعان"}. تتبع
                الحبل أثناء الحركة.
              </p>
              <TeX
                block
              >{`s_{\\text{سحب}}=${(2 * progress).toFixed(2)}\\,\\mathrm{m},\\quad h=${pu.rise.toFixed(2)}\\,\\mathrm{m}`}</TeX>
              <p>
                في التكوين ذي الفرعين يسحب الطرف الحر ضعف ارتفاع الحمل. هذه
                ملاحظة حركية في النموذج، وليست قاعدة لكل جهاز.
              </p>
            </>
          ) : tab === 2 ? (
            <>
              <p>
                الطريق الأطول يقلل قوة الجهد في هذه المقارنة المثالية؛ لا يعني
                تقليل الارتفاع.
              </p>
              <TeX
                block
              >{`F_{\\text{مائل}}=${inc.effort.toFixed(1)}\\,\\mathrm{N},\\quad F_{\\text{مباشر}}=${load}\\,\\mathrm{N}`}</TeX>
            </>
          ) : tab === 3 ? (
            <p>
              بعد الدورة نفسها يظهر تقدم أقل للأسنان الأكثر تقارباً. مقدار تقدم
              النموذج النسبي: {screwAdvance(pitch, progress).toFixed(1)}. هذه
              وحدات رسم توضيحية وليست قانوناً مطلوباً.
            </p>
          ) : (
            <>
              <p>زيادة نصف قطر العجلة مع ثبات المحور تزيد نسبة نصفي القطر.</p>
              <TeX
                block
              >{`\\text{الفائدة الآلية}=\\frac{${radius}}{${axle}}=${wh.advantage.toFixed(2)}`}</TeX>
              <TeX
                block
              >{`F_{\\text{ناتجة}}=${wh.output.toFixed(1)}\\,\\mathrm{N}`}</TeX>
            </>
          )}
        </div>
      )}
    </section>
  );
}
