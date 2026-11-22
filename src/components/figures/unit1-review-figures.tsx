"use client";

/**
 * رسوم قسم «أراجع وأختبر نفسي — الوحدة الأولى» (ص 63–64).
 * كل رسم معاد إنتاجه رقميًا من صور الكتاب، بوحدات ورموز عبر `SvgTeX`.
 * الخطوط البيانية تفاعلية: الضغط على أي نقطة يعرض إحداثييها.
 */
import { useId, useState, type ReactNode } from "react";
import { SvgTeX, TeX } from "@/components/math/TeX";
import { bodyTable } from "@/content/unit1-review";
import styles from "./unit1-review.module.css";

const INK = "#33404f";
const GRID = "#d6dce4";
const FRAME = "#b9c3cf";
const ACCENT = "#33568f";
const POINT = "#c0392b";
const CURVE = "#c0392b";

type ChartProps = {
  W: number;
  H: number;
  ML: number;
  MR: number;
  MT: number;
  MB: number;
  xMax: number;
  yMax: number;
  gridX: number[];
  gridY: number[];
  title: string;
  desc: string;
  children: (p: { sx: (v: number) => number; sy: (v: number) => number }) => ReactNode;
};

function Chart({
  W,
  H,
  ML,
  MR,
  MT,
  MB,
  xMax,
  yMax,
  gridX,
  gridY,
  title,
  desc,
  children,
}: ChartProps) {
  const iw = W - ML - MR;
  const ih = H - MT - MB;
  const sx = (v: number) => ML + (v / xMax) * iw;
  const sy = (v: number) => H - MB - (v / yMax) * ih;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={styles.chart}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <desc>{desc}</desc>
      <rect x={ML} y={MT} width={iw} height={ih} fill="#fbfcfe" stroke={FRAME} strokeWidth="1.4" />
      {gridX.map((v) => (
        <line
          key={`gx-${v}`}
          x1={sx(v)}
          y1={MT}
          x2={sx(v)}
          y2={H - MB}
          stroke={GRID}
          strokeWidth="1"
        />
      ))}
      {gridY.map((v) => (
        <line
          key={`gy-${v}`}
          x1={ML}
          y1={sy(v)}
          x2={W - MR}
          y2={sy(v)}
          stroke={GRID}
          strokeWidth="1"
        />
      ))}
      <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {gridX.map((v) => (
        <text
          key={`tx-${v}`}
          x={sx(v)}
          y={H - MB + 18}
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#4b5568"
        >
          {v}
        </text>
      ))}
      {gridY.map((v) => (
        <text
          key={`ty-${v}`}
          x={ML - 8}
          y={sy(v) + 4}
          textAnchor="end"
          fontSize="14"
          fontWeight="700"
          fill="#4b5568"
        >
          {v}
        </text>
      ))}
      <SvgTeX
        tex="d(\mathrm{m})"
        x={ML - 4}
        y={MT - 30}
        width={90}
        height={22}
        align="end"
        color={ACCENT}
        fontSize="15px"
      />
      <SvgTeX
        tex="t(\mathrm{s})"
        x={W - MR - 74}
        y={H - MB + 22}
        width={72}
        height={22}
        align="end"
        color={ACCENT}
        fontSize="15px"
      />
      {children({ sx, sy })}
    </svg>
  );
}

/* ═══════════════ نقطة بيانات تفاعلية ═══════════════ */

function DataPoint({
  x,
  y,
  label,
  active,
  onSelect,
  radius = 5.6,
}: {
  x: number;
  y: number;
  label: string;
  active: boolean;
  onSelect: () => void;
  radius?: number;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className={styles.point}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <circle cx={x} cy={y} r={16} fill="transparent" />
      <circle
        cx={x}
        cy={y}
        r={active ? radius + 2.2 : radius}
        fill={POINT}
        stroke={active ? "#1a2438" : "#ffffff"}
        strokeWidth={active ? 2.6 : 1.4}
      />
    </g>
  );
}

function PointCaption({
  value,
  fallback,
}: {
  value: { t: number; d: number; series?: string } | null;
  fallback: string;
}) {
  return (
    <p className={styles.caption} aria-live="polite">
      {value ? (
        <>
          <span className={styles.captionKey}>النقطة المختارة:</span>{" "}
          <span dir="ltr" className={styles.captionValue}>
            t = {value.t} s
          </span>{" "}
          —{" "}
          <span dir="ltr" className={styles.captionValue}>
            d = {value.d} m
          </span>
          {value.series ? <span className={styles.captionNote}> {value.series}</span> : null}
        </>
      ) : (
        <span className={styles.captionHint}>{fallback}</span>
      )}
    </p>
  );
}

function smoothPath(pixels: [number, number][]): string {
  if (pixels.length < 2) return "";
  let d = `M ${pixels[0][0]} ${pixels[0][1]}`;
  for (let i = 0; i < pixels.length - 1; i++) {
    const p0 = pixels[i - 1] ?? pixels[i];
    const p1 = pixels[i];
    const p2 = pixels[i + 1];
    const p3 = pixels[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* ═══════════════ الشكل (أ): حركة مستقيمة منتظمة ═══════════════ */

const UNIFORM_POINTS: [number, number][] = [
  [1, 20],
  [2, 30],
  [3, 40],
  [4, 50],
  [5, 60],
  [6, 70],
  [7, 80],
];

export function UniformGraph() {
  const [selected, setSelected] = useState<{ t: number; d: number } | null>(null);
  return (
    <div className={styles.figureBox}>
      <Chart
        W={520}
        H={330}
        ML={64}
        MR={44}
        MT={42}
        MB={52}
        xMax={7}
        yMax={90}
        gridX={[1, 2, 3, 4, 5, 6, 7]}
        gridY={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90]}
        title="الشكل (أ): خط بياني مستقيم للمسافة بدلالة الزمن"
        desc="نقاط بيانات عند أزمنة من 1 إلى 7 ثوان ومسافات من 20 إلى 80 مترًا، تقع على استقامة واحدة."
      >
        {({ sx, sy }) => (
          <>
            <polyline
              points={UNIFORM_POINTS.map(([t, d]) => `${sx(t)},${sy(d)}`).join(" ")}
              fill="none"
              stroke={CURVE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {UNIFORM_POINTS.map(([t, d]) => (
              <DataPoint
                key={`${t}-${d}`}
                x={sx(t)}
                y={sy(d)}
                label={`نقطة عند الزمن ${t} ثانية والمسافة ${d} مترًا`}
                active={selected?.t === t}
                onSelect={() => setSelected({ t, d })}
              />
            ))}
          </>
        )}
      </Chart>
      <PointCaption
        value={selected}
        fallback="اضغط على أي نقطة في الرسم لقراءة إحداثييها."
      />
    </div>
  );
}

/* ═══════════════ الشكل (ب): حركة متسارعة ═══════════════ */

const ACCELERATED_POINTS: [number, number][] = [
  [0, 0],
  [1, 2],
  [2, 8],
  [3, 18],
  [4, 32],
];

export function AcceleratedGraph() {
  const [selected, setSelected] = useState<{ t: number; d: number } | null>(null);
  return (
    <div className={styles.figureBox}>
      <Chart
        W={520}
        H={330}
        ML={64}
        MR={44}
        MT={42}
        MB={52}
        xMax={4}
        yMax={40}
        gridX={[0, 1, 2, 3, 4]}
        gridY={[0, 5, 10, 15, 20, 25, 30, 35, 40]}
        title="الشكل (ب): خط بياني منحنٍ للمسافة بدلالة الزمن"
        desc="نقاط بيانات تزداد مسافاتها بمقادير متزايدة: 0 ثم 2 ثم 8 ثم 18 ثم 32 مترًا عند الأزمنة 0 و1 و2 و3 و4 ثوان."
      >
        {({ sx, sy }) => {
          const pixels = ACCELERATED_POINTS.map(
            ([t, d]) => [sx(t), sy(d)] as [number, number],
          );
          return (
            <>
              <path
                d={smoothPath(pixels)}
                fill="none"
                stroke={CURVE}
                strokeWidth="3"
                strokeLinecap="round"
              />
              {ACCELERATED_POINTS.map(([t, d]) => (
                <DataPoint
                  key={`${t}-${d}`}
                  x={sx(t)}
                  y={sy(d)}
                  label={`نقطة عند الزمن ${t} ثانية والمسافة ${d} مترًا`}
                  active={selected?.t === t}
                  onSelect={() => setSelected({ t, d })}
                />
              ))}
            </>
          );
        }}
      </Chart>
      <PointCaption
        value={selected}
        fallback="اضغط على أي نقطة في الرسم لقراءة إحداثييها."
      />
    </div>
  );
}

/* ═══════════════ الشكل (ج): سلسلتان أفقيتان ═══════════════ */

const REST_TIMES = [1, 3, 5, 7];

export function RestGraph() {
  const [selected, setSelected] = useState<{ t: number; d: number; series?: string } | null>(null);
  return (
    <div className={styles.figureBox}>
      <Chart
        W={520}
        H={330}
        ML={64}
        MR={60}
        MT={42}
        MB={52}
        xMax={7}
        yMax={9}
        gridX={[1, 2, 3, 4, 5, 6, 7]}
        gridY={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
        title="الشكل (ج): سلسلتا نقاط أفقيتان عند 0 و5 أمتار"
        desc="سلسلة نقاط عند المسافة 0 متر وأخرى عند 5 أمتار، عند الأزمنة 1 و3 و5 و7 ثوان، وخط أفقي عند 5 أمتار."
      >
        {({ sx, sy }) => (
          <>
            <line
              x1={sx(0)}
              y1={sy(5)}
              x2={sx(7)}
              y2={sy(5)}
              stroke={INK}
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            {REST_TIMES.map((t) => (
              <DataPoint
                key={`five-${t}`}
                x={sx(t)}
                y={sy(5)}
                label={
                  selected?.t === t && selected.d === 5
                    ? `نقطة عند الزمن ${t} ثانية والمسافة 5 أمتار، مختارة`
                    : `نقطة عند الزمن ${t} ثانية والمسافة 5 أمتار`
                }
                active={selected?.t === t && selected.d === 5}
                onSelect={() => setSelected({ t, d: 5, series: "عند d = 5 m" })}
              />
            ))}
            {REST_TIMES.map((t) => (
              <DataPoint
                key={`zero-${t}`}
                x={sx(t)}
                y={sy(0)}
                label={`نقطة عند الزمن ${t} ثانية والمسافة 0 متر`}
                active={selected?.t === t && selected.d === 0}
                onSelect={() => setSelected({ t, d: 0 })}
              />
            ))}
          </>
        )}
      </Chart>
      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} aria-hidden="true" />
          نقاط عند d = 5 m
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} aria-hidden="true" />
          نقاط عند d = 0 m
        </span>
      </div>
      <p className={styles.caption}>
        <span className={styles.captionHint}>
          الصفّان أفقيان: المسافة لا تتغيّر مع تقدّم الزمن في أيّ منهما. اضغط على أي نقطة لقراءة إحداثييها.
        </span>
      </p>
      {selected ? (
        <p className={styles.caption} aria-live="polite">
          <span className={styles.captionKey}>النقطة المختارة:</span>{" "}
          <span dir="ltr" className={styles.captionValue}>
            t = {selected.t} s
          </span>{" "}
          —{" "}
          <span dir="ltr" className={styles.captionValue}>
            d = {selected.d} m
          </span>
        </p>
      ) : null}
    </div>
  );
}

/* ═══════════════ مسار الخنفساء والمسطرة ═══════════════ */

const BEETLE_POSITIONS = [0, 10, 30, 50, 70];
const BEETLE_TIMES = [0, 10, 30, 50, 70];
const X0 = 62;
const X80 = 606;
const px = (cm: number) => X0 + (cm / 80) * (X80 - X0);

function Beetle({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#7b241c" strokeWidth="1.1" fill="none">
      <ellipse cx="0" cy="0" rx="8.5" ry="6" fill="#c0392b" stroke="#7b241c" strokeWidth="1.2" />
      <path d="M0 -5.6 L0 5.6" stroke="#7b241c" strokeWidth="1" />
      <circle cx="-8.6" cy="-0.6" r="3.2" fill="#7b241c" stroke="none" />
      <path d="M-5 -4 L-9 -8 M-1 -5.5 L-2.5 -9.5 M3 -5 L5 -9 M6 -3.5 L9.5 -6.5" />
      <path d="M-5 4 L-9 8 M-1 5.5 L-2.5 9.5 M3 5 L5 9 M6 3.5 L9.5 6.5" />
    </g>
  );
}

export function BeetlePath() {
  return (
    <figure className={styles.figureBox}>
      <svg
        viewBox="0 0 660 210"
        className={styles.wideFigure}
        role="img"
        aria-label="مسار الخنفساء: مواقع عند الأزمنة صفر و10 و30 و50 و70 ثانية، والمسطرة من صفر إلى 80 سنتيمترًا"
      >
        <title>مسار الخنفساء على مسطرة مدرّجة بالسنتيمتر</title>
        {/* الزمن */}
        <line x1={px(0)} y1={44} x2={px(70)} y2={44} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {BEETLE_TIMES.map((t, i) => (
          <g key={`time-${t}`}>
            <line x1={px(BEETLE_POSITIONS[i])} y1={38} x2={px(BEETLE_POSITIONS[i])} y2={50} stroke={INK} strokeWidth="2.4" />
            <text
              x={px(BEETLE_POSITIONS[i])}
              y={26}
              textAnchor="middle"
              fontSize="15"
              fontWeight="800"
              fill="#1a2438"
            >
              {t} s
            </text>
          </g>
        ))}
        {BEETLE_POSITIONS.map((p) => (
          <Beetle key={`beetle-${p}`} x={px(p)} y={72} />
        ))}
        {/* المسطرة */}
        <rect x={X0} y={112} width={X80 - X0} height={16} fill="#f5f7fa" stroke={INK} strokeWidth="1.6" />
        {Array.from({ length: 81 }, (_, cm) => {
          const major = cm % 10 === 0;
          const mid = cm % 5 === 0;
          return (
            <line
              key={`tick-${cm}`}
              x1={px(cm)}
              y1={112}
              x2={px(cm)}
              y2={112 - (major ? 12 : mid ? 8 : 4)}
              stroke={INK}
              strokeWidth={major ? 1.6 : 1}
            />
          );
        })}
        {[0, 10, 20, 30, 40, 50, 60, 70, 80].map((cm) => (
          <text
            key={`cm-${cm}`}
            x={px(cm)}
            y={152}
            textAnchor="middle"
            fontSize="15"
            fontWeight="800"
            fill="#1a2438"
          >
            {cm}
          </text>
        ))}
        <SvgTeX
          tex="\mathrm{cm}"
          x={4}
          y={140}
          width={50}
          height={20}
          align="end"
          color={ACCENT}
          fontSize="15px"
        />
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.captionHint}>
          مواقع الخنفساء على المسطرة عند الأزمنة المثبّتة أعلى الشكل.
        </span>
      </figcaption>
    </figure>
  );
}

/* ═══════════════ الربيعات الثلاث ═══════════════ */

function SpringScale({
  cx,
  letter,
  reading,
  forces,
}: {
  cx: number;
  letter: string;
  reading: number;
  forces: ("F_1" | "F_2")[];
}) {
  const top = 54;
  const zero = top + 20;
  const step = 20;
  return (
    <g transform={`translate(${cx} 0)`}>
      {/* لوحة الحرف */}
      <rect x={-16} y={10} width={32} height={22} rx={4} fill="#e08b3a" stroke="#b96f24" strokeWidth="1.2" />
      <text x={0} y={26} textAnchor="middle" fontSize="15" fontWeight="800" fill="#ffffff">
        {letter}
      </text>
      {/* الخطاف العلوي */}
      <path d={`M0 ${32} L0 ${top - 6}`} stroke="#7b8794" strokeWidth="2.6" />
      <circle cx={0} cy={34} r={4} fill="none" stroke="#7b8794" strokeWidth="2.6" />
      {/* الجسم */}
      <rect x={-30} y={top} width={60} height={110} rx={9} fill="#e8ecf1" stroke="#8d99a6" strokeWidth="1.8" />
      <rect x={-18} y={top + 8} width={36} height={94} rx={6} fill="#ffffff" stroke="#b6c0cb" strokeWidth="1.2" />
      {/* التدريجات 0..4 */}
      {[0, 1, 2, 3, 4].map((n) => (
        <g key={`tick-${n}`}>
          <line
            x1={-14}
            y1={zero + n * step}
            x2={n === reading ? 8 : 4}
            y2={zero + n * step}
            stroke="#5b6776"
            strokeWidth={1.4}
          />
          <text
            x={16}
            y={zero + n * step + 4}
            textAnchor="start"
            fontSize="13"
            fontWeight="700"
            fill="#33404f"
          >
            {n}
          </text>
        </g>
      ))}
      {/* المؤشر */}
      <rect x={-16} y={zero + reading * step - 3} width={20} height={6} rx={2} fill="#c0392b" />
      <path
        d={`M${4} ${zero + reading * step} l8 -5 l0 10 z`}
        fill="#c0392b"
      />
      {/* القوس السفلي */}
      <circle cx={0} cy={top + 118} r={4.5} fill="none" stroke="#7b8794" strokeWidth="2.6" />
      {/* الأسهم */}
      {forces.map((f, i) => {
        const ax = forces.length === 1 ? 0 : i === 0 ? -9 : 9;
        return (
          <g key={f}>
            <line x1={ax} y1={top + 126} x2={ax} y2={top + 158} stroke={ACCENT} strokeWidth="2.4" />
            <path d={`M${ax - 5} ${top + 150} l5 9 l5 -9 z`} fill={ACCENT} />
            <SvgTeX
              tex={f}
              x={ax - 26}
              y={top + 160}
              width={52}
              height={20}
              align="middle"
              color={ACCENT}
              fontSize="15px"
            />
          </g>
        );
      })}
    </g>
  );
}

export function SpringScalesFigure() {
  const id = useId();
  return (
    <figure className={styles.figureBox}>
      <svg
        viewBox="0 0 620 250"
        className={styles.wideFigure}
        role="img"
        aria-label={`ثلاث ربيعات مدرّجة بالنيوتن: a وb وc، مؤشراتها عند 1 و2 و3 نيوتن`}
      >
        <title id={id}>الربيعات الثلاث المدرّجة بالنيوتن</title>
        <SpringScale cx={110} letter="a" reading={1} forces={["F_1"]} />
        <SpringScale cx={310} letter="b" reading={2} forces={["F_2"]} />
        <SpringScale cx={510} letter="c" reading={3} forces={["F_1", "F_2"]} />
      </svg>
      <figcaption className={styles.caption}>
        <span className={styles.captionHint}>
          الأسهم تشير إلى جهة القوة المؤثرة، والمؤشر الأحمر يدل على الشدة على التدريج.
        </span>
      </figcaption>
    </figure>
  );
}

/* ═══════════════ جدول السؤال الثاني (معطى) ═══════════════ */

export function BodiesTable() {
  return (
    <figure className={styles.figureBox}>
      <div className={styles.bodiesWrap}>
        <table className={styles.bodiesTable}>
          <caption className={styles.caption}>
            جدول السؤال الثاني (ص 63): كتلة كل جسم وثقله على الكوكب الذي يتواجد عليه (فرضًا).
          </caption>
          <thead>
            <tr>
              <th scope="col">الجسم</th>
              <th scope="col" dir="rtl">
                الكتلة <TeX>{String.raw`\left(\mathrm{kg}\right)`}</TeX>
              </th>
              <th scope="col" dir="rtl">
                الثقل <TeX>{String.raw`\left(\mathrm{N}\right)`}</TeX>
              </th>
            </tr>
          </thead>
          <tbody>
            {bodyTable.rows.map((row) => (
              <tr key={row.body}>
                <th scope="row" dir="ltr">
                  {row.body}
                </th>
                <td dir="ltr">{row.mass}</td>
                <td dir="ltr">{row.weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}
