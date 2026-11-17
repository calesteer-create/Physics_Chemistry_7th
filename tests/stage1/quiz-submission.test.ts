/**
 * اختبارات المرحلة الأولى — P0-2: بوابة تسليم الاختبار.
 *
 * تُثبت أن الطلبات غير المكتملة/المُزوَّرة تُرفض وأن أجسام الرفض لا تحمل
 * أي مفتاح إجابة أو شرح، وأن المحاولة الكاملة تُقبل.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  deniedSubmissionBody,
  gateQuizSubmission,
  type QuestionSpec,
} from "../../src/lib/quiz-submission";

const QUESTIONS: QuestionSpec[] = [
  { id: "q1", type: "mcq", optionCount: 4 },
  { id: "q2", type: "tf" },
  { id: "q3", type: "fill" },
];

function assertNoAnswerLeak(body: unknown): void {
  const serialized = JSON.stringify(body);
  for (const forbidden of ["feedback", "correctLabel", "explain", "الإجابة الصحيحة", "صح", "خطأ"]) {
    assert.equal(serialized.includes(forbidden), false, `يجب ألّا يظهر «${forbidden}» في استجابة الرفض`);
  }
}

test("الحالة المسموحة: إجابات كاملة صحيحة الأنواع تُقبل", () => {
  const gate = gateQuizSubmission(QUESTIONS, { q1: 2, q2: false, q3: "الحركة" });
  assert.equal(gate.ok, true);
  if (gate.ok) {
    assert.deepEqual(gate.answers, { q1: 2, q2: false, q3: "الحركة" });
  }
});

test("الحالة المرفوضة: الطلب الفارغ الذي كان يُسرب المفاتيح", () => {
  const gate = gateQuizSubmission(QUESTIONS, {});
  assert.equal(gate.ok, false);
  if (!gate.ok) {
    assert.equal(gate.status, 400);
    assertNoAnswerLeak(deniedSubmissionBody(gate));
  }
});

test("الحالات المرفوضة: إجابات ناقصة أو بأنواع/مدى خاطئ أو مفاتيح دخيلة", () => {
  const cases: unknown[] = [
    { q1: 0, q2: true },
    { q1: 0, q2: true, q3: "" },
    { q1: 0, q2: true, q3: "   " },
    { q1: "2", q2: true, q3: "x" },
    { q1: 4, q2: true, q3: "x" },
    { q1: -1, q2: true, q3: "x" },
    { q1: 1.5, q2: true, q3: "x" },
    { q1: 0, q2: "true", q3: "x" },
    { q1: 0, q2: true, q3: null },
    { q1: 0, q2: true, q3: ["x"] },
    { q1: 0, q2: true, q3: "x", injected: "anything" },
    null,
    undefined,
    [],
    "not-an-object",
  ];

  for (const candidate of cases) {
    const gate = gateQuizSubmission(QUESTIONS, candidate);
    assert.equal(gate.ok, false, `يجب رفض: ${JSON.stringify(candidate)}`);
    if (!gate.ok) assertNoAnswerLeak(deniedSubmissionBody(gate));
  }
});

test("قائمة أسئلة فارغة تُرفض ولا تُعيد تغذية راجعة", () => {
  const gate = gateQuizSubmission([], {});
  assert.equal(gate.ok, false);
  if (!gate.ok) assertNoAnswerLeak(deniedSubmissionBody(gate));
});
