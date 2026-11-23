/**
 * حارس التنقّل: صفحة الوحدة — وبطاقة «أراجع وأختبر نفسي» داخلها — يجب أن تكون
 * قابلة للوصول من صفحة «الوحدات الدراسية» التي يفتحها الطالب من الترويسة.
 *
 * سبب الاختبار: قبل الإصلاح كانت `/units/` تعرض الوحدة الأولى وقائمة دروسها
 * الخمسة فقط، دون أي رابط إلى `/units/unit-1/`. فكانت صفحة الوحدة — ومعها بطاقة
 * قسم المراجعة الختامية — صفحة يتيمة (orphan) لا يصلها الطالب من التنقّل العادي،
 * رغم أنها مبنية ومنشورة بشكل صحيح. الاختبارات السابقة فحصت وجود الملف ووجود
 * البطاقة داخل الملف، فمرّت جميعها بينما ظلّ الطالب لا يرى القسم إطلاقاً.
 *
 * ── درس من الخطأ السابق (لا تتجاوز بصمت) ──
 * النسخة الأولى من هذا الملف كانت تقرأ مجلد التصدير `out/` وتتجاوز كل اختبار
 * بـ `return` مبكر إن لم يكن موجوداً. وبما أن CI يشغّل `npm test` **قبل**
 * `npm run build`، كانت الاختبارات السبعة تُعلن النجاح دون أن تنفّذ أي تحقق.
 *
 * لذلك تُصيَّر هذه الاختبارات **الصفحات نفسها من المصدر** مباشرةً (بلا متصفح
 * وبلا مجلد تصدير)، فتعمل دائماً في كل بيئة ولا تحتاج أي شرط مسبق. ولا يوجد في
 * هذا الملف أي `skip` أو `return` مبكر أو تجاوز صامت: كل تأكيد يُنفَّذ فعلياً.
 *
 * فحص مخرجات التصدير الفعلية (ما يُنشر على GitHub Pages) في ملف منفصل:
 * `tests/export/navigation-export.test.ts` ويُشغَّل بعد البناء عبر `npm run test:export`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import "../render/css-stub"; // تمرير CSS Modules قبل أي مكوّن

import UnitsPage from "@/app/units/page";
import UnitPage from "@/app/units/[slug]/page";
import { units } from "@/content/registry";

const BASEPATH = "/Physics_Chemistry_7th";

/** يُصيّر صفحة الوحدة من المصدر لمعلوم slug، بنفس الطريقة التي يستدعيها Next.js. */
async function renderUnitPage(slug: string): Promise<string> {
  // صفحة الوحدة مكوّن خادم غير متزامن: نستدعيه ثم نصيّر الناتج.
  const element = await (UnitPage as unknown as (props: {
    params: Promise<{ slug: string }>;
  }) => Promise<React.ReactElement>)({ params: Promise.resolve({ slug }) });
  return renderToStaticMarkup(element);
}

/** كل hrefs في HTML، بعد تجريد basePath إن وُجد. */
function hrefs(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)]
    .map((m) => m[1])
    .filter((href) => href !== undefined)
    .map((href) => (href.startsWith(BASEPATH) ? href.slice(BASEPATH.length) : href));
}

// ───────────────────────────────────────────────────────────────────────────
// صفحة «الوحدات الدراسية»: القلب الجوهري للإصلاح
// ───────────────────────────────────────────────────────────────────────────

test("صفحة «الوحدات الدراسية» تُصيَّر بلا أخطاء", () => {
  const html = renderToStaticMarkup(h(UnitsPage));
  assert.ok(html.length > 1000, "الصفحة المصيَّرة فارغة أو قصيرة بشكل غير متوقع");
  assert.ok(html.includes("الوحدات الدراسية"), "عنوان الصفحة مفقود");
});

test("صفحة «الوحدات الدراسية» ترتبط بصفحة الوحدة الأولى (لا صفحة يتيمة)", () => {
  const all = hrefs(renderToStaticMarkup(h(UnitsPage)));
  assert.ok(
    all.some((x) => /^\/units\/unit-1\/?$/.test(x)),
    `صفحة «الوحدات الدراسية» لا ترتبط بـ /units/unit-1/ — صفحة الوحدة يتيمة. الروابط: ${all.join(", ")}`,
  );
});

test("كل وحدة في «الوحدات الدراسية» لها رابط إلى صفحتها", () => {
  const all = hrefs(renderToStaticMarkup(h(UnitsPage)));
  for (const unit of units) {
    assert.ok(
      all.some((x) => new RegExp(`^/units/${unit.slug}/?$`).test(x)),
      `لا يوجد رابط إلى صفحة الوحدة ${unit.slug} من صفحة الوحدات`,
    );
  }
});

test("عنوان كل وحدة نفسه رابط إلى صفحتها (لا نص جامد)", () => {
  const html = renderToStaticMarkup(h(UnitsPage));
  for (const unit of units) {
    const link = new RegExp(
      `<a[^>]*href="/units/${unit.slug}"[^>]*>[\\s\\S]{0,400}?${unit.title}`,
    );
    assert.ok(
      link.test(html),
      `عنوان الوحدة ${unit.slug} ليس رابطاً إلى صفحتها`,
    );
  }
});

test("«الوحدات الدراسية» لا تعرض بطاقة المراجعة (القسم يبقى في صفحة الوحدة فقط)", () => {
  const html = renderToStaticMarkup(h(UnitsPage));
  assert.ok(
    !html.includes("أراجع وأختبر نفسي"),
    "بطاقة المراجعة يجب ألا تظهر في صفحة الوحدات — مكانها صفحة الوحدة",
  );
});

// ───────────────────────────────────────────────────────────────────────────
// صفحة الوحدة الأولى: بطاقة المراجعة كآخر عنصر
// ───────────────────────────────────────────────────────────────────────────

test("صفحة الوحدة الأولى تحتوي بطاقة «أراجع وأختبر نفسي»", async () => {
  const html = await renderUnitPage("unit-1");
  assert.ok(
    html.includes("أراجع وأختبر نفسي — الوحدة الأولى"),
    "بطاقة قسم المراجعة غير موجودة في صفحة الوحدة",
  );
  assert.ok(
    hrefs(html).some((x) => /^\/units\/unit-1\/review\/?$/.test(x)),
    "بطاقة المراجعة لا تشير إلى /units/unit-1/review/",
  );
});

test("بطاقة المراجعة هي آخر رابط في صفحة الوحدة الأولى", async () => {
  const all = hrefs(await renderUnitPage("unit-1"));
  assert.ok(all.length >= 7, `روابط الصفحة أقل من المتوقع: ${all.length}`);
  assert.match(
    all[all.length - 1] ?? "",
    /^\/units\/unit-1\/review\/?$/,
    `قسم المراجعة ليس آخر رابط في الصفحة؛ آخر رابط: ${all[all.length - 1]}`,
  );
});

test("صفحة الوحدة: الدروس الخمسة ← اختبار الوحدة ← المراجعة (بهذا الترتيب)", async () => {
  const all = hrefs(await renderUnitPage("unit-1"));

  const lessonIdx = all
    .map((x, i) => ({ x, i }))
    .filter(({ x }) => /^\/lessons\//.test(x))
    .map(({ i }) => i);
  const quizIdx = all.findIndex((x) => /^\/quizzes\/quiz-unit-1\/?$/.test(x));
  const reviewIdx = all.findIndex((x) => /^\/units\/unit-1\/review\/?$/.test(x));

  assert.equal(lessonIdx.length, 5, `عدد روابط الدروس ليس خمسة: ${lessonIdx.length}`);
  assert.ok(quizIdx >= 0, "اختبار الوحدة الشامل غير موجود في الصفحة");
  assert.ok(reviewIdx >= 0, "بطاقة المراجعة غير موجودة في الصفحة");

  // الدروس الخمسة كلها قبل الاختبار
  for (const i of lessonIdx) {
    assert.ok(i < quizIdx, "أحد الدروس يأتي بعد اختبار الوحدة");
  }
  // الاختبار قبل المراجعة
  assert.ok(quizIdx < reviewIdx, "المراجعة يجب أن تأتي بعد اختبار الوحدة الشامل");
  // المراجعة أخيراً
  assert.equal(reviewIdx, all.length - 1, "المراجعة ليست آخر رابط");
});

test("قسم المراجعة لا يتكرّر في صفحة الوحدة", async () => {
  const reviewLinks = hrefs(await renderUnitPage("unit-1")).filter((x) =>
    /^\/units\/unit-1\/review\/?$/.test(x),
  );
  assert.equal(reviewLinks.length, 1, `قسم المراجعة مكرّر: ${reviewLinks.length} بطاقات`);
});

test("بطاقة المراجعة تُعرض دون غلاف كشف تدريجي مخفٍ (.reveal)", async () => {
  const html = await renderUnitPage("unit-1");
  const cardStart = html.indexOf("/units/unit-1/review");
  assert.ok(cardStart > 0, "بطاقة المراجعة غير موجودة");

  // نتتبّع الظهور: هل البطاقة داخل عنصر .reveal؟ (يبقيها شفافة حتى التمرير)
  const before = html.slice(0, cardStart);
  const openReveal = (before.match(/class="reveal/g) ?? []).length;
  const closeDivs = (before.match(/<\/div>/g) ?? []).length;
  const openDivs = (before.match(/<div/g) ?? []).length;
  const depthOfUnclosed = openDivs - closeDivs;

  // كل .reveal في الصفحة يُغلق قبل البطاقة، وقسم الاختبار/المراجعة خارجها.
  assert.ok(
    html.includes("<section") && before.lastIndexOf("<section") > before.lastIndexOf('class="reveal'),
    `البطاقة تبدو داخل غلاف كشف تدريجي (reveal مفتوح=${openReveal}, عمق=${depthOfUnclosed})`,
  );
});

// ───────────────────────────────────────────────────────────────────────────
// الوحدات الأخرى: البطاقة تخصّ الوحدة الأولى وحدها
// ───────────────────────────────────────────────────────────────────────────

test("بطاقة المراجعة تظهر في الوحدة الأولى فقط ولا تتسرّب لغيرها", async () => {
  for (const unit of units.filter((u) => u.slug !== "unit-1")) {
    const html = await renderUnitPage(unit.slug);
    assert.ok(
      !html.includes("أراجع وأختبر نفسي"),
      `بطاقة مراجعة الوحدة الأولى تسرّبت إلى ${unit.slug}`,
    );
  }
});
