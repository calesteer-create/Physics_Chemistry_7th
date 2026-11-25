import test from "node:test";
import assert from "node:assert/strict";
import { pressureQuiz } from "../../src/content/pressure-quiz";
import { gradeAssessment } from "../../src/lib/unit1-assessment";

test("اختبار الضغط: 10 أسئلة مستقلة متدرجة بتفسير لكل إجابة", () => {
  assert.equal(pressureQuiz.length, 10);
  assert.deepEqual(
    pressureQuiz.map((q) => q.id),
    ["pq1", "pq2", "pq3", "pq4", "pq5", "pq6", "pq7", "pq8", "pq9", "pq10"],
  );
  // التدرّج الحقيقي: أساسية ثم متوسطة ثم متقدمة بهذا الترتيب.
  assert.deepEqual(
    pressureQuiz.map((q) => q.level),
    ["basic", "basic", "basic", "medium", "medium", "medium", "medium", "advanced", "advanced", "advanced"],
  );
  for (const q of pressureQuiz) {
    assert.ok(q.prompt.trim().length > 0, q.id);
    assert.ok(q.explain.trim().length > 10, `${q.id}: تفسير مفقود أو قصير`);
    if (q.type === "mcq") {
      assert.ok(q.options && q.options.length >= 3, q.id);
      assert.ok(typeof q.answer === "number" && q.answer >= 0 && q.answer < (q.options?.length ?? 0), q.id);
    }
    if (q.type === "number") {
      assert.ok(typeof q.answer === "number" && Number.isFinite(q.answer), q.id);
      assert.ok(q.unit, q.id);
    }
  }
});

test("اختبار الضغط قابل للتصحيح الكامل بالنموذج المشترك", () => {
  const answers: Record<string, number | boolean | string> = {};
  for (const q of pressureQuiz) {
    answers[q.id] = q.type === "number" ? String(q.answer) : q.answer;
  }
  const grade = gradeAssessment(pressureQuiz, answers);
  assert.equal(grade.score, 10);
  assert.equal(grade.percentage, 100);
  // وإجابات خاطئة بالكامل تعطي صفرًا (المفتاح فعلي لا شكلي).
  const wrong: Record<string, number | boolean | string> = {};
  for (const q of pressureQuiz) {
    wrong[q.id] = q.type === "mcq" ? ((q.answer as number) + 1) % (q.options?.length ?? 2) : q.type === "tf" ? !q.answer : "-999";
  }
  assert.equal(gradeAssessment(pressureQuiz, wrong).score, 0);
});

test("قيم اختبار الضغط الحسابية مطابقة لقانون الضغط", () => {
  const byId = new Map(pressureQuiz.map((q) => [q.id, q]));
  assert.equal(byId.get("pq5")?.answer, 300 / 0.6);
  assert.equal(byId.get("pq6")?.answer, 2500 * 0.8);
  assert.equal(byId.get("pq7")?.answer, 900 / 300);
  assert.equal(byId.get("pq8")?.answer, (20 * 10) / 0.5);
});
