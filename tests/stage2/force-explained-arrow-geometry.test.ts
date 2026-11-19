/** هندسة سهمي الأرض/القمر كما تُرسم فعليًا في MassWeightExplained:
 * الطول الكلي متناسب مع الثقل، ورأس السهم متناسب مع طول سهمه. */
import test from "node:test";
import assert from "node:assert/strict";
import { MassWeightExplained } from "../../src/components/figures/force-explanation-figures";

type El = { props?: Record<string, unknown> };

function collect(node: unknown, out: El[]): void {
  if (Array.isArray(node)) { node.forEach(n => collect(n, out)); return; }
  if (node && typeof node === "object") {
    const el = node as El & { props?: { children?: unknown } };
    if (el.props) {
      out.push(el as El);
      collect(el.props.children, out);
    }
  }
}

test("هندسة سهمي MassWeightExplained: طول كلي ورأس متناسبان مع الثقل", () => {
  const els: El[] = [];
  collect(MassWeightExplained(), els);

  const shafts = els.filter(e => e.props?.strokeWidth === 4.5 && typeof e.props?.y1 === "number");
  const heads = els.filter(e => typeof e.props?.size === "number" && e.props?.angle === Math.PI / 2);
  assert.equal(shafts.length, 2, "سهمان مرسومان");
  assert.equal(heads.length, 2, "رأسا سهمان مرسومان");

  const arrows = shafts.map((shaft, i) => {
    const head = heads[i].props as { y: number; size: number };
    const y1 = shaft.props?.y1 as number;
    const y2 = shaft.props?.y2 as number;
    const total = head.y - y1; // من أصل السهم إلى طرف الرأس
    const headAxial = head.size * Math.cos(0.42); // الامتداد المحوري الفعلي للرأس
    return { total, headAxial, shaftEnd: y2, headBase: head.y - headAxial, size: head.size };
  });

  const [earth, moon] = arrows;
  const expected = 9.8 / 1.62;

  // الطول الكلي للسهمين بنسبة الثقلين الفعلية
  assert.ok(Math.abs(earth.total / moon.total / expected - 1) < 1e-9,
    `نسبة الطولين الكليين ${earth.total / moon.total} لا تساوي نسبة الثقلين ${expected}`);
  // رأس سهم القمر أصغر بوضوح وبنفس نسبة التناسب
  assert.ok(moon.headAxial < earth.headAxial, "رأس سهم القمر ليس أصغر من رأس سهم الأرض");
  assert.ok(Math.abs(earth.headAxial / moon.headAxial / expected - 1) < 1e-9,
    "رأسا السهمين ليسا متناسبين مع طوليهما");
  // الخط ينتهي عند قاعدة الرأس حسابيًا فلا فجوة ولا تداخل، والطول الكلي محفوظ
  for (const a of arrows) {
    assert.ok(Math.abs(a.shaftEnd - a.headBase) < 1e-9, "نهاية الخط لا تطابق قاعدة الرأس");
    assert.ok(a.headAxial < a.total, "الرأس لا يشغل كامل السهم");
  }
  assert.ok(moon.headAxial / moon.total < 0.3, "رأس سهم القمر ما زال يشغل معظم سهمه");
});
