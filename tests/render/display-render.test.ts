/**
 * اختبارات عرض فعلية (react-dom/server) للطبقة الموحدة KaTeX:
 * - لا `katex-error` في أي مخرجات (صيغ صالحة).
 * - لا تسرّب نصّ خام: `\text{` `\cdot` `m.s⁻¹` أو أقواس وحدات مفردة `(N)`.
 * - ترتيب القيمة قبل الوحدة داخل تعبير LTR معزول داخل سياق RTL.
 * - كل مكوّنات المحتوى (دفتر، أسئلة، فحوص، مختبرات، رسوم) تعمل بلا أخطاء صيغ.
 *
 * تُشغَّل بدون `--conditions=react-server` (react-dom/server لا يعمل معها):
 * انظر سكربت test في package.json.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import "./css-stub"; // أولًا: تمرير CSS Modules قبل أي مكوّن
import { Notebook } from "@/components/lesson/Notebook";
import { RichText } from "@/components/content/RichText";
import { AutoTex, Q, TeX } from "@/components/math/TeX";
import { ForceBookQuestions } from "@/components/lesson/ForceBookQuestions";
import { OneSupportBookQuestions } from "@/components/lesson/OneSupportBookQuestions";
import { WorkPowerBookQuestions } from "@/components/lesson/WorkPowerBookQuestions";
import { InlineCheck } from "@/components/lesson/InlineCheck";
import { BlockRenderer } from "@/components/lesson/Blocks";
import { UnitConverter } from "@/components/lab/UnitConverter";
import {
  SpringMagnetExperiment,
  ForceVectorDiagram,
  HangingBallForcesDiagram,
  ForceScaleDrawing,
} from "@/components/figures/force-figures";
import {
  ForceVectorDiagramExplained,
  SpringWeightExplained,
  MassWeightExplained,
} from "@/components/figures/force-explanation-figures";
import {
  WorkStoppedCarFigure,
  WorkLiftCarryFigure,
  WorkDirectionCasesFigure,
  WorkCarForcesFigure,
  WorkHorsepowerFigure,
} from "@/components/figures/work-power-figures";
import {
  BookOnTableFigure,
  TugOfWarFigure,
  CarPullersFigure,
  ResultantSameDirectionFigure,
  OppositeForcesRingFigure,
  ResultantOppositeForcesFigure,
  DirectOppositeEqualForcesFigure,
  ActionReactionFigure,
  ActionReactionExamplesGrid,
  ParachuteFigure,
} from "@/components/figures/one-support-figures";
import type { Rich } from "@/content/types";
import { listLessons } from "@/content/registry";
import { getQuizFull, listQuizzesMeta } from "@/content/quiz-bank";
import { oneSupportNotation } from "@/components/lesson/one-support-notation";

const CHECK_PROPS = {
  question: [{ t: "إذا كان وزن جسم 2 N، فما قوة تأثير الأرض عليه؟" }],
  options: ["2 N", "50 N", "0.5 N"],
  correct: 0,
  explain: [{ t: "تساوي قوة تأثير الأرض وزن الجسم مقدارًا 2 N." }],
};

const RAW = [
  "\\text{", // هروب خام تسرّب إلى المخرجات
  "\\cdot", // صيغة مفردة غير معزولة
  "m.s⁻¹", // أُسّ unicode غير محوَّل
  "(N)", // وحدة مفردة داخل قوس كنصّ
  "(kg)",
  "(m)",
  "(s)",
];

function assertClean(html: string, label: string) {
  assert.ok(!html.includes("katex-error"), `${label}: خطأ KaTeX في العرض`);
  for (const raw of RAW) {
    assert.ok(!html.includes(raw), `${label}: تسرّب نصّ خام ${JSON.stringify(raw)}`);
  }
}

test("Q: القيمة قبل الوحدة داخل تعبير LTR واحد معزول في سياق RTL", () => {
  const html = renderToStaticMarkup(h("div", { dir: "rtl" }, h(Q, { v: "0.5", u: "N" })));
  assertClean(html, "Q");
  assert.ok(html.includes('dir="ltr"'), "Q: لا تعبير LTR معزول");
  const iValue = html.indexOf("0.5");
  const iUnit = html.indexOf(">N<");
  assert.ok(iValue > -1 && iUnit > iValue, `Q: ترتيب القيمة قبل الوحدة (value=${iValue}, unit=${iUnit})`);
});

test("AutoTex: معادلة وكمية تُعرض KaTeX معزولة داخل RTL", () => {
  const eq = renderToStaticMarkup(h("div", { dir: "rtl" }, h(AutoTex, { text: "w = m × g" })));
  assertClean(eq, "AutoTex equation");
  assert.ok(eq.includes('dir="ltr"'), "AutoTex: لا تعبير LTR معزول");
  assert.ok(eq.includes("class=\"katex\""), "AutoTex: لا KaTeX");

  const mixed = renderToStaticMarkup(
    h("div", { dir: "rtl" }, h(RichText, { rich: [{ t: "سرعة " }, { q: { v: "80", u: "km/h" } }] })),
  );
  assertClean(mixed, "RichText mixed");
  const iArabic = mixed.indexOf("سرعة");
  const iValue = mixed.indexOf("80");
  assert.ok(iArabic > -1 && iValue > iArabic, "RichText: النصّ قبل القيمة في المصدر");
  assert.ok(mixed.includes('dir="ltr"'), "RichText: القيمة/الوحدة معزولة LTR");
});

test("دفتر كل الدرس يُعرض بلا أخطاء صيغ ولا تسرّبات خام", () => {
  for (const lesson of listLessons()) {
    const html = renderToStaticMarkup(
      h(Notebook, {
        items: lesson.notebook,
        lessonTitle: lesson.title,
        notation: lesson.slug === "forces-on-one-support" ? oneSupportNotation : undefined,
      }),
    );
    assertClean(html, `notebook:${lesson.slug}`);
    const data = JSON.stringify(lesson.notebook);
    if (data.includes('"tex"') || data.includes('"q"') || data.includes('"unit"')) {
      assert.ok(html.includes("class=\"katex\""), `notebook:${lesson.slug}: لا KaTeX أصلًا`);
    }
  }
});

test("دفتر قوانين القوة يعرض رموز الوحدات معزولة ورتَبها المعنى ثم الوحدة", () => {
  const lesson = listLessons().find((l) => l.slug === "force-and-motion")!;
  const html = renderToStaticMarkup(
    h(Notebook, { items: lesson.notebook, lessonTitle: lesson.title }),
  );
  // المعنى (كتلة الجسم) يسبق الوحدة في المصدر والعرض
  const iMeaning = html.indexOf("كتلة الجسم");
  const iKg = html.indexOf("class=\"katex\"", iMeaning);
  assert.ok(iMeaning > -1 && iKg > iMeaning, "ترتيب: المعنى قبل رمز الوحدة");
});

test("مكوّنات المحتوى (أسئلة، فحوص، رسوم) تُعرض KaTeX بلا أخطاء", () => {
  const figures: Array<[string, () => string]> = [
    ["SpringMagnetExperiment", () => renderToStaticMarkup(h(SpringMagnetExperiment, {}))],
    ["ForceVectorDiagram", () => renderToStaticMarkup(h(ForceVectorDiagram, {}))],
    ["HangingBallForcesDiagram", () => renderToStaticMarkup(h(HangingBallForcesDiagram, {}))],
    ["ForceScaleDrawing", () => renderToStaticMarkup(h(ForceScaleDrawing, {}))],
    ["ForceVectorDiagramExplained", () => renderToStaticMarkup(h(ForceVectorDiagramExplained, {}))],
    ["SpringWeightExplained", () => renderToStaticMarkup(h(SpringWeightExplained, {}))],
    ["MassWeightExplained", () => renderToStaticMarkup(h(MassWeightExplained, {}))],
    ["BookOnTableFigure", () => renderToStaticMarkup(h(BookOnTableFigure, {}))],
    ["TugOfWarFigure", () => renderToStaticMarkup(h(TugOfWarFigure, {}))],
    ["CarPullersFigure", () => renderToStaticMarkup(h(CarPullersFigure, {}))],
    ["ResultantSameDirectionFigure", () => renderToStaticMarkup(h(ResultantSameDirectionFigure, {}))],
    ["OppositeForcesRingFigure", () => renderToStaticMarkup(h(OppositeForcesRingFigure, {}))],
    ["ResultantOppositeForcesFigure", () => renderToStaticMarkup(h(ResultantOppositeForcesFigure, {}))],
    ["DirectOppositeEqualForcesFigure", () => renderToStaticMarkup(h(DirectOppositeEqualForcesFigure, {}))],
    ["ActionReactionFigure", () => renderToStaticMarkup(h(ActionReactionFigure, {}))],
    ["ActionReactionExamplesGrid", () => renderToStaticMarkup(h(ActionReactionExamplesGrid, {}))],
    ["ParachuteFigure", () => renderToStaticMarkup(h(ParachuteFigure, {}))],
    ["WorkStoppedCarFigure", () => renderToStaticMarkup(h(WorkStoppedCarFigure, {}))],
    ["WorkLiftCarryFigure", () => renderToStaticMarkup(h(WorkLiftCarryFigure, {}))],
    ["WorkDirectionCasesFigure", () => renderToStaticMarkup(h(WorkDirectionCasesFigure, {}))],
    ["WorkCarForcesFigure", () => renderToStaticMarkup(h(WorkCarForcesFigure, {}))],
    ["WorkHorsepowerFigure", () => renderToStaticMarkup(h(WorkHorsepowerFigure, {}))],
    ["ForceBookQuestions", () => renderToStaticMarkup(h(ForceBookQuestions, {}))],
    ["OneSupportBookQuestions", () => renderToStaticMarkup(h(OneSupportBookQuestions, {}))],
    ["WorkPowerBookQuestions", () => renderToStaticMarkup(h(WorkPowerBookQuestions, {}))],
    ["InlineCheck", () => renderToStaticMarkup(h(InlineCheck, CHECK_PROPS))],
    ["UnitConverter", () => renderToStaticMarkup(h(UnitConverter, {}))],
  ];
  for (const [label, render] of figures) {
    assertClean(render(), label);
  }
  // وحدات الفحص مُعرضة KaTeX (لا `2 N` نصًّا)
  const check = renderToStaticMarkup(h(InlineCheck, CHECK_PROPS));
  const katexCount = (check.match(/class="katex"/g) ?? []).length;
  assert.ok(katexCount >= 3, `InlineCheck: ${katexCount} KaTeX — الخيارات الثلاث يجب أن تُعرض صيغًا`);
});

test("كل أسئلة بنك الاختبارات (تلميحات + خيارات + شروحات) تُعرض KaTeX بلا أخطاء", () => {
  let checked = 0;
  for (const { id } of listQuizzesMeta()) {
    const quiz = getQuizFull(id)!;
    for (const q of quiz.questions) {
      const html = renderToStaticMarkup(h("div", { dir: "rtl" }, h(RichText, { rich: q.prompt })));
      assertClean(html, `${id}:prompt`);
      const maybeOptions = (q as { options?: Rich[] }).options;
      if (Array.isArray(maybeOptions)) {
        for (const opt of maybeOptions) {
          const optHtml = renderToStaticMarkup(h("div", { dir: "rtl" }, h(RichText, { rich: opt })));
          assertClean(optHtml, `${id}:options`);
        }
      }
      checked += 1;
    }
  }
  assert.ok(checked >= 20, `expected quiz questions, got ${checked}`);
});

test("كتل الدرس (عنوان وقانون وجدول) تُعرض KaTeX بلا أخطاء", () => {
  const lesson = listLessons().find((l) => l.slug === "force-and-motion")!;
  const stage = lesson.stages[0];
  for (const block of stage.blocks) {
    const html = renderToStaticMarkup(
      h("div", { dir: "rtl" }, h(BlockRenderer, { block })),
    );
    assertClean(html, `block:${block.type}`);
  }
});
