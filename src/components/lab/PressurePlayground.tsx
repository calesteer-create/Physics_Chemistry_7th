"use client";

import { useMemo, useState } from "react";
import { Activity, Home, Play, RotateCcw, TriangleAlert } from "lucide-react";
import { TeX } from "@/components/math/TeX";
import {
  areaFromPressureM2,
  comparePressure,
  displayIndentationRatio,
  forceFromPressureN,
  pressurePa,
  type LabMaterial,
} from "@/lib/pressure-model";
import { C, ArabicLabel, DippedSurface, Label, MetalBlock, Panel, Sponge, Vector } from "@/components/figures/pressure-drawing";
import styles from "@/components/figures/pressure.module.css";

const INK = "#1a2438";
const MUTED = "#4b5568";

const MATERIALS: { id: LabMaterial; label: string; hint: string }[] = [
  { id: "sponge", label: "إسفنج", hint: "مادة التجربة في الكتاب" },
  { id: "sand", label: "رمل ناعم", hint: "نشاط الصفحة 70" },
  { id: "snow", label: "ثلج", hint: "حالة المتزلج" },
];

const FACES: { label: string; area: number }[] = [
  { label: "الوجه الكبير", area: 0.8 },
  { label: "وجه متوسط", area: 0.4 },
  { label: "الوجه الصغير", area: 0.2 },
];

const PRESETS: { label: string; force: number; area: number; material: LabMaterial; note: string }[] = [
  { label: "متزلج على الثلج", force: 700, area: 0.9, material: "snow", note: "مساحة كبيرة على مادة لينة" },
  { label: "جمل على الرمل", force: 1500, area: 1.2, material: "sand", note: "قوة كبيرة لكن مساحة كبيرة أيضًا" },
  { label: "حصان على الرمل", force: 1100, area: 0.25, material: "sand", note: "قوة أصغر لكن مساحة صغيرة جدًا" },
  { label: "مسمار حاد", force: 120, area: 0.04, material: "sponge", note: "قوة صغيرة جدًا لكن مساحة صغيرة جدًا" },
];

type MissionId = "half-area" | "double-force" | "change-material" | "halve-force" | "target";
type Prediction = "double" | "half" | "same";

const MISSIONS: {
  id: MissionId; title: string; instruction: string; correct?: Prediction;
  kind: "predict" | "target";
  apply: { force: number; area: number; material: LabMaterial };
  explain: string;
}[] = [
  {
    id: "half-area",
    kind: "predict",
    title: "المهمة ١: قلّص المساحة إلى النصف",
    instruction: "سنثبّت القوة عند 800 N ونقلّص مساحة التماس من 0.8 m² إلى 0.4 m². ماذا تتوقع للضغط؟",
    correct: "double",
    apply: { force: 800, area: 0.4, material: "sponge" },
    explain: "المساحة صارت نصف ما كانت عند القوة نفسها، فتضاعف الضغط: نصيب كل وحدة مساحة من القوة صار ضعفًا.",
  },
  {
    id: "double-force",
    kind: "predict",
    title: "المهمة ٢: ضاعف القوة",
    instruction: "سنثبّت المساحة عند 0.5 m² ونضاعف القوة من 500 N إلى 1000 N. ماذا تتوقع للضغط؟",
    correct: "double",
    apply: { force: 1000, area: 0.5, material: "sponge" },
    explain: "القوة تضاعفت على المساحة نفسها، فتضاعف الضغط بالتناسب الطردي نفسه.",
  },
  {
    id: "change-material",
    kind: "predict",
    title: "المهمة ٣: غيّر المادة فقط",
    instruction: "سنبقي القوة 800 N والمساحة 0.4 m² ونبدّل الإسفنج بالرمل. ماذا تتوقع للضغط المحسوب؟",
    correct: "same",
    apply: { force: 800, area: 0.4, material: "sand" },
    explain: "الضغط المحسوب لم يتغيّر لأن F وs لم يتغيّرا. ما قد يختلف هو شكل الأثر المرئي بحسب ليونة المادة — والانضغاط الحقيقي ليس جزءًا من قانون الضغط.",
  },
  {
    id: "halve-force",
    kind: "predict",
    title: "المهمة ٤: نصّف القوة",
    instruction: "سنثبّت المساحة عند 0.4 m² وننصّف القوة من 800 N إلى 400 N. ماذا تتوقع للضغط؟",
    correct: "half",
    apply: { force: 400, area: 0.4, material: "sponge" },
    explain: "القوة صارت نصف ما كانت على المساحة نفسها، فصار الضغط نصفًا أيضًا بالتناسب الطردي نفسه.",
  },
  {
    id: "target",
    kind: "target",
    title: "المهمة ٥: تحدّي الضغط المستهدف",
    instruction: "من نقطة البداية (F=400 N, s=0.8 m²) عدّل مساحة التماس وحدها — دون تغيير القوة — حتى يصبح الضغط المحسوب 1000 Pa بالضبط، ثم اضغط «تحقّق من الهدف».",
    apply: { force: 400, area: 0.8, material: "sponge" },
    explain: "المساحة المطلوبة s = F/P = 400/1000 = 0.4 m²: نصف المساحة الابتدائية، لذلك تضاعف الضغط من 500 إلى 1000 Pa.",
  },
];

const PREDICTIONS: { id: Prediction; label: string }[] = [
  { id: "double", label: "يتضاعف الضغط" },
  { id: "half", label: "ينقص الضغط إلى النصف" },
  { id: "same", label: "لا يتغيّر الضغط" },
];

function fmt(n: number): string {
  if (n >= 1000) return String(Math.round(n));
  if (n >= 10) return String(Math.round(n * 10) / 10);
  return String(Math.round(n * 100) / 100);
}

export function PressurePlayground() {
  const [force, setForce] = useState(400);
  const [area, setArea] = useState(0.8);
  const [material, setMaterial] = useState<LabMaterial>("sponge");
  const [missionId, setMissionId] = useState<MissionId>("half-area");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [applied, setApplied] = useState(false);
  const [targetDone, setTargetDone] = useState(false);
  const [targetMsg, setTargetMsg] = useState<string | null>(null);
  const [graphForce, setGraphForce] = useState(600);
  const [graphArea, setGraphArea] = useState(0.6);

  const pressure = pressurePa(force, area);
  const ratio = displayIndentationRatio(pressure, material);
  const mission = MISSIONS.find((m) => m.id === missionId) ?? MISSIONS[0];

  const graph = useMemo(() => {
    const pA = pressurePa(graphForce, graphArea);
    const maxFA = 2000;
    const maxPA = pressurePa(maxFA, graphArea);
    const lineA: string[] = [];
    for (let i = 0; i <= 10; i++) {
      const f = 50 + (i * (maxFA - 50)) / 10;
      lineA.push(`${f},${pressurePa(f, graphArea)}`);
    }
    const curveB: string[] = [];
    for (let i = 0; i <= 16; i++) {
      const s = 0.05 + (i * (1.6 - 0.05)) / 16;
      curveB.push(`${s},${pressurePa(graphForce, s)}`);
    }
    return { pA, maxPA, lineA, curveB, maxPB: pressurePa(graphForce, 0.05) };
  }, [graphForce, graphArea]);


  // تعديل يدوي بعد «طبّق» يُبطل نتيجة التوقّع، لكنه لا يُبطل المهمة المستهدفة (تعديلها هو المطلوب أصلًا).
  function invalidate() {
    if (mission.kind === "predict") setApplied(false);
  }

  function applyMission() {
    setForce(mission.apply.force);
    setArea(mission.apply.area);
    setMaterial(mission.apply.material);
    setApplied(true);
    setTargetDone(false);
    setTargetMsg(null);
  }

  function checkTarget() {
    if (force !== 400) {
      setTargetMsg("غيّرت القوة أيضًا! أعِد الضبط ثم عدّل المساحة وحدها.");
      return;
    }
    if (pressure === 1000) {
      setTargetDone(true);
      setTargetMsg("أحسنت! حقّقت الضغط المستهدف. " + mission.explain);
    } else {
      setTargetMsg(`الضغط الحالي ${fmt(pressure)} Pa. جرّب مساحة أصغر لتكبير الضغط، أو أكبر لتصغيره.`);
    }
  }

  function resetAll() {
    setForce(400);
    setArea(0.8);
    setMaterial("sponge");
    setPrediction(null);
    setApplied(false);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-[#d3dde7] bg-white shadow-[0_18px_40px_-30px_rgba(26,36,56,0.45)]" aria-labelledby="pressure-lab-title">
      <header className="border-b border-[#e2e9f0] bg-[#f2f5f9] px-5 py-5 md:px-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9cfd8] bg-white px-3 py-1 text-[13px] font-black text-[#33568f]">
            <Activity className="h-4 w-4" /> مختبر تفاعلي
          </span>
          <h3 id="pressure-lab-title" className="text-xl font-black text-[#1a2438]">مختبر الإسفنجة والضغط</h3>
        </div>
        <p className="mt-2 max-w-3xl text-sm font-bold leading-7 text-[#4b5568]">
          غيّر شدة القوة الضاغطة ومساحة التماس والمادة، ولاحظ الضغط المحسوب بالقانون والأثر البصري النسبي.
          ابدأ بالمهمات الخمس: توقّع أولًا، ثم طبّق التغيير وقارن — والأخيرة تحدٍّ عددي تحقّقه بنفسك.
        </p>
      </header>

      <div className="grid gap-5 bg-white p-4 md:p-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {/* المشهد */}
          <div className="rounded-2xl border border-[#e2e9f0] bg-[#f2f5f9] p-3 sm:p-5">
            <div className={styles.onlyWide}>
              <PressureScene force={force} area={area} material={material} ratio={ratio} />
            </div>
            <div className={styles.onlyNarrow}>
              <PressureScene compact force={force} area={area} material={material} ratio={ratio} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-bold text-[#3d4a5f]">
                شدة القوة الضاغطة <TeX>{`F=${force}\\,\\text{N}`}</TeX>
                <input aria-label="شدة القوة الضاغطة بالنيوتن" className="mt-2 w-full accent-[#a8304a]" type="range" min="50" max="2000" step="50" value={force}
                  onChange={(e) => { setForce(Number(e.target.value)); invalidate(); }} />
              </label>
              <label className="block text-sm font-bold text-[#3d4a5f]">
                مساحة سطح التماس <TeX>{`s=${area}\\,\\text{m}^2`}</TeX>
                <input aria-label="مساحة سطح التماس بالمتر المربع" className="mt-2 w-full accent-[#23608f]" type="range" min="0.05" max="1.6" step="0.05" value={area}
                  onChange={(e) => { setArea(Number(e.target.value)); invalidate(); }} />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="وجوه متوازي المستطيلات">
              <span className="text-[13px] font-black text-[#3d4a5f]">وجه التماس:</span>
              {FACES.map((f) => (
                <button key={f.label} type="button" aria-pressed={Math.abs(area - f.area) < 1e-9} onClick={() => { setArea(f.area); invalidate(); }}
                  className={`min-h-10 rounded-lg border px-3 py-1.5 text-[13px] font-black ${Math.abs(area - f.area) < 1e-9 ? "border-[#23608f] bg-[#eaf1fa] text-[#1a2438]" : "border-[#d3dde7] bg-white text-[#3d4a5f] hover:bg-[#f2f5f9]"}`}>
                  {f.label} <TeX>{`${f.area}\\,\\text{m}^2`}</TeX>
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="مادة السطح">
              <span className="text-[13px] font-black text-[#3d4a5f]">المادة:</span>
              {MATERIALS.map((m) => (
                <button key={m.id} type="button" aria-pressed={material === m.id} onClick={() => { setMaterial(m.id); invalidate(); }}
                  className={`min-h-10 rounded-lg border px-3 py-1.5 text-[13px] font-black ${material === m.id ? "border-[#a97e2f] bg-[#fdf6e0] text-[#1a2438]" : "border-[#d3dde7] bg-white text-[#3d4a5f] hover:bg-[#f2f5f9]"}`}>
                  {m.label}
                </button>
              ))}
              <span className="text-[12px] font-bold text-[#4b5568]">{MATERIALS.find((m) => m.id === material)?.hint}</span>
            </div>
          </div>

          {/* تنبيه النموذج التعليمي */}
          <div className="flex items-start gap-3 rounded-2xl border border-[#e3d4b6] bg-[#fdf8ee] p-4">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#8a5a00]" />
            <p className="text-[13px] font-bold leading-7 text-[#5a4212]">
              عمق الانضغاط الذي تراه <strong>مؤشر بصري نسبي تقريبي للتوضيح فقط</strong>، يتدخل فيه نوع المادة وليونتها،
              وهو ليس قيمة مقاسة ولا يُحسب من قانون الضغط وحده. الكمية الفيزيائية المحسوبة هنا هي الضغط
              <TeX>{"P=F/s"}</TeX> فقط.
            </p>
          </div>

          {/* إعدادات جاهزة */}
          <div>
            <h4 className="text-sm font-black text-[#26406e]">قارن بنفسك (قيم تعليمية مبسّطة)</h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => { setForce(p.force); setArea(p.area); setMaterial(p.material); setApplied(false); }}
                  className="min-h-10 rounded-lg border border-[#d3dde7] bg-white px-3 py-1.5 text-[13px] font-black text-[#3d4a5f] hover:bg-[#f2f5f9]">
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[12px] font-bold text-[#4b5568]">جرّب «جمل على الرمل» ثم «حصان على الرمل»: القوة أكبر عند الجمل، فمن ضغطه أكبر؟ احسب قبل أن تنظر إلى النتيجة.</p>
          </div>
        </div>

        <aside className="space-y-4">
          {/* النتيجة */}
          <div className="rounded-2xl border border-[#e3d4b6] bg-[#fdf8ee] p-5" aria-live="polite">
            <h4 className="text-base font-black text-[#785618]">الضغط المحسوب بالقانون</h4>
            <div className="mt-3 space-y-2 text-sm font-bold text-[#1a2438]">
              <p><TeX>{`P=\\dfrac{F}{s}=\\dfrac{${force}}{${area}}=${fmt(pressure)}\\,\\text{Pa}`}</TeX></p>
              <p className="text-lg text-[#785618]"><TeX>{`P=${fmt(pressure)}\\,\\text{Pa}`}</TeX></p>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[12px] font-black text-[#5a4212]">
                <span>مؤشر الانضغاط البصري النسبي (تقريبي)</span>
                <span dir="ltr">{Math.round(ratio * 100)}%</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[#eee3c8]">
                <div className="h-full rounded-full bg-[#c99a2e] transition-all duration-500" style={{ width: `${Math.round(ratio * 100)}%` }} />
              </div>
              <p className="mt-1.5 text-[11.5px] font-bold leading-6 text-[#5a4212]">نسبة من أقصى انضغاط يعرضه هذا المختبر — ليست قياسًا حقيقيًا لعمق الغوص.</p>
            </div>
          </div>

          {/* المهمات والتوقع */}
          <div className="rounded-2xl border border-[#bcd4e6] bg-[#eef5fb] p-4">
            <h4 className="text-sm font-black text-[#26406e]">توقّع ← طبّق ← فسّر</h4>
            <div className="mt-3 grid gap-2" role="group" aria-label="مهمات المختبر">
              {MISSIONS.map((m) => (
                <button key={m.id} type="button" aria-pressed={missionId === m.id}
                  onClick={() => { setMissionId(m.id); setPrediction(null); setApplied(false); setTargetDone(false); setTargetMsg(null); }}
                  className={`min-h-11 rounded-xl border px-3 py-2 text-right text-[13px] font-black ${missionId === m.id ? "border-[#33568f] bg-white text-[#1a2438]" : "border-[#c9cfd8] bg-white text-[#3d4a5f]"}`}>
                  {m.title}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] font-bold leading-7 text-[#26406e]">{mission.instruction}</p>
            {mission.kind === "predict" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {PREDICTIONS.map((p) => (
                  <button key={p.id} type="button" aria-pressed={prediction === p.id} onClick={() => setPrediction(p.id)}
                    className={`rounded-lg border px-3 py-2 text-[13px] font-black ${prediction === p.id ? "border-[#33568f] bg-white text-[#1a2438]" : "border-[#c9cfd8] bg-white text-[#3d4a5f]"}`}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={applyMission} disabled={mission.kind === "predict" && !prediction}
                style={{ color: "#ffffff" }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#33568f] px-4 text-sm font-black text-white hover:bg-[#27436f] disabled:opacity-60">
                <Play className="h-4 w-4" /> {mission.kind === "target" ? "ابدأ من نقطة البداية" : "طبّق التغيير"}
              </button>
              {mission.kind === "target" && applied && (
                <button type="button" onClick={checkTarget}
                  style={{ color: "#ffffff" }} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#5b46b8] px-4 text-sm font-black text-white hover:bg-[#48379a]">
                  تحقّق من الهدف
                </button>
              )}
              <button type="button" onClick={resetAll}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#c9cfd8] bg-white px-4 text-sm font-black text-[#26406e] hover:bg-[#f2f5f9]">
                <RotateCcw className="h-4 w-4" /> إعادة الضبط
              </button>
            </div>
            {applied && prediction && mission.kind === "predict" && (
              <div role="status" className={`mt-3 rounded-xl border p-4 text-[13px] font-bold leading-7 ${prediction === mission.correct ? "border-[#9ec9b4] bg-[#edf7f1] text-[#0f5c46]" : "border-[#e3d4b6] bg-[#fdf8ee] text-[#6b4a10]"}`}>
                {prediction === mission.correct ? "أحسنت، توقعك صحيح. " : "قارن توقعك بالنتيجة الجديدة في الأعلى. "}{mission.explain}
              </div>
            )}
            {mission.kind === "target" && targetMsg && (
              <div role="status" className={`mt-3 rounded-xl border p-4 text-[13px] font-bold leading-7 ${targetDone ? "border-[#9ec9b4] bg-[#edf7f1] text-[#0f5c46]" : "border-[#e3d4b6] bg-[#fdf8ee] text-[#6b4a10]"}`}>
                {targetMsg}
              </div>
            )}
          </div>
        </aside>
      </div>

      <RelationshipExplorer
        force={graphForce} area={graphArea} pressure={graph.pA}
        onForce={setGraphForce} onArea={setGraphArea}
        lineA={graph.lineA} curveB={graph.curveB} maxPA={graph.maxPA} maxPB={graph.maxPB}
      />

      <div className="border-t border-[#e2e9f0] bg-[#f8f5ec] px-5 py-5 md:px-7">
        <h4 className="flex items-center gap-2 text-base font-black text-[#785618]">
          <Home className="h-5 w-5" /> نشاط منزلي (الكتاب — صفحة 70)
        </h4>
        <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-sm font-bold leading-7 text-[#4b5568]">
          <li>خذ وعاءً بلاستيكيًا وضع فيه كمية من الرمل الناعم وسوِّ سطحه.</li>
          <li>ضع قطعة خشب على شكل متوازي مستطيلات فوق الرمل بحيث يلامس أحد أوجهها سطح الرمل الأفقي. ماذا تلاحظ؟</li>
          <li>ضع فوق قطعة الخشب السابقة ثقلًا. ماذا تلاحظ؟</li>
          <li>اقلِب قطعة الخشب على وجه مختلف عن السابق. ماذا تلاحظ؟</li>
          <li>فسّر ما حدث مستخدمًا عاملي الضغط: شدة القوة الضاغطة ومساحة السطح.</li>
        </ol>
        <p className="mt-2 text-[13px] font-bold leading-7 text-[#5a4212]">قارن ملاحظاتك بنتائج المختبر: الوجه المختلف غيّر المساحة، والثقل الإضافي غيّر القوة.</p>
      </div>
    </section>
  );
}

/* ───────── مشهد المختبر ───────── */
function PressureScene({ force, area, material, ratio, compact = false }: {
  force: number; area: number; material: LabMaterial; ratio: number; compact?: boolean;
}) {
  const W = compact ? 360 : 560;
  const H = compact ? 250 : 264;
  const groundY = compact ? 188 : 196;
  const cx = W / 2;
  // عرض الجسم يزداد مع مساحة التماس، وارتفاعه ينقص (متوازي مستطيلات نفسه بوجه مختلف)
  const bw = (compact ? 44 : 52) + Math.sqrt(area) * (compact ? 52 : 62);
  const bh = Math.max(compact ? 40 : 44, (compact ? 108 : 118) - bw * 0.42);
  const depth = ratio * (compact ? 26 : 30);
  const blockY = groundY + depth - bh;
  const arrowLen = 22 + (force / 2000) * 42;
  const matFill = material === "sponge" ? C.sponge : material === "sand" ? C.sand : C.snow;
  const matEdge = material === "sponge" ? C.spongeEdge : material === "sand" ? C.sandEdge : C.snowEdge;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="مشهد مختبر الضغط: جسم على سطح لين">
      <Panel x={4} y={4} w={W - 8} h={H - 8} />
      {/* أسهم القوة الضاغطة */}
      {[-0.28, 0, 0.28].map((off, i) => (
        <g key={i}>
          <Vector from={[cx + off * bw, blockY - arrowLen - 14]} to={[cx + off * bw, blockY - 16]} color={C.red} width={4.4} />
        </g>
      ))}
      <Label at={[cx + bw / 2 + 34, blockY - arrowLen - 4]} tex="F" color={C.red} width={36} size={compact ? 21 : 16} />
      {/* الجسم والسطح */}
      <MetalBlock x={cx - bw / 2} y={blockY} w={bw} h={bh} />
      {material === "sponge" ? (
        <Sponge x={cx - (compact ? 132 : 190)} y={groundY} w={compact ? 264 : 380} h={compact ? 40 : 44} cx={cx} dipWidth={bw + 30} depth={depth} />
      ) : (
        <DippedSurface x1={cx - (compact ? 132 : 190)} x2={cx + (compact ? 132 : 190)} y={groundY} cx={cx} dipWidth={bw + 30} depth={depth} color={matEdge} fill={matFill} />
      )}
      {/* بصمة التماس */}
      <rect x={cx - bw / 2} y={groundY + depth - 3} width={bw} height={6} fill="#bcd9ef" stroke={C.blue} strokeWidth={1.6} />
      <Label at={[cx, H - 14]} tex={`s=${area}\\,\\text{m}^2`} color={C.blue} width={110} size={compact ? 20 : 15} />
      <ArabicLabel at={[compact ? 66 : 84, 30]} text={material === "sponge" ? "إسفنج" : material === "sand" ? "رمل ناعم" : "ثلج"} size={compact ? 18 : 14} color={C.ink2} />
    </svg>
  );
}

/* ───────── مستكشف العلاقات ───────── */
function RelationshipExplorer({ force, area, pressure, onForce, onArea, lineA, curveB, maxPA, maxPB }: {
  force: number; area: number; pressure: number;
  onForce: (n: number) => void; onArea: (n: number) => void;
  lineA: string[]; curveB: string[]; maxPA: number; maxPB: number;
}) {
  const doubledF = pressurePa(force * 2, area);
  const doubledS = pressurePa(force, area * 2);
  // تحويل القيم إلى إحداثيات لوحة 260×170 (منطقة رسم 200×120)
  const plotA = lineA.map((pt) => {
    const [f, p] = pt.split(",").map(Number);
    const x = 44 + ((f - 50) / 1950) * 200;
    const y = 138 - (p / maxPA) * 118;
    return `${x},${y}`;
  }).join(" ");
  const plotB = curveB.map((pt) => {
    const [s, p] = pt.split(",").map(Number);
    const x = 44 + ((s - 0.05) / 1.55) * 200;
    const y = 138 - (p / maxPB) * 118;
    return `${x},${y}`;
  }).join(" ");
  const dotAx = 44 + ((force - 50) / 1950) * 200;
  const dotAy = 138 - (pressure / maxPA) * 118;
  const dotBx = 44 + ((area - 0.05) / 1.55) * 200;
  const dotBy = 138 - (pressure / maxPB) * 118;

  const chart = (title: string, points: string, dot: [number, number], xLabel: string) => (
    <div className="rounded-2xl border border-[#e2e9f0] bg-[#f7fafc] p-3">
      <h5 className="text-center text-[13px] font-black" style={{ color: INK }}>{title}</h5>
      <svg viewBox="0 0 260 170" className="h-auto w-full" role="img" aria-label={title}>
        <line x1={44} y1={20} x2={44} y2={138} stroke={C.rule} strokeWidth={2} />
        <line x1={44} y1={138} x2={248} y2={138} stroke={C.rule} strokeWidth={2} />
        <polyline points={points} fill="none" stroke={C.gold} strokeWidth={2.6} strokeLinejoin="round" />
        <circle cx={dot[0]} cy={dot[1]} r={4.6} fill={C.red} stroke="#fff" strokeWidth={1.6} />
        <ArabicLabel at={[24, 30]} text="P" size={14} color={C.gold} />
        <ArabicLabel at={[236, 158]} text={xLabel} size={14} color={C.ink2} />
      </svg>
    </div>
  );

  return (
    <div className="border-t border-[#e2e9f0] bg-white px-5 py-5 md:px-7">
      <h4 className="text-base font-black" style={{ color: INK }}>مستكشف العلاقات: كيف يتغيّر الضغط؟</h4>
      <p className="mt-1 text-[13px] font-bold leading-7" style={{ color: MUTED }}>
        حرّك القيمتين وشاهد الخطين: مع القوة علاقة طردية (خط مستقيم)، ومع المساحة علاقة عكسية (منحنٍ يتناقص).
        وتحقّق عدديًا من أثر المضاعفة في الأسفل.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-[#3d4a5f]">
            القوة <TeX>{`F=${force}\\,\\text{N}`}</TeX>
            <input aria-label="قوة مستكشف العلاقات" className="mt-2 w-full accent-[#a8304a]" type="range" min="50" max="2000" step="50" value={force} onChange={(e) => onForce(Number(e.target.value))} />
          </label>
          <label className="block text-sm font-bold text-[#3d4a5f]">
            المساحة <TeX>{`s=${area}\\,\\text{m}^2`}</TeX>
            <input aria-label="مساحة مستكشف العلاقات" className="mt-2 w-full accent-[#23608f]" type="range" min="0.05" max="1.6" step="0.05" value={area} onChange={(e) => onArea(Number(e.target.value))} />
          </label>
          <div className="rounded-2xl border border-[#e3d4b6] bg-[#fdf8ee] p-4 text-[13px] font-bold leading-7 text-[#5a4212]">
            <p>الضغط الآن: <TeX>{`P=${fmt(pressure)}\\,\\text{Pa}`}</TeX></p>
            <p>عند مضاعفة القوة وحدها: <TeX>{`P=${fmt(doubledF)}\\,\\text{Pa}`}</TeX> — تضاعف تمامًا.</p>
            <p>عند مضاعفة المساحة وحدها: <TeX>{`P=${fmt(doubledS)}\\,\\text{Pa}`}</TeX> — صار النصف تمامًا.</p>
            <p className="mt-1 text-[12px]">تحقق أيضًا: <TeX>{`F=P\\,s=${fmt(forceFromPressureN(pressure, area))}\\,\\text{N}`}</TeX> و <TeX>{`s=F/P=${fmt(areaFromPressureM2(force, pressure))}\\,\\text{m}^2`}</TeX> — القانون نفسه يعمل بالاتجاهات الثلاثة.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {chart("الضغط مع القوة (مساحة ثابتة)", plotA, [dotAx, dotAy], "F")}
          {chart("الضغط مع المساحة (قوة ثابتة)", plotB, [dotBx, dotBy], "s")}
        </div>
      </div>
    </div>
  );
}
