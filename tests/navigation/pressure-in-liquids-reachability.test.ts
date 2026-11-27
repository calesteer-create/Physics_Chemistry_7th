/**
 * حارس تنقّل وظهور خاص بالدرس الثاني «الضغط في السوائل».
 *
 * يُصيِّر الصفحات من المصدر (لا من `out/`) فيعمل قبل البناء أيضاً،
 * ويتحقق أن الدرس ليس يتيماً: الوحدة الثانية → الدرس → اختباره →
 * دفتر الطالب، مع بقاء الدرس الثالث «قيد الإعداد» وبطاقة مراجعة الوحدة
 * الأولى حصراً في مكانها. لا تعديل على اختبارات التنقّل القديمة.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import "../render/css-stub";
import UnitPage from "@/app/units/[slug]/page";
import LessonPage from "@/app/lessons/[slug]/page";
import QuizzesPage from "@/app/quizzes/page";
import { PressureInLiquidsNotebook } from "@/components/lesson/PressureInLiquidsNotebook";
import { getLesson, listPublishedLessons, units } from "@/content/registry";

const BASEPATH = "/Physics_Chemistry_7th";

function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1] ?? "")
    .map((x) => (x.startsWith(BASEPATH) ? x.slice(BASEPATH.length) : x))
    .filter(Boolean);
}

async function renderUnit(slug: string): Promise<string> {
  const el = await (UnitPage as unknown as (props: { params: Promise<{ slug: string }> }) => Promise<React.ReactElement>)({
    params: Promise.resolve({ slug }),
  });
  return renderToStaticMarkup(el);
}

async function renderLesson(slug: string): Promise<string> {
  const el = await (LessonPage as unknown as (props: { params: Promise<{ slug: string }> }) => Promise<React.ReactElement>)({
    params: Promise.resolve({ slug }),
  });
  return renderToStaticMarkup(el);
}

test("الدرس الثاني منشور والدرس الثالث ما زال مقفلاً", () => {
  const lesson = getLesson("pressure-in-liquids");
  assert.ok(lesson);
  assert.equal(lesson.status, "published");
  assert.equal(lesson.unitSlug, "unit-2");
  assert.equal(lesson.quizId, "quiz-pressure-in-liquids-7");
  assert.ok(listPublishedLessons().some((l) => l.slug === "pressure-in-liquids"));
  const unit2 = units.find((u) => u.slug === "unit-2");
  assert.equal(unit2?.lessons.find((l) => l.slug === "pressure-in-liquids")?.status, "published");
  assert.equal(unit2?.lessons.find((l) => l.slug === "archimedes-buoyancy")?.status, "pending");
  assert.equal(getLesson("archimedes-buoyancy"), undefined);
});

test("صفحة الوحدة الثانية ترتبط بالدرس الثاني ولا تتسرّب إليها مراجعة الوحدة الأولى", async () => {
  const html = await renderUnit("unit-2");
  assert.ok(hrefs(html).some((x) => /^\/lessons\/pressure-in-liquids\/?$/.test(x)));
  assert.ok(html.includes("الضغط في السوائل"));
  assert.ok(!html.includes("أراجع وأختبر نفسي"));
});

test("صفحة الدرس تعرض المراحل التسع والدفتر المعتمد ورابط الاختبار", async () => {
  const html = await renderLesson("pressure-in-liquids");
  assert.ok(html.includes("الضغط في السوائل"));
  for (const title of [
    "التهيئة والاستكشاف", "اكتشف المفهوم", "الشرح التفصيلي", "المختبر التفاعلي",
    "افهم وتحقق", "طبّق ما تعلمته", "اختبر نفسك", "مراجعة الدرس", "دفتر الطالب",
  ]) assert.ok(html.includes(title), `مرحلة مفقودة: ${title}`);
  // نظام التبويبات يُصيِّر المرحلة النشطة وحدها؛ نُصيِّر الدفتر مباشرةً للتأكد
  // من أن المرحلة التاسعة تحمل النص المعتمد لا نسخة بديلة.
  const notebookHtml = renderToStaticMarkup(h(PressureInLiquidsNotebook));
  assert.ok(notebookHtml.includes('data-approved-notebook="pressure-in-liquids"'));
  assert.ok(notebookHtml.includes("الدرس الثاني: الضغط في السوائل"));
  // رابط الاختبار داخل تبويب «اختبر نفسك»، لا في المرحلة النشطة الأولى؛
  // يُفتح ويُفحص في متصفح التصدير الحقيقي.
  assert.equal(getLesson("pressure-in-liquids")?.quizId, "quiz-pressure-in-liquids-7");
});

test("صفحة منطقة الاختبارات تعرض الاختبار الجديد ولا تكشف مفاتيح الإجابة", () => {
  const html = renderToStaticMarkup(h(QuizzesPage));
  assert.ok(html.includes("اختبار الدرس الثاني — الضغط في السوائل"));
  assert.ok(hrefs(html).some((x) => /^\/quizzes\/quiz-pressure-in-liquids-7\/?$/.test(x)));
  assert.ok(!html.includes('"answer"'));
  assert.ok(!html.includes('"explain"'));
});
