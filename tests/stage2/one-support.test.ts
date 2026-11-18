import assert from "node:assert/strict";
import test from "node:test";
import { addition, subtraction } from "../../src/components/figures/one-support-geometry";
import { oneSupportTeX, presentOneSupportBlock } from "../../src/components/lesson/one-support-notation";
import { forceOnOneSupportLesson as lesson } from "../../src/content/lessons/unit1/force-on-one-support";
import katex from "katex";

test("p.31: three downward vectors on one carrier, from O, in uncalibrated SVG units", () => {
  const { origin, first, second, resultant } = addition;
  assert.deepEqual(origin, [106, 26]);
  assert.deepEqual([first, second, resultant].map(([x, y]) => [x - origin[0], y - origin[1]]), [[0, 45], [0, 70], [0, 115]]);
});

test("p.34: 4 SVG units/N, including the sign and the common line of action", () => {
  const { origin, first, second, resultant } = subtraction;
  assert.deepEqual(origin, [110, 54]);
  assert.deepEqual([first, second, resultant].map(([x, y]) => [(x - origin[0]) / 4, y - origin[1]]), [[-20, 0], [30, 0], [10, 0]]);
});

test("typeset the original notation without mutating any source block or notebook item", () => {
  const original = JSON.stringify(lesson);
  const tex = lesson.notebook.flatMap(item => item.kind === "law" ? [item.formula] : item.kind === "draw" ?
    item.instruction.flatMap(s => "tex" in s ? [s.tex] : []) : []).map(oneSupportTeX);
  assert.deepEqual(tex, ["F = F_1 + F_2", String.raw`\vec{F_1}`, String.raw`\vec{F_2}`, String.raw`\vec{F}`,
    String.raw`F = F_2 - F_1 \;\; \text{إذا كانت} \; F_2 > F_1`]);
  for (const s of tex) assert.doesNotThrow(() => katex.renderToString(s, { throwOnError: true, strict: false }));
  const displayed = lesson.stages.flatMap(s => s.blocks.map(presentOneSupportBlock));
  const results = displayed.flatMap(b => b.type === "example" ? b.result?.flatMap(s => "tex" in s ? [s.tex] : []) ?? [] : []);
  assert.deepEqual(results, [50, 10, 100].map(n => `F = ${n}\\,\\mathrm{N}`));
  assert.equal(JSON.stringify(lesson), original);
});
