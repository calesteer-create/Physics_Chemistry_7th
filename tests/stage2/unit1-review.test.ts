/**
 * اختبارات محتوى ومنطق «أراجع وأختبر نفسي — الوحدة الأولى»:
 * - حصر البنود العشرين ومطابقتها لأسئلة الكتاب (٥ + ٣ + ٣ + ٩).
 * - سلامة كل بند: إجابة واحدة صحيحة، شرح، تلميح، مصدر.
 * - منطق التصحيح: الأرقام العربية، الجدول، التخطيط، الربيعات، مخطط القوى.
 */
import test from "node:test";
import assert from "node:assert/strict";

import {
  bodyTable,
  reviewItemCount,
  reviewStations,
  reviewItems,
} from "../../src/content/unit1-review";
import {
  countAnswered,
  countCorrect,
  gradeDiagram,
  gradePlot,
  gradeScales,
  gradeTable,
  normalizeNumber,
  numberAnswerMatches,
  percentage,
} from "../../src/lib/unit1-review";
import type {
  DiagramItem,
  PlotItem,
  ScalesItem,
  TableItem,
} from "../../src/content/unit1-review";

test("حصر البنود: 20 بندًا موزعة 5 + 3 + 3 + 9", () => {
  assert.equal(reviewItemCount, 20);
  assert.equal(reviewItems.length, 20);
  assert.deepEqual(
    reviewStations.map((s) => s.items.length),
    [5, 3, 3, 9],
  );
  assert.deepEqual(
    reviewStations.map((s) => s.number),
    ["١", "٢", "٣", "٤"],
  );
  assert.deepEqual(
    reviewStations.map((s) => s.source),
    [
      "ص 63 — السؤال الأول",
      "ص 63 — السؤال الثاني",
      "ص 63 — السؤال الثالث",
      "ص 64 — السؤال الرابع",
    ],
  );
});

test("معرّفات البنود فريدة، ولكل بند شرح وتلميح ومصدر", () => {
  const ids = reviewItems.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const item of reviewItems) {
    assert.ok(item.id.length > 0, "id");
    assert.ok(item.label.length > 0, `label ${item.id}`);
    assert.match(item.source, /ص 6[34]/, `source ${item.id}`);
    assert.ok(item.explain.length > 0, `explain ${item.id}`);
    assert.ok(item.hint && item.hint.length > 0, `hint ${item.id}`);
  }
});

test("المحطة الأولى: خمس عبارات كلها خاطئة كما طُبعت، ولكل واحدة تصحيح واحد صحيح", () => {
  const station = reviewStations[0];
  assert.equal(station.items.length, 5);
  for (const item of station.items) {
    assert.equal(item.kind, "tf");
    if (item.kind !== "tf") continue;
    assert.equal(item.isTrue, false, `${item.id} مطبوعة خاطئة في الكتاب`);
    assert.equal(item.corrections.length, 3);
    assert.equal(item.corrections.filter((c) => c.correct).length, 1);
  }
});

test("جدول السؤال الثاني معروض كمعطى: أربعة أجسام بكتلها وأثقالها", () => {
  const station = reviewStations[1];
  assert.equal(station.figure, "bodies");
  assert.deepEqual(
    bodyTable.rows.map((row) => [row.body, row.mass, row.weight]),
    [
      ["A", 40, 80],
      ["B", 20, 200],
      ["C", 10, 200],
      ["D", 20, 40],
    ],
  );
  assert.deepEqual(bodyTable.gravity, [2, 10, 20, 2]);
  assert.ok(reviewStations[0].figure === undefined);
});

test("الاختيار المفرد: خيار صحيح واحد فقط في كل بند", () => {
  const singles = reviewItems.filter((item) => item.kind === "single");
  assert.ok(singles.length >= 6);
  for (const item of singles) {
    if (item.kind !== "single") continue;
    assert.equal(item.options.length, 4, item.id);
    assert.equal(item.options.filter((o) => o.correct).length, 1, item.id);
  }
});

test("السؤال الثاني: الإجابات المعتمدة B ثم A+D ثم C", () => {
  const [q1, q2, q3] = reviewStations[1].items;
  assert.equal(q1.kind, "single");
  if (q1.kind === "single") assert.equal(q1.options.findIndex((o) => o.correct), 1);
  assert.equal(q2.kind, "pair");
  if (q2.kind === "pair") assert.deepEqual(q2.answer, [0, 3]);
  assert.equal(q3.kind, "single");
  if (q3.kind === "single") assert.equal(q3.options.findIndex((o) => o.correct), 2);
});

test("الشكل الثالث: خياري السكون هو الصحيح، ولا يُضاف سؤال من خارج الكتاب", () => {
  const graphs = reviewStations[2].items;
  assert.equal(graphs.length, 3);
  for (const item of graphs) {
    assert.equal(item.kind, "single");
    if (item.kind !== "single") continue;
    assert.equal(item.options.filter((o) => o.correct).length, 1);
    assert.ok(item.figure && item.figure.startsWith("graph-"));
  }
  const rest = graphs[2];
  const plain = (rich: { t?: string }[]) => rich.map((seg) => seg.t ?? "").join("");
  if (rest.kind === "single") {
    assert.match(plain(rest.explain as { t?: string }[]), /سكون/);
    assert.match(plain((rest.hint ?? []) as { t?: string }[]), /الخط أفقي/);
  }
});

test("جدول المسألة الأولى: خمسة أعمدة كما في الكتاب (0/0 ثم d=5 ثم ثلاثة فارغة)", () => {
  const item = reviewItems.find((i) => i.id === "s4-table") as TableItem;
  assert.ok(item);
  assert.equal(item.kind, "table");
  assert.equal(item.columns.length, 5);
  assert.deepEqual(item.columns[0], { d: 0, t: 0 });
  assert.equal(item.columns[1].d, 5);
  assert.equal(item.columns[1].t, null);
  assert.equal(item.columns.filter((c) => c.d === null).length, 3);
  assert.deepEqual(item.interpolation, { d: 5, t: 5 });
  assert.deepEqual(item.pairs, [
    [10, 10],
    [30, 30],
    [50, 50],
    [70, 70],
  ]);
});

test("التخطيط: النقاط المطلوبة هي بيانات الشكل، وشكل الخط واحد صحيح", () => {
  const item = reviewItems.find((i) => i.id === "s4-plot") as PlotItem;
  assert.ok(item);
  assert.deepEqual(item.requiredPoints, [
    [0, 0],
    [10, 10],
    [30, 30],
    [50, 50],
    [70, 70],
  ]);
  assert.equal(item.shapeOptions.filter((o) => o.correct).length, 1);
  assert.ok(item.shapeOptions[0].correct);
});

test("الربيعات: القراءات 1 و2 و3 نيوتن", () => {
  const item = reviewItems.find((i) => i.id === "s4-scales") as ScalesItem;
  assert.ok(item);
  assert.deepEqual(
    item.readings.map((r) => r.answer),
    [1, 2, 3],
  );
});

test("مخطط القوى: أربع قوى على أربعة مواضع مختلفة", () => {
  const item = reviewItems.find((i) => i.id === "s4-forces") as DiagramItem;
  assert.ok(item);
  assert.equal(item.tokens.length, 4);
  assert.deepEqual(
    item.tokens.map((t) => t.slot).sort(),
    ["down", "left", "right", "up"],
  );
});

test("الإجابات العددية: السرعة 1 وعمل الاحتكاك 200/−200 والعمل الكلي 1300", () => {
  const numbers = reviewItems.filter((i) => i.kind === "number");
  assert.equal(numbers.length, 3);
  const byId = new Map(numbers.map((n) => [n.id, n]));
  const speed = byId.get("s4-speed");
  const friction = byId.get("s4-work-friction");
  const total = byId.get("s4-work-total");
  assert.ok(speed && speed.kind === "number");
  assert.ok(friction && friction.kind === "number");
  assert.ok(total && total.kind === "number");
  if (speed && speed.kind === "number") {
    assert.equal(speed.answer, 1);
    assert.equal(speed.unit, "cm/s");
  }
  if (friction && friction.kind === "number") {
    assert.equal(friction.answer, 200);
    assert.deepEqual(friction.alternates, [-200]);
    assert.ok(friction.answerNote);
  }
  if (total && total.kind === "number") {
    assert.equal(total.answer, 1300);
    assert.equal(total.unit, "J");
  }
});

test("تطبيع الأرقام: عربية وفارسية وفاصلة عشرية وسالب", () => {
  assert.equal(normalizeNumber("5"), 5);
  assert.equal(normalizeNumber("٥"), 5);
  assert.equal(normalizeNumber("۱۲۳"), 123);
  assert.equal(normalizeNumber("1,5"), 1.5);
  assert.equal(normalizeNumber("−200"), -200);
  assert.equal(normalizeNumber(" 70 "), 70);
  assert.equal(normalizeNumber(""), null);
  assert.equal(normalizeNumber("abc"), null);
  assert.equal(normalizeNumber("1/2"), null);
});

test("مطابقة الإجابات العددية مع البدائل المسموحة", () => {
  assert.equal(numberAnswerMatches("200", 200), true);
  assert.equal(numberAnswerMatches("-200", 200, [-200]), true);
  assert.equal(numberAnswerMatches("٢٠٠", 200), true);
  assert.equal(numberAnswerMatches("201", 200), false);
  assert.equal(numberAnswerMatches("", 200), false);
});

test("تصحيح الجدول: يقبل أي ثلاث أزواج مختلفة من الشكل ويرفض التكرار", () => {
  const item = reviewItems.find((i) => i.id === "s4-table") as TableItem;
  const ok = gradeTable(item, {
    interpolation: "5",
    blank: [
      { d: 10, t: "10" },
      { d: 30, t: "٣٠" },
      { d: 70, t: "70" },
    ],
  });
  assert.equal(ok.ok, true);
  assert.equal(ok.interpolationOk, true);
  assert.deepEqual(ok.columnOk, [true, true, true]);

  const wrongT = gradeTable(item, {
    interpolation: "5",
    blank: [
      { d: 10, t: "20" },
      { d: 30, t: "30" },
      { d: 70, t: "70" },
    ],
  });
  assert.equal(wrongT.ok, false);
  assert.deepEqual(wrongT.columnOk, [false, true, true]);

  const duplicate = gradeTable(item, {
    interpolation: "5",
    blank: [
      { d: 10, t: "10" },
      { d: 10, t: "10" },
      { d: 70, t: "70" },
    ],
  });
  assert.equal(duplicate.ok, false);

  const wrongInterpolation = gradeTable(item, {
    interpolation: "10",
    blank: [
      { d: 10, t: "10" },
      { d: 30, t: "30" },
      { d: 70, t: "70" },
    ],
  });
  assert.equal(wrongInterpolation.ok, false);
  assert.equal(wrongInterpolation.interpolationOk, false);
  assert.ok(wrongInterpolation.message);
});

test("تصحيح التخطيط: النقاط الخمس + شكل الخط", () => {
  const item = reviewItems.find((i) => i.id === "s4-plot") as PlotItem;
  const all: [number, number][] = [
    [0, 0],
    [10, 10],
    [30, 30],
    [50, 50],
    [70, 70],
  ];
  assert.equal(gradePlot(item, all, 0).ok, true);
  const missing = gradePlot(item, all.slice(1), 0);
  assert.equal(missing.ok, false);
  assert.equal(missing.missing.length, 1);
  const offLine = gradePlot(item, [...all, [20, 40]], 0);
  assert.equal(offLine.ok, false);
  assert.equal(offLine.offLine.length, 1);
  const wrongShape = gradePlot(item, all, 1);
  assert.equal(wrongShape.ok, false);
  assert.equal(wrongShape.shapeOk, false);
  assert.equal(gradePlot(item, all, null).ok, false);
});

test("تصحيح الربيعات ومخطط القوى", () => {
  const scales = reviewItems.find((i) => i.id === "s4-scales") as ScalesItem;
  assert.equal(gradeScales(scales, { a: "1", b: "٢", c: "3" }).ok, true);
  const badScales = gradeScales(scales, { a: "1", b: "3", c: "3" });
  assert.equal(badScales.ok, false);
  assert.deepEqual(
    badScales.details.map((d) => d.ok),
    [true, false, true],
  );

  const diagram = reviewItems.find((i) => i.id === "s4-forces") as DiagramItem;
  assert.equal(
    gradeDiagram(diagram, {
      push: "right",
      friction: "left",
      weight: "down",
      normal: "up",
    }).ok,
    true,
  );
  const partial = gradeDiagram(diagram, { push: "right", friction: "left" });
  assert.equal(partial.ok, false);
  assert.equal(partial.remaining, 2);
  const swapped = gradeDiagram(diagram, {
    push: "left",
    friction: "right",
    weight: "up",
    normal: "down",
  });
  assert.equal(swapped.ok, false);
});

test("حساب التقدّم والنسبة", () => {
  const results = { a: true, b: false, c: undefined, d: true };
  assert.equal(countAnswered(results), 3);
  assert.equal(countCorrect(results), 2);
  assert.equal(percentage(2, 4), 50);
  assert.equal(percentage(0, 0), 0);
});
