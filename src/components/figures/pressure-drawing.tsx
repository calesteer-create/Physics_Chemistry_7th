"use client";

/**
 * نظام الرسم الموحّد لدرس «الضغط» (الوحدة الثانية، الدرس الأول).
 *
 * نفس مبادئ نظام الدرس الرابع المعتمد: سهم متجه واحد النسب، خطوط إسناد
 * منقّطة، تسميات رياضية KaTeX معزولة LTR داخل صفحة RTL، ومقياس لوني
 * واحد بتباين ≥ 4.5:1 على خلفية اللوحة #f7fafc:
 * - الأحمر: شدة القوة الضاغطة F / الثقل،
 * - الأزرق: مساحة السطح s وبصمة التماسّ،
 * - الذهبي الداكن: الضغط P والنتيجة،
 * - الأخضر: الأثر الأصغر/الحالة الآمنة عند المقارنة.
 */
import type { ReactNode } from "react";
import { renderTeXToHtml } from "@/components/math/TeX";
import styles from "./pressure.module.css";

export type Pt = [number, number];

export const C = {
  ink: "#1a2438",
  ink2: "#3d4a5f",
  rule: "#5d7086",
  guide: "#8b9bab",
  panel: "#f7fafc",
  panelEdge: "#d6dde5",
  red: "#a8304a" /* F */,
  blue: "#23608f" /* s */,
  gold: "#8a5a00" /* P */,
  green: "#0f6b52",
  violet: "#5b4781",
  sponge: "#f2d492",
  spongeEdge: "#a97e2f",
  spongePore: "#d9b96a",
  sand: "#ecd3a0",
  sandEdge: "#b08d4f",
  snow: "#eef4fa",
  snowEdge: "#9db8cc",
  wood: "#e3cda4",
  woodEdge: "#7c5f36",
  woodGrain: "#c9ae83",
  metal: "#c8d4de",
  metalEdge: "#4d6577",
  body: "#dbe7ef",
  bodyEdge: "#3f5c75",
} as const;

export const S = {
  force: 5,
  forceNarrow: 5,
  ref: 4,
  labelWide: 17,
  labelNarrow: 25,
} as const;

export function Plate({ title, desc, viewBox, maxWidth = "46rem", variant = "wide", children }: {
  title: string; desc: string; viewBox: string; maxWidth?: string;
  variant?: "wide" | "narrow"; children: ReactNode;
}) {
  return (
    <div className={`${styles.holder} ${variant === "wide" ? styles.onlyWide : styles.onlyNarrow}`} style={{ maxWidth }}>
      <svg className={styles.plate} viewBox={viewBox} role="img" aria-label={title}
        preserveAspectRatio="xMidYMid meet">
        <title>{title}</title>
        <desc>{desc}</desc>
        {children}
      </svg>
    </div>
  );
}

/** سهم متجه قياسي: رأس متناسب مع سمك الساق في أي اتجاه. */
export function Vector({ from, to, color, width = S.force }: {
  from: Pt; to: Pt; color: string; width?: number;
}) {
  const [x, y] = from;
  const dx = to[0] - x;
  const dy = to[1] - y;
  const length = Math.hypot(dx, dy);
  if (length < 1.5) return null;
  const headLen = Math.min(3.5 * width, length * 0.7);
  const headHalf = Math.min(1.6 * width, headLen * 0.6);
  const neck = length - headLen;
  const half = width / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const f = (n: number) => Number(n.toFixed(2));
  const d = `M0 ${f(-half)} H${f(neck)} V${f(-headHalf)} L${f(length)} 0 L${f(neck)} ${f(headHalf)} V${f(half)} H0 Z`;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)})`}>
      <path d={d} fill={color} />
    </g>
  );
}

export function PointMark({ at: [cx, cy], color = C.ink, r = 3.4 }: { at: Pt; color?: string; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={color} strokeWidth={1.6} />;
}

export function Carrier({ from, to, color = C.guide, width = 1.6 }: {
  from: Pt; to: Pt; color?: string; width?: number;
}) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={width} strokeDasharray="5 5" strokeLinecap="round" />;
}

export function Ground({ x1, x2, y, width = 3, color = C.rule }: { x1: number; x2: number; y: number; width?: number; color?: string }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={width} strokeLinecap="round" />;
}

/** تسمية رياضية KaTeX معزولة LTR. */
export function Label({ at: [cx, cy], tex, color = C.ink, size = S.labelWide, width = 72, height }: {
  at: Pt; tex: string; color?: string; size?: number; width?: number; height?: number;
}) {
  const h = height ?? Math.round(size * 1.7);
  return (
    <foreignObject x={cx - width / 2} y={cy - h / 2} width={width} height={h} style={{ overflow: "visible" }}>
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%", color, fontSize: `${size}px`,
          direction: "ltr", unicodeBidi: "isolate", lineHeight: 1,
        }}
        dangerouslySetInnerHTML={{ __html: renderTeXToHtml(tex, false) }}
      />
    </foreignObject>
  );
}

/** تسمية عربية داخل اللوحة (اتجاه RTL مستقل). */
export function ArabicLabel({ at: [x, y], text, size = 17, color = C.ink, anchor = "middle", weight = 700 }: {
  at: Pt; text: string; size?: number; color?: string; anchor?: "start" | "middle" | "end"; weight?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} direction="rtl" fill={color} fontSize={size} fontWeight={weight}>
      {text}
    </text>
  );
}

export function Panel({ x, y, w, h, fill = C.panel }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={16} fill={fill} stroke={C.panelEdge} strokeWidth={1.6} />;
}

/**
 * سطح قابل للغوص (رمل/ثلج) مع انخفاض مقوّس تحت بصمة التماسّ.
 * `depth` عمق بصري نسبي بوحدات اللوحة — مؤشر تعليمي لا قيمة مقاسة.
 */
export function DippedSurface({ x1, x2, y, cx, dipWidth, depth, color, fill }: {
  x1: number; x2: number; y: number; cx: number; dipWidth: number; depth: number; color: string; fill?: string;
}) {
  const left = cx - dipWidth / 2;
  const right = cx + dipWidth / 2;
  const d = `M${x1} ${y} L${left} ${y} Q${cx} ${y + depth * 1.7} ${right} ${y} L${x2} ${y}`;
  return (
    <g>
      {fill && <path d={`${d} L${x2} ${y + 46} L${x1} ${y + 46} Z`} fill={fill} opacity={0.55} />}
      <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/** متوازي مستطيلات معدني: وجه أمامي + وجه علوي + وجه جانبي. */
export function MetalBlock({ x, y, w, h, lift = 12 }: {
  /** x,y: الزاوية العلوية اليسرى للوجه الأمامي */
  x: number; y: number; w: number; h: number; lift?: number;
}) {
  return (
    <g strokeLinejoin="round">
      <polygon points={`${x},${y} ${x + lift},${y - lift} ${x + w + lift},${y - lift} ${x + w},${y}`} fill="#e2ebf2" stroke={C.metalEdge} strokeWidth={2.2} />
      <polygon points={`${x + w},${y} ${x + w + lift},${y - lift} ${x + w + lift},${y + h - lift} ${x + w},${y + h}`} fill="#aebfcd" stroke={C.metalEdge} strokeWidth={2.2} />
      <rect x={x} y={y} width={w} height={h} fill={C.metal} stroke={C.metalEdge} strokeWidth={2.4} />
    </g>
  );
}

/**
 * قطعة إسفنج: سطحها العلوي ينخفض تحت بصمة الجسم بمقدار `depth` (بصري نسبي).
 * x,y: الزاوية العلوية اليسرى عند الراحة؛ الجسم يجلس داخل الانخفاض.
 */
export function Sponge({ x, y, w, h, cx, dipWidth, depth }: {
  x: number; y: number; w: number; h: number; cx: number; dipWidth: number; depth: number;
}) {
  const left = Math.max(x + 6, cx - dipWidth / 2);
  const right = Math.min(x + w - 6, cx + dipWidth / 2);
  const top = `M${x} ${y} L${left} ${y} Q${cx} ${y + depth * 1.8} ${right} ${y} L${x + w} ${y}`;
  const pores: Array<[number, number, number]> = [
    [0.12, 0.38, 5], [0.3, 0.62, 6], [0.48, 0.4, 4.5], [0.66, 0.66, 5.5],
    [0.84, 0.42, 5], [0.2, 0.8, 4.5], [0.55, 0.82, 5], [0.78, 0.8, 4.2], [0.38, 0.85, 3.8],
  ];
  return (
    <g>
      <path d={`${top} L${x + w} ${y + h} L${x} ${y + h} Z`} fill={C.sponge} stroke={C.spongeEdge} strokeWidth={2.4} strokeLinejoin="round" />
      {pores.map(([rx, ry, r], i) => (
        <circle key={i} cx={x + rx * w} cy={y + depth * 0.7 + ry * (h - 10)} r={r} fill={C.spongePore} opacity={0.75} />
      ))}
    </g>
  );
}

/** شريط قياس أفقي بعلامتين طرفيتين (لبصمة التماسّ/المساحة). */
export function Measure({ x1, x2, y, color = C.blue, tick = 11 }: { x1: number; x2: number; y: number; color?: string; tick?: number }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} strokeDasharray="7 5" strokeLinecap="round" />
      <line x1={x1} y1={y - tick / 2} x2={x1} y2={y + tick / 2} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <line x1={x2} y1={y - tick / 2} x2={x2} y2={y + tick / 2} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}
