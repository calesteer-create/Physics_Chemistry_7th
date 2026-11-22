/**
 * اختبارات عرض فعلية (react-dom/server) لقسم مراجعة الوحدة الأولى:
 * - الصفحة تُصيَّر بلا أخطاء.
 * - كل الصيغ تُمرَّر عبر KaTeX بلا `katex-error`.
 * - الرسوم تُنتج SVG، والجدول بخمسة أعمدة، ومخطط القوى بأربعة مواضع.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import "./css-stub"; // أولًا: تمرير CSS Modules قبل أي مكوّن

import { Unit1Review } from "@/components/review/Unit1Review";
import {
  AcceleratedGraph,
  BeetlePath,
  BodiesTable,
  RestGraph,
  SpringScalesFigure,
  UniformGraph,
} from "@/components/figures/unit1-review-figures";
import { TableItemView, PlotItemView, ScalesItemView, DiagramItemView } from "@/components/review/ActivityItems";
import { reviewItems } from "@/content/unit1-review";
import type {
  DiagramItem,
  PlotItem,
  ScalesItem,
  TableItem,
} from "@/content/unit1-review";

const noop = () => {};

function assertClean(html: string, label: string) {
  assert.ok(!html.includes("katex-error"), `${label}: katex-error`);
  assert.ok(!html.includes("\\\\("), `${label}: TeX خام`);
  assert.ok(!html.includes("$$"), `${label}: TeX خام`);
}

test("صفحة المراجعة تُصيَّر وتحتوي الترويسة والمحطة الأولى", () => {
  const html = renderToStaticMarkup(h(Unit1Review));
  assertClean(html, "Unit1Review");
  assert.ok(html.includes("أراجع وأختبر نفسي — الوحدة الأولى"));
  assert.ok(html.includes("المحطة ١"));
  assert.ok(html.includes("صح أم خطأ؟ ثم صحّح"));
  assert.ok(html.includes("تكون حركة جسم مستقيمة منتظمة"));
  assert.ok(html.includes("تحقّق من الإجابة"));
  assert.ok(html.includes("أنجزت 0 من 20"));
});

test("الرسوم الثلاثة والمسار والربيعات تُنتج SVG سليمة", () => {
  for (const [label, element] of [
    ["الشكل أ", h(UniformGraph)],
    ["الشكل ب", h(AcceleratedGraph)],
    ["الشكل ج", h(RestGraph)],
    ["مسار الخنفساء", h(BeetlePath)],
    ["الربيعات", h(SpringScalesFigure)],
  ] as const) {
    const html = renderToStaticMarkup(element as never);
    assertClean(html, label);
    assert.ok(html.includes("<svg"), `${label}: svg`);
    assert.ok(html.includes("katex"), `${label}: تسميات KaTeX`);
  }

  const rest = renderToStaticMarkup(h(RestGraph));
  // سلسلتا النقاط: 4 نقاط عند d=5 و4 نقاط عند d=0.
  assert.equal((rest.match(/role="button"/g) ?? []).length, 8);
  assert.ok(rest.includes("d = 5 m"));
  assert.ok(rest.includes("d = 0 m"));
  assert.ok(rest.includes("الصفّان أفقيان"));
});

test("جدول الأجسام: أربعة صفوف بكتلتها وأثقالها", () => {
  const html = renderToStaticMarkup(h(BodiesTable));
  assertClean(html, "جدول الأجسام");
  assert.equal((html.match(/<tr/g) ?? []).length, 5, "رأس + أربعة أجسام");
  assert.ok(html.includes(">A<") && html.includes(">D<"));
  assert.ok(html.includes(">40<") && html.includes(">80<"));
  assert.ok(html.includes("الكتلة"));
  assert.ok(html.includes("الثقل"));
});

test("جدول المسألة الأولى: خمسة أعمدة وثلاثة اختيارات وخانة زمن واحدة", () => {
  const item = reviewItems.find((i) => i.id === "s4-table") as TableItem;
  const html = renderToStaticMarkup(h(TableItemView, { item, onResult: noop }));
  assertClean(html, "الجدول");
  assert.equal((html.match(/<td/g) ?? []).length, 10, "5 أعمدة × صفّين");
  assert.equal((html.match(/<select/g) ?? []).length, 3);
  assert.ok(html.includes("الزمن اللازم لقطع 5 cm"));
  assert.ok(html.includes("المسافة المقطوعة"));
});

test("تخطيط النقاط: شبكة 9×9 = 81 موضعًا", () => {
  const item = reviewItems.find((i) => i.id === "s4-plot") as PlotItem;
  const html = renderToStaticMarkup(h(PlotItemView, { item, onResult: noop }));
  assertClean(html, "التخطيط");
  assert.equal((html.match(/role="button"/g) ?? []).length, 81);
  assert.ok(html.includes("شكل الخط البياني"));
});

test("الربيعات: ثلاثة حقول قراءة", () => {
  const item = reviewItems.find((i) => i.id === "s4-scales") as ScalesItem;
  const html = renderToStaticMarkup(h(ScalesItemView, { item, onResult: noop }));
  assertClean(html, "الربيعات");
  assert.equal((html.match(/type="text"/g) ?? []).length, 3);
  assert.ok(html.includes("الربيعة (a)"));
  assert.ok(html.includes("الربيعة (c)"));
});

test("مخطط القوى: أربعة مواضع وأربع قوى", () => {
  const item = reviewItems.find((i) => i.id === "s4-forces") as DiagramItem;
  const html = renderToStaticMarkup(h(DiagramItemView, { item, onResult: noop }));
  assertClean(html, "مخطط القوى");
  assert.ok(html.includes("الصندوق"));
  assert.ok(html.includes("قوة العامل"));
  assert.ok(html.includes("ثقل الصندوق"));
  assert.equal((html.match(/أعلى الصندوق|أسفل الصندوق|يمين الصندوق|يسار الصندوق/g) ?? []).length >= 4, true);
});
