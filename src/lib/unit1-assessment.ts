import {
  unit1Assessment,
  type AssessmentItem,
} from "../content/unit1-assessment";
import { fillAnswersMatch } from "./quiz-grading";
export const PREVIOUS_FORM_KEY = "physics-unit1-previous-form-v1";
/** Injectable randomness for exhaustive deterministic tests; no answer or grade persistence. */
function choose<T>(arr: readonly T[], n: number, random: () => number) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
export function validPrevious(value: unknown): value is string[] {
  if (
    !Array.isArray(value) ||
    value.length !== 30 ||
    !value.every((x) => typeof x === "string")
  )
    return false;
  const qs = value.map((id) => unit1Assessment.find((q) => q.id === id));
  if (qs.some((q) => !q) || new Set(qs.map((q) => q!.slot)).size !== 30)
    return false;
  for (let l = 1; l <= 5; l++)
    if (qs.filter((q) => q!.lesson === l && q!.id.endsWith("A")).length !== 3)
      return false;
  return true;
}
export function selectUnit1(
  previous: unknown = null,
  random: () => number = Math.random,
): AssessmentItem[] {
  const prev = validPrevious(previous) ? previous : null;
  const selected: AssessmentItem[] = [];
  for (let lesson = 1; lesson <= 5; lesson++) {
    const slots = Array.from({ length: 6 }, (_, i) => (lesson - 1) * 6 + i + 1);
    let a: number[];
    if (prev) {
      const oldA = slots.filter((s) => prev.includes(`u1-${s}-A`));
      const oldB = slots.filter((s) => !oldA.includes(s));
      const flipA = choose(oldA, 2, random),
        flipB = choose(oldB, 2, random);
      a = [...oldA.filter((s) => !flipA.includes(s)), ...flipB];
    } else a = choose(slots, 3, random);
    for (const slot of slots)
      selected.push(
        unit1Assessment.find(
          (q) => q.id === `u1-${slot}-${a.includes(slot) ? "A" : "B"}`,
        )!,
      );
  }
  // Stable pedagogical order: two basic rounds, three medium rounds, one advanced round.
  return selected.sort(
    (a, b) => ((a.slot - 1) % 6) - ((b.slot - 1) % 6) || a.lesson - b.lesson,
  );
}
export function gradeAssessment(
  questions: readonly AssessmentItem[],
  answers: Readonly<Record<string, unknown>>,
) {
  const results = questions.map((q) => {
    const value = answers[q.id];
    return {
      id: q.id,
      lesson: q.lesson,
      correct:
        q.type === "number"
          ? typeof value === "string" &&
            fillAnswersMatch(value, [String(q.answer)])
          : typeof value === typeof q.answer && value === q.answer,
    };
  });
  const score = results.filter((r) => r.correct).length;
  return {
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    results,
    lessons: Array.from(
      { length: 5 },
      (_, i) => results.filter((r) => r.lesson === i + 1 && r.correct).length,
    ),
  };
}
