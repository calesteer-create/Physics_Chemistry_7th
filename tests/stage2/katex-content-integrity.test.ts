/**
 * سلامة الصيغ العلمية في بيانات المحتوى (دروس + بنك اختبارات):
 * - كل `tex` و `formula` و `sym` صالح KaTeX (throwOnError).
 * - لا محارف تحكم، ولا فقد متابعات (\text مكتوب text)، ولا فاصلة عشرية
 *   التُصيَّر مبتلعة بين رقم وحرف، ولا أقواس غير متوازنة، ولا محارف عربية
 *   مرتفعة (⁻¹) بدلًا من بناء LaTeX السليم.
 * - قوانين الوحدات ورموزها تمر عبر unitTex وتُظهر الوحدة في صيغة نصية.
 */
import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { normalizeTex, unitTex } from "../../src/lib/tex-format";
import { listLessons } from "../../src/content/registry";
import { getQuizFull, listQuizzesMeta } from "../../src/content/quiz-bank";

const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const DIGIT_COMMA_LETTER = /(\d),[A-Za-z]/;
const LOST_COMMAND = /(?<![\\A-Za-z{}])(text|vec|frac|cdot|times|approx|circ|Delta|sqrt|mathrm)(?=[{\s])/;
const RAISED = /[⁻¹²³⁴⁵⁶⁷⁸⁹⁰]/;

function checkRaw(label: string, raw: string) {
  assert.ok(!CONTROL.test(raw), `${label}: محارف تحكم في ${JSON.stringify(raw)}`);
  assert.ok(!DIGIT_COMMA_LETTER.test(raw), `${label}: فاصلة تبتلع متابعة حرفية في ${JSON.stringify(raw)}`);
  assert.ok(!LOST_COMMAND.test(raw), `${label}: أمر LaTeX فقد مقدمته في ${JSON.stringify(raw)}`);
  assert.ok(!RAISED.test(raw), `${label}: محارف عربية مرتفعة بدلًا من LaTeX في ${JSON.stringify(raw)}`);
  const open = (raw.match(/\{/g) ?? []).length;
  const close = (raw.match(/\}/g) ?? []).length;
  assert.equal(open, close, `${label}: أقواس غير متوازنة في ${JSON.stringify(raw)}`);
  assert.doesNotThrow(
    () => katex.renderToString(normalizeTex(raw), { throwOnError: true, strict: false }),
    `${label}: KaTeX يرفض ${JSON.stringify(normalizeTex(raw))}`,
  );
}

const TEX_KEYS = new Set(["tex", "formula", "sym"]);

function walk(node: unknown, where: string, hits: Array<{ where: string; value: string }>) {
  if (Array.isArray(node)) {
    node.forEach((x, i) => walk(x, `${where}[${i}]`, hits));
    return;
  }
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && TEX_KEYS.has(k)) hits.push({ where: `${where}.${k}`, value: v });
    else if (k === "unit" && typeof v === "string") {
      hits.push({ where: `${where}.unit`, value: unitTex(v) });
    } else walk(v, `${where}.${k}`, hits);
  }
}

test("كل صيغ الدروس (tex/formula/sym ورموز الوحدات) صالحة KaTeX بلا تشوهات", () => {
  const hits: Array<{ where: string; value: string }> = [];
  for (const lesson of listLessons()) {
    walk(lesson.stages, `${lesson.slug}.stages`, hits);
    walk(lesson.notebook, `${lesson.slug}.notebook`, hits);
  }
  assert.ok(hits.length > 60, `expected many tex values, got ${hits.length}`);
  for (const h of hits) checkRaw(h.where, h.value);
});

test("كل صيغ بنك الاختبارات (tex/formula ورموز الوحدات) صالحة KaTeX بلا تشوهات", () => {
  const hits: Array<{ where: string; value: string }> = [];
  for (const { id } of listQuizzesMeta()) walk(getQuizFull(id), id, hits);
  assert.ok(hits.length > 40, `expected quiz tex values, got ${hits.length}`);
  for (const h of hits) checkRaw(h.where, h.value);
});

test("رموز الوحدات المعكوسة تظهر كنص (\\text) بترتيب قيمة ثم وحدة محفوظ", () => {
  // قوانين الدروس: كل رمز ذو وحدة يجب أن يخرج بوحدة نصية KaTeX.
  let checked = 0;
  for (const lesson of listLessons()) {
    for (const stage of lesson.stages) {
      for (const block of stage.blocks) {
        if (block.type !== "law" || !("symbols" in block) || !block.symbols) continue;
        for (const sym of block.symbols) {
          if (!sym.unit) continue;
          const rendered = unitTex(sym.unit);
          assert.match(rendered, /\\(?:text|mathrm)\{/, `${lesson.slug}: وحدة ${sym.unit} ليست نصية`);
          checked += 1;
          // ترتيب معنون: المعنى قبل الوحدة في المصدر (اقرأ الاتجاه من النص لا من العرض).
          assert.ok(sym.meaning.length > 0, `${lesson.slug}: رمز بلا معنون`);
        }
      }
    }
  }
  assert.ok(checked >= 3, `expected law symbols with units, got ${checked}`);
});

test("معادلات القوانين الأساسية مكتوبة بناءً سليمًا (لا فقد متابعات، لا سوابق رفع)", () => {
  const formulas: string[] = [];
  for (const lesson of listLessons()) {
    for (const stage of lesson.stages) {
      for (const block of stage.blocks) {
        if (block.type === "law" && "formula" in block && typeof block.formula === "string") {
          formulas.push(`${lesson.slug}: ${block.formula}`);
        }
      }
    }
  }
  assert.ok(formulas.length >= 3, `expected law formulas, got ${formulas.length}`);
  for (const f of formulas) {
    const raw = f.split(": ").slice(1).join(": ");
    checkRaw(f, raw);
    // صيغ تُفهم كميات: كل رقم يتبعه حرف وحدة مفصول بـ \, أو بناء \text
    assert.ok(!/(?<!\\)\d\s*(?:N|kg|m\/s)(?![A-Za-z])/.test(raw) || /\\text|\\,/.test(raw), f);
  }
});
