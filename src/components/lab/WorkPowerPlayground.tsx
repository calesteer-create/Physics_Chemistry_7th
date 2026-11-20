"use client";

import { useEffect, useState } from "react";
import { Activity, Play, RotateCcw, Timer } from "lucide-react";
import { SvgTeX, TeX } from "@/components/math/TeX";
import { calculatePower, calculateWork, comparePower } from "@/lib/work-power-model";

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
  const boxOffset = activeCase === "still" ? 0 : progress * 1.25;

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
    <section className="lab-card overflow-hidden" aria-labelledby="work-lab-title">
      <header className="bg-[#0d1b2e] px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow eyebrow-amber"><Activity className="h-4 w-4" /> مختبر تفاعلي</span>
          <h3 id="work-lab-title" className="text-xl font-black text-white">متى تنجز القوة عملاً؟</h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-[var(--color-mist)]">اختر الحالة، توقّع إشارة العمل، ثم شغّل التجربة. راقب صندوقاً متحركاً أو ساكناً، وسهم القوة وسهم الانتقال.</p>
      </header>

      <div className="grid gap-5 bg-[#060c1a] p-4 md:p-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="حالات العمل الأربع">
            {CASES.map((item) => (
              <button key={item.id} type="button" aria-pressed={activeCase === item.id} onClick={() => resetCase(item.id)} className={`min-h-12 rounded-xl border px-3 py-2 text-right text-sm font-black transition-colors ${activeCase === item.id ? "border-[#42c4ad] bg-[rgba(35,131,93,0.18)] text-white" : "border-[var(--color-line)] bg-white/[0.02] text-[var(--color-mist)] hover:bg-white/[0.06]"}`}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-[rgba(6,14,30,0.65)] p-3 sm:p-5">
            <svg viewBox="0 0 520 245" className="h-auto w-full" role="img" aria-label={`${selectedCase.label}. السهم الأحمر للقوة، والسهم الأزرق للانتقال.`}>
              <title>{selectedCase.label}</title>
              <line x1="40" y1="197" x2="480" y2="197" stroke="#8fa2b2" strokeWidth="3" />
              <g transform={`translate(${boxOffset} 0)`} style={{ transition: running ? "transform 70ms linear" : "transform 250ms ease-out" }}>
                <rect x="150" y="123" width="82" height="67" rx="8" fill="#d9bd8e" stroke="#856f4c" strokeWidth="3" />
                <path d="M158 139h66M158 153h66" stroke="#b69b6e" strokeWidth="2" />
                <circle cx="172" cy="166" r="3" fill="#8c7149" />
                <circle cx="210" cy="166" r="3" fill="#8c7149" />
                {activeCase === "aligned" && <><line x1="191" y1="138" x2="285" y2="138" stroke="#c2415d" strokeWidth="6" strokeLinecap="round" /><polygon points="285,138 270,129 270,147" fill="#c2415d" /></>}
                {activeCase === "opposed" && <><line x1="191" y1="138" x2="99" y2="138" stroke="#c2415d" strokeWidth="6" strokeLinecap="round" /><polygon points="99,138 114,129 114,147" fill="#c2415d" /></>}
                {activeCase === "perpendicular" && <><line x1="191" y1="126" x2="191" y2="66" stroke="#c2415d" strokeWidth="6" strokeLinecap="round" /><polygon points="191,66 182,81 200,81" fill="#c2415d" /></>}
                {activeCase === "still" && <><line x1="191" y1="138" x2="285" y2="138" stroke="#c2415d" strokeWidth="6" strokeLinecap="round" /><polygon points="285,138 270,129 270,147" fill="#c2415d" /></>}
              </g>
              {activeCase !== "still" ? <><line x1="155" y1="215" x2={Math.max(180, 155 + 120 * progress / 100)} y2="215" stroke="#2874a6" strokeWidth="5" strokeLinecap="round" /><polygon points={`${Math.max(180, 155 + 120 * progress / 100)},215 ${Math.max(180, 155 + 120 * progress / 100) - 14},207 ${Math.max(180, 155 + 120 * progress / 100) - 14},223`} fill="#2874a6" /></> : <line x1="155" y1="215" x2="275" y2="215" stroke="#2874a6" strokeWidth="4" strokeDasharray="8 7" />}
              <SvgTeX tex="F" x={activeCase === "opposed" ? 98 : 265} y={activeCase === "perpendicular" ? 56 : 104} width={22} height={22} color="#c2415d" fontSize="16px" />
              <SvgTeX tex="d" x={258} y={215} width={22} height={22} color="#2874a6" fontSize="16px" />
              {activeCase === "perpendicular" && <path d="M191 178v-15h15" fill="none" stroke="#465c70" strokeWidth="2" />}
              {activeCase === "still" && <><line x1="291" y1="129" x2="291" y2="169" stroke="#c2415d" strokeWidth="4" /><line x1="280" y1="169" x2="302" y2="169" stroke="#c2415d" strokeWidth="4" /></>}
            </svg>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[var(--color-mist)]">شدة القوة <TeX>{`F=${force}\\,\\text{N}`}</TeX><input aria-label="شدة القوة بالنيوتن" className="mt-2 w-full accent-[#c2415d]" type="range" min="5" max="50" step="5" value={force} onChange={(event) => { setForce(Number(event.target.value)); setObserved(false); setPrediction(null); }} /></label>
              <label className="block text-sm font-bold text-[var(--color-mist)]">مسافة الانتقال <TeX>{`d=${distance}\\,\\text{m}`}</TeX><input aria-label="مسافة الانتقال بالمتر" className="mt-2 w-full accent-[#2874a6]" type="range" min="0" max="8" step="1" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setObserved(false); setPrediction(null); }} /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(60,224,244,0.2)] bg-[rgba(60,224,244,0.05)] p-4">
            <h4 className="text-sm font-black text-[#8ceeff]">توقّع قبل التشغيل</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {PREDICTIONS.map((item) => <button key={item.id} type="button" aria-pressed={prediction === item.id} onClick={() => setPrediction(item.id)} className={`rounded-lg border px-4 py-2 text-sm font-black ${prediction === item.id ? "border-[#8ceeff] bg-[rgba(60,224,244,0.15)] text-white" : "border-[var(--color-line)] text-[var(--color-mist)]"}`}>{item.label}</button>)}
            </div>
            {prediction && <p className="mt-2 text-xs font-bold text-[var(--color-mist)]">سُجّل توقعك. شغّل التجربة لترى النتيجة وتفسيرها.</p>}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[rgba(255,176,58,0.22)] bg-[rgba(255,176,58,0.06)] p-5">
            <h4 className="text-base font-black text-[var(--color-chem)]">النتيجة</h4>
            {observed ? <div className="mt-3 space-y-2 text-sm font-bold text-white">
              <p>المسافة في هذه الحالة: <TeX>{`${displacement}\\,\\text{m}`}</TeX></p>
              <p>العلاقة المستخدمة: <TeX>{activeCase === "opposed" && displacement > 0 ? "W=-Fd" : activeCase === "perpendicular" || activeCase === "still" || displacement === 0 ? "W=0" : "W=Fd"}</TeX></p>
              <p className="text-lg text-[#ffe4b8]"><TeX>{`W=${work}\\,\\text{J}`}</TeX></p>
            </div> : <p className="mt-3 text-sm font-bold leading-7 text-[var(--color-mist)]">سجّل توقعك وشغّل التجربة لتظهر قيمة العمل وعلاقته وتفسيرها.</p>}
            {observed && <p className="mt-3 text-sm font-bold leading-7 text-[#ffe4b8]">{activeCase !== "still" && distance === 0 ? "لم يحدث انتقال لأن المسافة تساوي صفراً، لذلك العمل معدوم." : selectedCase.explanation}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={runExperiment} disabled={running || !prediction} className="btn btn-phys flex-1 justify-center disabled:opacity-50"><Play className="h-4 w-4" />{running ? "تجري التجربة…" : "شغّل التجربة"}</button>
            <button type="button" onClick={() => resetCase()} className="btn btn-ghost flex-1 justify-center"><RotateCcw className="h-4 w-4" />إعادة الضبط</button>
          </div>
          {observed && prediction && <div role="status" className={`rounded-xl border p-4 text-sm font-bold leading-7 ${prediction === actualPrediction ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100" : "border-amber-400/40 bg-amber-400/10 text-amber-100"}`}>{prediction === actualPrediction ? "أحسنت، توقعك صحيح." : "قارن توقعك بالنتيجة، ثم راجع اتجاه القوة والانتقال."} {activeCase !== "still" && distance === 0 ? "لم يحدث انتقال لأن المسافة تساوي صفراً، لذلك العمل معدوم." : selectedCase.explanation}</div>}
        </aside>
      </div>
      <PowerComparison />
    </section>
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
  const progressA = mode === "same-work" ? Math.min(100, elapsed * duration / timeA) : elapsed;
  const progressB = mode === "same-work" ? Math.min(100, elapsed * duration / timeB) : elapsed;

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
    <div className="border-t border-[var(--color-line)] bg-[#091426] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow"><Timer className="h-4 w-4" /> مختبر الاستطاعة</span>
          <h3 className="text-lg font-black text-white">قارن العمل والزمن بنفسك</h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="نوع مقارنة الاستطاعة">
          <button type="button" aria-pressed={mode === "same-work"} onClick={() => changeMode("same-work")} className={`rounded-xl border px-4 py-2.5 text-sm font-black ${mode === "same-work" ? "border-[#8ceeff] bg-[rgba(60,224,244,0.12)] text-white" : "border-[var(--color-line)] text-[var(--color-mist)]"}`}>العمل نفسه في زمنين مختلفين</button>
          <button type="button" aria-pressed={mode === "same-time"} onClick={() => changeMode("same-time")} className={`rounded-xl border px-4 py-2.5 text-sm font-black ${mode === "same-time" ? "border-[#8ceeff] bg-[rgba(60,224,244,0.12)] text-white" : "border-[var(--color-line)] text-[var(--color-mist)]"}`}>عملان مختلفان في الزمن نفسه</button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4 rounded-2xl bg-[rgba(6,14,30,0.65)] p-4">
            {mode === "same-work" ? <>
              <label className="block text-sm font-bold text-[var(--color-mist)]">العمل نفسه في المهمتين: <TeX>{`W=${workAmount}\\,\\text{J}`}</TeX><input className="mt-2 w-full accent-[#3ce0f4]" aria-label="العمل نفسه بالجول" type="range" min="60" max="300" step="30" value={workAmount} onChange={(event) => { setWorkAmount(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
              <label className="block text-sm font-bold text-[var(--color-mist)]">زمن المهمة A: <TeX>{`t_A=${timeA}\\,\\text{s}`}</TeX><input className="mt-2 w-full accent-[#42c4ad]" aria-label="زمن المهمة A بالثانية" type="range" min="2" max="12" step="1" value={timeA} onChange={(event) => { setTimeA(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
              <label className="block text-sm font-bold text-[var(--color-mist)]">زمن المهمة B: <TeX>{`t_B=${timeB}\\,\\text{s}`}</TeX><input className="mt-2 w-full accent-[#f2b632]" aria-label="زمن المهمة B بالثانية" type="range" min="2" max="12" step="1" value={timeB} onChange={(event) => { setTimeB(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
            </> : <>
              <label className="block text-sm font-bold text-[var(--color-mist)]">الزمن نفسه للمهمتين: <TeX>{`t=${sharedTime}\\,\\text{s}`}</TeX><input className="mt-2 w-full accent-[#3ce0f4]" aria-label="الزمن المشترك بالثانية" type="range" min="2" max="12" step="1" value={sharedTime} onChange={(event) => { setSharedTime(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
              <label className="block text-sm font-bold text-[var(--color-mist)]">عمل المهمة A: <TeX>{`W_A=${workA}\\,\\text{J}`}</TeX><input className="mt-2 w-full accent-[#42c4ad]" aria-label="عمل المهمة A بالجول" type="range" min="30" max="240" step="30" value={workA} onChange={(event) => { setWorkA(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
              <label className="block text-sm font-bold text-[var(--color-mist)]">عمل المهمة B: <TeX>{`W_B=${workB}\\,\\text{J}`}</TeX><input className="mt-2 w-full accent-[#f2b632]" aria-label="عمل المهمة B بالجول" type="range" min="30" max="240" step="30" value={workB} onChange={(event) => { setWorkB(Number(event.target.value)); setStarted(false); setElapsed(0); setGuess(null); }} /></label>
            </>}
          </div>

          <div className="space-y-4">
            {(["A", "B"] as const).map((id) => {
              const amount = mode === "same-work" ? workAmount : id === "A" ? workA : workB;
              const time = mode === "same-work" ? (id === "A" ? timeA : timeB) : sharedTime;
              const power = id === "A" ? pA : pB;
              const progressValue = id === "A" ? progressA : progressB;
              return <div key={id} className="rounded-2xl border border-[var(--color-line)] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-2 text-sm font-black text-white"><span>المهمة {id}</span><span><TeX>{`W=${amount}\\,\\text{J}`}</TeX> <span className="text-[var(--color-dim)]">|</span> <TeX>{`t=${time}\\,\\text{s}`}</TeX></span></div>
                <p className="mt-3 text-xs font-bold text-[var(--color-mist)]">تقدم إنجاز المهمة</p>
                <div className="mt-1 h-4 overflow-hidden rounded-full bg-slate-700/70" role="progressbar" aria-label={`تقدم إنجاز المهمة ${id}`} aria-valuenow={Math.round(progressValue)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full transition-[width] duration-75 ${id === "A" ? "bg-[#42c4ad]" : "bg-[#f2b632]"}`} style={{ width: `${progressValue}%` }} /></div>
                <p className="mt-3 text-xs font-bold text-[var(--color-mist)]">مقدار العمل مقارنة بالمقياس</p>
                <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-700/70" role="img" aria-label={`مقدار عمل المهمة ${id}: ${amount} جول`}><div className={`h-full rounded-full ${id === "A" ? "bg-[#42c4ad]/70" : "bg-[#f2b632]/70"}`} style={{ width: `${Math.min(100, amount / 300 * 100)}%` }} /></div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-[var(--color-mist)]"><span>الاستطاعة: {completed ? <TeX>{`P=${power.toFixed(1)}\\,\\text{W}`}</TeX> : "تظهر بعد إكمال المقارنة"}</span><span className="text-xs">{mode === "same-work" ? `زمنها ${time} ثانية` : `عملها ${amount} جول`}</span></div>
              </div>;
            })}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={run} disabled={!guess} className="btn btn-phys flex-1 justify-center disabled:opacity-50"><Play className="h-4 w-4" />شغّل المقارنة</button>
              <button type="button" onClick={() => { setElapsed(0); setStarted(false); setGuess(null); }} className="btn btn-ghost flex-1 justify-center"><RotateCcw className="h-4 w-4" />إعادة</button>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-[rgba(255,176,58,0.2)] bg-[rgba(255,176,58,0.05)] p-4">
          <p className="text-sm font-black text-[var(--color-chem)]">قبل التشغيل: أي المهمتين استطاعتها أكبر؟</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {([{ id: "A", label: "المهمة A" }, { id: "B", label: "المهمة B" }, { id: "equal", label: "متساويتان" }] as const).map((item) => <button key={item.id} type="button" aria-pressed={guess === item.id} onClick={() => setGuess(item.id)} className={`rounded-lg border px-4 py-2 text-sm font-black ${guess === item.id ? "border-[#ffd08a] bg-[rgba(255,176,58,0.15)] text-white" : "border-[var(--color-line)] text-[var(--color-mist)]"}`}>{item.label}</button>)}
          </div>
          {completed && guess && <p className={`mt-3 text-sm font-bold leading-7 ${guess === stronger ? "text-emerald-200" : "text-amber-100"}`} role="status">{guess === stronger ? "توقعك صحيح." : "راجع النتيجة وقارن العمل بالزمن."} {stronger === "equal" ? "الاستطاعتان متساويتان" : `الاستطاعة الأكبر للمهمة ${stronger}`}؛ <TeX>{`P_A=${pA.toFixed(1)}\\,\\text{W}`}</TeX> و<TeX>{`P_B=${pB.toFixed(1)}\\,\\text{W}`}</TeX>.</p>}
          <p className="mt-3 text-xs font-bold leading-6 text-[var(--color-mist)]">{mode === "same-work" ? "العمل متساوٍ؛ المهمة التي تنجزه في زمن أقصر استطاعتها أكبر." : "الزمن متساوٍ؛ المهمة التي تنجز عملاً أكبر استطاعتها أكبر."}</p>
        </div>
      </div>
    </div>
  );
}
