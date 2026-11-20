/**
 * اختبارات سلامة بنك الاختبارات — P1-4a.
 *
 * تتحقق من بنوك الاختبارات الخمسة الفعلية، ثم من قدرة الفحص على كشف كل نوع خلل
 * عبر نسخ معدّلة في الذاكرة فقط. لا تُعدّل أي محتوى ولا تلمس قاعدة بيانات.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  assertQuizIsGradeable,
  QuizIntegrityError,
  validateQuiz,
  validateQuizBank,
  type QuizIntegrityCode,
  type QuizIntegrityIssue,
} from "../../src/lib/quiz-integrity";
import { allQuizzes, findQuiz } from "./helpers";

function hasCode(issues: readonly QuizIntegrityIssue[], code: QuizIntegrityCode): boolean {
  return issues.some((issue) => issue.code === code);
}

test("البنك الحالي سليم بالكامل", () => {
  const quizzes = allQuizzes();

  assert.deepEqual(
    quizzes.map((quiz) => quiz.id).sort(),
    ["quiz-force-2", "quiz-motion-1", "quiz-one-support-3", "quiz-orientation", "quiz-work-power-4"],
  );
  assert.deepEqual(validateQuizBank(quizzes), []);
  for (const quiz of quizzes) {
    assert.deepEqual(validateQuiz(quiz), [], quiz.id);
  }
});

test("يكشف تكرار معرّف الاختبار بين اختبارين", () => {
  const quiz = allQuizzes()[0];
  const issues = validateQuizBank([quiz, structuredClone(quiz)]);

  assert.equal(hasCode(issues, "duplicate-quiz-id"), true);
});

test("يكشف الاختبار بلا أسئلة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.questions = [];
  broken.answers = [];

  assert.equal(hasCode(validateQuiz(broken), "no-questions"), true);
});

test("يكشف السؤال بلا إجابة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.answers.splice(0, 1);
  const issues = validateQuiz(broken);

  assert.equal(hasCode(issues, "missing-answer"), true);
  assert.equal(hasCode(issues, "answer-count-mismatch"), true);
});

test("يكشف الإجابة اليتيمة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.answers.push({
    id: "ghost-answer",
    type: "fill",
    accepted: ["x"],
    explain: [],
  });
  const issues = validateQuiz(broken);

  assert.equal(hasCode(issues, "orphan-answer"), true);
  assert.equal(hasCode(issues, "answer-count-mismatch"), true);
});

test("يكشف تكرار معرّف السؤال", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.questions[1].id = broken.questions[0].id;

  assert.equal(hasCode(validateQuiz(broken), "duplicate-question-id"), true);
});

test("يكشف تكرار معرّف الإجابة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.answers[1] = { ...broken.answers[1], id: broken.answers[0].id };

  assert.equal(hasCode(validateQuiz(broken), "duplicate-answer-id"), true);
});

test("يكشف اختلاف نوع الإجابة عن نوع السؤال", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  const question = broken.questions.find((item) => item.type === "tf");
  if (!question) throw new Error("Expected a true/false question");

  broken.answers = broken.answers.map((answer) =>
    answer.id === question.id
      ? { id: answer.id, type: "mcq", correct: 0, explain: [] }
      : answer,
  );

  assert.equal(hasCode(validateQuiz(broken), "answer-type-mismatch"), true);
});

test("يكشف فهرس اختيار من متعدد خارج المدى", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  const question = broken.questions.find((item) => item.type === "mcq");
  if (!question) throw new Error("Expected an MCQ question");

  const answer = broken.answers.find((item) => item.id === question.id);
  if (!answer || answer.type !== "mcq") throw new Error("Expected an MCQ answer");
  answer.correct = 99;

  assert.equal(hasCode(validateQuiz(broken), "mcq-correct-out-of-range"), true);
});

test("يكشف عدد خيارات اختيار من متعدد أقل من اثنين", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  const question = broken.questions.find((item) => item.type === "mcq");
  if (!question || question.type !== "mcq") throw new Error("Expected an MCQ question");

  question.options = question.options.slice(0, 1);

  assert.equal(hasCode(validateQuiz(broken), "mcq-option-count"), true);
});

test("يكشف قيمة صح/خطأ غير منطقية", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  const answer = broken.answers.find((item) => item.type === "tf");
  if (!answer || answer.type !== "tf") throw new Error("Expected a true/false answer");

  answer.correct = "true" as unknown as boolean;

  assert.equal(hasCode(validateQuiz(broken), "tf-correct-not-boolean"), true);
});

test("يكشف مصفوفة إكمال فارغة أو غير نصية أو فارغة القيمة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  const answer = broken.answers.find((item) => item.type === "fill");
  if (!answer || answer.type !== "fill") throw new Error("Expected a fill answer");

  answer.accepted = [];
  assert.equal(hasCode(validateQuiz(broken), "fill-accepted-empty"), true);

  answer.accepted = ["x", 5 as unknown as string];
  assert.equal(hasCode(validateQuiz(broken), "fill-accepted-not-string"), true);

  answer.accepted = ["", "x"];
  assert.equal(hasCode(validateQuiz(broken), "fill-accepted-blank"), true);
});

test("assertQuizIsGradeable يرمي على البنك المعطوب", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.answers.splice(0, 1);

  assert.throws(() => assertQuizIsGradeable(broken), QuizIntegrityError);
});
