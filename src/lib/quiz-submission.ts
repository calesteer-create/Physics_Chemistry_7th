/**
 * بوابة تسليم الاختبار (المرحلة الأولى — P0-2).
 *
 * قبل المرحلة الأولى كان POST بإجابات فارغة `{"answers":{}}` يُعيد مفاتيح
 * الإجابة كاملة. تُفرض هنا قاعدة الخادم نفسها التي تفرضها الواجهة بالفعل
 * («سلّم الاختبار» لا يُفعّل إلا بعد الإجابة عن كل سؤال)، مع التحقق من نوع
 * كل قيمة ومداها. لا تُبنى أي تغذية راجعة قبل اجتياز هذه البوابة.
 *
 * لا يغيّر هذا الملف أي محتوى تعليمي: الأسئلة والإجابات والشروح تبقى كما هي،
 * تعرض الواجهة حالة الصحة فقط؛ أما الحلول التفصيلية فتبقى في منطقة المعلم.
 */

export interface QuestionSpec {
  id: string;
  type: "mcq" | "tf" | "fill";
  optionCount?: number;
}

export type ValidatedAnswers = Record<string, unknown>;

export type SubmissionGate =
  | { ok: true; answers: ValidatedAnswers }
  | { ok: false; status: number; error: string };

const INCOMPLETE = "أجب عن جميع الأسئلة قبل تسليم الاختبار.";
const MALFORMED = "صيغة الإجابات غير صالحة.";

function denied(status: number, error: string): SubmissionGate {
  // الاستجابة المرفوضة لا تحمل feedback ولا correctLabel ولا explain قصداً.
  return { ok: false, status, error };
}

/**
 * يتحقق من أن `raw` يغطي كل الأسئلة بقيم من النوع الصحيح، ولا يحمل مفاتيح
 * دخيلة. لا يُعيد أي معلومة عن الإجابات الصحيحة في حالة الرفض.
 */
export function gateQuizSubmission(questions: QuestionSpec[], raw: unknown): SubmissionGate {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return denied(400, MALFORMED);
  const source = raw as Record<string, unknown>;
  const knownIds = new Set(questions.map((q) => q.id));
  if (Object.keys(source).some((key) => !knownIds.has(key))) return denied(400, MALFORMED);
  if (questions.length === 0) return denied(400, MALFORMED);

  const answers: ValidatedAnswers = {};
  for (const question of questions) {
    const value = source[question.id];
    if (value === undefined || value === null) return denied(400, INCOMPLETE);

    if (question.type === "mcq") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        return denied(400, MALFORMED);
      }
      if (value >= (question.optionCount ?? 0)) return denied(400, MALFORMED);
    } else if (question.type === "tf") {
      if (typeof value !== "boolean") return denied(400, MALFORMED);
    } else {
      if (typeof value !== "string" || value.trim() === "") return denied(400, MALFORMED);
    }
    answers[question.id] = value;
  }

  return { ok: true, answers };
}

/** جسم الاستجابة للطلبات المرفوضة — خالٍ قصداً من أي مفتاح إجابة أو شرح. */
export function deniedSubmissionBody(gate: Extract<SubmissionGate, { ok: false }>): {
  ok: false;
  error: string;
} {
  return { ok: false, error: gate.error };
}
