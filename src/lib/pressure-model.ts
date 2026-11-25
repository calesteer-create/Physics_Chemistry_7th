/**
 * نموذج الضغط النقي — الدرس الأول من الوحدة الثانية (ص 65–70).
 *
 * الكميات الفيزيائية المحسوبة هنا هي فقط:
 * - شدة القوة الضاغطة `F` بالنيوتن،
 * - مساحة السطح `s` بالمتر المربع،
 * - الضغط `P = F / s` بالباسكال،
 * - وشدة الثقل `w = m g` عند الحاجة.
 *
 * تنبيه تربوي أساسي: عمق انضغاط الإسفنج/الرمل/الثلج في المختبر ليس كمية
 * فيزيائية محسوبة من قانون الضغط. الدالة `displayIndentationRatio` أدناه
 * تمثيل بصري نسبي تعليمي فقط: تجعل الأثر المرئي يتناسب رتيبًا مع الضغط
 * ضمن المادة نفسها، وتتدخل فيها ليونة المادة، ولا تُقرأ قيمة مقاسة.
 */

function finiteNonNegative(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a finite non-negative number`);
  }
  return value;
}

function finitePositive(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a finite positive number`);
  }
  return value;
}

/** الضغط بالباسكال: `P = F / s` — F بالنيوتن وs بالمتر المربع. */
export function pressurePa(forceN: number, areaM2: number): number {
  return finiteNonNegative(forceN, "Force") / finitePositive(areaM2, "Area");
}

/** شدة القوة الضاغطة من الضغط والمساحة: `F = P s`. */
export function forceFromPressureN(pressure: number, areaM2: number): number {
  return finiteNonNegative(pressure, "Pressure") * finitePositive(areaM2, "Area");
}

/** مساحة السطح من القوة والضغط: `s = F / P`. */
export function areaFromPressureM2(forceN: number, pressure: number): number {
  return finiteNonNegative(forceN, "Force") / finitePositive(pressure, "Pressure");
}

/** شدة الثقل بالنيوتن: `w = m g` — m بالكيلوغرام. */
export function weightN(massKg: number, g = 10): number {
  return finiteNonNegative(massKg, "Mass") * finitePositive(g, "g");
}

/**
 * ضغط جسم مستند بثقله إلى سطح أفقي (دون قوة ضاغطة إضافية):
 * شدة القوة الضاغطة تساوي شدة الثقل، ثم `P = F / s`.
 */
export function pressureFromMassPa(massKg: number, areaM2: number, g = 10): number {
  return pressurePa(weightN(massKg, g), areaM2);
}

/** مقارنة ضغطين: أيّهما أكبر؟ */
export function comparePressure(aPa: number, bPa: number): "A" | "B" | "equal" {
  const a = finiteNonNegative(aPa, "Pressure A");
  const b = finiteNonNegative(bPa, "Pressure B");
  if (a === b) return "equal";
  return a > b ? "A" : "B";
}

/**
 * ليونة مواد مختبر الإسفنج — معامل عرض بصري فقط.
 * يغيّر هذا المعامل شكل الأثر المرئي وحده؛ قيمة الضغط المحسوبة لا تتغير
 * بتغيّر المادة إطلاقًا.
 */
export const MATERIAL_SOFTNESS = {
  sponge: 1,
  sand: 0.78,
  snow: 0.9,
} as const;

export type LabMaterial = keyof typeof MATERIAL_SOFTNESS;

/**
 * مؤشر الانضغاط البصري النسبي (0 إلى 0.95) — للعرض التعليمي فقط.
 *
 * الخصائص المضمونة بالاختبارات:
 * - رتيب التزايد مع الضغط ضمن المادة نفسها (ضغط أكبر ← أثر مرئي أكبر)؛
 * - مسقوف عند 0.95 مهما كبر الضغط (الانضغاط المرئي لا ينمو بلا حد)؛
 * - يتأثر بمعامل ليونة المادة دون أن يغيّر قيمة الضغط الفيزيائية.
 *
 * لا يمثّل هذا المؤشر عمقًا مقاسًا ولا يتنبأ بانضغاط مادة حقيقية؛
 * الانضغاط الحقيقي يتدخل فيه نوع المادة وسماكتها وخواصها، وهو خارج
 * قانون الضغط `P = F / s` الذي يحسب الضغط وحده.
 */
export function displayIndentationRatio(pressure: number, material: LabMaterial): number {
  const p = finiteNonNegative(pressure, "Pressure");
  const softness = MATERIAL_SOFTNESS[material];
  // منحنى تشبّع تعليمي: يقترب الأثر المرئي من حدّه الأقصى تدريجيًا.
  const saturated = p / (p + 2500);
  return Math.min(0.95, softness * 0.98 * saturated);
}
