import test from "node:test";
import assert from "node:assert/strict";
import { calculatePower, calculateWork, comparePower } from "../../src/lib/work-power-model";

test("العمل الموجب والسالب والمعدوم في الحالات الأربع للدرس", () => {
  assert.equal(calculateWork(30, 1.5, "aligned"), 45);
  assert.equal(calculateWork(30, 1.5, "opposed"), -45);
  assert.equal(calculateWork(30, 1.5, "perpendicular"), 0);
  assert.equal(calculateWork(30, 0, "aligned"), 0);
  assert.equal(calculateWork(30, 1.5, "no-displacement"), 0);
});

test("العمل يتغير طردياً مع القوة والمسافة في الاتجاه الموافق", () => {
  assert.equal(calculateWork(40, 3, "aligned"), 120);
  assert.equal(calculateWork(20, 6, "aligned"), 120);
});

test("الاستطاعة تحسب بقسمة العمل على الزمن", () => {
  assert.equal(calculatePower(54000, 6), 9000);
  assert.equal(calculatePower(1200, 120), 10);
});

test("المقارنة تغطي ثبات العمل وتغير الزمن وثبات الزمن وتغير العمل", () => {
  assert.equal(comparePower(120, 4, 120, 10), "A");
  assert.equal(comparePower(100, 5, 250, 5), "B");
  assert.equal(comparePower(200, 10, 100, 5), "equal");
});

test("يرفض النموذج قيماً غير فيزيائية أو زمناً غير موجب", () => {
  assert.throws(() => calculateWork(-1, 2, "aligned"), RangeError);
  assert.throws(() => calculateWork(2, -1, "aligned"), RangeError);
  assert.throws(() => calculatePower(12, 0), RangeError);
});
