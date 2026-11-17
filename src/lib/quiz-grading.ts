import "server-only";
import type { QuizFull } from "../content/quiz-bank";
import { assertQuizIsGradeable } from "./quiz-integrity";

/**
 * التصحيح النقي — P1-4a.
 *
 * لا اتصال بقاعدة بيانات، ولا كتابة، ولا استدعاء شبكي. تُمرَّر له بيانات
 * الاختبار المحلية وإجابات الطالب، فيعيد درجة مجمّعة وتفصيلًا داخليًا
 * لكل سؤال. التفصيل (`results`) لا يُرسل إلى المتصفح؛ الحد الفاصل هو
 * `toPublicGrade` التي تعيد الدرجة والمجموع والنسبة فقط.
 *
 * قواعد التطبيع المعتمدة لإجابات الإكمال:
 * 1) حذف جميع المسافات.
 * 2) تحويل الأرقام العربية والفارسية إلى ASCII، و`٫` إلى `.`.
 * 3) توحيد حالة الأحرف اللاتينية.
 * 4) حذف محارف التحكم والاتجاه غير المرئية فقط.
 * 5) تكافؤ عددي عشري قانوني بلا سماحية أو أسّ أو وحدات أو فاصلة `,`.
 * 6) لا تطبيع للتشكيل أو التطويل أو `ة/ه` أو `ى/ي` أو علامات الترقيم.
 */

export type SubmittedAnswers = Readonly<Record<string, unknown>>;

export interface QuestionGrade {
  id: string;
  correct: boolean;
}

export interface QuizGrade {
  score: number;
  total: number;
  percentage: number;
  /** تفصيل داخلي لكل سؤال — ممنوع إرساله إلى المتصفح. */
  results: QuestionGrade[];
}

export interface PublicQuizGrade {
  score: number;
  total: number;
  percentage: number;
}

const ARABIC_INDIC_DIGITS = /[\u0660-\u0669]/g;
const EXTENDED_ARABIC_INDIC_DIGITS = /[\u06F0-\u06F9]/g;

/**
 * محارف غير مرئية فقط: شرطة لينة، علامة الحرف العربي، محارف صفرية العرض،
 * محارف تضمين/عزل الاتجاه، ومحارف يونيكود غير المرئية، وBOM.
 * لا تشمل التطويل (U+0640) ولا الحركات (U+064B–U+0652) ولا الحروف العربية.
 */
const INVISIBLE_FORMAT_CHARS =
  /[\u00AD\u061C\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFEFF]/g;

function asciiDigit(digit: string, zeroCodePoint: number): string {
  const codePoint = digit.codePointAt(0);
  return codePoint === undefined ? digit : String(codePoint - zeroCodePoint);
}

/**
 * التطبيع النصي لإجابة إكمال واحدة. لا يغيّر الإجابة المعتمدة في المحتوى؛
 * يُطبَّق على الطرفين وقت المقارنة فقط.
 */
export function normalizeFillAnswer(raw: string): string {
  return raw
    .replace(ARABIC_INDIC_DIGITS, (digit) => asciiDigit(digit, 0x0660))
    .replace(EXTENDED_ARABIC_INDIC_DIGITS, (digit) => asciiDigit(digit, 0x06f0))
    .replace(/\u066B/g, ".")
    .replace(INVISIBLE_FORMAT_CHARS, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

/**
 * صيغة قانونية للرقم العشري: `3.60` و`3.6` و`03.6` و`+3.6` و`3.6` كلها
 * تعطي `3.6`، قبل المقارنة. لا تُقبل الأسّ (`9e0`) ولا الوحدات (`3.6m`)
 * ولا الفاصلة `,`. تعيد `null` إن لم تكن القيمة رقمًا عشريًا كاملًا.
 */
function canonicalDecimal(value: string): string | null {
  if (!DECIMAL_PATTERN.test(value)) return null;

  const negative = value.startsWith("-");
  const unsigned = value.replace(/^[+-]/, "");
  const [integerPartRaw = "", fractionPartRaw = ""] = unsigned.split(".");
  const integerPart = (integerPartRaw === "" ? "0" : integerPartRaw).replace(/^0+(?=\d)/, "");
  const fractionPart = fractionPartRaw.replace(/0+$/, "");
  const isZero = integerPart === "0" && fractionPart === "";

  return `${negative && !isZero ? "-" : ""}${integerPart}${fractionPart ? `.${fractionPart}` : ""}`;
}

/**
 * هل تطابق إجابة إكمال واحدة أي قيمة معتمدة؟ المطابقة النصية بعد التطبيع
 * أولًا، ثم التكافؤ العددي العشري القانوني إن كان الطرفان رقمين.
 */
export function fillAnswersMatch(raw: string, accepted: readonly string[]): boolean {
  const submitted = normalizeFillAnswer(raw);
  if (submitted === "") return false;

  const submittedDecimal = canonicalDecimal(submitted);

  for (const candidate of accepted) {
    if (typeof candidate !== "string") continue;
    const normalized = normalizeFillAnswer(candidate);
    if (submitted === normalized) return true;
    if (submittedDecimal !== null && canonicalDecimal(normalized) === submittedDecimal) {
      return true;
    }
  }

  return false;
}

/**
 * يصحح محاولة كاملة. يرفض البنك المعطوب قبل أي حساب (لا تصحيح صامت)،
 * ويعامل الإجابة الناقصة أو مجهولة المعرّف أو خاطئة النوع كإجابة غير
 * صحيحة. لا يعدّل كائن الاختبار ولا كائن الإجابات.
 */
export function gradeQuiz(quiz: QuizFull, answers: SubmittedAnswers): QuizGrade {
  assertQuizIsGradeable(quiz);

  const answersById = new Map(quiz.answers.map((answer) => [answer.id, answer]));

  const results: QuestionGrade[] = quiz.questions.map((question) => {
    const answer = answersById.get(question.id);
    const submitted = answers[question.id];

    if (!answer || answer.type !== question.type) {
      return { id: question.id, correct: false };
    }

    if (answer.type === "mcq") {
      return {
        id: question.id,
        correct:
          typeof submitted === "number" &&
          Number.isInteger(submitted) &&
          submitted === answer.correct,
      };
    }

    if (answer.type === "tf") {
      return {
        id: question.id,
        correct: typeof submitted === "boolean" && submitted === answer.correct,
      };
    }

    return {
      id: question.id,
      correct: typeof submitted === "string" && fillAnswersMatch(submitted, answer.accepted),
    };
  });

  const total = quiz.questions.length;
  const score = results.reduce((sum, result) => sum + (result.correct ? 1 : 0), 0);
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

  return { score, total, percentage, results };
}

/** الحد الفاصل بين الخادم والمتصفح: درجة ومجموع ونسبة فقط. */
export function toPublicGrade(grade: QuizGrade): PublicQuizGrade {
  return {
    score: grade.score,
    total: grade.total,
    percentage: grade.percentage,
  };
}
