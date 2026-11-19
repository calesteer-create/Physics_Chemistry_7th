/**
 * منظومة تنسيق الصيغ العلمية الموحدة (KaTeX).
 *
 * - `normalizeTex` يُطبَّق على كل صيغة قبل عرضها (HTML وSVG): يرمّم الوحدات
 *   إلى صيغة منتصبة داخل `\text{}`، ويصلح تلف الهروب الشائع (`\,` المفقودة،
 *   محارف التحكم الناتجة عن `\text`/`\vec`/`\frac`…).
 * - `unitTex` يحوّل حقل «الوحدة» في جداول الرموز إلى صيغة KaTeX صحيحة،
 *   بدعم الأسس التخطيطية مثل `⁻¹`.
 * القاعدة: الرقم أولًا ثم الوحدة إلى يمينه داخل تعبير LTR واحد `value\,\text{unit}`.
 */

/** وحدات لاتينية تُنصَّب حين تظهر مجرّدة خارج `\text{}` (لا رموز المتغيرات). */
const UPRIGHT_UNITS = ["cm", "km", "mm", "min", "px", "kg", "N"] as const;

/** وحدات حرف واحد: تُنصَّب فقط بعد رقم بفاصلة رفيعة (`20\,s`) أو بين قوسين `(m)`. */
const SINGLE_LETTER_UNITS_AFTER_NUMBER = ["m", "s", "h", "g"] as const;

/** أوامر LaTeX تحوَّل إلى نصّ فقد زنادها الخلفي (سلاسل JS مفردة الظهر). */
const LOST_COMMANDS =
  /(?<![A-Za-z\\{}])(text|vec|frac|cdot|times|approx|circ|Delta|sqrt|mathrm|theta|alpha|beta|gamma|lambda)(?=[{(\s^])/g;

/** محارف التحكم الناتجة عن تفسير JS لـ `\t` `\v` `\f` `\b` داخل الصيغ. */
const CONTROL_FIXES: Array<[RegExp, string]> = [
  [/\u000bec{/g, "\\vec{"], // \v + ec{  ← \vec
  [/\u0009ext{/g, "\\text{"], // \t + ext{ ← \text
  [/\u0009imes/g, "\\times"], // \t + imes ← \times
  [/\u000crac{/g, "\\frac{"], // \f + rac{  ← \frac
  [/\u0008ig\{/g, "\\big{"], // \b + ig{   ← \big
];

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-",
};

function superscriptsToAscii(run: string): string {
  return Array.from(run, (ch) => SUPERSCRIPT_MAP[ch] ?? ch).join("");
}

/**
 * توحيد صيغة الوحدة إلى KaTeX:
 * - `N`               → `\text{N}`
 * - `m.s⁻¹`           → `\text{m.s}^{-1}`
 * - `N\cdot kg^{-1}`  → تُترك كما هي (TeX جاهز) ويُنصَّب رمزها عند العرض.
 */
export function unitTex(unit: string): string {
  if (!unit) return "";
  if (unit.includes("\\")) {
    // صيغة معقّدة جاهزة مثل `N\cdot kg^{-1}` → تُنصَّب بالكامل كرموز منتصبة.
    if (/\\(?:mathrm|text)\{/.test(unit)) return unit; // مُعلّمة من قبل
    return `\\mathrm{${unit}}`;
  }
  const withExponent = /^(.*?)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/.exec(unit);
  if (withExponent && withExponent[1]) {
    return `\\text{${withExponent[1]}}^{${superscriptsToAscii(withExponent[2])}}`;
  }
  return `\\text{${unit}}`;
}

/**
 * تنظيف صيغة KaTeX قبل العرض — يُطبَّق مركزًا على كل مسارات العرض
 * (TeX وSvgTeX) حتى تبقى الوحدات منتصبة والصيغ سليمة مع أي درس جديد.
 */
export function normalizeTex(tex: string): string {
  let out = tex;

  // 1) إصلاح محارف التحكم (تلف الهروب الكامل مثل \text → TAB+ext).
  for (const [pattern, replacement] of CONTROL_FIXES) out = out.replace(pattern, replacement);

  // 2) إصلاح الأوامر التي فقدت زنادها الخلفية تمامًا.
  out = out.replace(LOST_COMMANDS, "\\$1");

  // 3) الفاصلة المفقودة مكان `\,` بين رقم ووحدة: `20,N` → `20\,N`.
  out = out.replace(/(\d),([A-Za-z])/g, "$1\\,$2");

  // 4) `N.kg` (نقطة بدل ضرب) → `\text{N}\cdot\text{kg}`.
  out = out.replace(/(?<![A-Za-z\\{}])N\.kg/g, "\\text{N}\\cdot\\text{kg}");

  // 5) تنصيب الوحدات اللاتينية المجرّدة خارج `\text{}`.
  for (const unit of UPRIGHT_UNITS) {
    const pattern = new RegExp(`(?<![A-Za-z\\\\{}])${unit}(?![A-Za-z])`, "g");
    out = out.replace(pattern, `\\text{${unit}}`);
  }

  // 6) وحدات الحرف الواحد: بعد رقم+فاصلة رفيعة فقط (يبقى `m`/`g` رمزًا في `w = m\,g`).
  for (const unit of SINGLE_LETTER_UNITS_AFTER_NUMBER) {
    const pattern = new RegExp(`(?<=\\d\\\\,)${unit}(?![A-Za-z])`, "g");
    out = out.replace(pattern, `\\text{${unit}}`);
  }
  //    وداخل قوسين صريحيين: `d(m)` و`t(s)` → وحدات منتصبة.
  out = out.replace(/\((m|s|h)\)/g, (_all, u: string) => `(\\text{${u}})`);

  // 7) `^\circ C` → `^\circ\,\text{C}` (وحدة مئوية منتصبة).
  out = out.replace(/\^\\circ\s+C(?![A-Za-z])/g, "^\\circ\\,\\text{C}");

  // 8) أُس unicode متبقي خارج `\text{}`: `m.s⁻¹` → `m.s^{-1}`.
  out = out.replace(/(?<=[A-Za-z])[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (run) => `^{${superscriptsToAscii(run)}}`);

  return out;
}
