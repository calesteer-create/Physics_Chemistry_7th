/**
 * فحص مخرجات التصدير الثابت — ما يُنشر فعلياً على GitHub Pages.
 *
 * هذا الملف منفصل عن اختبارات المصدر عمداً، لأن CI يشغّل `npm test` **قبل**
 * `npm run build`. لذلك:
 *   - `tests/stage2/navigation-reachability.test.ts` يفحص المصدر (يعمل دائماً).
 *   - هذا الملف يفحص `out/` ويُشغَّل بعد البناء عبر `npm run test:export`.
 *
 * لا يوجد هنا أي تجاوز صامت: إن غاب `out/` أو غاب أي مخرج مطلوب، يفشل الاختبار
 * بصوت عالٍ. تجاوز الفحص بصمت هو بالضبط الخطأ الذي سمح للمشكلة الأصلية بالمرور.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const OUT = join(ROOT, "out");
const BASEPATH = "/Physics_Chemistry_7th";

function read(file: string): string {
  return readFileSync(join(OUT, file), "utf-8");
}

/** hrefs داخل <main> فقط، مجرَّدة من basePath. */
function mainHrefs(html: string): string[] {
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  assert.ok(start >= 0 && end > start, "لا يوجد عنصر <main> في الصفحة");
  return [...html.slice(start, end).matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1] ?? "")
    .map((x) => (x.startsWith(BASEPATH) ? x.slice(BASEPATH.length) : x))
    .filter(Boolean);
}

test("مجلد التصدير out/ موجود وقابل للفحص (لا تجاوز صامت)", () => {
  assert.ok(
    existsSync(OUT),
    "مجلد out/ غير موجود — شغّل `npm run build` أولاً (هذا الاختبار يُشغَّل بعد البناء)",
  );
});

test("كل صفحات الوحدات موجودة في التصدير الثابت", () => {
  for (const slug of ["unit-1", "unit-2", "unit-3", "unit-4"]) {
    assert.ok(
      existsSync(join(OUT, "units", slug, "index.html")),
      `صفحة الوحدة ${slug} غير موجودة في التصدير`,
    );
  }
});

test("المنشور: «الوحدات الدراسية» ترتبط بصفحة الوحدة الأولى بأسماء مقروءة", () => {
  const all = mainHrefs(read("units/index.html"));
  for (const slug of ["unit-1", "unit-2", "unit-3", "unit-4"]) {
    assert.ok(
      all.some((x) => new RegExp(`^/units/${slug}/?$`).test(x)),
      `المنشور لا يربط صفحة الوحدة ${slug}`,
    );
  }
  // وقد كانت الصفحة يتيمة قبل الإصلاح: يجب أن يكون هناك رابط داخل main.
  assert.ok(
    all.filter((x) => /^\/units\/unit-1\/?$/.test(x)).length >= 1,
    "صفحة الوحدة الأولى لا تزال يتيمة في المنشور",
  );
});

test("المنشور: صفحة الوحدة الأولى تحتوي بطاقة المراجعة كآخر رابط في main", () => {
  const all = mainHrefs(read("units/unit-1/index.html"));
  assert.ok(all.length >= 7, `روابط main أقل من المتوقع: ${all.length}`);
  assert.match(
    all[all.length - 1] ?? "",
    /^\/units\/unit-1\/review\/?$/,
    `قسم المراجعة ليس آخر رابط؛ آخر رابط: ${all[all.length - 1]}`,
  );
});

test("المنشور: صفحة المراجعة نفسها موجودة وتحتوي المحطات الأربع", () => {
  assert.ok(
    existsSync(join(OUT, "units", "unit-1", "review", "index.html")),
    "صفحة المراجعة غير موجودة في التصدير",
  );
  const html = read("units/unit-1/review/index.html");
  assert.ok(html.includes("أراجع وأختبر نفسي — الوحدة الأولى"), "عنوان المراجعة مفقود");
  for (const station of ["صح أم خطأ", "الكتلة والثقل", "اقرأ الخط البياني", "المسائل"]) {
    assert.ok(html.includes(station), `محطة مفقودة في المنشور: ${station}`);
  }
});

test("المنشور: لا روابط تنقّل جذرية تتجاوز basePath في صفحات الوحدات", () => {
  // نفحص روابط <a> فقط: هي التي ينقرها الطالب. تلميحات <link rel="preconnect"
  // href="/"> التي يحقنها Next.js ليست روابط تنقّل و`href="/"` فيها سليم.
  for (const file of ["units/index.html", "units/unit-1/index.html", "units/unit-1/review/index.html"]) {
    const html = read(file);
    const anchors = [...html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map((m) => m[1] ?? "");
    const bad = anchors.filter(
      (href) => href.startsWith("/") && !href.startsWith(`${BASEPATH}/`),
    );
    assert.equal(
      bad.length,
      0,
      `روابط <a> جذرية تتجاوز basePath في ${file}: ${[...new Set(bad)].slice(0, 5).join(", ")}`,
    );
  }
});

test("المنشور: حمولة RSC لصفحة الوحدة تحتوي البطاقة (التنقّل من جهة العميل)", () => {
  const rsc = read("units/unit-1/index.txt");
  assert.ok(
    rsc.includes("أراجع وأختبر نفسي — الوحدة الأولى"),
    "حمولة RSC المنشورة لا تحتوي البطاقة — لن تظهر عند التنقّل من جهة العميل",
  );
});
