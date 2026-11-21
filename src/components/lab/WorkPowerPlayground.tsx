"use client";

import { useEffect, useState } from "react";
import { Activity, Play, RotateCcw, Timer } from "lucide-react";
import { SvgTeX, TeX } from "@/components/math/TeX";
import { calculatePower, calculateWork, comparePower } from "@/lib/work-power-model";
import { C, Carrier, Crate, Ground, Label, Measure, RightAngle, Vector } from "@/components/figures/work-power-drawing";
import styles from "@/components/figures/work-power.module.css";

type WorkCase = "aligned" | "opposed" | "perpendicular" | "still";
type Prediction = "positive" | "negative" | "zero";
type CompareMode = "same-work" | "same-time";

const CASES: { id: WorkCase; label: string; prediction: Prediction; explanation: string }[] = [
  { id: "aligned", label: "القوة موافقة للانتقال", prediction: "positive", explanation: "القوة والانتقال في الجهة نفسها؛ لذلك العمل موجب." },
  { id: "opposed", label: "القوة معاكسة للانتقال", prediction: "negative", explanation: "اتجاه القوة يعاكس اتجاه الانتقال؛ لذلك العمل سالب." },
  { id: "perpendicular", label: "القوة عمودية على الانتقال", prediction: "zero", explanation: "القوة عمودية على الانتقال؛ لذلك عمل هذه القوة معدوم." },
  { id: "still", label: "لا يحدث انتقال", prediction: "zero", explanation: "لا تنتقل نقطة تأثير القوة، أي إن المسافة تساوي صفراً؛ لذلك العمل معدوم." },
];

const PREDICTIONS: { id: Prediction; label: string }[] = [
  { id: "positive", label: "موجب" },
  { id: "negative", label: "سالب" },
  { id: "zero", label: "معدوم" },
];

/* ألوان المختبر — نفس مقياس الدرس ونفس نسب التباين (≥ 4.5:1 على #f7fafc) */
const INK = "#1a2438";
const MUTED = "#4b5568";
const SURFACE = "#ffffff";
const CANVAS = "#f2f5f9";
const EDGE = "#d3dde7";
const PRIMARY = "#33568f";

export function WorkPowerPlayground() {
  const [activeCase, setActiveCase] = useState<WorkCase>("aligned");
  const [force, setForce] = useState(20);
  const [distance, setDistance] = useState(4);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [observed, setObserved] = useState(false);

  useEffect(() => {
    if (!running) return;
    let nextProgress = 0;
    const timer = window.setInterval(() => {
      nextProgress = Math.min(100, nextProgress + 5);
      setProgress(nextProgress);
      if (nextProgress >= 100) {
        window.clearInterval(timer);
        setRunning(false);
        setObserved(true);
      }
    }, 35);
    return () => window.clearInterval(timer);
  }, [running]);

  const selectedCase = CASES.find((item) => item.id === activeCase) ?? CASES[0];
  const displacement = activeCase === "still" ? 0 : distance;
  const work = calculateWork(force, displacement, activeCase === "still" ? "no-displacement" : activeCase);
  const actualPrediction: Prediction = work > 0 ? "positive" : work < 0 ? "negative" : "zero";
  /* صندوق المشهد لا يتحرّك إطلاقًا إذا كانت المسافة صفرًا (تصحيح تناقض d=0) */
  const travel = activeCase === "still" ? 0 : 22 * distance;
  const boxOffset = travel === 0 ? 0 : (progress * travel) / 100;
  const stillNote = activeCase !== "still" && distance === 0;

  function resetCase(nextCase = activeCase) {
    setActiveCase(nextCase);
    setProgress(0);
    setPrediction(null);
    setObserved(false);
    setRunning(false);
  }

  function runExperiment() {
    setProgress(0);
    setObserved(false);
    setRunning(true);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d3dde7] bg-white shadow-[0_18px_40px_-30px_rgba(26,36,56,0.45)]" aria-labelledby="work-lab-title">
      <header className="border-b border-[#e2e9f0] bg-[#f2f5f9] px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9cfd8] bg-white px-3 py-1 text-[13px] font-black text-[#33568f]">
            <Activity className="h-4 w-4" /> مختبر تفاعلي
          </span>
          <h3 id="work-lab-title" className="text-xl font-black text-[#1a2438]">متى تنجز القوة عملاً؟</h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-[#4b5568]">
          اختر الحالة، توقّع إشارة العمل، ثم شغّل التجربة. راقب صندوقاً متحركاً أو ساكناً، وسهم القوة وسهم الانتقال.
        </p>
      </header>

      <div className="grid gap-5 bg-white p-4 md:p-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="حالات العمل الأربع">
            {CASES.map((item) => (
              <button key={item.id} type="button" aria-pressed={activeCase === item.id} onClick={() => resetCase(item.id)}
                className={`min-h-12 rounded-xl border px-3 py-2 text-right text-sm font-black transition-colors ${activeCase === item.id
                  ? "border-[#33568f] bg-[#eaf1fa] text-[#1a2438]"
                  : "border-[#d3dde7] bg-white text-[#3d4a5f] hover:bg-[#f2f5f9]"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[#e2e9f0] bg-[#f2f5f9] p-3 sm:p-5">
            <div className={styles.onlyWide}>
              <WorkScene activeCase={activeCase} force={force} distance={distance} offset={boxOffset} animate={running} displacement={displacement} />
            </div>
            <div className={styles.onlyNarrow}>
              <WorkScene compact activeCase={activeCase} force={force} distance={distance} offset={boxOffset} animate={running} displacement={displacement} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[#3d4a5f]">
                شدّة القوة <TeX>{`F=${force}\\,\\text{N}`}</TeX>
                <input aria-label="شدة القوة بالنيوتن" className="mt-2 w-full accent-[#a8304a]" type="range" min="5" max="50" step="5" value={force}
                  onChange={(event) => { setForce(Number(event.target.value)); setObserved(false); setPrediction(null); }} />
              </label>
              <label className="block text-sm font-bold text-[#3d4a5f]">
                مسافة الانتقال <TeX>{`d=${distance}\\,\\text{m}`}</TeX>
                <input aria-label="مسافة الانتقال بالمتر" className="mt-2 w-full accent-[#23608f]" type="range" min="0" max="8" step="1" value={distance}
                  onChange={(event) => { setDistance(Number(event.target.value)); setObserved(false); setPrediction(null); }} />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#bcd4e6] bg-[#eef5fb] p-4">
            <h4 className="text-sm font-black text-[#26406e]">توقّع قبل التشغيل</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {PREDICTIONS.map((item) => (
                <button key={item.id} type="button" aria-pressed={prediction === item.id} onClick={() => setPrediction(item.id)}
                  className={`rounded-lg border px-4 py-2 text-sm font-black ${prediction === item.id
                    ? "border-[#33568f] bg-white text-[#1a2438]"
                    : "border-[#c9cfd8] bg-white text-[#3d4a5f]"}`}>
                  {item.label}
                </button>
              ))}
            </div>
            {prediction && <p className="mt-2 text-xs font-bold leading-6 text-[#3d4a5f]">سُجّل توقعك. شغّل التجربة لترى النتيجة وتفسيرها.</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[#e3d4b6] bg-[#fdf8ee] p-5">
            <h4 className="text-base font-black text-[#785618]">النتيجة</h4>
            {observed ? <div className="mt-3 space-y-2 text-sm font-bold text-[#1a2438]">
              <p>المسافة في هذه الحالة: <TeX>{`${displacement}\\,\\text{m}`}</TeX></p>
              <p>العلاقة المستخدمة: <TeX>{activeCase === "opposed" && displacement > 0 ? "W=-Fd" : activeCase === "perpendicular" || activeCase === "still" || displacement === 0 ? "W=0" : "W=Fd"}</TeX></p>
              <p className="text-lg text-[#785618]"><TeX>{`W=${work}\\,\\text{J}`}</TeX></p>
            </div> : <p className="mt-3 text-sm font-bold leading-7 text-[#4b5568]">سجّل توقعك وشغّل التجربة لتظهر قيمة العمل وعلاقته وتفسيرها.</p>}
            {observed && <p className="mt-3 text-sm font-bold leading-7 text-[#5a4212]">{stillNote ? "لم يحدث انتقال لأن المسافة تساوي صفراً، لذلك العمل معدوم." : selectedCase.explanation}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={runExperiment} disabled={running || !prediction}
              style={{ color: "#ffffff" }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#33568f] px-4 text-sm font-black text-white transition-colors hover:bg-[#27436f] disabled:bg-[#33568f] disabled:opacity-60">
              <Play className="h-4 w-4" />{running ? "تجري التجربة…" : "شغّل التجربة"}
            </button>
            <button type="button" onClick={() => resetCase()}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#c9cfd8] bg-white px-4 text-sm font-black text-[#26406e] transition-colors hover:bg-[#f2f5f9]">
              <RotateCcw className="h-4 w-4" />إعادة الضبط
            </button>
          </div>
          {observed && prediction && <div role="status" className={`rounded-xl border p-4 text-sm font-bold leading-7 ${prediction === actualPrediction
            ? "border-[#9ec9b4] bg-[#edf7f1] text-[#0f5c46]"
            : "border-[#e3d4b6] bg-[#fdf8ee] text-[#6b4a10]"}`}>
            {prediction === actualPrediction ? "أحسنت، توقعك صحيح." : "قارن توقعك بالنتيجة، ثم راجع اتجاه القوة والانتقال."} {stillNote ? "لم يحدث انتقال لأن المسافة تساوي صفراً، لذلك العمل معدوم." : selectedCase.explanation}
          </div>}
        </aside>
      </div>
      <PowerComparison />
    </section>
  );
}

/* ───────────── مشهد التجربة ─────────────
   لوحة واحدة بنفس نظام المتجهات في رسوم الدرس: أحمر للقوة، أزرق للانتقال،
   ورمادي لخط الأرض. الصندوق يتحرّك بمقدار المسافة d فقط، ولا يتحرّك إطلاقًا
   عندما d=0 أو في حالة «لا يحدث انتقال». */
function WorkScene({ activeCase, force, distance, offset, animate, displacement, compact = false }: {
  activeCase: WorkCase; force: number; distance: number; offset: number; animate: boolean;
  displacement: number; compact?: boolean;
}) {
  const G = compact
    ? { vb: "0 0 360 232", ground: 158, boxW: 82, boxH: 62, startX: 66, travelPerM: 13, fBase: 34, label: 22, arrowW: 5.2, h: 62 }
    : { vb: "0 0 560 218", ground: 156, boxW: 88, boxH: 66, startX: 132, travelPerM: 22, fBase: 44, label: 20, arrowW: 5, h: 66 };
  const { ground, boxW, boxH, startX } = G;
  const yTop = ground - boxH;
  const cy = ground - boxH / 2;
  const x = startX + offset;
  const scaleF = 0.55 + (force / 50) * 1.15; /* 5..50 N ←→ سهم أقصر..أطول */
  const fLen = G.fBase * scaleF;
  const travel = activeCase === "still" ? 0 : G.travelPerM * distance;

  const forceFrom: [number, number] = activeCase === "opposed" ? [x, cy] : activeCase === "perpendicular" ? [x + boxW / 2, yTop] : [x + boxW, cy];
  const forceTo: [number, number] = activeCase === "opposed" ? [x - fLen, cy] : activeCase === "perpendicular" ? [x + boxW / 2, yTop - fLen] : [x + boxW + fLen, cy];

  return (
    <svg viewBox={G.vb} className="h-auto w-full" role="img"
      aria-label={`${CASES.find((c) => c.id === activeCase)?.label}. السهم الأحمر للقوة، والسهم الأزرق للانتقال.`}>
      <title>{CASES.find((c) => c.id === activeCase)?.label}</title>
      <Ground x1={16} x2={compact ? 344 : 536} y={ground} />

      {/* الظلّ المنقّط = موضع الصندوق قبل الانتقال، يوضّح معنى d بصرياً */}
      {travel > 0 && displacement > 0 && (
        <rect x={startX} y={yTop} width={boxW} height={boxH} rx={5} fill="none"
          stroke={C.guide} strokeWidth={2} strokeDasharray="7 5" />
      )}

      <g transform={`translate(${offset} 0)`} style={{ transition: animate ? "transform 70ms linear" : "transform 250ms ease-out" }}>
        <Crate x={startX} y={yTop} w={boxW} h={boxH} id="lab-crate" />
      </g>

      {/* سهم القوة — التسمية فوق منتصف الساق، خارج كل الخطوط */}
      <Vector from={forceFrom} to={forceTo} color={C.red} width={G.arrowW} />
      <ForceTag at={activeCase === "perpendicular"
        ? [forceFrom[0] + 30, (forceFrom[1] + forceTo[1]) / 2]
        : [(forceFrom[0] + forceTo[0]) / 2, forceFrom[1] - 22]} color={C.red} size={G.label} />

      {/* علامة الزاوية القائمة في الحالة العمودية */}
      {activeCase === "perpendicular" && <RightAngle at={[x + boxW / 2, yTop]} size={18} dir="ul" color={C.ink2} />}

      {/* شريط الانتقال d أسفل الأرض، وتسميته تتبع طرف السهم */}
      {travel > 0 ? (
        <>
          <Carrier from={[startX, ground + 4]} to={[startX, ground + 34]} />
          <Carrier from={[startX + travel, ground + 4]} to={[startX + travel, ground + 34]} />
          <Vector from={[startX, ground + 22]} to={[startX + travel, ground + 22]} color={C.blue} width={4} />
          <Label at={[startX + travel + 22, ground + 22]} tex="d" color={C.blue} size={G.label} width={30} />
        </>
      ) : (
        <>
          <Measure x1={startX} x2={startX + boxW} y={ground + 22} color={C.blue} />
          <Label at={[startX + boxW + 40, ground + 22]} tex="d=0" color={C.blue} size={G.label} width={60} />
        </>
      )}
    </svg>
  );
}

function ForceTag({ at: [cx, cy], color, size }: { at: [number, number]; color: string; size: number }) {
  return (
    <foreignObject x={cx - 24} y={cy - 18} width={48} height={36} style={{ overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", color, fontSize: `${size}px`, direction: "ltr", lineHeight: 1 }}>
        <SvgTeX tex="\vec{F}" x={0} y={0} width={size + 12} height={size + 12} color={color} fontSize={`${size}px`} />
      </div>
    </foreignObject>
  );
}

function PowerComparison() {
  const [mode, setMode] = useState<CompareMode>("same-work");
  const [workAmount, setWorkAmount] = useState(120);
  const [timeA, setTimeA] = useState(4);
  const [timeB, setTimeB] = useState(10);
  const [workA, setWorkA] = useState(60);
  const [workB, setWorkB] = useState(120);
  const [sharedTime, setSharedTime] = useState(6);
  const [guess, setGuess] = useState<"A" | "B" | "equal" | null>(null);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const duration = mode === "same-work" ? Math.max(timeA, timeB) : sharedTime;
  useEffect(() => {
    if (!started || elapsed >= 100) return;
    const timer = window.setInterval(() => setElapsed((value) => Math.min(100, value + 4)), 40);
    return () => window.clearInterval(timer);
  }, [started, elapsed]);

  const pA = calculatePower(mode === "same-work" ? workAmount : workA, mode === "same-work" ? timeA : sharedTime);
  const pB = calculatePower(mode === "same-work" ? workAmount : workB, mode === "same-work" ? timeB : sharedTime);
  const stronger = comparePower(mode === "same-work" ? workAmount : workA, mode === "same-work" ? timeA : sharedTime, mode === "same-work" ? workAmount : workB, mode === "same-work" ? timeB : sharedTime);
  const completed = started && elapsed >= 100;
  const progressA = mode === "same-work" ? Math.min(100, (elapsed * duration) / timeA) : elapsed;
  const progressB = mode === "same-work" ? Math.min(100, (elapsed * duration) / timeB) : elapsed;

  function changeMode(next: CompareMode) {
    setMode(next);
    setGuess(null);
    setStarted(false);
    setElapsed(0);
  }

  function run() {
    setElapsed(0);
    setStarted(true);
  }

  return (
    <div className="border-t border-[#e2e9f0] bg-[#f2f5f9] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9cfd8] bg-white px-3 py-1 text-[13px] font-black text-[#33568f]">
            <Timer className="h-4 w-4" /> مختبر الاستطاعة
          </span>
          <h3 className="text-lg font-black text-[#1a2438]">قارن العمل والزمن بنفسك</h3>
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="نوع مقارنة الاستطاعة">
          {([["same-work", "العمل نفسه في زمنين مختلفين"], ["same-time", "عملان مختلفان في الزمن نفسه"]] as const).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={mode === id} onClick={() => changeMode(id)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-black ${mode === id
                ? "border-[#33568f] bg-white text-[#1a2438]"
                : "border-[#c9cfd8] bg-white text-[#3d4a5f] hover:bg-[#f2f5f9]"}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4 rounded-2xl border border-[#e2e9f0] bg-white p-4">
            {mode === "same-work" ? <>
              <RangeRow label="العمل نفسه في المهمتين:" tex={`W=${workAmount}\\,\\text{J}`} accent={PRIMARY}
                aria="العمل نفسه بالجول" min={60} max={300} step={30} value={workAmount}
                onChange={(v) => { setWorkAmount(v); setStarted(false); setElapsed(0); setGuess(null); }} />
              <RangeRow label="زمن المهمة A:" tex={`t_A=${timeA}\\,\\text{s}`} accent={C.green}
                aria="زمن المهمة A بالثانية" min={2} max={12} step={1} value={timeA}
                onChange={(v) => { setTimeA(v); setStarted(false); setElapsed(0); setGuess(null); }} />
              <RangeRow label="زمن المهمة B:" tex={`t_B=${timeB}\\,\\text{s}`} accent={C.gold}
                aria="زمن المهمة B بالثانية" min={2} max={12} step={1} value={timeB}
                onChange={(v) => { setTimeB(v); setStarted(false); setElapsed(0); setGuess(null); }} />
            </> : <>
              <RangeRow label="الزمن نفسه للمهمتين:" tex={`t=${sharedTime}\\,\\text{s}`} accent={PRIMARY}
                aria="الزمن المشترك بالثانية" min={2} max={12} step={1} value={sharedTime}
                onChange={(v) => { setSharedTime(v); setStarted(false); setElapsed(0); setGuess(null); }} />
              <RangeRow label="عمل المهمة A:" tex={`W_A=${workA}\\,\\text{J}`} accent={C.green}
                aria="عمل المهمة A بالجول" min={30} max={240} step={30} value={workA}
                onChange={(v) => { setWorkA(v); setStarted(false); setElapsed(0); setGuess(null); }} />
              <RangeRow label="عمل المهمة B:" tex={`W_B=${workB}\\,\\text{J}`} accent={C.gold}
                aria="عمل المهمة B بالجول" min={30} max={240} step={30} value={workB}
                onChange={(v) => { setWorkB(v); setStarted(false); setElapsed(0); setGuess(null); }} />
            </>}
          </div>

          <div className="space-y-4">
            {(["A", "B"] as const).map((id) => {
              const amount = mode === "same-work" ? workAmount : id === "A" ? workA : workB;
              const time = mode === "same-work" ? (id === "A" ? timeA : timeB) : sharedTime;
              const power = id === "A" ? pA : pB;
              const progressValue = id === "A" ? progressA : progressB;
              const tone = id === "A" ? C.green : C.gold;
              return (
                <div key={id} className="rounded-2xl border border-[#e2e9f0] bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm font-black text-[#1a2438]">
                    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
                      <span aria-hidden className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: tone }} />
                      المهمة {id}
                    </span>
                    <span className="whitespace-nowrap text-[#3d4a5f]"><TeX>{`W=${amount}\\,\\text{J}`}</TeX> <span className="text-[#5d7086]">|</span> <TeX>{`t=${time}\\,\\text{s}`}</TeX></span>
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#4b5568]">تقدم إنجاز المهمة</p>
                  <div className="mt-1 h-4 overflow-hidden rounded-full bg-[#e3eaf1]" role="progressbar"
                    aria-label={`تقدم إنجاز المهمة ${id}`} aria-valuenow={Math.round(progressValue)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full transition-[width] duration-75" style={{ width: `${progressValue}%`, background: tone }} />
                  </div>
                  <p className="mt-3 text-xs font-bold text-[#4b5568]">مقدار العمل مقارنة بالمقياس</p>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-[#e3eaf1]" role="img" aria-label={`مقدار عمل المهمة ${id}: ${amount} جول`}>
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (amount / 300) * 100)}%`, background: tone, opacity: 0.65 }} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-[#3d4a5f]">
                    <span>الاستطاعة: {completed ? <TeX>{`P=${power.toFixed(1)}\\,\\text{W}`}</TeX> : "تظهر بعد إكمال المقارنة"}</span>
                    <span className="text-xs">{mode === "same-work" ? `زمنها ${time} ثانية` : `عملها ${amount} جول`}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={run} disabled={!guess}
                style={{ color: "#ffffff" }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#33568f] px-4 text-sm font-black text-white transition-colors hover:bg-[#27436f] disabled:bg-[#33568f] disabled:opacity-60">
                <Play className="h-4 w-4 shrink-0" />شغّل المقارنة
              </button>
              <button type="button" onClick={() => { setElapsed(0); setStarted(false); setGuess(null); }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#c9cfd8] bg-white px-4 text-sm font-black text-[#26406e] transition-colors hover:bg-[#f2f5f9]">
                <RotateCcw className="h-4 w-4" />إعادة
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[#e3d4b6] bg-[#fdf8ee] p-4">
          <p className="text-sm font-black text-[#785618]">قبل التشغيل: أي المهمتين استطاعتها أكبر؟</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([{ id: "A", label: "المهمة A" }, { id: "B", label: "المهمة B" }, { id: "equal", label: "متساويتان" }] as const).map((item) => (
              <button key={item.id} type="button" aria-pressed={guess === item.id} onClick={() => setGuess(item.id)}
                className={`rounded-lg border px-4 py-2 text-sm font-black ${guess === item.id
                  ? "border-[#8a5a00] bg-white text-[#1a2438]"
                  : "border-[#d8c9ab] bg-white text-[#4a3b1c]"}`}>
                {item.label}
              </button>
            ))}
          </div>
          {completed && guess && <p role="status" className={`mt-3 text-sm font-bold leading-7 ${guess === stronger ? "text-[#0f5c46]" : "text-[#6b4a10]"}`}>
            {guess === stronger ? "توقعك صحيح." : "راجع النتيجة وقارن العمل بالزمن."} {stronger === "equal" ? "الاستطاعتان متساويتان" : `الاستطاعة الأكبر للمهمة ${stronger}`}؛ <TeX>{`P_A=${pA.toFixed(1)}\\,\\text{W}`}</TeX> و<TeX>{`P_B=${pB.toFixed(1)}\\,\\text{W}`}</TeX>.
          </p>}
          <p className="mt-3 text-xs font-bold leading-6 text-[#4b5568]">
            {mode === "same-work" ? "العمل متساوٍ؛ المهمة التي تنجزه في زمن أقصر استطاعتها أكبر." : "الزمن متساوٍ؛ المهمة التي تنجز عملاً أكبر استطاعتها أكبر."}
          </p>
        </div>
      </div>
    </div>
  );
}

function RangeRow({ label, tex, accent, aria, min, max, step, value, onChange }: {
  label: string; tex: string; accent: string; aria: string;
  min: number; max: number; step: number; value: number; onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-bold text-[#3d4a5f]">
      {label} <TeX>{tex}</TeX>
      <input aria-label={aria} className="mt-2 w-full" style={{ accentColor: accent }} type="range" min={min} max={max} step={step} value={value}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
