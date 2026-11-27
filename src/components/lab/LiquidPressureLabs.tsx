"use client";

/**
 * أربعة مختبرات تفاعلية خاصة بدرس «الضغط في السوائل» (ص 71–80):
 *  L1 الأنبوب ذو الثقوب الثلاثة · L2 المانومتر · L3 الكأسان والقانون
 *  L4 السدّ والأواني المستطرقة.
 *
 * كل مختبر: توقّع قبل التشغيل → تغيير متغيّرات → تشغيل/إيقاف/إعادة ضبط →
 * ملاحظة ومقارنة → استنتاج → تغذية راجعة. الحسابات من النموذج الصرف،
 * أما طول الفوّارة وفرق سويتي المانومتر فمؤشران بصريان نسبيان فقط،
 * ولا يُقرآن كقياسات أو سرعات حقيقية. لا تُدخل هذه المختبرات قوانين أخرى.
 */
import { useState, type ReactNode } from "react";
import { Activity, FlaskConical, Play, RotateCcw, Square } from "lucide-react";
import { AutoTex, Q, TeX } from "@/components/math/TeX";
import { RichText } from "@/components/content/RichText";
import { ArabicLabel, C, Label, Panel, PointMark, Vector } from "@/components/figures/pressure-drawing";
import {
  BOOK_DENSITIES, LIQUID_LABELS, MODEL_ASSUMPTIONS,
  densityOf, equalSurfaceHeights, fmt, hydrostaticPressure,
  jetReachIndicator, manometerGapIndicator, pressureDifference,
  type BookLiquidId,
} from "@/lib/liquid-pressure-model";
import { rich } from "@/lib/liquid-pressure-rich";
import styles from "./LiquidPressureLabs.module.css";

const INK = C.ink;
const WATER = "#54b6e8";
const WATER_EDGE = "#1b5a86";
const SALT = "#9a72bd";
const RED = C.red;
const GREEN = C.green;
const GOLD = C.gold;
const VIOLET = C.violet;
const BLUE = C.blue;

const LAB_TABS = [
  { id: "three-holes", title: "الأنبوب ذو الثقوب الثلاثة", page: "ص 72" },
  { id: "manometer", title: "مقياس ضغط السوائل", page: "ص 73–74" },
  { id: "two-glasses", title: "الكأسان وقانون الضغط", page: "ص 74–75" },
  { id: "dam-vessels", title: "السدّ والأواني المستطرقة", page: "ص 77" },
] as const;

type TabId = (typeof LAB_TABS)[number]["id"];
type PredictionOption = { id: string; label: string };

function LabBackdrop({ w, h }: { w: number; h: number }) {
  return <rect x={3} y={3} width={w - 6} height={h - 6} rx={16} fill="#f7fafc" stroke={C.panelEdge} strokeWidth={1.5} />;
}

function SceneTitle({ w, text, sub, size = 19 }: { w: number; text: string; sub?: string; size?: number }) {
  return (
    <g>
      <ArabicLabel at={[w / 2, 31]} text={text} size={size} color={INK} weight={900} />
      {sub && <ArabicLabel at={[w / 2, 55]} text={sub} size={Math.max(11.5, size - 5)} color={C.ink2} weight={700} />}
    </g>
  );
}

function ResponsiveScene({ title, desc, wideBox, narrowBox, wide, narrow }: {
  title: string; desc: string; wideBox: string; narrowBox: string; wide: ReactNode; narrow: ReactNode;
}) {
  return (
    <div className={styles.sceneWrap}>
      <h4 className={styles.sceneTitle}>{title}</h4>
      <svg className={`${styles.svg} ${styles.onlyWide}`} viewBox={wideBox} role="img" aria-label={desc} preserveAspectRatio="xMidYMid meet">
        <title>{desc}</title>{wide}
      </svg>
      <svg className={`${styles.svg} ${styles.onlyNarrow}`} viewBox={narrowBox} role="img" aria-label={desc} preserveAspectRatio="xMidYMid meet">
        <title>{desc}</title>{narrow}
      </svg>
    </div>
  );
}

function LabVessel({ x, y, w, h, surfaceY, liquid = WATER, edge = WATER_EDGE }: {
  x: number; y: number; w: number; h: number; surfaceY: number; liquid?: string; edge?: string;
}) {
  return (
    <g>
      <rect x={x + 3} y={surfaceY} width={w - 6} height={y + h - surfaceY - 3} rx={5} fill={liquid} opacity={0.4} />
      <path d={`M${x + 3} ${surfaceY} Q${x + w * .25} ${surfaceY - 5} ${x + w * .5} ${surfaceY} T${x + w - 3} ${surfaceY}`}
        fill="none" stroke={edge} strokeWidth={2.2} />
      <rect x={x} y={y} width={w} height={h} rx={9} fill="none" stroke={C.rule} strokeWidth={2.8} />
    </g>
  );
}

function LabManometer({ x, y, scale = 1, gap = 30, caption }: { x: number; y: number; scale?: number; gap?: number; caption?: string }) {
  const leftX = x + 62 * scale;
  const rightX = x + 140 * scale;
  const top = y;
  const bottom = y + 150 * scale;
  const mid = y + 88 * scale;
  const left = mid - gap / 2;
  const right = mid + gap / 2;
  return (
    <g>
      <rect x={x - 6 * scale} y={y - 8 * scale} width={224 * scale} height={176 * scale} rx={13 * scale}
        fill="#eef5fa" stroke={C.panelEdge} strokeWidth={1.4 * scale} />
      <path d={`M${leftX} ${bottom} L${leftX} ${top + 20 * scale} Q${leftX} ${top} ${leftX + 20 * scale} ${top} L${rightX - 20 * scale} ${top} Q${rightX} ${top} ${rightX} ${top + 20 * scale} L${rightX} ${bottom}`}
        fill="none" stroke={C.rule} strokeWidth={6.5 * scale} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={leftX - 5 * scale} y={left} width={10 * scale} height={bottom - left} fill={WATER_EDGE} opacity={0.9} />
      <rect x={rightX - 5 * scale} y={right} width={10 * scale} height={bottom - right} fill={WATER_EDGE} opacity={0.9} />
      <line x1={leftX - 17 * scale} y1={left} x2={rightX + 17 * scale} y2={left} stroke={C.guide} strokeWidth={1.2 * scale} strokeDasharray="5 4" />
      <line x1={leftX - 17 * scale} y1={right} x2={rightX + 17 * scale} y2={right} stroke={C.guide} strokeWidth={1.2 * scale} strokeDasharray="5 4" />
      {caption && <ArabicLabel at={[x + 106 * scale, bottom + 22 * scale]} text={caption} size={12 * scale} color={C.ink2} />}
    </g>
  );
}

function Assumptions({ extra }: { extra?: string }) {
  return (
    <div className={styles.assumptions}>
      <h4>افتراضات النموذج المعلنة</h4>
      <ul>{MODEL_ASSUMPTIONS.map((a) => <li key={a}>{a}</li>)}</ul>
      <p className={styles.visualNote}>
        المؤشرات البصرية في الرسم نسبية للتعليم فقط؛ القيم الرقمية المعتمدة هي الناتجة عن القانون، وليست مقروءة من طول سهم أو فارق سوية.
      </p>
      {extra && <p className={styles.visualNote}>{extra}</p>}
    </div>
  );
}

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={styles.metricValue}>{unit ? <Q v={value} u={unit} /> : value}</span>
    </div>
  );
}

function LabShell({ id, title, page, intro, controls, predictionLabel, predictionOptions, prediction, onPrediction, correct,
  run, onRun, onStop, onReset, scene, observations, conclusion, feedback, feedbackOk, extraAssumption }: {
  id: string; title: string; page: string; intro: string; controls: ReactNode;
  predictionLabel: string; predictionOptions: readonly PredictionOption[];
  prediction: string | null; onPrediction: (v: string) => void; correct: string;
  run: boolean; onRun: () => void; onStop: () => void; onReset: () => void;
  scene: ReactNode; observations: ReactNode; conclusion: ReactNode;
  feedback: string; feedbackOk: boolean; extraAssumption?: string;
}) {
  return (
    <article className={styles.lab} data-lab-id={id} data-run={run ? "true" : "false"} aria-label={`مختبر ${title}`}>
      <div className={styles.labHead}>
        <h3 className={styles.labTitle}>{title}</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span className={styles.badge}><FlaskConical size={14} />من الكتاب — {page}</span>
          <span className={`${styles.badge} ${styles.badgePlatform}`}><Activity size={14} />تفاعل من المنصة</span>
        </div>
      </div>
      <p className={styles.labIntro}>{intro}</p>

      <div className={styles.grid}>
        <section className={styles.panel} aria-label="لوحة التحكم والتوقع">
          <h4 className={styles.panelTitle}>١. غيّر المتغيّرات</h4>
          {controls}
          <h4 className={styles.panelTitle} style={{ marginTop: 18 }}>٢. توقّع قبل التشغيل</h4>
          <p className={styles.controlLabel}>{predictionLabel}</p>
          <div className={styles.predict} data-prediction-group={id}>
            {predictionOptions.map((o) => {
              const selected = prediction === o.id;
              const state = run && correct === o.id ? styles.choiceCorrect : run && selected ? styles.choiceWrong : selected ? styles.choiceActive : "";
              return (
                <button key={o.id} type="button" className={`${styles.choice} ${state}`}
                  aria-pressed={selected} onClick={() => onPrediction(o.id)} disabled={run}>
                  {o.label}
                </button>
              );
            })}
          </div>
          <div className={styles.buttons}>
            <button type="button" className={`${styles.button} ${styles.run}`} data-run-button={id} onClick={onRun} disabled={!prediction || run}>
              <Play size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />شغّل التجربة
            </button>
            <button type="button" className={`${styles.button} ${styles.stop}`} data-stop-button={id} onClick={onStop} disabled={!run}>
              <Square size={14} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />أوقف
            </button>
            <button type="button" className={`${styles.button} ${styles.reset}`} data-reset-button={id} onClick={onReset}>
              <RotateCcw size={14} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />إعادة الضبط
            </button>
          </div>
        </section>

        <section className={styles.panel} aria-label="مشهد التجربة">
          {scene}
          {run && <div className={styles.numeric}>{observations}</div>}
        </section>
      </div>

      {run && (
        <section className={styles.observations} aria-live="polite">
          <h4>٣. لاحظ وقارن ثم استنتج</h4>
          <div className={styles.observeText}>{conclusion}</div>
          <div className={`${styles.feedback} ${feedbackOk ? "" : styles.feedbackWarn}`}>{feedback}</div>
        </section>
      )}
      <Assumptions extra={extraAssumption} />
    </article>
  );
}

/* ═════════════════════════ L1: الأنبوب ذو الثقوب الثلاثة ═════════════════════════ */

function ThreeHolesLab() {
  const [scale, setScale] = useState(1);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [run, setRun] = useState(false);
  const baseH = [0.2, 0.5, 0.8];
  const hs = baseH.map((h) => Number((h * scale).toFixed(2)));
  const ps = hs.map((h) => hydrostaticPressure(BOOK_DENSITIES.water, h));
  const pMax = Math.max(...ps);
  const reaches = ps.map((p) => 26 + 175 * jetReachIndicator(p, pMax));
  const correct = "deep";
  const feedbackOk = prediction === correct;

  const wide = (
    <g>
      <LabBackdrop w={640} h={340} />
      <SceneTitle w={640} text="أنبوب مدرّج بثلاثة ثقوب" sub="السدادات تُنزع بآن واحد — طول الفوّارة مؤشر نسبي" />
      <Panel x={18} y={70} w={284} h={248} />
      <LabVessel x={58} y={86} w={96} h={212} surfaceY={110} />
      {hs.map((h, i) => {
        const y = 130 + (h / Math.max(...hs)) * 160;
        return (
          <g key={i}>
            <circle cx={154} cy={y} r={5.5} fill="#fff" stroke={C.rule} strokeWidth={2} />
            {run ? (
              <g>
                <path d={`M154 ${y} Q${154 + reaches[i] * .55} ${y - 8} ${154 + reaches[i]} ${y + reaches[i] * .22}`}
                  fill="none" stroke={WATER_EDGE} strokeWidth={3 + i} strokeLinecap="round" />
                <circle cx={154 + reaches[i]} cy={y + reaches[i] * .22} r={4} fill={WATER_EDGE} />
              </g>
            ) : <ArabicLabel at={[154, y - 14]} text="سدادة" size={10.5} color={C.ink2} />}
            <Label at={[210, y]} tex={`h_${i + 1}=${h.toFixed(2)}\\,\\mathrm{m}`} color={BLUE} size={13} width={104} />
          </g>
        );
      })}
      <ArabicLabel at={[106, 310]} text="سطح الماء الحرّ" size={12} color={WATER_EDGE} />
      <Panel x={316} y={70} w={306} h={248} />
      <ArabicLabel at={[469, 98]} text="ضغط السائل عند كل ثقب" size={15} color={BLUE} weight={900} />
      {ps.map((p, i) => (
        <g key={i}>
          <rect x={338} y={118 + i * 58} width={262} height={46} rx={11} fill={i === 2 ? "#fff1f3" : "#eef7fc"} stroke={i === 2 ? "#e3aeb9" : "#b9d2e8"} />
          <ArabicLabel at={[380, 147 + i * 58]} text={`الثقب ${i + 1}`} size={12.5} color={INK} />
          <Label at={[510, 147 + i * 58]} tex={`P_${i + 1}=${p.toFixed(0)}\\,\\mathrm{Pa}`} color={i === 2 ? RED : GOLD} size={14} width={150} />
        </g>
      ))}
    </g>
  );
  const narrow = (
    <g>
      <LabBackdrop w={360} h={490} />
      <SceneTitle w={360} text="الثقوب الثلاثة" sub="الفوّارة مؤشر نسبي" size={18} />
      <Panel x={10} y={68} w={340} h={280} />
      <LabVessel x={30} y={86} w={76} h={242} surfaceY={106} />
      {hs.map((h, i) => {
        const y = 122 + (h / Math.max(...hs)) * 190;
        const reach = 24 + 125 * jetReachIndicator(ps[i], pMax);
        return (
          <g key={i}>
            <circle cx={106} cy={y} r={5} fill="#fff" stroke={C.rule} strokeWidth={2} />
            {run ? (
              <path d={`M106 ${y} Q${106 + reach * .55} ${y - 7} ${106 + reach} ${y + reach * .2}`}
                fill="none" stroke={WATER_EDGE} strokeWidth={2.6 + i} strokeLinecap="round" />
            ) : null}
            <Label at={[250, y - 12]} tex={`h_${i + 1}=${h.toFixed(2)}\\,\\mathrm{m}`} color={BLUE} size={12} width={120} />
            <Label at={[250, y + 12]} tex={`P_${i + 1}=${ps[i].toFixed(0)}\\,\\mathrm{Pa}`} color={i === 2 ? RED : GOLD} size={12} width={140} />
          </g>
        );
      })}
      <ArabicLabel at={[68, 340]} text="سطح حرّ" size={11.5} color={WATER_EDGE} />
      <Panel x={10} y={360} w={340} h={112} />
      <ArabicLabel at={[180, 390]} text="الضغط يزداد مع العمق" size={15} color={GREEN} weight={900} />
      <Label at={[180, 428]} tex={String.raw`P=\rho g h`} color={GOLD} size={20} width={150} />
      <ArabicLabel at={[180, 458]} text="لا نستنتج سرعة مقاسة" size={12} color={C.ink2} />
    </g>
  );

  return (
    <LabShell
      id="three-holes" title="المختبر ١: الأنبوب ذو الثقوب الثلاثة" page="ص 72"
      intro="غيّر أعماق الثقوب، وتوقّع أيّها يندفع ماؤه أكثر، ثم شغّل التجربة وقارن القيم المحسوبة بملاحظتك."
      predictionLabel="أيّ ثقب تتوقّع أن يكون اندفاع مائه أكثر؟"
      predictionOptions={[
        { id: "top", label: "الثقب الأقرب إلى سطح السائل" },
        { id: "middle", label: "الثقب الأوسط" },
        { id: "deep", label: "الثقب الأعمق" },
      ]}
      prediction={prediction} onPrediction={(v) => { setPrediction(v); setRun(false); }} correct={correct}
      run={run} onRun={() => setRun(true)} onStop={() => setRun(false)}
      onReset={() => { setScale(1); setPrediction(null); setRun(false); }}
      controls={(
        <>
          <label className={styles.control}>
            <span className={styles.controlLabel}>مضاعف أعماق الثقوب <span className={styles.controlValue}>× {scale.toFixed(1)}</span></span>
            <input className={styles.range} type="range" min="0.5" max="1.5" step="0.1" value={scale}
              onChange={(e) => { setScale(Number(e.target.value)); setRun(false); }} aria-label="مضاعف أعماق الثقوب" />
          </label>
          <div className={styles.control}>
            <span className={styles.controlLabel}>ثوابت الحساب المعلنة</span>
            <div className={styles.numeric} style={{ marginTop: 0 }}>
              <Metric label="ρ (ماء، ص 76)" value="1000" unit="kg·m⁻³" />
              <Metric label="g" value="10" unit="m·s⁻²" />
            </div>
          </div>
        </>
      )}
      scene={<ResponsiveScene title="المشهد التفاعلي" desc="ثلاثة ثقوب على أعماق مختلفة وفوّارات نسبية" wideBox="0 0 640 340" narrowBox="0 0 360 490" wide={wide} narrow={narrow} />}
      observations={(
        <>
          {hs.map((h, i) => <Metric key={i} label={`h${i + 1}`} value={h.toFixed(2)} unit="m" />)}
          {ps.map((p, i) => <Metric key={`p${i}`} label={`P${i + 1}`} value={fmt(p)} unit="Pa" />)}
        </>
      )}
      conclusion={(
        <>
          <p className={styles.observeText}>
            عند ثبات <TeX>{String.raw`\rho`}</TeX> و<TeX>{String.raw`g`}</TeX>، كلّما زاد العمق <TeX>{String.raw`h`}</TeX> زاد ضغط السائل <TeX>{String.raw`P`}</TeX>.
            الثقب الأعمق له أكبر <TeX>{String.raw`P=\rho g h`}</TeX>؛ ولذلك كان اندفاعه الأكثر في تجربة الكتاب.
          </p>
          <div className={styles.lawBox}><RichText rich={rich("الاستنتاج من التجربة: $P \\propto h$ عند ثبات الكتلة الحجمية، والقانون الكامل $P=\\rho g h$.")} /></div>
          <table className={styles.resultTable}>
            <thead><tr><th>الثقب</th><th>h (m)</th><th>P (Pa)</th><th>المؤشر البصري النسبي</th></tr></thead>
            <tbody>{hs.map((h, i) => <tr key={i}><td>{i + 1}</td><td>{h.toFixed(2)}</td><td>{fmt(ps[i])}</td><td>{(100 * jetReachIndicator(ps[i], pMax)).toFixed(0)}%</td></tr>)}</tbody>
          </table>
        </>
      )}
      feedback={feedbackOk
        ? "توقّعك صحيح: الأعمق له أعلى ضغط. القيم المحسوبة تؤكد أن P تتضاعف خطيًا مع h."
        : "التوقّع الصحيح هو «الثقب الأعمق». راجع جدول القيم: أكبر h أعطى أكبر P، وهذا ما تصفه تجربة الكتاب."}
      feedbackOk={feedbackOk}
      extraAssumption="لا يُحسب هنا مدى الفوّارة أو سرعتها؛ طول المسار المرسوم مؤشر تعليمي نسبي فقط."
    />
  );
}

/* ═════════════════════════ L2: المانومتر ═════════════════════════ */

function ManometerLab() {
  const [liquid, setLiquid] = useState<BookLiquidId>("water");
  const [h, setH] = useState(0.4);
  const [angle, setAngle] = useState(0);
  const [sameLevel, setSameLevel] = useState(true);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [run, setRun] = useState(false);
  const rho = densityOf(liquid) ?? BOOK_DENSITIES.water;
  const p = hydrostaticPressure(rho, h);
  const pRef = hydrostaticPressure(rho, 0.4);
  const gap = 14 + 56 * manometerGapIndicator(p, 12000);
  const correct = "increase";

  const wide = (
    <g>
      <LabBackdrop w={640} h={340} />
      <SceneTitle w={640} text="المانومتر والحفّة الضغطية" sub="فرق السويتين مؤشر بصري — الضغط الرقمي من القانون" />
      <Panel x={16} y={70} w={280} h={248} />
      <LabVessel x={40} y={88} w={230} h={190} surfaceY={112} />
      <line x1={40} y1={192 + h * 36} x2={270} y2={192 + h * 36} stroke={GREEN} strokeWidth={1.8} strokeDasharray="6 5" />
      <g transform={`rotate(${angle} 155 ${192 + h * 36})`}>
        <ellipse cx={155} cy={192 + h * 36} rx={24} ry={13} fill="#f5e6c8" stroke={GOLD} strokeWidth={2.2} />
        <ArabicLabel at={[155, 196 + h * 36]} text="غشاء" size={10.5} color={GOLD} />
      </g>
      <ArabicLabel at={[155, 300]} text={sameLevel ? "نقل على السوية ذاتها" : "انتقل إلى عمق مختلف"} size={12.5} color={sameLevel ? GREEN : RED} />
      <ArabicLabel at={[155, 322]} text="الضغط من جميع الاتجاهات" size={11.5} color={C.ink2} />

      <Panel x={310} y={70} w={314} h={248} />
      <LabManometer x={354} y={88} scale={1.05} gap={gap} />
      <Label at={[467, 272]} tex={`P=${p.toFixed(0)}\\,\\mathrm{Pa}`} color={GOLD} size={17} width={170} />
      <ArabicLabel at={[467, 302]} text="قراءة الضغط من القانون" size={12} color={BLUE} />
    </g>
  );
  const narrow = (
    <g>
      <LabBackdrop w={360} h={490} />
      <SceneTitle w={360} text="المانومتر" sub="فرق السويتين مؤشر بصري" size={18} />
      <Panel x={10} y={68} w={340} h={190} />
      <LabVessel x={34} y={86} w={292} h={140} surfaceY={108} />
      <line x1={34} y1={160 + h * 30} x2={326} y2={160 + h * 30} stroke={GREEN} strokeWidth={1.7} strokeDasharray="6 5" />
      <g transform={`rotate(${angle} 180 ${160 + h * 30})`}>
        <ellipse cx={180} cy={160 + h * 30} rx={22} ry={12} fill="#f5e6c8" stroke={GOLD} strokeWidth={2} />
        <ArabicLabel at={[180, 164 + h * 30]} text="غشاء" size={10} color={GOLD} />
      </g>
      <ArabicLabel at={[180, 244]} text={sameLevel ? "السوية الأفقية ذاتها" : "عمق مختلف"} size={12} color={sameLevel ? GREEN : RED} />
      <Panel x={10} y={270} w={340} h={202} />
      <LabManometer x={74} y={286} scale={0.86} gap={gap * 0.86} />
      <Label at={[180, 440]} tex={`P=${p.toFixed(0)}\\,\\mathrm{Pa}`} color={GOLD} size={16} width={170} />
      <ArabicLabel at={[180, 464]} text="القيمة من القانون لا من الرسم" size={11.5} color={BLUE} />
    </g>
  );

  return (
    <LabShell
      id="manometer" title="المختبر ٢: المانومتر" page="ص 73–74"
      intro="غيّر عمق الحفّة الضغطية واتجاه الغشاء، وتوقّع أثر زيادة العمق، ثم قارن القيمة المحسوبة بفرق السويتين البصري."
      predictionLabel="إذا زاد عمق النقطة h، ماذا يحدث لضغط السائل P؟"
      predictionOptions={[
        { id: "increase", label: "يزداد P" },
        { id: "decrease", label: "ينقص P" },
        { id: "same", label: "لا يتغيّر P" },
      ]}
      prediction={prediction} onPrediction={(v) => { setPrediction(v); setRun(false); }} correct={correct}
      run={run} onRun={() => setRun(true)} onStop={() => setRun(false)}
      onReset={() => { setLiquid("water"); setH(0.4); setAngle(0); setSameLevel(true); setPrediction(null); setRun(false); }}
      controls={(
        <>
          <label className={styles.control}>
            <span className={styles.controlLabel}>السائل (قيم وردت في الكتاب)</span>
            <select className={styles.select} value={liquid} onChange={(e) => { setLiquid(e.target.value as BookLiquidId); setRun(false); }} aria-label="اختر السائل">
              <option value="water">ماء — 1000 kg·m⁻³ (ص 76)</option>
              <option value="seawater">ماء البحر — 1025 kg·m⁻³ (ص 80)</option>
              <option value="fishWater">ماء مسألة السمكتين — 1100 kg·m⁻³ (ص 80)</option>
            </select>
          </label>
          <label className={styles.control}>
            <span className={styles.controlLabel}>العمق h <span className={styles.controlValue}>{h.toFixed(1)} m</span></span>
            <input className={styles.range} type="range" min="0.1" max="1.2" step="0.1" value={h}
              onChange={(e) => { setH(Number(e.target.value)); setRun(false); }} aria-label="عمق الحفّة الضغطية" />
          </label>
          <label className={styles.control}>
            <span className={styles.controlLabel}>اتجاه الغشاء المرن</span>
            <select className={styles.select} value={angle} onChange={(e) => { setAngle(Number(e.target.value)); setRun(false); }} aria-label="اتجاه الغشاء المرن">
              <option value="0">الأصلي — 0°</option>
              <option value="90">مُدار — 90°</option>
              <option value="180">مُدار — 180°</option>
              <option value="270">مُدار — 270°</option>
            </select>
          </label>
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={sameLevel} onChange={(e) => { setSameLevel(e.target.checked); setRun(false); }} />
            إبقاء الحفّة على السوية الأفقية ذاتها
          </label>
        </>
      )}
      scene={<ResponsiveScene title="المشهد التفاعلي" desc="الحفّة الضغطية داخل سائل ومانومتر بفرق سويتين نسبي" wideBox="0 0 640 340" narrowBox="0 0 360 490" wide={wide} narrow={narrow} />}
      observations={(
        <>
          <Metric label="ρ" value={fmt(rho)} unit="kg·m⁻³" />
          <Metric label="h" value={h.toFixed(1)} unit="m" />
          <Metric label="P = ρgh" value={fmt(p)} unit="Pa" />
          <Metric label="P عند h=0.4" value={fmt(pRef)} unit="Pa" />
        </>
      )}
      conclusion={(
        <>
          <p className={styles.observeText}>
            القيمة المحسوبة هي <TeX>{String.raw`P=\rho g h`}</TeX>. زيادة <TeX>{String.raw`h`}</TeX> تزيد <TeX>{String.raw`P`}</TeX>،
            أما تدوير الغشاء أو نقل الحفّة على المستوى الأفقي ذاته فلا يغيّر فرق سويتي السائل الملون؛ لأن الضغط عند النقطة الواحدة متساوٍ من جميع الاتجاهات ومتساوٍ في جميع نقاط المستوي الأفقي الواحد.
          </p>
          <div className={styles.lawBox}><RichText rich={rich("مقارنة كتابية: $P(h)=\\rho g h$، و$P(0.4)=\\rho g(0.4)$؛ الفرق بين العمقين $\\Delta P=\\rho g\\Delta h$.")} /></div>
          <table className={styles.resultTable}>
            <thead><tr><th>الحالة</th><th>h (m)</th><th>P (Pa)</th><th>فرق السويتين</th></tr></thead>
            <tbody>
              <tr><td>المرجع</td><td>0.40</td><td>{fmt(pRef)}</td><td>مؤشر بصري</td></tr>
              <tr><td>الحالية</td><td>{h.toFixed(2)}</td><td>{fmt(p)}</td><td>مؤشر بصري</td></tr>
              <tr><td>تدوير {angle}°</td><td>{h.toFixed(2)}</td><td>{fmt(p)}</td><td>لا يتغيّر</td></tr>
            </tbody>
          </table>
          {!sameLevel && <p className={styles.visualNote}>تنبيه: إلغاء «السوية ذاتها» يخرج عن حالة تجربة الكتاب؛ انتقال الحفّة إلى عمق مختلف يغيّر P بحسب القانون.</p>}
        </>
      )}
      feedback={prediction === correct
        ? "توقّعك صحيح: زيادة العمق تزيد ضغط السائل، بينما الاتجاه على السوية ذاتها لا يغيّره."
        : "التوقّع الصحيح «يزداد P». راقب الجدول: كلما كبر h كبر حاصل ρgh، أما تدوير الغشاء فلا يغيّره."}
      feedbackOk={prediction === correct}
      extraAssumption="الماء الملون في الشعبتين والغشاء المرن مثاليان؛ لا يُحوّل فرق السويتين إلى قراءة باسكال مُعايرة."
    />
  );
}

/* ═════════════════════════ L3: الكأسان والقانون ═════════════════════════ */

function TwoGlassesLab() {
  const [liquid, setLiquid] = useState<BookLiquidId>("seawater");
  const [h, setH] = useState(0.5);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [run, setRun] = useState(false);
  const rhoWater = BOOK_DENSITIES.water;
  const rhoSelected = densityOf(liquid) ?? rhoWater;
  const pWater = hydrostaticPressure(rhoWater, h);
  const pSelected = hydrostaticPressure(rhoSelected, h);
  const ratio = pSelected / pWater;
  const correct = "salt";

  const wide = (
    <g>
      <LabBackdrop w={640} h={340} />
      <SceneTitle w={640} text="كأسان متماثلان على العمق ذاته" sub="ماء · محلول ملح الطعام · مقارنة عددية إضافية من قيم الكتاب" />
      <Panel x={16} y={70} w={292} h={248} />
      <ArabicLabel at={[90, 98]} text="ماء" size={15} color={BLUE} />
      <LabVessel x={34} y={112} w={112} h={166} surfaceY={136} liquid={WATER} edge={WATER_EDGE} />
      <ellipse cx={90} cy={218} rx={19} ry={11} fill="#f5e6c8" stroke={GOLD} strokeWidth={2} />
      <ArabicLabel at={[90, 222]} text="حفّة" size={10.5} color={GOLD} />
      <ArabicLabel at={[226, 98]} text="محلول ملح" size={15} color={VIOLET} />
      <LabVessel x={170} y={112} w={112} h={166} surfaceY={136} liquid={SALT} edge="#6f4b94" />
      <ellipse cx={226} cy={218} rx={19} ry={11} fill="#f5e6c8" stroke={GOLD} strokeWidth={2} />
      <ArabicLabel at={[226, 222]} text="حفّة" size={10.5} color={GOLD} />
      <line x1={34} y1={218} x2={282} y2={218} stroke={GREEN} strokeWidth={2} strokeDasharray="6 5" />
      <ArabicLabel at={[162, 300]} text="العمق ذاته" size={13} color={GREEN} weight={900} />

      <Panel x={322} y={70} w={302} h={248} />
      <LabManometer x={338} y={86} scale={0.62} gap={18} caption="ماء" />
      <LabManometer x={474} y={86} scale={0.62} gap={44} caption="محلول ملح" />
      <Label at={[473, 252]} tex={String.raw`\rho_{\mathrm{salt}}>\rho_{\mathrm{water}}`} color={VIOLET} size={16} width={210} />
      <ArabicLabel at={[473, 286]} text="الفرق نوعي؛ لا رقم للملح" size={12.5} color={C.ink2} />
      <Label at={[473, 312]} tex={String.raw`D=\dfrac{\rho}{\rho_{\mathrm{H_2O}}}`} color={GOLD} size={15} width={180} />
    </g>
  );
  const narrow = (
    <g>
      <LabBackdrop w={360} h={490} />
      <SceneTitle w={360} text="الكأسان" sub="العمق ذاته" size={18} />
      <Panel x={10} y={68} w={340} h={210} />
      <ArabicLabel at={[96, 96]} text="ماء" size={14} color={BLUE} />
      <LabVessel x={30} y={110} w={132} h={132} surfaceY={130} liquid={WATER} edge={WATER_EDGE} />
      <ellipse cx={96} cy={190} rx={18} ry={10} fill="#f5e6c8" stroke={GOLD} strokeWidth={2} />
      <ArabicLabel at={[264, 96]} text="محلول ملح" size={14} color={VIOLET} />
      <LabVessel x={198} y={110} w={132} h={132} surfaceY={130} liquid={SALT} edge="#6f4b94" />
      <ellipse cx={264} cy={190} rx={18} ry={10} fill="#f5e6c8" stroke={GOLD} strokeWidth={2} />
      <line x1={30} y1={190} x2={330} y2={190} stroke={GREEN} strokeWidth={1.8} strokeDasharray="6 5" />
      <ArabicLabel at={[180, 260]} text="العمق ذاته" size={13} color={GREEN} weight={900} />
      <Panel x={10} y={290} w={340} h={182} />
      <LabManometer x={28} y={302} scale={0.56} gap={16} />
      <LabManometer x={186} y={302} scale={0.56} gap={40} />
      <Label at={[180, 424]} tex={String.raw`\rho_{\mathrm{salt}}>\rho_{\mathrm{water}}`} color={VIOLET} size={15} width={220} />
      <ArabicLabel at={[180, 456]} text="لا قيمة عددية للملح في الكتاب" size={11.5} color={C.ink2} />
    </g>
  );

  return (
    <LabShell
      id="two-glasses" title="المختبر ٣: الكأسان وقانون الضغط" page="ص 74–75"
      intro="ثبّت العمق في الكأسين، وتوقّع أيّ السائلين يسبّب ضغطًا أكبر، ثم اشتقّ أثر الكتلة الحجمية من القانون."
      predictionLabel="عند العمق ذاته، أيّ ضغط أكبر؟"
      predictionOptions={[
        { id: "salt", label: "ضغط محلول ملح الطعام" },
        { id: "water", label: "ضغط الماء" },
        { id: "equal", label: "متساويان" },
      ]}
      prediction={prediction} onPrediction={(v) => { setPrediction(v); setRun(false); }} correct={correct}
      run={run} onRun={() => setRun(true)} onStop={() => setRun(false)}
      onReset={() => { setLiquid("seawater"); setH(0.5); setPrediction(null); setRun(false); }}
      controls={(
        <>
          <label className={styles.control}>
            <span className={styles.controlLabel}>العمق h المشترك <span className={styles.controlValue}>{h.toFixed(1)} m</span></span>
            <input className={styles.range} type="range" min="0.2" max="1.2" step="0.1" value={h}
              onChange={(e) => { setH(Number(e.target.value)); setRun(false); }} aria-label="العمق المشترك" />
          </label>
          <label className={styles.control}>
            <span className={styles.controlLabel}>مقارنة عددية إضافية من قيم الكتاب (ليست كثافة المحلول)</span>
            <select className={styles.select} value={liquid} onChange={(e) => { setLiquid(e.target.value as BookLiquidId); setRun(false); }} aria-label="سائل المقارنة العددية">
              <option value="water">ماء — 1000 kg·m⁻³</option>
              <option value="seawater">ماء البحر — 1025 kg·m⁻³</option>
              <option value="fishWater">ماء مسألة السمكتين — 1100 kg·m⁻³</option>
            </select>
          </label>
          <div className={styles.numeric} style={{ marginTop: 0 }}>
            <Metric label="g" value="10" unit="m·s⁻²" />
            <Metric label="ρ الماء" value="1000" unit="kg·m⁻³" />
          </div>
        </>
      )}
      scene={<ResponsiveScene title="المشهد التفاعلي" desc="كأسا ماء ومحلول ملح على العمق ذاته مع مانومترين" wideBox="0 0 640 340" narrowBox="0 0 360 490" wide={wide} narrow={narrow} />}
      observations={(
        <>
          <Metric label="h" value={h.toFixed(1)} unit="m" />
          <Metric label="P الماء" value={fmt(pWater)} unit="Pa" />
          <Metric label={`P ${LIQUID_LABELS[liquid]}`} value={fmt(pSelected)} unit="Pa" />
          <Metric label="النسبة العددية" value={ratio.toFixed(3)} />
        </>
      )}
      conclusion={(
        <>
          <p className={styles.observeText}>
            في تجربة الكتاب: ضغط محلول ملح الطعام أكبر من ضغط الماء عند العمق ذاته؛ لأن كتلته الحجمية أكبر.
            والكتاب لم يعطِ رقمًا لكثافة المحلول، لذلك نبقي هذه النتيجة نوعية. أما المقارنة العددية المعروضة فتستعمل فقط قيم كثافة وردت في صفحات الكتاب.
          </p>
          <div className={styles.lawBox}><RichText rich={rich("عند ثبات $h$ و$g$: $P\\propto\\rho$، والقانون $P=\\rho g h$؛ والكثافة النسبية $D=\\dfrac{\\rho}{\\rho_{\\mathrm{H_2O}}}$.")} /></div>
          <table className={styles.resultTable}>
            <thead><tr><th>السائل</th><th>ρ (kg·m⁻³)</th><th>h (m)</th><th>P (Pa)</th></tr></thead>
            <tbody>
              <tr><td>ماء</td><td>1000</td><td>{h.toFixed(1)}</td><td>{fmt(pWater)}</td></tr>
              <tr><td>{LIQUID_LABELS[liquid]}</td><td>{fmt(rhoSelected)}</td><td>{h.toFixed(1)}</td><td>{fmt(pSelected)}</td></tr>
              <tr><td>محلول ملح الطعام</td><td>لم يُعطَ</td><td>{h.toFixed(1)}</td><td>أكبر من الماء</td></tr>
            </tbody>
          </table>
        </>
      )}
      feedback={prediction === correct
        ? "توقّعك صحيح: المحلول الأعلى كتلة حجمية يسبّب الضغط الأكبر عند العمق ذاته."
        : "التوقّع الصحيح «ضغط محلول ملح الطعام». عند ثبات h و g، زيادة ρ تزيد P=ρgh."}
      feedbackOk={prediction === correct}
      extraAssumption="محلول ملح الطعام لا يُعطى قيمة عددية؛ فروق المانومتر في الرسم نوعية وليست قياسًا مُعايرًا."
    />
  );
}

/* ═════════════════════════ L4: السدّ والأواني المستطرقة ═════════════════════════ */

function DamVesselsLab() {
  const [liquid, setLiquid] = useState<BookLiquidId>("water");
  const [h, setH] = useState(2.5);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [run, setRun] = useState(false);
  const rho = densityOf(liquid) ?? BOOK_DENSITIES.water;
  const pBottom = hydrostaticPressure(rho, h);
  const pTop = hydrostaticPressure(rho, 0.5);
  const arrow = 22 + 64 * jetReachIndicator(pBottom, 40000);
  const heightsEqual = equalSurfaceHeights([{ h }, { h }, { h }, { h }, { h }]);
  const correct = "same";

  const wide = (
    <g>
      <LabBackdrop w={640} h={340} />
      <SceneTitle w={640} text="السدّ والأواني المستطرقة" sub="ضغط أكبر عند الأسفل · سطح حرّ واحد في الفروع كافّة" />
      <Panel x={16} y={70} w={276} h={248} />
      <ArabicLabel at={[154, 96]} text="مقطع السدّ" size={15} color={BLUE} />
      <path d={`M46 290 L78 122 L242 122 L270 290 Z`} fill="#d9e4ee" stroke={C.rule} strokeWidth={2.4} />
      <rect x={46} y={152} width={224} height={138} fill={WATER} opacity={0.38} />
      <line x1={46} y1={152} x2={270} y2={152} stroke={WATER_EDGE} strokeWidth={2.2} />
      {[186, 232, 276].map((y, i) => (
        <Vector key={y} from={[70, y]} to={[70 + arrow * (0.55 + i * 0.24), y]} color={RED} width={2.6 + i * 0.8} />
      ))}
      <ArabicLabel at={[186, 308]} text="ضغط كبير عند الأسفل" size={12.5} color={RED} weight={900} />

      <Panel x={306} y={70} w={318} h={248} />
      <ArabicLabel at={[465, 96]} text="أوعية مختلفة متصلة من الأسفل" size={14} color={BLUE} />
      <path d="M330 152 H604" stroke={WATER_EDGE} strokeWidth={2.4} />
      <path d="M344 152 V282 M408 152 V282 M472 152 V282 M536 152 V282 M590 152 V282" stroke={C.rule} strokeWidth={3.6} />
      <path d="M330 282 H604" stroke={C.rule} strokeWidth={3.6} />
      <rect x={330} y={152} width={274} height={130} fill={WATER} opacity={0.3} />
      {[344, 408, 472, 536, 590].map((x, i) => (
        <g key={x}>
          <PointMark at={[x, 238]} color={VIOLET} r={3.4} />
          <ArabicLabel at={[x, 228]} text={String.fromCharCode(65 + i)} size={11} color={VIOLET} weight={900} />
        </g>
      ))}
      <line x1={330} y1={238} x2={604} y2={238} stroke={GREEN} strokeWidth={1.8} strokeDasharray="6 5" />
      <ArabicLabel at={[465, 306]} text={heightsEqual ? "سوية أفقية واحدة" : "حساب غير متوازن"} size={12.5} color={heightsEqual ? GREEN : RED} weight={900} />
    </g>
  );
  const narrow = (
    <g>
      <LabBackdrop w={360} h={490} />
      <SceneTitle w={360} text="السدّ والأواني" size={18} />
      <Panel x={10} y={68} w={340} h={190} />
      <path d="M40 232 L68 94 L288 94 L318 232 Z" fill="#d9e4ee" stroke={C.rule} strokeWidth={2.2} />
      <rect x={40} y={120} width={278} height={112} fill={WATER} opacity={0.38} />
      <line x1={40} y1={120} x2={318} y2={120} stroke={WATER_EDGE} strokeWidth={2} />
      {[146, 184, 220].map((y, i) => (
        <Vector key={y} from={[58, y]} to={[58 + arrow * (0.5 + i * 0.24), y]} color={RED} width={2.4 + i * 0.7} />
      ))}
      <ArabicLabel at={[180, 248]} text="ضغط أكبر عند الأسفل" size={12.5} color={RED} weight={900} />
      <Panel x={10} y={270} w={340} h={202} />
      <ArabicLabel at={[180, 296]} text="أوعية متصلة" size={14} color={BLUE} />
      <path d="M32 324 H328" stroke={WATER_EDGE} strokeWidth={2.1} />
      <path d="M48 324 V440 M108 324 V440 M180 324 V440 M252 324 V440 M312 324 V440" stroke={C.rule} strokeWidth={3.2} />
      <path d="M32 440 H328" stroke={C.rule} strokeWidth={3.2} />
      <rect x={32} y={324} width={296} height={116} fill={WATER} opacity={0.3} />
      {[48, 108, 180, 252, 312].map((x, i) => (
        <g key={x}>
          <PointMark at={[x, 392]} color={VIOLET} r={3} />
          <ArabicLabel at={[x, 384]} text={String.fromCharCode(65 + i)} size={10} color={VIOLET} weight={900} />
        </g>
      ))}
      <line x1={32} y1={392} x2={328} y2={392} stroke={GREEN} strokeWidth={1.6} strokeDasharray="6 5" />
      <ArabicLabel at={[180, 462]} text="سوية واحدة للنقاط A–E" size={12} color={GREEN} weight={900} />
    </g>
  );

  return (
    <LabShell
      id="dam-vessels" title="المختبر ٤: السدّ والأواني المستطرقة" page="ص 77"
      intro="غيّر عمق الماء خلف السدّ، وتوقّع سوية السائل في أوعية مختلفة الأشكال، ثم اربط النتيجتين بالقانون وبرهان الكتاب."
      predictionLabel="عند ملء أوعية مختلفة الأشكال متصلة من الأسفل، أين يكون السطح الحرّ؟"
      predictionOptions={[
        { id: "same", label: "على المستوى الأفقي ذاته في الفروع كافّة" },
        { id: "different", label: "أعلى في الوعاء الأوسع" },
        { id: "narrow", label: "أعلى في الفرع الأضيق" },
      ]}
      prediction={prediction} onPrediction={(v) => { setPrediction(v); setRun(false); }} correct={correct}
      run={run} onRun={() => setRun(true)} onStop={() => setRun(false)}
      onReset={() => { setLiquid("water"); setH(2.5); setPrediction(null); setRun(false); }}
      controls={(
        <>
          <label className={styles.control}>
            <span className={styles.controlLabel}>عمق الماء خلف السدّ <span className={styles.controlValue}>{h.toFixed(1)} m</span></span>
            <input className={styles.range} type="range" min="1" max="4" step="0.5" value={h}
              onChange={(e) => { setH(Number(e.target.value)); setRun(false); }} aria-label="عمق الماء خلف السد" />
          </label>
          <label className={styles.control}>
            <span className={styles.controlLabel}>السائل (قيم وردت في الكتاب)</span>
            <select className={styles.select} value={liquid} onChange={(e) => { setLiquid(e.target.value as BookLiquidId); setRun(false); }} aria-label="سائل السد">
              <option value="water">ماء — 1000 kg·m⁻³</option>
              <option value="seawater">ماء البحر — 1025 kg·m⁻³</option>
              <option value="fishWater">ماء مسألة السمكتين — 1100 kg·m⁻³</option>
            </select>
          </label>
          <div className={styles.numeric} style={{ marginTop: 0 }}>
            <Metric label="g" value="10" unit="m·s⁻²" />
            <Metric label="ρ" value={fmt(rho)} unit="kg·m⁻³" />
          </div>
        </>
      )}
      scene={<ResponsiveScene title="المشهد التفاعلي" desc="مقطع سد وأوعية مستطرقة بسوية أفقية واحدة" wideBox="0 0 640 340" narrowBox="0 0 360 490" wide={wide} narrow={narrow} />}
      observations={(
        <>
          <Metric label="h" value={h.toFixed(1)} unit="m" />
          <Metric label="P عند الأسفل" value={fmt(pBottom)} unit="Pa" />
          <Metric label="P عند 0.5 m" value={fmt(pTop)} unit="Pa" />
          <Metric label="فرق الضغط" value={fmt(pressureDifference(rho, h, 0.5))} unit="Pa" />
        </>
      )}
      conclusion={(
        <>
          <p className={styles.observeText}>
            ضغط السائل عند أسفل السدّ أكبر منه قرب السطح؛ لذلك يُصمَّم السدّ عريضًا من الأسفل وضيّقًا من الأعلى.
            وفي الأواني المستطرقة، النقاط <AutoTex text="A,B,C,D,E" /> على سوية أفقية واحدة، فيتساوى الضغط فيها وتتساوى الأعماق، فيرتفع السطح الحرّ إلى المستوى ذاته مهما اختلفت أشكال الأوعية.
          </p>
          <div className={styles.lawBox}><RichText rich={rich("برهان الكتاب: $P_A=P_B=P_C=P_D=P_E$، و$\\rho g h_A=\\rho g h_B=\\rho g h_C=\\rho g h_D=\\rho g h_E$، إذاً $h_A=h_B=h_C=h_D=h_E$.")} /></div>
          <table className={styles.resultTable}>
            <thead><tr><th>الموضع</th><th>h (m)</th><th>P (Pa)</th><th>النتيجة</th></tr></thead>
            <tbody>
              <tr><td>قرب السطح</td><td>0.50</td><td>{fmt(pTop)}</td><td>ضغط أصغر</td></tr>
              <tr><td>الأسفل</td><td>{h.toFixed(1)}</td><td>{fmt(pBottom)}</td><td>ضغط أكبر</td></tr>
              <tr><td>A–E</td><td>متساوية</td><td>متساوٍ</td><td>سوية واحدة</td></tr>
            </tbody>
          </table>
        </>
      )}
      feedback={prediction === correct
        ? "توقّعك صحيح: اختلاف شكل الأوعية لا يغيّر السوية الأفقية للسطح الحرّ حين تتصل من الأسفل وتُفتح من الأعلى."
        : "التوقّع الصحيح «المستوى الأفقي ذاته في الفروع كافّة». تساوي الضغط على سوية واحدة يقود إلى تساوي الأعماق."}
      feedbackOk={prediction === correct}
      extraAssumption="الأوعية مفتوحة من الأعلى ومتصلة من الأسفل وبها السائل نفسه؛ أطوال أسهم السدّ مؤشرات بصرية نسبية لا قياسات إنشائية."
    />
  );
}

export function LiquidPressureLabs() {
  const [active, setActive] = useState<TabId>("three-holes");
  return (
    <div className={styles.labs} data-lab-count="4" data-interaction-count="4" aria-label="مختبرات الضغط في السوائل الأربعة">
      <div className={styles.tabs} role="tablist" aria-label="اختر المختبر">
        {LAB_TABS.map((tab, i) => (
          <button key={tab.id} type="button" role="tab" aria-selected={active === tab.id}
            className={`${styles.tab} ${active === tab.id ? styles.tabActive : ""}`}
            onClick={() => setActive(tab.id)}>
            <span className={styles.tabIndex}>المختبر {i + 1} · {tab.page}</span>
            {tab.title}
          </button>
        ))}
      </div>
      {active === "three-holes" && <ThreeHolesLab />}
      {active === "manometer" && <ManometerLab />}
      {active === "two-glasses" && <TwoGlassesLab />}
      {active === "dam-vessels" && <DamVesselsLab />}
    </div>
  );
}
