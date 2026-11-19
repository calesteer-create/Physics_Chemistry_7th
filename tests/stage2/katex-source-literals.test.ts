/**
 * فحص مصادر المكوّنات بدلًا من مخرجاتها:
 * - سلاسل JS (صياغة تفسير المحارف): لا هروب ناقص (`"\text"` → TAB)،
 *   لا تكرار مزدوج ملوّث (`\\text` في JS يُقرأ `\` + `text`)، صيغة KaTeX سليمة.
 * - خصائص JSX (نص حر): لا `\\` مزدوج (لا يُفسَّر في JSX)، KaTeX سليم.
 * - String.raw: بلا `\\` مزدوج وبلا مشاكل KaTeX.
 * يمنع عودة «إصلاح» بالهروب اليدوي الذي سبق أصل العطل (الفقرة الأربعة).
 */
import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { normalizeTex } from "../../src/lib/tex-format";

const ROOT = new URL("../../src", import.meta.url).pathname;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name) && !name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const DIGIT_COMMA_LETTER = /(\d),[A-Za-z]/;
const LOST_COMMAND = /(?<![\\A-Za-z{}])(text|vec|frac|cdot|times|approx|circ|Delta|sqrt|mathrm)(?=[{\s])/;
const RAISED = /[⁻¹²³⁴⁵⁶⁷⁸⁹⁰]/;

function checkTex(label: string, tex: string) {
  assert.ok(!CONTROL.test(tex), `${label}: محارف تحكم في ${JSON.stringify(tex)}`);
  assert.ok(!DIGIT_COMMA_LETTER.test(tex), `${label}: فاصلة مبتلعة في ${JSON.stringify(tex)}`);
  assert.ok(!LOST_COMMAND.test(tex), `${label}: أمر فقد زناده في ${JSON.stringify(tex)}`);
  assert.ok(!RAISED.test(tex), `${label}: أُسّ unicode في ${JSON.stringify(tex)}`);
  const open = (tex.match(/\{/g) ?? []).length;
  const close = (tex.match(/\}/g) ?? []).length;
  assert.equal(open, close, `${label}: أقواس غير متوازنة في ${JSON.stringify(tex)}`);
  assert.doesNotThrow(
    () => katex.renderToString(normalizeTex(tex), { throwOnError: true, strict: false }),
    `${label}: KaTeX يرفض ${JSON.stringify(normalizeTex(tex))}`,
  );
}

/** تحقق من سلسلة JS بمحارف الهروب (كما ستُقرأ عند تشغيل الوحدة). */
function checkJsString(label: string, raw: string) {
  let parsed: string;
  try {
    parsed = JSON.parse(`"${raw}"`);
  } catch (e) {
    assert.fail(`${label}: هروب غير صالح في ${JSON.stringify(raw)} (${String(e).slice(0, 60)})`);
  }
  // `\\text` (مكرر) يُقرأ `\\` + `text` — فقدان زناد ملوّث.
  assert.ok(!parsed.includes("\\\\"), `${label}: مزدوج ملوّث في ${JSON.stringify(raw)}`);
  checkTex(label, parsed);
}

const files = walk(ROOT);
assert.ok(files.length > 45, `expected source files, got ${files.length}`);

test("خصائص JSX (tex/formula/xLabel/yLabel) لا تحمل `\\` مزدوجًا وتُقرأ KaTeX سليمة", () => {
  const attr = /\b(tex|formula|xLabel|yLabel)="([^"\n]*)"/g;
  let checked = 0;
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(attr)) {
      checked += 1;
      const [full, key, value] = m;
      assert.ok(
        !value.includes("\\\\"),
        `${file}: خاصية ${key} تحمل مزدوجًا (يفسد الهروب) في ${full}`,
      );
      checkTex(`${file}: ${key}`, value);
    }
  }
  assert.ok(checked >= 40, `expected many JSX tex attrs, got ${checked}`);
});

test("صياغات JS (tex/formula/label و`<TeX>{...}`) تُقرأ بلا تلف هروب", () => {
  const patterns: RegExp[] = [
    /\b(tex|formula|label):\s*"((?:[^"\\\n]|\\.)*)"/g,
    /<TeX>\{"((?:[^"\\\n]|\\.)*)"\}<\/TeX>/g,
    /\btex=\{"((?:[^"\\\n]|\\.)*)"\}/g,
  ];
  let checked = 0;
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        const key = m.length > 2 ? m[1] : "TeX";
        const raw = m.length > 2 ? m[2] : m[1];
        // `label` قد يكون نصًّا عربيًا بلا صيغة — يُفحص على الهروب فقط إن كان يحمل شرطة.
        if (key === "label" && !raw.includes("\\")) {
          assert.ok(!CONTROL.test(raw), `${file}: محارف تحكم في label ${JSON.stringify(raw)}`);
          continue;
        }
        checked += 1;
        checkJsString(`${file}: ${key}`, raw);
      }
    }
  }
  assert.ok(checked >= 40, `expected many JS tex strings, got ${checked}`);
});

test("قوالب template داخل tex={...} وبـ <TeX>{...} صحيحة", () => {
  const patterns = [
    /\btex=\{`((?:[^`\\]|\\.)*)`\}/g,
    /<TeX>\{`((?:[^`\\]|\\.)*)`\}<\/TeX>/g,
  ];
  let checked = 0;
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const re of patterns) {
      for (const m of src.matchAll(re)) {
        checked += 1;
        const withoutExprs = m[1].replace(/\$\{[^}]*\}/g, "0");
        checkJsString(`${file}: tex-template`, withoutExprs);
      }
    }
  }
  assert.ok(checked >= 5, `expected template tex strings, got ${checked}`);
});

test("String.raw للصيغ (تعمل حرفيًا) بلا `\\` مزدوج وبلا تشوهات", () => {
  const raw = /String\.raw`([^`]*)`/g;
  let checked = 0;
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(raw)) {
      checked += 1;
      const value = m[1];
      // شظايا إصلاح one-support-notation مقصودة عدم توازنها (تُركَّب مع ما بعدها).
      if (value.endsWith("{") || value.startsWith("}")) continue;
      // أنماط regex بـ String.raw (auto-tex.ts) ليست صيغًا علمية: تبدأ بصنف محارف [.
      if (/\[[A-Za-z0-9_\-^⁰¹²³⁴⁵⁶⁷⁸⁹⁻]/.test(value)) continue;
      const formulaLike = /=|\\,|\\text|\\cdot|\\times|\\approx|\\div|\\mathrm|\\;|\\vec/.test(value);
      if (!formulaLike) continue;
      assert.ok(!value.includes("\\\\"), `${file}: مزدوج داخل String.raw في ${JSON.stringify(value)}`);
      checkTex(`${file}: String.raw`, value);
    }
  }
  assert.ok(checked >= 1, `expected String.raw tex strings, got ${checked}`);
});
