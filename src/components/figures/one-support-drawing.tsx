import type { ReactNode } from "react";
import { SvgTeX } from "@/components/math/TeX";
import type { Point } from "./one-support-geometry";
import styles from "./one-support.module.css";

export const ink = {
  first: "#866018", second: "#ab503c", resultant: "#33568f",
  body: "#28384c", guide: "#8c9aaa", line: "#d7dfe4", teal: "#236d68",
};

export function Drawing({ title, viewBox, maxWidth, children }: {
  title: string; viewBox: string; maxWidth: string; children: ReactNode;
}) {
  return (
    <svg className={styles.drawing} style={{ maxWidth }} viewBox={viewBox} preserveAspectRatio="xMidYMid meet"
      role="img" aria-label={title} direction="ltr">
      <title>{title}</title>
      {children}
    </svg>
  );
}

export function Carrier({ from: [x1, y1], to: [x2, y2] }: { from: Point; to: Point }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ink.guide} strokeWidth={1.3} strokeDasharray="4 4" />;
}

/** One filled outline: the apex is exactly `to`, with no marker or line cap overhang. */
export function Vector({ from: [x, y], to, color, width = 4 }: {
  from: Point; to: Point; color: string; width?: number;
}) {
  const dx = to[0] - x, dy = to[1] - y;
  const length = Math.hypot(dx, dy);
  const neck = length - 2.7 * width;
  const half = width / 2, wing = 1.55 * width;
  return <path transform={`translate(${x} ${y}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`} fill={color}
    d={`M0 ${-half} H${neck} V${-wing} L${length} 0 L${neck} ${wing} V${half} H0 Z`} />;
}

export function PointMark({ at: [cx, cy], radius = 3.5 }: { at: Point; radius?: number }) {
  return <circle cx={cx} cy={cy} r={radius} fill="white" stroke={ink.body} strokeWidth={1.75} />;
}

/** Center the entire KaTeX box, including the vector accent and subscript. */
export function Label({ at: [cx, cy], tex, color = ink.body, size = 16, width = 40, height = size * 1.8 }: {
  at: Point; tex: string; color?: string; size?: number; width?: number; height?: number;
}) {
  return <SvgTeX tex={tex} x={cx - width / 2} y={cy - height / 2} width={width} height={height}
    fontSize={`${size}px`} color={color} />;
}
