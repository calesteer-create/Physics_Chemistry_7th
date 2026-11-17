import type { QuizAnswer, QuizFull } from "../content/quiz-bank";
import type { QuizQuestion } from "../content/types";

/**
 * فحوص سلامة بنك الاختبارات — P1-4a.
 *
 * هذه الوحدة لا تُصحّح إجابات ولا تكتب في قاعدة البيانات. وظيفتها الوحيدة
 * التحقق من أن كل اختبار قابل للتصحيح: لكل سؤال إجابة واحدة، والمعرّفات
 * فريدة، وأنواع الإجابات مطابقة لأنواع الأسئلة، وفهارس الاختيار من متعدد
 * داخل المدى، ومصفوفات الإكمال غير فارغة.
 *
 * قاعدة أمنية: رسائل الفحص لا تحتوي أي قيمة من `accepted` أو `correct`
 * ولا أي شرح؛ تُذكر المعرّفات والرموز فقط، كي لا تتسرّب مفاتيح الإجابة
 * عبر سجلات أو استثناءات.
 */

export type QuizIntegrityCode =
  | "questions-not-array"
  | "answers-not-array"
  | "quiz-id-empty"
  | "duplicate-quiz-id"
  | "no-questions"
  | "question-id-empty"
  | "duplicate-question-id"
  | "question-type-unknown"
  | "answer-id-empty"
  | "duplicate-answer-id"
  | "answer-count-mismatch"
  | "missing-answer"
  | "orphan-answer"
  | "answer-type-mismatch"
  | "mcq-option-count"
  | "mcq-correct-not-integer"
  | "mcq-correct-out-of-range"
  | "tf-correct-not-boolean"
  | "fill-accepted-empty"
  | "fill-accepted-not-string"
  | "fill-accepted-blank";

export interface QuizIntegrityIssue {
  quizId: string;
  code: QuizIntegrityCode;
  questionId?: string;
  /** وصف تقني بلا أي قيمة إجابة أو شرح. */
  detail: string;
}

function issue(
  quizId: string,
  code: QuizIntegrityCode,
  detail: string,
  questionId?: string,
): QuizIntegrityIssue {
  return questionId === undefined
    ? { quizId, code, detail }
    : { quizId, code, questionId, detail };
}

/** يفحص اختبارًا واحدًا، ويعيد كل المشكلات بدل التوقف عند أولها. */
export function validateQuiz(quiz: QuizFull): QuizIntegrityIssue[] {
  const issues: QuizIntegrityIssue[] = [];
  const quizId = typeof quiz.id === "string" ? quiz.id : "";

  if (!quizId.trim()) {
    issues.push(issue(quizId, "quiz-id-empty", "Quiz id is empty."));
  }

  if (!Array.isArray(quiz.questions)) {
    issues.push(issue(quizId, "questions-not-array", "Quiz questions must be an array."));
  }
  if (!Array.isArray(quiz.answers)) {
    issues.push(issue(quizId, "answers-not-array", "Quiz answers must be an array."));
  }

  const questions: QuizQuestion[] = Array.isArray(quiz.questions) ? quiz.questions : [];
  const answers: QuizAnswer[] = Array.isArray(quiz.answers) ? quiz.answers : [];

  if (questions.length === 0) {
    issues.push(issue(quizId, "no-questions", "Quiz has no questions."));
  }
  if (answers.length !== questions.length) {
    issues.push(
      issue(
        quizId,
        "answer-count-mismatch",
        `Questions: ${questions.length}; answers: ${answers.length}.`,
      ),
    );
  }

  const questionIds = new Set<string>();
  const questionsById = new Map<string, QuizQuestion>();
  for (const question of questions) {
    const questionId = typeof question.id === "string" ? question.id : "";
    if (!questionId.trim()) {
      issues.push(issue(quizId, "question-id-empty", "Question id is empty.", questionId));
      continue;
    }
    if (questionIds.has(questionId)) {
      issues.push(
        issue(quizId, "duplicate-question-id", "Duplicate question id.", questionId),
      );
      continue;
    }
    questionIds.add(questionId);
    questionsById.set(questionId, question);

    if (question.type !== "mcq" && question.type !== "tf" && question.type !== "fill") {
      issues.push(
        issue(quizId, "question-type-unknown", "Unknown question type.", questionId),
      );
    }
  }

  const answersById = new Map<string, QuizAnswer>();
  for (const answer of answers) {
    const answerId = typeof answer.id === "string" ? answer.id : "";
    if (!answerId.trim()) {
      issues.push(issue(quizId, "answer-id-empty", "Answer id is empty.", answerId));
      continue;
    }
    if (answersById.has(answerId)) {
      issues.push(issue(quizId, "duplicate-answer-id", "Duplicate answer id.", answerId));
      continue;
    }
    answersById.set(answerId, answer);
  }

  for (const [questionId, question] of questionsById) {
    const answer = answersById.get(questionId);
    if (!answer) {
      issues.push(issue(quizId, "missing-answer", "Question has no answer.", questionId));
      continue;
    }
    if (answer.type !== question.type) {
      issues.push(
        issue(quizId, "answer-type-mismatch", "Answer type does not match question type.", questionId),
      );
      continue;
    }

    if (question.type === "mcq") {
      const options = Array.isArray(question.options) ? question.options : [];
      if (options.length < 2) {
        issues.push(
          issue(quizId, "mcq-option-count", "MCQ must have at least two options.", questionId),
        );
      }
      if (answer.type === "mcq") {
        if (!Number.isInteger(answer.correct)) {
          issues.push(
            issue(quizId, "mcq-correct-not-integer", "MCQ correct index is not an integer.", questionId),
          );
        } else if (answer.correct < 0 || answer.correct >= options.length) {
          issues.push(
            issue(quizId, "mcq-correct-out-of-range", "MCQ correct index is out of range.", questionId),
          );
        }
      }
    } else if (question.type === "tf") {
      if (answer.type === "tf" && typeof answer.correct !== "boolean") {
        issues.push(
          issue(quizId, "tf-correct-not-boolean", "True/false correct value is not boolean.", questionId),
        );
      }
    } else if (question.type === "fill") {
      if (answer.type === "fill") {
        if (!Array.isArray(answer.accepted) || answer.accepted.length === 0) {
          issues.push(
            issue(quizId, "fill-accepted-empty", "Fill answer has no accepted values.", questionId),
          );
        } else {
          for (const accepted of answer.accepted) {
            if (typeof accepted !== "string") {
              issues.push(
                issue(quizId, "fill-accepted-not-string", "Accepted value is not a string.", questionId),
              );
            } else if (accepted.trim() === "") {
              issues.push(
                issue(quizId, "fill-accepted-blank", "Accepted value is blank.", questionId),
              );
            }
          }
        }
      }
    }
  }

  for (const answerId of answersById.keys()) {
    if (!questionIds.has(answerId)) {
      issues.push(issue(quizId, "orphan-answer", "Answer has no matching question.", answerId));
    }
  }

  return issues;
}

/** يفحص مجموعة الاختبارات، بما في ذلك تكرار معرّفات الاختبارات بينها. */
export function validateQuizBank(quizzes: readonly QuizFull[]): QuizIntegrityIssue[] {
  const issues: QuizIntegrityIssue[] = [];
  const seen = new Set<string>();

  for (const quiz of quizzes) {
    if (seen.has(quiz.id)) {
      issues.push(issue(quiz.id, "duplicate-quiz-id", "Duplicate quiz id."));
    } else {
      seen.add(quiz.id);
    }
    issues.push(...validateQuiz(quiz));
  }

  return issues;
}

/** خطأ بنك غير قابل للتصحيح — يحمل الرموز فقط، لا قيم الإجابات. */
export class QuizIntegrityError extends Error {
  readonly issues: readonly QuizIntegrityIssue[];

  constructor(quizId: string, issues: readonly QuizIntegrityIssue[]) {
    super(`Quiz "${quizId}" is not gradeable (${issues.map((item) => item.code).join(", ")})`);
    this.name = "QuizIntegrityError";
    this.issues = issues;
  }
}

/** يمنع التصحيح الصامت على بنك معطوب. */
export function assertQuizIsGradeable(quiz: QuizFull): void {
  const issues = validateQuiz(quiz);
  if (issues.length > 0) {
    const quizId = typeof quiz.id === "string" ? quiz.id : "";
    throw new QuizIntegrityError(quizId, issues);
  }
}
