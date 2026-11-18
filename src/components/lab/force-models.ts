/**
 * نماذج فيزيائية نقية لمختبر القوة — بلا React ولا رسم.
 * قابلة للاختبار الآلي: القصور الذاتي، تناسب الاستطالة، هندسة المتجه، الثقل.
 */

export const CAR_MASS_KG = 10;

/** خطوة حركة واحدة: السرعة تُدمج من القوة المحصلة، ولا تُصفَّر بغياب القوة. */
export function nextVelocity(v: number, appliedN: number, frictionN: number, dt: number): number {
  const opposing = v > 0 ? frictionN : v < 0 ? -frictionN : 0;
  let net = appliedN - opposing;
  // احتكاك ساكن مبسّط: إن لم تكن القوة كافية لتحريك الجسم الساكن يبقى ساكنًا
  if (v === 0 && Math.abs(appliedN) <= frictionN) net = 0;
  const nv = v + (net / CAR_MASS_KG) * dt;
  // الاحتكاك وحده لا يعكس اتجاه الحركة؛ يوقف الجسم عند الصفر
  if (appliedN === 0 && v !== 0 && Math.sign(nv) !== Math.sign(v)) return 0;
  return nv;
}

export function nextPosition(x: number, v: number, dt: number): number {
  return x + v * dt;
}

/** استطالة ربيعة توازنية ضمن حدود المرونة: تتناسب طردًا مع القوة. */
export const SPRING_K_N_PER_CM = 5;
export function springElongationCm(forceN: number): number {
  return forceN / SPRING_K_N_PER_CM;
}

export interface VecOrigin { x: number; y: number }

/** أصغر مقياس (px/N) يُبقي رأس السهم وتسميته داخل الإطار بهامش معلوم. */
export function fittedVectorScale(
  origin: VecOrigin, magnitudeN: number, angleDeg: number,
  w: number, h: number, pad: number, preferred: number,
): number {
  if (magnitudeN <= 0) return preferred;
  const rad = (angleDeg * Math.PI) / 180;
  const cx = Math.abs(Math.cos(rad)) * magnitudeN;
  const cy = Math.abs(Math.sin(rad)) * magnitudeN;
  const availX = Math.cos(rad) >= 0 ? w - pad - origin.x : origin.x - pad;
  const availY = Math.sin(rad) >= 0 ? origin.y - pad : h - pad - origin.y;
  let scale = preferred;
  if (cx > 0) scale = Math.min(scale, availX / (magnitudeN * Math.abs(Math.cos(rad))));
  if (cy > 0) scale = Math.min(scale, availY / (magnitudeN * Math.abs(Math.sin(rad))));
  // رأس السهم نفسه يمتد إضافيًا على امتداد الاتجاه
  return Math.max(scale, 0.1);
}

export function vectorTip(origin: VecOrigin, magnitudeN: number, angleDeg: number, scale: number): VecOrigin {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: origin.x + Math.cos(rad) * magnitudeN * scale,
    y: origin.y - Math.sin(rad) * magnitudeN * scale,
  };
}

/** مقطع الحامل: المستقيم المار بنقطة التأثير وباتجاه القوة، مقصوصًا داخل الإطار. */
export function carrierSegment(
  origin: VecOrigin, angleDeg: number, w: number, h: number, pad: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad), dy = -Math.sin(rad);
  let tMin = -Infinity, tMax = Infinity;
  if (Math.abs(dx) > 1e-9) {
    const t1 = (pad - origin.x) / dx, t2 = (w - pad - origin.x) / dx;
    tMin = Math.max(tMin, Math.min(t1, t2)); tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (Math.abs(dy) > 1e-9) {
    const t1 = (pad - origin.y) / dy, t2 = (h - pad - origin.y) / dy;
    tMin = Math.max(tMin, Math.min(t1, t2)); tMax = Math.min(tMax, Math.max(t1, t2));
  }
  return {
    x1: origin.x + dx * tMin, y1: origin.y + dy * tMin,
    x2: origin.x + dx * tMax, y2: origin.y + dy * tMax,
  };
}

/** الثقل من الكتلة والجاذبية. */
export function weightN(massKg: number, g: number): number {
  return massKg * g;
}

/** استطالة ميزان ربيعة (px) متناسبة مع الثقل الفعلي — تستجيب للكتلة والمكان معًا. */
export const WEIGHT_SPRING_MAX_PX = 56;
export const WEIGHT_MAX_N = 100 * 9.83; // أقصى حالة معروضة: 100kg عند القطب
export function weightSpringPx(w: number): number {
  return Math.min((w / WEIGHT_MAX_N) * WEIGHT_SPRING_MAX_PX, WEIGHT_SPRING_MAX_PX);
}

export function weightArrowPx(w: number): number {
  return 10 + Math.min((w / WEIGHT_MAX_N) * 40, 40);
}
