/**
 * اختبارات المُجزِّئ الذكي (AutoTex): كل قيمة علمية أو وحدة أو رمز أو معادلة
 * داخل نص عربي تُعزل إلى KaTeX، مع حماية النصوص الممنوعة (صفوح/سنوات/كلمات)
 * وسلامة الصيغ الناتجة وسلامة ترتيب القطع (لا فقد ولا تغيير في النص غير المطابق).
 */
import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { splitAutoTex } from "../../src/lib/auto-tex";
import { normalizeTex } from "../../src/lib/tex-format";
import { listLessons } from "../../src/content/registry";
import { getQuizFull, listQuizzesMeta } from "../../src/content/quiz-bank";

function assertKatex(value: string, where: string) {
  assert.doesNotThrow(
    () => katex.renderToString(normalizeTex(value), { throwOnError: true, strict: false }),
    `${where}: ${JSON.stringify(value)}`,
  );
}

function texOf(input: string): string[] {
  return splitAutoTex(input).filter((s) => s.type === "tex").map((s) => (s as { value: string }).value);
}

test("كميات ووحدات تُعرض KaTeX بالترتيب رقم ثم وحدة", () => {
  const cases: Array<[string, string]> = [
    ["0.5 N", "0.5\\,\\text{N}"],
    ["50 N", "50\\,\\text{N}"],
    ["0.5N", "0.5\\,\\text{N}"],
    ["2 N", "2\\,\\text{N}"],
    ["80 km/h", "80\\,\\text{km/h}"],
    ["400 km", "400\\,\\text{km}"],
    ["1cm", "1\\,\\text{cm}"],
    ["300 kg", "300\\,\\text{kg}"],
    ["20 s", "20\\,\\text{s}"],
    ["25 min", "25\\,\\text{min}"],
    ["1N", "1\\,\\text{N}"],
    ["45°", "45^\\circ"],
    ["45° C", "45^\\circ\\,\\text{C}"],
    ["مقدارها 7.2", "7.2"],
  ];
  for (const [input, expected] of cases) {
    const tex = texOf(input);
    assert.deepEqual(tex, [expected], input);
    assertKatex(expected, input);
  }
});

test("وحدات مفردة ومعقدة تُعرض KaTeX", () => {
  const cases: Array<[string, string]> = [
    ["m.s⁻¹", "\\text{m.s}^{-1}"],
    ["وحدتها kg", "\\text{kg}"],
    ["مثل m/s", "\\text{m/s}"],
    ["بـ km/h إلى m/s", "\\text{km/h}"],
    ["بالنيوتن N", "\\text{N}"],
    ["تُقاس بالمتر (m)", "(\\text{m})"],
    ["بالثانية (s)", "(\\text{s})"],
  ];
  for (const [input, expected] of cases) {
    const tex = texOf(input);
    assert.ok(tex.includes(expected), `${input} → ${JSON.stringify(tex)}`);
    assertKatex(expected, input);
  }
});

test("معادلات علمية تُعرض KaTeX كاملة", () => {
  const cases: Array<[string, string]> = [
    ["w = m × g", "w = m \\times g"],
    ["w = mg", "w = mg"],
    ["F = F1 + F2", "F = F_1 + F_2"],
    ["F₂ = 25N", "F_2 = 25\\,N"],
    ["g = 10", "g = 10"],
    ["18 / 0.5 = 36", "18 / 0.5 = 36"],
    ["500 × 20 = 10000", "500 \\times 20 = 10000"],
    ["÷ 3.6", "\\div 3.6"],
    ["9.83 ≈ 9.84", "9.83 ≈ 9.84"],
  ];
  for (const [input, expected] of cases) {
    const tex = texOf(input);
    assert.deepEqual(tex, [expected], input);
    assertKatex(expected, input);
  }
});

test("رموز علمية مفردة تُعرض KaTeX", () => {
  const cases: Array<[string, string]> = [
    ["قيمة g تختلف", "g"],
    ["الزمن t على المحور", "t"],
    ["المسافة d", "d"],
    ["السرعة v", "v"],
    ["كتلة m", "m"],
    ["نقطة O و B", "O"],
    ["الشعاع OB", "OB"],
    ["حامل xx′", "xx'"],
    ["قوة F'", "F'"],
  ];
  for (const [input, expected] of cases) {
    const tex = texOf(input);
    assert.ok(tex.includes(expected), `${input} → ${JSON.stringify(tex)}`);
    assertKatex(expected, input);
  }
});

test("نصوص محمية تبقى نصًّا بلا تحويل (صفوح وسنوات واختصارات ووحدات عربية)", () => {
  const untouched = [
    "ص 17–28",
    "ص 3 و 4",
    "1642–1727",
    "الجملة الدولية SI",
    "تقطع مسافة 1600 كم/سا",
    "كتلة 102 غرام",
    "الدرس الثاني: القوة والحركة",
  ];
  for (const input of untouched) {
    const segs = splitAutoTex(input);
    assert.equal(segs.length, 1, input);
    assert.equal(segs[0].type, "text", input);
    assert.equal((segs[0] as { value: string }).value, input, input);
  }
});

test("قيمة صرفة كخيار اختبار تُعرض KaTeX", () => {
  assert.deepEqual(splitAutoTex("20"), [{ type: "tex", value: "20" }]);
  assert.deepEqual(splitAutoTex("7.2"), [{ type: "tex", value: "7.2" }]);
  // لكن داخل جملة عربية لا تُلامس
  assert.deepEqual(splitAutoTex("الفريق 20 نقطة"), [{ type: "text", value: "الفريق 20 نقطة" }]);
});

test("كل قطع AutoTex الصادرة عن نصوص المحتوى صالحة KaTeX", () => {
  const richOf = (node: unknown, collect: (t: string) => void): void => {
    if (Array.isArray(node)) for (const x of node) richOf(x, collect);
    else if (node && typeof node === "object") {
      const o = node as Record<string, unknown>;
      if (typeof o.t === "string") collect(o.t);
      for (const v of Object.values(o)) if (typeof v !== "string") richOf(v, collect);
    }
  };
  const texts: string[] = [];
  for (const lesson of listLessons()) {
    richOf(lesson.stages, (t) => texts.push(t));
    richOf(lesson.notebook, (t) => texts.push(t));
  }
  for (const { id } of listQuizzesMeta()) richOf(getQuizFull(id), (t) => texts.push(t));
  assert.ok(texts.length > 100, `expected rich texts, got ${texts.length}`);
  for (const text of texts) {
    for (const seg of splitAutoTex(text)) {
      if (seg.type === "tex") assertKatex(seg.value, text);
      else assert.equal(typeof seg.value, "string");
    }
  }
});

test("تغطية: كل نصّ محتوى يحمل نمط وحدة أو معادلة يُisolated عبر KaTeX (لا تراجع عند إضافة دروس)", () => {
  // نمط الوحدة/الكمية كما يظهر في النصوص غير المعالجة — أي مطابقة جديدة
  // في درس لاحق يجب أن يمسّها AutoTex ويُخرجها صيغة.
  const unitPattern =
    /\d+(?:\.\d+)?\s*(?:km\/h|m\/s|m\.s[⁻¹²]*|km\.h[⁻¹²]*|kg|km|cm|mm|min|N|g|m|s|h)(?![A-Za-z0-9_])/;
  const equationPattern = /[A-Za-z][A-Za-z0-9_]*\s*(?:=|≈)\s*\S/;
  const texts: string[] = [];
  for (const lesson of listLessons()) {
    const walk = (node: unknown): void => {
      if (Array.isArray(node)) node.forEach(walk);
      else if (node && typeof node === "object") {
        const o = node as Record<string, unknown>;
        if (typeof o.t === "string") texts.push(o.t);
        for (const [k, v] of Object.entries(o)) if (k !== "t") walk(v);
      }
    };
    walk(lesson.stages);
    walk(lesson.notebook);
  }
  let checked = 0;
  for (const text of texts) {
    const needsIsolation = unitPattern.test(text) || equationPattern.test(text);
    if (!needsIsolation) continue;
    checked += 1;
    const tex = texOf(text);
    assert.ok(tex.length > 0, `لم يُعزل أي جزء من: ${text}`);
    for (const t of tex) assertKatex(t, text);
  }
  assert.ok(checked >= 5, `expected >=5 isolated texts, got ${checked}`);
});
