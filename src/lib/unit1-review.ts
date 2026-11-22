/**
 * منطق قسم «أراجع وأختبر نفسي — الوحدة الأولى»: دوال نقية تعمل في المتصفح
 * (بلا خادم) وتُختبر وحديًا: تطبيع الأرقام العربية، وتصحيح كل نوع بند.
 */
import type {
  DiagramItem,
  PlotItem,
  ScalesItem,
  TableItem,
  TableColumn,
} from "../content/unit1-review";

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** يحوّل إدخال الطالب إلى عدد: أرقام عربية/فارسية، فاصلة عشرية، إشارة سالبة. */
export function normalizeNumber(raw: string): number | null {
  if (typeof raw !== "string") return null;
  let text = "";
  for (const ch of raw.trim()) {
    const a = ARABIC_DIGITS.indexOf(ch);
    const p = PERSIAN_DIGITS.indexOf(ch);
    if (a >= 0) text += String(a);
    else if (p >= 0) text += String(p);
    else text += ch;
  }
  const cleaned = text
    .replace(/[,\u060C]/g, ".")
    .replace(/\s+/g, "")
    .replace(/[−–—]/g, "-")
    .replace(/^\+/, "");
  if (!/^-?(?:\d+|\d*\.\d+)$/.test(cleaned)) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function numbersEqual(a: number, b: number, tolerance = 1e-9): boolean {
  return Math.abs(a - b) <= tolerance;
}

/** إجابة عددية: القيمة المعتمدة أو أي بديل مسموح (مثل −200 و200). */
export function numberAnswerMatches(
  raw: string,
  answer: number,
  alternates: number[] = [],
): boolean {
  const value = normalizeNumber(raw);
  if (value === null) return false;
  return [answer, ...alternates].some((option) => numbersEqual(value, option));
}

/* ═══════════════ جدول المحطة الرابعة ═══════════════ */

export type TableEntry = {
  /** خانة الزمن للعمود ذي المسافة المطبوعة 5 cm. */
  interpolation: string;
  /** الأعمدة الثلاثة الفارغة: المسافة المختارة والزمن المدخل. */
  blank: { d: number | null; t: string }[];
};

export type TableGrade = {
  ok: boolean;
  interpolationOk: boolean;
  columnOk: boolean[];
  message?: string;
};

export function gradeTable(item: TableItem, entry: TableEntry): TableGrade {
  const interpolationOk = numbersEqual(
    normalizeNumber(entry.interpolation) ?? Number.NaN,
    item.interpolation.t,
  );

  const used = new Set<number>();
  const columnOk = entry.blank.map((cell) => {
    if (cell.d === null) return false;
    if (used.has(cell.d)) return false;
    const pair = item.pairs.find(([d]) => d === cell.d);
    if (!pair) return false;
    const t = normalizeNumber(cell.t);
    if (t === null || !numbersEqual(t, pair[1])) return false;
    used.add(cell.d);
    return true;
  });

  const ok = interpolationOk && columnOk.every(Boolean);
  let message: string | undefined;
  if (!ok) {
    if (!interpolationOk)
      message = "راجع خانة المسافة 5 cm: كم ثانية تحتاج الخنفساء لقطع 5 cm؟";
    else if (entry.blank.some((c) => c.d === null))
      message = "اختر قيمة مسافة لكل عمود من الأعمدة الثلاثة.";
    else if (new Set(entry.blank.map((c) => c.d)).size < entry.blank.length)
      message = "كل عمود يحتاج زوجًا مختلفًا من الشكل.";
    else message = "تحقّق من الأزمنة: كل مسافة تقابلها القيمة نفسها للزمن.";
  }
  return { ok, interpolationOk, columnOk, message };
}

/** أعمدة الجدول الثلاثة الفارغة مع قيم المسافة المسموحة. */
export function blankColumns(columns: TableColumn[]): TableColumn[] {
  return columns.filter((c) => c.d === null);
}

/* ═══════════════ تخطيط النقاط ═══════════════ */

export type PlotGrade = {
  ok: boolean;
  missing: [number, number][];
  offLine: [number, number][];
  shapeOk: boolean;
  message?: string;
};

export function gradePlot(
  item: PlotItem,
  points: [number, number][],
  shapeIndex: number | null,
): PlotGrade {
  const has = (p: [number, number]) =>
    points.some((q) => q[0] === p[0] && q[1] === p[1]);
  const missing = item.requiredPoints.filter((p) => !has(p));
  const offLine = points.filter(([t, d]) => t !== d);
  const shapeOk =
    shapeIndex !== null && item.shapeOptions[shapeIndex]?.correct === true;
  const ok = missing.length === 0 && offLine.length === 0 && shapeOk;

  let message: string | undefined;
  if (!ok) {
    if (missing.length) message = `لم تُوضع بعد ${missing.length} من نقاط البيانات المطلوبة.`;
    else if (offLine.length) message = "بعض النقاط لا تقع على الخط المتوقّع؛ راجع إحداثييها.";
    else if (!shapeOk) message = "اختر شكل الخط البياني الناتج.";
  }
  return { ok, missing, offLine, shapeOk, message };
}

/* ═══════════════ قراءة الربيعات ═══════════════ */

export function gradeScales(
  item: ScalesItem,
  values: Record<string, string>,
): { ok: boolean; details: { key: string; ok: boolean }[] } {
  const details = item.readings.map((r) => ({
    key: r.key,
    ok: numbersEqual(normalizeNumber(values[r.key] ?? "") ?? Number.NaN, r.answer),
  }));
  return { ok: details.every((d) => d.ok), details };
}

/* ═══════════════ مخطط القوى ═══════════════ */

export type Slot = "right" | "left" | "up" | "down";

export function gradeDiagram(
  item: DiagramItem,
  placement: Record<string, Slot | undefined>,
): {
  ok: boolean;
  details: { id: string; ok: boolean }[];
  remaining: number;
} {
  const details = item.tokens.map((token) => ({
    id: token.id,
    ok: placement[token.id] === token.slot,
  }));
  const remaining = item.tokens.filter((t) => !placement[t.id]).length;
  return { ok: details.every((d) => d.ok), details, remaining };
}

/* ═══════════════ تقدّم المراجعة ═══════════════ */

export type ReviewResults = Record<string, boolean | undefined>;

export function countAnswered(results: ReviewResults): number {
  return Object.values(results).filter((v) => v !== undefined).length;
}

export function countCorrect(results: ReviewResults): number {
  return Object.values(results).filter((v) => v === true).length;
}

export function percentage(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}
