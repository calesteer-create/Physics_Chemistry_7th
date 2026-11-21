"use client";

/**
 * نظام الرسم الموحّد للدرس الرابع (العمل والاستطاعة) — نسخة معزولة داخل الدرس.
 *
 * لماذا ملف مستقل؟
 * - الرسوم الخمسة والمختبران يستعملون نفس الهندسة: سهم متجه واحد النسب،
 *   خطوط إسناد منقّطة، تسميات رياضية معزولة LTR، ومقياس لوني واحد.
 * - إصلاح اتجاه الصيغ محصور هنا (label owns `direction:ltr`) ولا يمسّ
 *   الطبقة المشتركة `components/math/TeX.tsx` المستعملة في بقية الدروس.
 */
import type { ReactNode } from "react";
import { renderTeXToHtml } from "@/components/math/TeX";
import styles from "./work-power.module.css";

export type Pt = [number, number];

/* ───────────── مقياس التصميم (Design tokens) ─────────────
   كل الألوان تحقّق تباينًا ≥ 4.5:1 على خلفية اللوحة #f7fafc
   (والخطوط الدلالية ≥ 3:1)، وهي نفس عائلة ألوان المنصّة. */
export const C = {
  ink: "#1a2438",
  ink2: "#3d4a5f",
  rule: "#5d7086" /* خط الأرض */,
  guide: "#8b9bab" /* خطوط الإسناد */,
  panel: "#f7fafc",
  panelEdge: "#d6dde5",
  body: "#dbe7ef" /* هيكل السيارة */,
  bodyEdge: "#3f5c75",
  wood: "#e3cda4" /* الصندوق */,
  woodEdge: "#7c5f36",
  woodGrain: "#c9ae83",
  red: "#a8304a" /* F₂ */,
  gold: "#8a5a00" /* F₁ + نصوص التحذير */,
  green: "#0f6b52" /* R + الحالة الموجبة */,
  blue: "#23608f" /* d */,
  violet: "#5b4781" /* W (الثقل) */,
  steel: "#566c7b" /* البكرة */,
  rope: "#8a6b3f" /* الحبل */,
  hide: "#a9743f" /* الحصان */,
  hideEdge: "#6d4527",
} as const;

export const S = {
  /** سمك سهم القوة في اللوحات الواسعة */
  force: 5,
  /** سمك سهم القوة في اللوحات الضيّقة */
  forceNarrow: 5,
  /** سمك السهم المرجعي (الانتقال) */
  ref: 4,
  /** حجم التسمية في اللوحة الواسعة (وحدات viewBox) */
  labelWide: 17,
  /** حجم التسمية في لوحة الهاتف — أكبر نسبيًا ليعوّض التصغير */
  labelNarrow: 25,
} as const;

/* ───────────── الإطار ───────────── */

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

/* ───────────── المتجه القياسي ─────────────
   شكل واحد مغلق: الساق تنتهي عند قاعدة الرأس، والرأس يُحسب من سُمك
   الساق (طوله 2.9×السُمك، نصف قاعدته 1.5×السُمك) في أي اتجاه. */
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

/** نقطة تأثير القوة (اختيارية) — تُظهر من أين تنطلق القوة. */
export function PointMark({ at: [cx, cy], color = C.ink, r = 3.4 }: { at: Pt; color?: string; r?: number }) {
  return <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={color} strokeWidth={1.6} />;
}

/** خط إسناد منقّط: يوضح انتقال جسم ما أو امتداد حامل قوة. */
export function Carrier({ from, to, color = C.guide, width = 1.6 }: {
  from: Pt; to: Pt; color?: string; width?: number;
}) {
  return <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={width} strokeDasharray="5 5" strokeLinecap="round" />;
}

/** خط الأرض/الطريق. */
export function Ground({ x1, x2, y, width = 3 }: { x1: number; x2: number; y: number; width?: number }) {
  return <line x1={x1} y1={y} x2={x2} y2={y} stroke={C.rule} strokeWidth={width} strokeLinecap="round" />;
}

/** مسطرة قياس (مسافة d) بعلامتين طرفيتين. */
export function Measure({ x1, x2, y, color = C.blue, tick = 11 }: { x1: number; x2: number; y: number; color?: string; tick?: number }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} strokeDasharray="7 5" strokeLinecap="round" />
      <line x1={x1} y1={y - tick / 2} x2={x1} y2={y + tick / 2} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
      <line x1={x2} y1={y - tick / 2} x2={x2} y2={y + tick / 2} stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

/** علامة الزاوية القائمة (للحالة العمودية) لا لبس فيها. */
export function RightAngle({ at: [x, y], size = 16, dir = "ur", color = C.ink2 }: {
  at: Pt; size?: number; dir?: "ur" | "ul" | "dr" | "dl"; color?: string;
}) {
  const sx = dir === "ur" || dir === "dr" ? 1 : -1;
  const sy = dir === "ur" || dir === "ul" ? -1 : 1;
  return <path d={`M${x} ${y + sy * size} L${x + sx * size} ${y + sy * size} L${x + sx * size} ${y}`} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />;
}

/* ───────────── التسمية الرياضية ─────────────
   صندوق KaTeX معزول LTR داخل صفحة RTL: هذا هو الإصلاح الجذري لظهور
   `₁F` و`0 = d` بالمقلوب، ومحصور بالدرس الرابع. */
export function Label({ at: [cx, cy], tex, color = C.ink, size = S.labelWide, width = 64, height }: {
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

/** لوحة داخلية (إطار مقارنة) بنفس أسلوب كل رسوم الدرس. */
export function Panel({ x, y, w, h, fill = C.panel }: { x: number; y: number; w: number; h: number; fill?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={16} fill={fill} stroke={C.panelEdge} strokeWidth={1.6} />;
}

/* ───────────── الصندوق (الجسم في الرسوم والمختبر) ───────────── */
export function Crate({ x, y, w, h, id = "crate" }: { x: number; y: number; w: number; h: number; id?: string }) {
  const grain = [0.32, 0.62].map((ratio) => Math.round(y + h * ratio));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={C.wood} stroke={C.woodEdge} strokeWidth={2.6} />
      {grain.map((gy) => (
        <line key={`${id}-${gy}`} x1={x + 8} y1={gy} x2={x + w - 8} y2={gy} stroke={C.woodGrain} strokeWidth={2} strokeLinecap="round" />
      ))}
    </g>
  );
}
