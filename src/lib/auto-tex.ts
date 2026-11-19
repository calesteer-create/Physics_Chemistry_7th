/**
 * المُجزِّئ الذكي للنص العربي المختلط بالقيم العلمية والوحدات والرموز.
 *
 * كل نصّ `t` في المنصّة يمرّ عبره وقت العرض فقط — النصّ الأصلي في ملفات
 * المحتوى (بما فيه دفتر الطالب) لا يُمَس. المخرجات قطع: نصّ كما هو،
 * أو صيغة KaTeX تُعرض داخل `<TeX>` (عزل LTR — ترتيب الرقم ثم الوحدة
 * لا ينقلب داخل السياق العربي).
 *
 * القواعد (بالترتيب، أول منطابقة تفوز عند موضع الحرف):
 *  1. معادلة تبدأ بحرف أو برقم وتحوي `=`/`≈`… مثل `w = m × g`,
 *     `F = F1 + F2`, `18 / 0.5 = 36`, `500 × 20 = 10000`
 *  2. كمية: رقم + وحدة مثل `0.5 N`, `80 km/h`, `1cm`, `45°`, `20°C`
 *  3. ضرب/قسمة رقمية بلا مساواة: `500 × 20`, `÷ 3.6`
 *  4. وحدة مفردة: `kg`, `m.s⁻¹`, `km/h`, `m/s`
 *  5. وحدة `N` مفردة، ووحدات صريحة بين قوسين `(m)` `(kg)` `(N)`…
 *  6. عدد عشري مفرد: `3.6`
 *  7. رموز علمية: `g` `w` `m` `F` `d` `t` `v` `O` `B` `ΔL` `xx′` `F₂` `F'`…
 *
 * الممنوعات حفاظًا على النص: أرقام صفحات وسنوات بلا وحدة (`ص 17–28`,
 * `1642–1727`)، والكلمات العربية، واختصارات مثل `SI`، والوحدات بحروف
 * عربية (`كم/سا`) — تبقى نصًّا كما هي.
 */

export type AutoSeg =
  | { type: "text"; value: string }
  | { type: "tex"; value: string };

/** وحدات معقدة تسبق البديل الأقصر في التنويع. */
const UNIT_COMPOUND = String.raw`km\/h|m\/s|km\.h[⁻¹²]*|m\.s[⁻¹²]*|px\/N`;
/** وحدات قصيرة (تُسمح بعد رقم في قاعدة الكمية). */
const UNIT_SHORT = String.raw`kg|km|cm|mm|min|px|m|g|h|s|N`;
const UNIT_AFTER_NUMBER = `(?:${UNIT_COMPOUND}|${UNIT_SHORT})`;
/** وحدات تُعرض مفردة بلا رقم (الحرف الواحد يُعامل رمزًا لا وحدة). */
const UNIT_STANDALONE = `(?:${UNIT_COMPOUND}|kg|km|cm|mm|min|px)`;
/** وحدات مسموحة داخل قوسين صريحيين `(m)`. */
const UNIT_PAREN = String.raw`km\/h|m\/s|kg|km|cm|mm|min|m|s|h|N`;
/** رموز علمية مفردة الحرف. */
const SYMBOLS = String.raw`gwmFdvtOBΔ`;
const SUB_DIGITS = "₀-₉";
/** أحرف يُسمح بها داخل معادلة (لاتينية/أرقام/مسافات وعمليات). */
const EQ_BODY = String.raw`[A-Za-z0-9_\\^.,\t ×÷+\-*/′'=₀-₉≈≤≥≠]+`;

const SUPERSCRIPT_MAP: Record<string, string> = {
  "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4",
  "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁻": "-",
};

/** تحويل الأرقام التخطيطية إلى ASCII: `F₂` → `F_2`. */
function asciiSubscripts(ident: string): string {
  return ident
    .replace(/([A-Za-z])[₀-₉]+/g, (all, letter: string) => {
      const digits = Array.from(all.slice(1), (d) =>
        d >= "₀" && d <= "₉" ? String(d.charCodeAt(0) - 0x2080) : d,
      ).join("");
      return `${letter}_${digits}`;
    })
    .replace(/[₀-₉]/g, (d) => String(d.charCodeAt(0) - 0x2080));
}

/** الوحدة الآمنة: تُحوَّل بقاعدة `unitTex` من tex-format. */
function unitSafe(unit: string): string {
  if (unit.includes("\\")) return unit;
  const withExponent = /^(.*?)([⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+)$/.exec(unit);
  if (withExponent && withExponent[1]) {
    const exponent = Array.from(withExponent[2], (ch) => SUPERSCRIPT_MAP[ch] ?? ch).join("");
    return `\\text{${withExponent[1]}}^{${exponent}}`;
  }
  return `\\text{${unit}}`;
}

/**
 * بناء معادلة من مطابقة خام: يُشطَب ما زائد من الأطراف (فراغات/عمليات)
 * مع إرجاع عدد المحارف المستهلكة فعلًا من المصدر كي لا يضيع فاصل.
 */
function buildEquation(raw: string): { tex: string; used: number } | null {
  const trimmed = raw.replace(/[=×÷+\-*/,.\s]+$/u, "").replace(/^[=×÷+\-*/,.\s]+/u, "");
  if (!trimmed || !/[=≈≤≥≠]/.test(trimmed)) return null;
  const tex = trimmed
    .replace(/([A-Za-z])[₀-₉]+/g, (all) => asciiSubscripts(all)) // F₂ → F_2
    .replace(/([A-Za-z])(\d)/g, "$1_$2") // F1 → F_1
    .replace(/(\d)([A-Za-z])/g, "$1\\,$2") // 25N → 25\,N
    .replace(/(\d+(?:\.\d+)?) +([A-Za-z]+)(?![A-Za-z])/g, "$1\\,$2") // 40 N → 40\,N
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ")
    .replace(/−/g, "-")
    .replace(/ {2,}/g, " ")
    .trim();
  if (!tex) return null;
  return { tex, used: trimmed.length };
}

type Rule = { re: RegExp; build: (m: RegExpExecArray) => { tex: string; used: number } | null };

const RULES: Rule[] = [
  {
    // 1) معادلة تبدأ بحرف لاتيني وتحوي = / ≈ …
    re: new RegExp(String.raw`[A-Za-z][A-Za-z0-9_${SUB_DIGITS}]*[ \t]*(?:=|≈|≤|≥|≠)[ \t]*${EQ_BODY}`, "g"),
    build: (m) => buildEquation(m[0]),
  },
  {
    // 1ب) معادلة تبدأ برقم وتحوي مساواة (مثل `18 / 0.5 = 36`).
    re: new RegExp(String.raw`[0-9][0-9A-Za-z_\\^.,\t ×÷+\-*/′'=₀-₉≈≤≥≠]+`, "g"),
    build: (m) => buildEquation(m[0]),
  },
  {
    // 2) كمية: رقم (+ عشري) + وحدة.
    re: new RegExp(String.raw`(\d+(?:[.,]\d+)?)[ \t]*(${UNIT_AFTER_NUMBER})(?![A-Za-z0-9_])`, "g"),
    build: (m) => ({ tex: `${m[1]}\\,${unitSafe(m[2])}`, used: m[0].length }),
  },
  {
    // 3) زاوية/مئوية: `45°` أو `20°C`.
    re: new RegExp(String.raw`(\d+(?:[.,]\d+)?)[ \t]*°[ \t]*(C(?![A-Za-z])|(?![A-Za-z]))`, "g"),
    build: (m) => {
      const celsius = /°[ \t]*C$/.test(m[0]);
      return { tex: `${m[1]}^\\circ${celsius ? "\\,\\text{C}" : ""}`, used: m[0].length };
    },
  },
  {
    // 4) ضرب/قسمة رقمية بلا مساواة: `500 × 20`, `3 ÷ 4`.
    re: new RegExp(String.raw`\d+(?:[.,]\d+)?(?:[ \t]*[×÷][ \t]*\d+(?:[.,]\d+)?)+`, "g"),
    build: (m) => ({
      tex: m[0].replace(/×/g, "\\times ").replace(/÷/g, "\\div ").replace(/ {2,}/g, " ").trim(),
      used: m[0].length,
    }),
  },
  {
    // 4ب) `÷ 3.6` يبدأ بعملية.
    re: new RegExp(String.raw`[×÷][ \t]*\d+(?:[.,]\d+)?`, "g"),
    build: (m) => ({
      tex: m[0].replace(/×/, "\\times ").replace(/÷/, "\\div ").replace(/ +/g, " ").trim(),
      used: m[0].length,
    }),
  },
  {
    // 5) وحدة مفردة معقدة: `kg`, `m.s⁻¹`, `km/h`, `m/s`…
    re: new RegExp(String.raw`(?<![A-Za-z0-9_])${UNIT_STANDALONE}(?![A-Za-z0-9_])`, "g"),
    build: (m) => ({ tex: unitSafe(m[0]), used: m[0].length }),
  },
  {
    // 6) وحدة N مفردة (النيوتن).
    re: /(?<![A-Za-z0-9_])N(?![A-Za-z0-9_])/g,
    build: (m) => ({ tex: "\\text{N}", used: m[0].length }),
  },
  {
    // 7) وحدة صريحة داخل قوسين `(m)` `(kg)` `(N)`…
    re: new RegExp(String.raw`\((${UNIT_PAREN})\)(?![A-Za-z0-9_])`, "g"),
    build: (m) => ({ tex: `(\\text{${m[1]}})`, used: m[0].length }),
  },
  {
    // 8) عدد عشري مفرد بلا وحدة: `3.6`, `0.4`.
    re: /(?<![\d.,])\d+\.\d+(?![\d.,])/g,
    build: (m) => ({ tex: m[0], used: m[0].length }),
  },
  {
    // 9) رموز متعددة الحروف: `xx′`, `OB`, `ΔL`.
    re: new RegExp(String.raw`(?<![A-Za-z0-9_])(?:xx[′']|OB|ΔL)(?![A-Za-z0-9_])`, "g"),
    build: (m) => ({ tex: asciiSubscripts(m[0]).replace("′", "'"), used: m[0].length }),
  },
  {
    // 10) رمز علمي مفرد (يشمل `F'` و`F_2` و`F₂`).
    re: new RegExp(
      String.raw`(?<![A-Za-z0-9_])[${SYMBOLS}](?:['′])?(?:_\d+|[${SUB_DIGITS}]+)?(?![A-Za-z0-9_])`,
      "g",
    ),
    build: (m) => ({ tex: asciiSubscripts(m[0]).replace("′", "'"), used: m[0].length }),
  },
];

/** هل يمكن لهذا الحرف أن يبدأ مطابقة؟ */
const INTERESTING = /[A-Za-z0-9Δ°÷×(]/;

/**
 * تجزئة نصّ إلى قطع نصية/علمية. دالة نقية بلا خطّافات (تعمل داخل
 * مكوّنات الخادم والعميل على حد سواء).
 */
export function splitAutoTex(input: string): AutoSeg[] {
  // قيمة صرفة (خيار اختبار مثل `20` أو `7.2`) → صيغة واحدة. لا تُلامَس
  // أرقام الصفوح والسنوات لأنها تأتي داخل جمل عربية لا كقطع مفردة.
  const whole = input.trim();
  if (whole && /^[−+-]?\d+(?:[.,]\d+)?$/.test(whole)) {
    return [{ type: "tex", value: whole.replace("−", "-") }];
  }

  const segs: AutoSeg[] = [];
  let buf = "";
  const flush = () => {
    if (buf) {
      segs.push({ type: "text", value: buf });
      buf = "";
    }
  };
  const take = (value: string) => {
    flush();
    segs.push({ type: "tex", value });
  };

  let i = 0;
  while (i < input.length) {
    const ch = input[i];
    const prev = i > 0 ? input[i - 1] : "";
    if (!INTERESTING.test(ch) || /[A-Za-z0-9_]/.test(prev)) {
      buf += ch;
      i += 1;
      continue;
    }
    let matched = false;
    for (const rule of RULES) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(input);
      if (!m || m.index !== i) continue;
      const built = rule.build(m);
      if (!built) continue;
      take(built.tex);
      i = i + built.used; // لا يبتلع أي محرف زائد (فاصلة/فراغ بعد المعادلة)
      matched = true;
      break;
    }
    if (!matched) {
      buf += ch;
      i += 1;
    }
  }
  flush();
  return segs;
}
