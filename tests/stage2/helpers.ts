/**
 * أدوات اختبار P1-4a — تقرأ البنوك الفعلية ولا تكرّر مفاتيح الإجابة.
 *
 * كل الإجابات الصحيحة/الخاطئة في الاختبارات مشتقة من `quiz-bank.ts` وقت
 * التشغيل، كي تبقى الاختبارات صالحة إذا تغيّر المحتوى، وكي لا تُنسخ
 * المفاتيح داخل ملفات الاختبار.
 */
import { getQuizFull, listQuizzesMeta } from "../../src/content/quiz-bank";
import type { QuizAnswer, QuizFull } from "../../src/content/quiz-bank";
import type { QuizQuestion } from "../../src/content/types";

export function allQuizzes(): QuizFull[] {
  return listQuizzesMeta().map(({ id }) => {
    const quiz = getQuizFull(id);
    if (!quiz) throw new Error(`Quiz not found: ${id}`);
    return quiz;
  });
}

export function findQuiz(id: string): QuizFull {
  const quiz = getQuizFull(id);
  if (!quiz) throw new Error(`Quiz not found: ${id}`);
  return quiz;
}

export function findQuestion(quiz: QuizFull, id: string): QuizQuestion {
  const question = quiz.questions.find((item) => item.id === id);
  if (!question) throw new Error(`Question not found: ${quiz.id}/${id}`);
  return question;
}

export function findAnswer(quiz: QuizFull, id: string): QuizAnswer {
  const answer = quiz.answers.find((item) => item.id === id);
  if (!answer) throw new Error(`Answer not found: ${quiz.id}/${id}`);
  return answer;
}

export function countAcceptedValues(): number {
  let count = 0;
  for (const quiz of allQuizzes()) {
    for (const question of quiz.questions) {
      if (question.type !== "fill") continue;
      const answer = findAnswer(quiz, question.id);
      if (answer.type === "fill") count += answer.accepted.length;
    }
  }
  return count;
}

export function acceptedValues(quizId: string, questionId: string): string[] {
  const answer = findAnswer(findQuiz(quizId), questionId);
  if (answer.type !== "fill") {
    throw new Error(`Question is not fill: ${quizId}/${questionId}`);
  }
  return answer.accepted;
}

function correctAnswerFor(answer: QuizAnswer): number | boolean | string {
  if (answer.type === "mcq") return answer.correct;
  if (answer.type === "tf") return answer.correct;
  return answer.accepted[0] ?? "";
}

export function correctAnswers(quiz: QuizFull): Record<string, number | boolean | string> {
  const answersById = new Map(quiz.answers.map((answer) => [answer.id, answer]));
  const result: Record<string, number | boolean | string> = {};

  for (const question of quiz.questions) {
    const answer = answersById.get(question.id);
    if (!answer) continue;
    result[question.id] = correctAnswerFor(answer);
  }

  return result;
}

export function wrongAnswerFor(
  question: QuizQuestion,
  answer: QuizAnswer,
): number | boolean | string {
  if (question.type === "mcq" && answer.type === "mcq") {
    return (answer.correct + 1) % (question.options.length || 1);
  }
  if (question.type === "tf" && answer.type === "tf") {
    return !answer.correct;
  }
  return "إجابة خاطئة";
}

export function wrongAnswers(quiz: QuizFull): Record<string, number | boolean | string> {
  const answersById = new Map(quiz.answers.map((answer) => [answer.id, answer]));
  const result: Record<string, number | boolean | string> = {};

  for (const question of quiz.questions) {
    const answer = answersById.get(question.id);
    if (!answer) continue;
    result[question.id] = wrongAnswerFor(question, answer);
  }

  return result;
}
