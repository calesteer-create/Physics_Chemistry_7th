/**
 * فحص مخرجات التصدير الثابت للدرس الثاني «الضغط في السوائل».
 *
 * يُشغَّل بعد `npm run build` عبر `npm run test:export` ولا يتجاوز أي فحص
 * عند غياب `out/`؛ بل يفشل بصوت عالٍ. يتحقق من وجود الصفحات المنشورة،
 * وارتباط الوحدة الثانية بالدرس، وظهور الدفتر المعتمد، وخلوّ الحمولة
 * الأولى للاختبار من مفاتيح الإجابة والتفسيرات.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const OUT = join(ROOT, "out");
const BASEPATH = "/Physics_Chemistry_7th";

function read(file: string): string {
  return readFileSync(join(OUT, file), "utf-8");
}

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1] ?? "")
    .map((x) => (x.startsWith(BASEPATH) ? x.slice(BASEPATH.length) : x))
    .filter(Boolean);
}

test("مجلد out/ موجود وصفحات الدرس والاختبار مُصدَّرة", () => {
  assert.ok(existsSync(OUT), "مجلد out/ غير موجود — شغّل npm run build أولاً");
  for (const file of [
    "lessons/pressure-in-liquids/index.html",
    "lessons/pressure-in-liquids/index.txt",
    "quizzes/quiz-pressure-in-liquids-7/index.html",
    "quizzes/quiz-pressure-in-liquids-7/index.txt",
    "units/unit-2/index.html",
  ]) assert.ok(existsSync(join(OUT, file)), `ملف التصدير مفقود: ${file}`);
});

test("المنشور: الوحدة الثانية ترتبط بالدرس الثاني", () => {
  const html = read("units/unit-2/index.html");
  assert.ok(hrefs(html).some((x) => /^\/lessons\/pressure-in-liquids\/?$/.test(x)));
  assert.ok(html.includes("الضغط في السوائل"));
  assert.ok(!html.includes("أراجع وأختبر نفسي"));
});

test("المنشور: صفحة الدرس تحتوي الدفتر المعتمد والمراحل التسع", () => {
  const html = read("lessons/pressure-in-liquids/index.html");
  assert.ok(html.includes("الضغط في السوائل"));
  // نظام التبويبات يُصيِّر المرحلة النشطة وحدها في HTML الأولي؛ تبويب الدفتر
  // موجود في التنقّل، ويُفتح فعلياً في فحص المتصفح الحقيقي.
  for (const title of ["المختبر التفاعلي", "طبّق ما تعلمته", "اختبر نفسك", "دفتر الطالب"]) {
    assert.ok(html.includes(title), `مرحلة مفقودة في المنشور: ${title}`);
  }
  const rsc = read("lessons/pressure-in-liquids/index.txt");
  assert.ok(rsc.includes("الضغط في السوائل"));
  assert.ok(rsc.includes("دفتر الطالب"));
  assert.ok(rsc.includes("data-approved-notebook"), "حمولة RSC لا تحمل الدفتر المعتمد");
});

test("المنشور: صفحة الاختبار لا تكشف مفاتيح الإجابة ولا نسق الترتيب في الحمولة الأولى", () => {
  const html = read("quizzes/quiz-pressure-in-liquids-7/index.html");
  assert.ok(html.includes("اختبار الدرس الثاني — الضغط في السوائل"));
  assert.ok(html.includes("ابدأ الاختبار"));
  assert.ok(!html.includes('"answer"'));
  assert.ok(!html.includes('"explain"'));
  assert.ok(!html.includes('"steps"'));
  assert.ok(!html.includes("7000"));
  assert.ok(!html.includes("الإجابة الصحيحة"));
  assert.ok(!html.includes("[1,3,0,2]"));
  assert.ok(!html.includes("الترتيب الصحيح"));
  assert.ok(!html.includes('data-ordering-correct="true"'));
  const rsc = read("quizzes/quiz-pressure-in-liquids-7/index.txt");
  assert.ok(!rsc.includes('"answer"'));
  assert.ok(!rsc.includes('"explain"'));
  assert.ok(!rsc.includes('"steps"'));
  assert.ok(!rsc.includes("[1,3,0,2]"));
  assert.ok(!rsc.includes("الترتيب الصحيح"));
  assert.ok(!rsc.includes('data-ordering-correct="true"'));
});

test("المنشور: فهرس الاختبارات يرتبط بالاختبار الجديد", () => {
  const html = read("quizzes/index.html");
  assert.ok(html.includes("اختبار الدرس الثاني — الضغط في السوائل"));
  assert.ok(hrefs(html).some((x) => /^\/quizzes\/quiz-pressure-in-liquids-7\/?$/.test(x)));
});
