/**
 * نموذج «الضغط في السوائل» — الدرس الثاني من الوحدة الثانية (كتاب ص 71–80).
 *
 * طبقة نقية تمامًا (بلا React وبلا خادم) تُستعمل في المختبرات والاختبارات:
 *   P  = ρ g h        ضغط السائل المتوازن في نقطة على عمق h
 *   Pt = P₀ + ρ g h   الضغط الكلي عند سطح معرّض للهواء
 *
 * قيم الكثافة الوحيدة المسموح بها رقمياً هي القيم التي وردت في صفحات الكتاب:
 *   1000 kg·m⁻³ (ماء، ص 76)، 1025 kg·m⁻³ (ماء البحر، ص 80)،
 *   1100 kg·m⁻³ (ماء مسألة السمكتين، ص 80).
 * محلول ملح الطعام (ص 75) يُعامل نوعياً فقط: «أكبر من الماء»؛ لأن الكتاب
 * لم يعطِ له قيمة عددية، ولا يجوز اختراع واحدة.
 *
 * افتراضات النموذج (تُعرض للطالب داخل كل مختبر):
 *  - السائل متوازن (ساكن) وكتلته الحجمية ثابتة لا تتغيّر مع العمق.
 *  - g = 10 m·s⁻² كما في مسائل الكتاب.
 *  - الثقوب صغيرة، وتُهمَل اللزوجة والاضطراب وفقدان الطاقة وحركة السطح.
 *  - مؤشرات اندفاع الماء وفرق سويتي المانومتر بصرية نسبية للتعليم فقط،
 *    وليست قياسات حقيقية ولا تُستعمل لحساب سرعة أو مدى فيزيائي.
 */

export const G_BOOK = 10;
export const ATM_PA = 101325;
export const ATM_MMHG = 760;
export const GRAPH_APPROX_P0 = 1e5;

/** الكثافات الواردة حرفياً في صفحات الكتاب 71–80. */
export const BOOK_DENSITIES = {
  water: 1000,
  seawater: 1025,
  fishWater: 1100,
} as const;

export type BookLiquidId = keyof typeof BOOK_DENSITIES;

export const LIQUID_LABELS: Record<BookLiquidId | "salt", string> = {
  water: "ماء",
  seawater: "ماء البحر",
  fishWater: "ماء (مسألة السمكتين)",
  salt: "محلول ملح الطعام",
};

/** كثافة رقمية للسوائل التي أعطاها الكتاب قيمة؛ محلول الملح بلا قيمة عددية. */
export function densityOf(id: BookLiquidId | "salt"): number | null {
  return id === "salt" ? null : BOOK_DENSITIES[id];
}

export const MODEL_ASSUMPTIONS: readonly string[] = [
  "السائل متوازن (ساكن)، وكتلته الحجمية ثابتة لا تتغيّر مع العمق.",
  "تسارع الجاذبية الأرضية g = 10 m·s⁻² كما في مسائل الكتاب.",
  "الثقوب صغيرة، وتُهمَل اللزوجة والاضطراب وفقدان الطاقة وتغيّر مستوى السطح.",
  "اندفاع الماء وفرق سويتي المانومتر مؤشران بصريان نسبيان للتعليم فقط، وليسا قياساً حقيقياً.",
  "الغشاء المرن في المانومتر مثالي، والسائل الملون في الشعبتين هو نفسه.",
];

function requirePositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} يجب أن يكون عددًا منتهيًا غير سالب: ${value}`);
  }
}

/** ضغط السائل وحده (بدون الضغط الجوي) — القانون الذي تُحل به مسائل الكتاب. */
export function hydrostaticPressure(rho: number, h: number, g = G_BOOK): number {
  requirePositive("ρ", rho);
  requirePositive("h", h);
  requirePositive("g", g);
  return rho * g * h;
}

/** الضغط الكلي = الضغط الجوي + ضغط عمود السائل. لا يُستعمل في مسائل ضغط السائل. */
export function totalPressure(rho: number, h: number, g = G_BOOK, p0 = ATM_PA): number {
  requirePositive("P₀", p0);
  return p0 + hydrostaticPressure(rho, h, g);
}

/** فرق الضغط بين عمقين في السائل نفسه: ΔP = ρ g Δh. */
export function pressureDifference(rho: number, h1: number, h2: number, g = G_BOOK): number {
  return hydrostaticPressure(rho, Math.abs(h1 - h2), g);
}

export function depthFromPressure(p: number, rho: number, g = G_BOOK): number {
  if (rho <= 0 || g <= 0) throw new RangeError("ρ و g يجب أن يكونا موجبين");
  requirePositive("P", p);
  return p / (rho * g);
}

export function densityFromPressure(p: number, h: number, g = G_BOOK): number {
  if (h <= 0 || g <= 0) throw new RangeError("h و g يجب أن يكونا موجبين");
  requirePositive("P", p);
  return p / (g * h);
}

/* ── علاقات من دروس سابقة (واضحة في النص: ليست قوانين جديدة في هذا الدرس) ── */

export function massFromDensityVolume(rho: number, volume: number): number {
  requirePositive("ρ", rho);
  requirePositive("V", volume);
  return rho * volume;
}

export function weightFromMass(mass: number, g = G_BOOK): number {
  requirePositive("m", mass);
  requirePositive("g", g);
  return mass * g;
}

/** نتيجة الأواني المستطرقة: على سوية أفقية واحدة تتساوى الأعماق. */
export function equalSurfaceHeights(points: readonly { h: number }[]): boolean {
  if (points.length === 0) return false;
  const first = points[0].h;
  return points.every((p) => Math.abs(p.h - first) < 1e-9);
}

/** مقارنة ضغطين عند العمق نفسه لسائلين مختلفي الكتلة الحجمية. */
export function compareAtSameDepth(rhoA: number, rhoB: number, h: number, g = G_BOOK): -1 | 0 | 1 {
  const a = hydrostaticPressure(rhoA, h, g);
  const b = hydrostaticPressure(rhoB, h, g);
  return a === b ? 0 : a > b ? 1 : -1;
}

/**
 * مؤشر بصري نسبي (0…1) لاندفاع الماء من ثقب — عرض تعليمي فقط.
 * لا يُشتق من قانون طوريني (Torricelli) ولا يُقرأ كمدى أو سرعة مقاسة.
 */
export function jetReachIndicator(p: number, pMax: number): number {
  if (!Number.isFinite(pMax) || pMax <= 0) return 0;
  return Math.max(0, Math.min(1, p / pMax));
}

/** مؤشر بصري نسبي (0…1) لفرق سويتي المانومتر — ليس قراءة مُعايرة بالباسكال. */
export function manometerGapIndicator(p: number, pMax: number): number {
  return jetReachIndicator(p, pMax);
}

/** عمق ثلاثة ثقوب مرتبة من الأعلى إلى الأسفل تحت سطح حرّ. */
export function holeDepths(surface: number, offsets: readonly number[]): number[] {
  return offsets.map((o) => surface - o);
}

/** كتابة عدد بفاصلة عربية مناسبة للعرض (لا تُغيّر القيمة). */
export function fmt(value: number, digits = 0): string {
  return Number(value.toFixed(digits)).toLocaleString("en-US", { maximumFractionDigits: digits });
}
