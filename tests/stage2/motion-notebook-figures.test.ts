/** Protect both the notebook's direct figures and the legacy figure IDs
 * flagged as notebook figures in the original lesson. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { motionAndRestLesson } from "../../src/content/lessons/unit1/motion-and-rest";

test("رسومات الحركة الأصلية مطابقة تماماً لخط الأساس", () => {
  const source = readFileSync("src/components/figures/motion-charts.tsx");
  assert.equal(createHash("sha256").update(source).digest("hex"), "0a11b99e4c4f69facd7a7786abe767f472ca08b849019bad137ffce12ca682b2");
});

test("معرفات الدفتر القديمة ما زالت تشير إلى رسومها الأصلية", () => {
  const registry = readFileSync("src/components/figures/index.tsx", "utf8");
  for (const [id, component] of [
    ["path-types-diagram", "PathTypesDiagram"],
    ["uniform-motion-chart", "UniformMotionChart"],
    ["non-uniform-motion-chart", "NonUniformMotionChart"],
    ["stationary-chart", "StationaryChart"],
    ["speedometer", "SpeedometerSVG"],
  ]) {
    assert.match(registry, new RegExp(`"${id}":\\s*(?:\\(\\) => <)?${component}`));
  }
  const notebookRenderer = registry.slice(registry.indexOf("export function NotebookFigure"));
  assert.match(notebookRenderer, /FIGURES\[figure\.src\]/);
  assert.doesNotMatch(notebookRenderer, /EXPLANATION_FIGURES/);
});

test("نسخ الشرح المحسنة منفصلة ولا تطلب كرسوم للدفتر", () => {
  const blocks = motionAndRestLesson.stages.flatMap(stage => stage.blocks ?? []);
  const figures = blocks.filter(block => block.type === "figure").map(block => block.figure);
  for (const src of ["motion-explained-nonuniform", "motion-explained-speedometer"]) {
    const figure = figures.find(item => item.src === src);
    assert.ok(figure, src);
    assert.equal(figure.notebook, false);
  }
  const notebookFigures = motionAndRestLesson.notebook.filter(item => item.kind === "draw").map(item => item.figure?.src);
  assert.deepEqual(notebookFigures, ["path-types-diagram", "uniform-motion-chart"]);
});
