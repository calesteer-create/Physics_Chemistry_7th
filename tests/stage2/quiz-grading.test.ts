/**
 * اختبارات التصحيح النقي — P1-4a.
 *
 * تغطي البنوك الخمسة وكل الأسئلة وأنواع الإجابة الثلاثة، دون تفعيل أي
 * مسار API أو قاعدة بيانات. كل الإجابات المرجعية مشتقة من البنك نفسه.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { gradeQuiz, toPublicGrade, type QuestionGrade } from "../../src/lib/quiz-grading";
import { QuizIntegrityError } from "../../src/lib/quiz-integrity";
import type { QuizFull } from "../../src/content/quiz-bank";
import {
  allQuizzes,
  correctAnswers,
  countAcceptedValues,
  findAnswer,
  findQuiz,
  wrongAnswerFor,
  wrongAnswers,
} from "./helpers";

test("كل الإجابات الصحيحة تعطي الدرجة الكاملة في البنوك الخمسة", () => {
  for (const quiz of allQuizzes()) {
    const grade = gradeQuiz(quiz, correctAnswers(quiz));

    assert.equal(grade.total, quiz.questions.length);
    assert.equal(grade.score, quiz.questions.length, quiz.id);
    assert.equal(grade.percentage, 100, quiz.id);
    assert.equal(grade.results.length, quiz.questions.length);
    assert.deepEqual(
      grade.results.map((result) => result.id),
      quiz.questions.map((question) => question.id),
    );
    for (const result of grade.results) {
      assert.equal(result.correct, true, `${quiz.id}/${result.id}`);
    }
  }
});

test("كل الإجابات الخاطئة تعطي صفرًا في البنوك الخمسة", () => {
  for (const quiz of allQuizzes()) {
    const grade = gradeQuiz(quiz, wrongAnswers(quiz));

    assert.equal(grade.score, 0, quiz.id);
    assert.equal(grade.percentage, 0, quiz.id);
    for (const result of grade.results) {
      assert.equal(result.correct, false, `${quiz.id}/${result.id}`);
    }
  }
});

test("خطأ واحد في كل سؤال ينقص درجة واحدة ويحدد السؤال الخاطئ فقط", () => {
  for (const quiz of allQuizzes()) {
    const correct = correctAnswers(quiz);

    for (const question of quiz.questions) {
      const answer = findAnswer(quiz, question.id);
      const wrong = wrongAnswerFor(question, answer);
      const grade = gradeQuiz(quiz, { ...correct, [question.id]: wrong });

      assert.equal(grade.score, quiz.questions.length - 1, `${quiz.id}/${question.id}`);
      for (const result of grade.results) {
        assert.equal(
          result.correct,
          result.id !== question.id,
          `${quiz.id}/${question.id}/${result.id}`,
        );
      }
    }
  }
});

test("كل فهرس اختيار من متعدد يُحسب حسب مفتاح الإجابة فقط", () => {
  for (const quiz of allQuizzes()) {
    const correct = correctAnswers(quiz);

    for (const question of quiz.questions) {
      if (question.type !== "mcq") continue;
      const answer = findAnswer(quiz, question.id);
      if (answer.type !== "mcq") continue;

      for (let index = 0; index < question.options.length; index += 1) {
        const grade = gradeQuiz(quiz, { ...correct, [question.id]: index });
        const result: QuestionGrade | undefined = grade.results.find((item) => item.id === question.id);
        if (!result) throw new Error(`Missing result: ${quiz.id}/${question.id}`);

        assert.equal(
          result.correct,
          index === answer.correct,
          `${quiz.id}/${question.id}/${index}`,
        );
      }
    }
  }
});

test("صح/خطأ: القيمتان تُصححان حسب مفتاح الإجابة", () => {
  for (const quiz of allQuizzes()) {
    const correct = correctAnswers(quiz);

    for (const question of quiz.questions) {
      if (question.type !== "tf") continue;
      const answer = findAnswer(quiz, question.id);
      if (answer.type !== "tf") continue;

      for (const value of [true, false]) {
        const grade = gradeQuiz(quiz, { ...correct, [question.id]: value });
        const result: QuestionGrade | undefined = grade.results.find((item) => item.id === question.id);
        if (!result) throw new Error(`Missing result: ${quiz.id}/${question.id}`);

        assert.equal(
          result.correct,
          value === answer.correct,
          `${quiz.id}/${question.id}/${String(value)}`,
        );
      }
    }
  }
});

test("كل قيمة accepted في كل أسئلة الإكمال تُحسب صحيحة", () => {
  let checked = 0;

  for (const quiz of allQuizzes()) {
    const correct = correctAnswers(quiz);

    for (const question of quiz.questions) {
      if (question.type !== "fill") continue;
      const answer = findAnswer(quiz, question.id);
      if (answer.type !== "fill") continue;

      for (const accepted of answer.accepted) {
        const grade = gradeQuiz(quiz, { ...correct, [question.id]: accepted });
        const result: QuestionGrade | undefined = grade.results.find((item) => item.id === question.id);
        if (!result) throw new Error(`Missing result: ${quiz.id}/${question.id}`);

        assert.equal(result.correct, true, `${quiz.id}/${question.id}: ${accepted}`);
        checked += 1;
      }
    }
  }

  assert.equal(checked, countAcceptedValues());
  assert.ok(checked > 0, "يجب أن يحتوي البنك على قيم إكمال معتمدة");
});

test("الإجابة الناقصة أو الدخيلة أو خاطئة النوع لا تُحسب صحيحة", () => {
  const quiz = findQuiz("quiz-motion-1");
  const correct = correctAnswers(quiz);

  const missing = { ...correct };
  delete missing.q1;
  const missingGrade = gradeQuiz(quiz, missing);
  assert.equal(missingGrade.score, quiz.questions.length - 1);
  assert.equal(missingGrade.results.find((result) => result.id === "q1")?.correct, false);

  const extra = { ...correct, injected: "x" };
  assert.equal(gradeQuiz(quiz, extra).score, quiz.questions.length);

  const malformed = { ...correct, q1: "1", q3: "true", q5: 0 };
  const malformedGrade = gradeQuiz(quiz, malformed);
  assert.equal(malformedGrade.score, quiz.questions.length - 3);
  assert.equal(malformedGrade.results.find((result) => result.id === "q1")?.correct, false);
  assert.equal(malformedGrade.results.find((result) => result.id === "q3")?.correct, false);
  assert.equal(malformedGrade.results.find((result) => result.id === "q5")?.correct, false);
});

test("التصحيح لا يعدّل كائن الاختبار ولا كائن الإجابات", () => {
  const quiz = findQuiz("quiz-orientation");
  const answers = correctAnswers(quiz);
  const quizSnapshot = structuredClone(quiz);
  const answersSnapshot = structuredClone(answers);

  gradeQuiz(quiz, answers);

  assert.deepEqual(quiz, quizSnapshot);
  assert.deepEqual(answers, answersSnapshot);
});

test("التصحيح حتمي لنفس المدخلات", () => {
  const quiz = findQuiz("quiz-force-2");
  const answers = correctAnswers(quiz);

  assert.deepEqual(gradeQuiz(quiz, answers), gradeQuiz(quiz, answers));
});

test("الملخص العام لا يحمل تفصيلًا لكل سؤال", () => {
  const quiz = findQuiz("quiz-orientation");
  const grade = gradeQuiz(quiz, correctAnswers(quiz));
  const publicGrade = toPublicGrade(grade);

  assert.deepEqual(Object.keys(publicGrade).sort(), ["percentage", "score", "total"]);
  assert.equal("results" in publicGrade, false);
  assert.equal(JSON.stringify(publicGrade).includes("correct"), false);
  assert.equal(JSON.stringify(publicGrade).includes("results"), false);
});

test("البنك المعطوب يُرفض ولا يُنتج درجة", () => {
  const broken = structuredClone(findQuiz("quiz-orientation"));
  broken.answers.splice(0, 1);

  assert.throws(() => gradeQuiz(broken, correctAnswers(broken)), QuizIntegrityError);
});

test("تقريب النسبة يتبع Math.round", () => {
  const fixture: QuizFull = {
    id: "quiz-fixture-3",
    lessonSlug: null,
    title: "اختبار اختباري",
    description: "اختبار اختباري للنسبة",
    durationMin: 1,
    curricular: false,
    questions: [
      { id: "a", type: "tf", prompt: [{ t: "أ" }] },
      { id: "b", type: "tf", prompt: [{ t: "ب" }] },
      { id: "c", type: "tf", prompt: [{ t: "ج" }] },
    ],
    answers: [
      { id: "a", type: "tf", correct: true, explain: [{ t: "أ" }] },
      { id: "b", type: "tf", correct: true, explain: [{ t: "ب" }] },
      { id: "c", type: "tf", correct: true, explain: [{ t: "ج" }] },
    ],
    teacherNotes: [],
  };

  assert.equal(gradeQuiz(fixture, { a: true, b: false, c: false }).percentage, 33);
  assert.equal(gradeQuiz(fixture, { a: true, b: true, c: false }).percentage, 67);
});
