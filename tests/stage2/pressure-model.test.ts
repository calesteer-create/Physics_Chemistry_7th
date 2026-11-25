import test from "node:test";
import assert from "node:assert/strict";
import {
  areaFromPressureM2,
  comparePressure,
  displayIndentationRatio,
  forceFromPressureN,
  pressureFromMassPa,
  pressurePa,
  weightN,
} from "../../src/lib/pressure-model";

test("قانون الضغط والعلاقتان العكسيّتان بقيم الكتاب", () => {
  assert.equal(pressurePa(15000, 1.5), 10000);
  assert.equal(pressurePa(50, 0.01), 5000);
  assert.equal(forceFromPressureN(3000, 1.6), 4800);
  assert.equal(forceFromPressureN(4000, 1.2), 4800);
  assert.equal(areaFromPressureM2(500, 50), 10);
});

test("سلسلة الكتلة ← الثقل ← الضغط", () => {
  assert.equal(weightN(5, 10), 50);
  assert.equal(weightN(50, 10), 500);
  assert.equal(pressureFromMassPa(5, 0.01, 10), 5000);
  assert.equal(pressureFromMassPa(20, 0.5, 10), 400);
});

test("المقارنة: الأثقل قد يكون ضغطه أصغر", () => {
  assert.equal(comparePressure(pressurePa(6000, 0.6), pressurePa(4000, 0.2)), "B");
  assert.equal(comparePressure(10000, 10000), "equal");
  assert.equal(comparePressure(500, 100), "A");
});

test("مؤشر الانضغاط البصري: رتيب ومسقوف وليس قيمة فيزيائية", () => {
  assert.equal(displayIndentationRatio(0, "sponge"), 0);
  assert.ok(displayIndentationRatio(1000, "sponge") < displayIndentationRatio(3000, "sponge"));
  assert.ok(displayIndentationRatio(3000, "sponge") < displayIndentationRatio(9000, "sponge"));
  assert.ok(displayIndentationRatio(10_000_000, "sponge") <= 0.95);
  // تغيّر المادة يغيّر المؤشر البصري وحده؛ الضغط المحسوب لا يتغيّر.
  assert.notEqual(displayIndentationRatio(2000, "sponge"), displayIndentationRatio(2000, "sand"));
  assert.equal(pressurePa(800, 0.4), 2000);
});

test("يرفض النموذج قيمًا غير فيزيائية", () => {
  assert.throws(() => pressurePa(-1, 1), RangeError);
  assert.throws(() => pressurePa(10, 0), RangeError);
  assert.throws(() => areaFromPressureM2(10, 0), RangeError);
  assert.throws(() => weightN(-2, 10), RangeError);
  assert.throws(() => displayIndentationRatio(-5, "sand"), RangeError);
});
