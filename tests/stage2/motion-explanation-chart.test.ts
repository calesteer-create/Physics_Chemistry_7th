import test from "node:test";
import assert from "node:assert/strict";
import { Children, type ReactElement } from "react";
import { ExplainedNonUniformMotionChart } from "../../src/components/figures/motion-explanation-figures";

test("خط رسم الشرح يصل جميع مراكز النقاط الخمس", () => {
  const chart = ExplainedNonUniformMotionChart();
  // Exercise the actual renderer with distinct affine axis scales, as in the SVG.
  const sx = (t: number) => 70 + t * 80;
  const sy = (d: number) => 246 - d * 174 / 18;
  const fragment = chart.props.children({ sx, sy });
  const elements = Children.toArray(fragment.props.children) as ReactElement[];
  const line = elements[0] as ReactElement<{ points: string }>;
  const dots = elements.slice(1) as ReactElement<{ cx: number; cy: number }>[];
  assert.equal(line.type, "polyline");
  const vertices = line.props.points.split(" ").map(pair => pair.split(",").map(Number));
  assert.deepEqual(vertices, dots.map(dot => [dot.props.cx, dot.props.cy]));
  assert.deepEqual(vertices, [[0, 0], [1, 1], [2, 4], [3, 9], [4, 16]].map(([t, d]) => [sx(t), sy(d)]));
});
