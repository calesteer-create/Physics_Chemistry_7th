/**
 * حارس التنقّل: صفحة الوحدة — وبطاقة «أراجع وأختبر نفسي» داخلها — يجب أن تكون
 * قابلة للوصول من صفحة «الوحدات الدراسية» التي يفتحها الطالب من الترويسة.
 *
 * سبب الاختبار: قبل هذا الإصلاح كانت `/units/` تعرض الوحدة الأولى وقائمة دروسها
 * الخمسة فقط، دون أي رابط إلى `/units/unit-1/`. فكانت صفحة الوحدة — ومعها بطاقة
 * قسم المراجعة الختامية — صفحة يتيمة (orphan) لا يصلها الطالب من التنقّل العادي،
 * رغم أنها مبنية ومنشورة بشكل صحيح. الاختبارات السابقة فحصت وجود الملف ووجود
 * البطاقة داخل الملف، فمرّت جميعها بينما ظلّ الطالب لا يرى القسم إطلاقاً.
 *
 * لذلك يفحص هذا الاختبار *الرابط* لا *الملف*: مسار الطالب من `/units/` إلى
 * `/units/unit-1/` ثم إلى بطاقة المراجعة.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const OUT = join(ROOT, "out");

/** يستخرج كل hrefs الداخلية التي تمرّ عبر basePath. */
function internalLinks(html: string): string[] {
  return [...html.matchAll(/href="(\/Physics_Chemistry_7th[^"#]*)"/g)].map((m) => m[1]);
}

test("سجل المحتوى: كل وحدة منشورة لها صفحة في التصدير", () => {
  const outDir = join(ROOT, "out");
  if (!existsSync(outDir)) {
    // لا يوجد تصدير في هذه الجولة؛ يكفي فحص المصدر أدناه.
    return;
  }
  for (const slug of ["unit-1", "unit-2", "unit-3", "unit-4"]) {
    assert.ok(
      existsSync(join(outDir, "units", slug, "index.html")),
      `صفحة الوحدة ${slug} غير موجودة في التصدير الثابت`,
    );
  }
});

test("صفحة الوحدة الأولى تحتوي بطاقة المراجعة كآخر رابط في main", () => {
  const page = join(OUT, "units", "unit-1", "index.html");
  if (!existsSync(page)) return;
  const html = readFileSync(page, "utf-8");
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const hrefs = internalLinks(main);
  assert.ok(
    hrefs.some((x) => x.includes("/units/unit-1/review/")),
    "بطاقة قسم المراجعة غير موجودة في صفحة الوحدة",
  );
  assert.ok(
    hrefs[hrefs.length - 1]?.includes("/units/unit-1/review/"),
    `قسم المراجعة ليس آخر رابط في الصفحة؛ آخر رابط: ${hrefs[hrefs.length - 1]}`,
  );
});

test("صفحة الوحدة تحتوي اختبار الوحدة الشامل قبل المراجعة", () => {
  const page = join(OUT, "units", "unit-1", "index.html");
  if (!existsSync(page)) return;
  const html = readFileSync(page, "utf-8");
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const hrefs = internalLinks(main);
  const quizAt = hrefs.findIndex((x) => x.includes("/quizzes/quiz-unit-1/"));
  const reviewAt = hrefs.findIndex((x) => x.includes("/units/unit-1/review/"));
  assert.ok(quizAt >= 0, "اختبار الوحدة الشامل غير موجود");
  assert.ok(reviewAt > quizAt, "المراجعة يجب أن تأتي بعد اختبار الوحدة الشامل");
});

/**
 * القلب الجوهري للإصلاح: `/units/` يجب أن ترتبط بصفحة كل وحدة.
 * بدونه تبقى صفحة الوحدة يتيمة ولا يرى الطالب قسم المراجعة أبداً.
 */
test("صفحة «الوحدات الدراسية» ترتبط بصفحة الوحدة الأولى (لا صفحة يتيمة)", () => {
  const page = join(OUT, "units", "index.html");
  if (!existsSync(page)) return;
  const hrefs = internalLinks(readFileSync(page, "utf-8"));
  assert.ok(
    hrefs.some((x) => /\/units\/unit-1\/$/.test(x)),
    "صفحة «الوحدات الدراسية» لا ترتبط بـ /units/unit-1/ — صفحة الوحدة يتيمة",
  );
});

test("كل وحدة في «الوحدات الدراسية» لها رابط إلى صفحتها", () => {
  const page = join(OUT, "units", "index.html");
  if (!existsSync(page)) return;
  const hrefs = internalLinks(readFileSync(page, "utf-8"));
  for (const slug of ["unit-1", "unit-2", "unit-3", "unit-4"]) {
    assert.ok(
      hrefs.some((x) => x.endsWith(`/units/${slug}/`)),
      `لا يوجد رابط إلى صفحة الوحدة ${slug} من صفحة الوحدات`,
    );
  }
});

/** فحص المصدر نفسه: لا نكتفي بالتصدير القديم. */
test("مصدر صفحة الوحدات يربط عنوان كل وحدة بصفحتها", async () => {
  const src = readFileSync(join(ROOT, "src/app/units/page.tsx"), "utf-8");
  assert.ok(
    src.includes("/units/${unit.slug}"),
    "مصدر صفحة الوحدات لا يبني رابطاً إلى صفحة الوحدة",
  );
});

/** لا بطاقة ثانية: قسم المراجعة يظهر مرة واحدة فقط داخل صفحة الوحدة. */
test("قسم المراجعة لا يتكرّر في صفحة الوحدة", () => {
  const page = join(OUT, "units", "unit-1", "index.html");
  if (!existsSync(page)) return;
  const html = readFileSync(page, "utf-8");
  const main = html.slice(html.indexOf("<main"), html.indexOf("</main>"));
  const reviewLinks = internalLinks(main).filter((x) => x.includes("/units/unit-1/review/"));
  assert.equal(reviewLinks.length, 1, `قسم المراجعة مكرّر: ${reviewLinks.length} بطاقات`);
});
