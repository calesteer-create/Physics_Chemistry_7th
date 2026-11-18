/** تثبيت رسم دفتر الطالب لدرس القوة: المكوّن الأصلي مجمّد ونسخ الشرح منفصلة. */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { forceAndMotionLesson } from "../../src/content/lessons/unit1/force-and-motion";

test("مكوّن رسم الدفتر الأصلي ForceVectorDiagram مطابق لخط الأساس حرفيًا", () => {
  const source = readFileSync("src/components/figures/force-figures.tsx", "utf8");
  const start = source.indexOf("export function ForceVectorDiagram");
  const end = source.indexOf("export function HangingBallForcesDiagram");
  assert.ok(start >= 0 && end > start);
  const hash = createHash("sha256").update(source.slice(start, end), "utf8").digest("hex");
  assert.equal(hash, "5c2e9ca7b40cac5c304751856b21b38ee6954c746400e310e347f0dec054cc2b");
});

test("مصفوفة دفتر الطالب في ملف الدرس مطابقة لخط الأساس المصدري", () => {
  const source = readFileSync("src/content/lessons/unit1/force-and-motion.ts", "utf8");
  const slice = source.slice(source.indexOf("  notebook: ["));
  assert.equal(createHash("sha256").update(slice, "utf8").digest("hex"),
    "dd19a4ac1eb9d9121a25cb3cae44dfd077bbee314cdea2fc086c42e15f45fa61");
});

test("رسم الدفتر الوحيد ما زال الأصلي ونسخ الشرح لا تصل إليه", () => {
  const notebookFigures = forceAndMotionLesson.notebook
    .filter(item => item.kind === "draw").map(item => item.figure?.src);
  assert.deepEqual(notebookFigures, ["force-vector-diagram"]);

  const registry = readFileSync("src/components/figures/index.tsx", "utf8");
  assert.match(registry, /"force-vector-diagram":\s*ForceVectorDiagram/);
  const notebookRenderer = registry.slice(registry.indexOf("export function NotebookFigure"));
  assert.match(notebookRenderer, /FIGURES\[figure\.src\]/);
  assert.doesNotMatch(notebookRenderer, /EXPLANATION_FIGURES/);

  const stageFigures = forceAndMotionLesson.stages
    .flatMap(stage => stage.blocks).filter(b => b.type === "figure");
  for (const src of ["force-vector-explained", "force-spring-weight-explained", "force-mass-weight-explained"]) {
    const fig = stageFigures.find(b => b.type === "figure" && b.figure.src === src);
    assert.ok(fig && fig.type === "figure", src);
    assert.equal(fig.figure.notebook, false, src);
  }
});
