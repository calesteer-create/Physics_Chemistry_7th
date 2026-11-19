/**
 * بهَر التعديلات في `force-on-one-support.ts` (دفتر الطالب وأساليبه) — مستقل عن
 * بصمة الاختبار: يقارن النسخة المعتمدة (الأصل من main@34f5df3 المحفوظة في
 * tests/fixtures) بالنسخة الحالية على مستوى البنية والنصوص والدلالة العلمية:
 *
 *  1) البنية والترتيب: مطابقة تامة للمفاتيح وطول المصفوفات وترتيبها.
 *  2) النصوص: كل ورقة نصية خارج حقلي `tex`/`formula` مطابقة حرفيًا.
 *  3) الصيغ المعدَّلة: ثلاث كفلات:
 *     أ) visible(old) === visible(new) — بعد إزالة علامات التنسيق فقط
 *        (لفّات \mathrm، الفاصلة الرفيعة المفقودة، محارف التحكم من الهروب الناقص)
 *        يبقى كل حرف علمي/عربي/رقم/معامل مطابقًا وبالترتيب نفسه.
 *     ب) oneSupportTeX(old) === new — التعديل يساوي تمامًا دالة الإصلاح
 *        المعتمدة للعرض فقط (موثّقة في one-support-notation.tsx).
 *     ج) الصيغة الجديدة صالحة KaTeX، والأصل كانت تالفة فعليًا (سبب الإصلاح).
 *  4) تثبيت الـ hash كدليل إضافي — لا كدليل وحيد.
 */
import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { forceOnOneSupportLesson as current } from "../../src/content/lessons/unit1/force-on-one-support";
import { forceOnOneSupportLesson as approved } from "../fixtures/force-on-one-support.base";
import { oneSupportTeX } from "../../src/components/lesson/one-support-notation";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

/** محارف التحكم التي أنتجها تفسير JS لمحارف الهروب الناقصة \t \v \f \b. */
const CONTROL_LETTER: Record<string, string> = {
  "\t": "t", "\u000b": "v", "\u000c": "f", "\u0008": "b",
};

/**
 * المحتوى العلمي/المرئي للصيغة بعد إزالة علامات التنسيق فقط:
 * لا يحذف ولا يعيد ترتيب أي حرف من المضمون العلمي.
 */
function visible(s: string): string {
  return s
    .replace(/[\u0000-\u001f\u007f]/g, (c) => CONTROL_LETTER[c] ?? "")
    .replace(/\\mathrm\{([^{}]*)\}/g, "$1")
    .replace(/\\,/g, "")
    .replace(/(\d),(?=[A-Za-z\\])/g, "$1")
    .replace(/\\/g, "");
}

type Diff = { path: string; old: string; neu: string };

function walkPair(o: unknown, n: unknown, path: string, diffs: Diff[], shapeErrors: string[]) {
  if (Array.isArray(o) || Array.isArray(n)) {
    if (!Array.isArray(o) || !Array.isArray(n)) {
      shapeErrors.push(`${path}: نوع مختلف (مصفوفة/غير مصفوفة)`);
      return;
    }
    if (o.length !== n.length) {
      shapeErrors.push(`${path}: طول ${o.length} ≠ ${n.length}`);
      return;
    }
    o.forEach((x, i) => walkPair(x, n[i], `${path}[${i}]`, diffs, shapeErrors));
    return;
  }
  if (o && n && typeof o === "object" && typeof n === "object") {
    const ok = Object.keys(o as object);
    const nk = Object.keys(n as object);
    if (ok.join("|") !== nk.join("|")) {
      shapeErrors.push(`${path}: مفاتيح ${JSON.stringify(ok)} ≠ ${JSON.stringify(nk)}`);
      return;
    }
    for (const k of ok) {
      walkPair((o as Record<string, unknown>)[k], (n as Record<string, unknown>)[k], `${path}.${k}`, diffs, shapeErrors);
    }
    return;
  }
  if (typeof o !== typeof n) {
    shapeErrors.push(`${path}: نوع القيمة ${typeof o} ≠ ${typeof n}`);
    return;
  }
  if (o !== n) {
    diffs.push({ path, old: String(o), neu: String(n) });
  }
}

function collect(): { diffs: Diff[]; shapeErrors: string[] } {
  const diffs: Diff[] = [];
  const shapeErrors: string[] = [];
  walkPair(approved, current, "lesson", diffs, shapeErrors);
  return { diffs, shapeErrors };
}

test("البنية والترتيب مطابقان تمامًا للنسخة المعتمدة (مفاتيح، مصفوفات، تسلسل)", () => {
  const { diffs, shapeErrors } = collect();
  assert.deepEqual(shapeErrors, [], "أخطاء بنية/ترتيب:\n" + shapeErrors.join("\n"));
  assert.ok(diffs.length > 0, "يُتوقع وجود إصلاحات عرض فعلية");
});

test("كل ورقة نصية خارج tex/formula مطابقة حرفيًا (لا تغيير في أي نصّ علمي/عربي)", () => {
  const { diffs, shapeErrors } = collect();
  assert.deepEqual(shapeErrors, []);
  for (const d of diffs) {
    const lastKey = d.path.split(/[.[\]]/).filter(Boolean).pop();
    assert.ok(
      lastKey === "tex" || lastKey === "formula",
      `تعديل خارج حقول العرض: ${d.path}\n  قديم: ${JSON.stringify(d.old)}\n  جديد: ${JSON.stringify(d.neu)}`,
    );
  }
});

test("الصيغ المعدَّلة: المضمون العلمي نفسه بالترتيب — إزالة التنسيق فقط تكشف التطابق", () => {
  const { diffs } = collect();
  assert.ok(diffs.length >= 10, `عدد التعديلات المتوقع ≥10، وُجد ${diffs.length}`);
  for (const d of diffs) {
    assert.equal(
      visible(d.old),
      visible(d.neu),
      `المضمون المرئي يختلف في ${d.path}:\n  ${JSON.stringify(visible(d.old))}\n  ${JSON.stringify(visible(d.neu))}`,
    );
  }
});

test("كل تعديل يساوي تمامًا دالة الإصلاح المعتمدة oneSupportTeX (عرض فقط)", () => {
  const { diffs } = collect();
  assert.ok(diffs.length >= 10);
  for (const d of diffs) {
    assert.equal(
      oneSupportTeX(d.old),
      d.neu,
      `التعديل ≠ الإصلاح المعتمدة في ${d.path}:\n  old: ${JSON.stringify(d.old)}\n  repair: ${JSON.stringify(oneSupportTeX(d.old))}\n  new: ${JSON.stringify(d.neu)}`,
    );
    // الإصلاح كان لازمًا: الأصل كان تالفًا فعلًا (ولم يكن معروضًا كما أُريد).
    assert.notEqual(oneSupportTeX(d.old), d.old, `${d.path}: الأصل لم يكن معطوبًا — لماذا عُدّل؟`);
    // الأصل يحمل دليل تلف: محارف تحكم أو فاصلة رفيعة مفقودة بين رقم ووحدة.
    const corrupted = /[\u0000-\u001f\u007f]/.test(d.old) || /(\d),N/.test(d.old);
    assert.ok(corrupted, `${d.path}: لا دليل تلف في الأصل ${JSON.stringify(d.old)}`);
    // الجديدة صالحة KaTeX.
    assert.doesNotThrow(
      () => katex.renderToString(d.neu, { throwOnError: true, strict: false }),
      `${d.path}: KaTeX يرفض ${JSON.stringify(d.neu)}`,
    );
  }
});

test("دليل إضافي: بصمة الملف الحالية هي المعتمدة b0320f71… (وليست الدليل الوحيد)", () => {
  const json = JSON.stringify({ title: current.title, notebook: current.notebook });
  const hash = createHash("sha256").update(json).digest("hex");
  assert.equal(hash, "b0320f71ae611d10425dc0bf8fd7259849825d68582f7a6d57e4a2d942a44d08");
  const src = readFileSync(new URL("../../src/content/lessons/unit1/force-on-one-support.ts", import.meta.url), "utf8");
  assert.ok(src.includes("forceOnOneSupportLesson"), "الملف الحالي هو مصدر الدرس");
});
