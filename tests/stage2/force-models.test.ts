import test from "node:test";
import assert from "node:assert/strict";
import {
  carrierSegment, fittedVectorScale, nextVelocity, springElongationCm,
  vectorTip, weightArrowPx, weightN, weightSpringPx,
} from "../../src/components/lab/force-models";

test("القصور الذاتي: انعدام القوة المحصلة يُبقي السرعة كما هي", () => {
  let v = 0;
  for (let i = 0; i < 60; i++) v = nextVelocity(v, 30, 0, 1 / 60);
  assert.ok(v > 0, "القوة تُسرّع الجسم ابتداءً");
  const cruising = v;
  for (let i = 0; i < 120; i++) v = nextVelocity(v, 0, 0, 1 / 60);
  assert.equal(v, cruising, "بلا دفع وبلا احتكاك تستمر السرعة نفسها ولا تتصفّر");
});

test("الاحتكاك وحده يوقف الجسم تدريجيًا ولا يعكس حركته", () => {
  let v = 5;
  for (let i = 0; i < 600 && v > 0; i++) v = nextVelocity(v, 0, 10, 1 / 60);
  assert.equal(v, 0);
});

test("احتكاك أكبر من الدفع: تتباطأ السيارة حتى تقف ولا تنعكس أبدًا", () => {
  let v = 6;
  let reversed = false;
  for (let i = 0; i < 1200; i++) {
    v = nextVelocity(v, 10, 20, 1 / 60); // دفع 10N واحتكاك 20N أثناء الحركة
    if (v < 0) reversed = true;
  }
  assert.equal(reversed, false, "الاحتكاك الغالب كبح فقط ولم يعكس الاتجاه");
  assert.equal(v, 0, "توقفت وبقيت ساكنة ما دام الدفع لا يغلب الاحتكاك");
  // خطوة زمنية كبيرة واحدة لا تقفز بالسرعة إلى الجهة المعاكسة
  assert.equal(nextVelocity(0.1, 10, 20, 1), 0);
  // وبعد الوقوف لا يعيدها الاحتكاك للخلف
  assert.equal(nextVelocity(0, 10, 20, 1 / 60), 0);
});

test("استطالة الربيعة التوازنية تتناسب طردًا مع القوة", () => {
  assert.equal(springElongationCm(0), 0);
  assert.ok(Math.abs(springElongationCm(40) / springElongationCm(20) - 2) < 1e-9);
  assert.ok(Math.abs(springElongationCm(50) / springElongationCm(10) - 5) < 1e-9);
});

test("هندسة بناء المتجه: كل التوليفات داخل الإطار مع رأس السهم", () => {
  const W = 560, H = 260, PAD = 30;
  for (const origin of [{ x: 140, y: 160 }, { x: 420, y: 160 }]) {
    for (let mag = 5; mag <= 80; mag += 5) {
      for (let ang = -90; ang <= 90; ang += 15) {
        const scale = fittedVectorScale(origin, mag, ang, W, H, PAD, 2.5);
        const tip = vectorTip(origin, mag, ang, scale);
        const rad = (ang * Math.PI) / 180;
        const headX = tip.x + Math.cos(rad) * 16;
        const headY = tip.y - Math.sin(rad) * 16;
        assert.ok(headX >= 8 && headX <= W - 8 && headY >= 8 && headY <= H - 8,
          `خارج الإطار: origin=${origin.x},${origin.y} F=${mag} angle=${ang} tip=${tip.x.toFixed(1)},${tip.y.toFixed(1)}`);
      }
    }
  }
});

test("الحامل يدور مع اتجاه القوة ويمر بنقطة التأثير", () => {
  const origin = { x: 140, y: 160 };
  for (const ang of [-90, -45, 0, 30, 90]) {
    const seg = carrierSegment(origin, ang, 560, 260, 16);
    const rad = (ang * Math.PI) / 180;
    const dx = Math.cos(rad), dy = -Math.sin(rad);
    // اتجاه المقطع موازٍ لاتجاه القوة (جداء اتجاهي ~ 0)
    const sx = seg.x2 - seg.x1, sy = seg.y2 - seg.y1;
    assert.ok(Math.abs(sx * dy - sy * dx) < 1e-6, `الحامل لا يوازي القوة عند ${ang}`);
    // نقطة التأثير على المقطع
    const cross = (origin.x - seg.x1) * sy - (origin.y - seg.y1) * sx;
    assert.ok(Math.abs(cross) < 1e-6, `نقطة التأثير ليست على الحامل عند ${ang}`);
    if (ang !== 0) assert.ok(Math.abs(sy) > 1, `الحامل أفقي رغم زاوية ${ang}`);
  }
});

test("طول سهم الثقل متناسب طرديًا مع الثقل بنسبة الأرض/القمر الفعلية", () => {
  const m = 10;
  const earth = weightArrowPx(weightN(m, 9.8));
  const moon = weightArrowPx(weightN(m, 1.62));
  assert.equal(weightArrowPx(0), 0, "لا طول أساسيًا ثابتًا يُضاف إلى السهم");
  const ratio = earth / moon;
  const expected = 9.8 / 1.62;
  assert.ok(Math.abs(ratio / expected - 1) < 1e-9, `نسبة السهمين ${ratio} لا تساوي نسبة الثقلين ${expected}`);
  // التناسب نفسه لأي كتلة أخرى
  const ratio2 = weightArrowPx(weightN(37, 9.83)) / weightArrowPx(weightN(37, 1.62));
  assert.ok(Math.abs(ratio2 / (9.83 / 1.62) - 1) < 1e-9);
});

test("ميزان الربيعة يستجيب للكتلة وللمكان معًا والثقل w = mg", () => {
  assert.equal(weightN(10, 10), 100);
  assert.ok(weightSpringPx(weightN(20, 9.796)) > weightSpringPx(weightN(10, 9.796)), "زيادة الكتلة تزيد الاستطالة");
  assert.ok(weightSpringPx(weightN(10, 1.62)) < weightSpringPx(weightN(10, 9.796)), "القمر يقلل الاستطالة لنفس الكتلة");
  assert.ok(Math.abs(weightN(10, 1.62) / weightN(10, 9.83) - 1.62 / 9.83) < 1e-9);
});
