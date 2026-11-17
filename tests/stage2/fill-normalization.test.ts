/**
 * اختبارات تطبيع إجابات الإكمال — P1-4a.
 *
 * تُثبت القواعد الست المعتمدة: حذف المسافات، تحويل الأرقام العربية/الفارسية
 * و`٫`، توحيد حالة الأحرف، حذف المحارف غير المرئية، التكافؤ العشري القانوني،
 * وعدم تطبيع التشكيل/التطويل/الحروف/الترقيم.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { fillAnswersMatch, normalizeFillAnswer } from "../../src/lib/quiz-grading";
import { acceptedValues, allQuizzes, countAcceptedValues, findAnswer } from "./helpers";

test("يحذف جميع المسافات بما فيها المسافات الداخلية", () => {
  assert.equal(normalizeFillAnswer("  الفيزياء  "), "الفيزياء");
  assert.equal(normalizeFillAnswer("F = F1 + F2"), "f=f1+f2");
  assert.equal(normalizeFillAnswer("w= m g"), "w=mg");
  assert.equal(normalizeFillAnswer("شدة ويعاكسه جهة"), "شدةويعاكسهجهة");
});

test("يحوّل الأرقام العربية والفارسية إلى ASCII ويحوّل الفاصلة العشرية العربية", () => {
  assert.equal(normalizeFillAnswer("٠١٢٣٤٥٦٧٨٩"), "0123456789");
  assert.equal(normalizeFillAnswer("۰۱۲۳۴۵۶۷۸۹"), "0123456789");
  assert.equal(normalizeFillAnswer("٣٫٦"), "3.6");
  assert.equal(normalizeFillAnswer("٣.٦"), "3.6");
  assert.equal(normalizeFillAnswer("٩"), "9");
});

test("يوحّد حالة الأحرف اللاتينية", () => {
  assert.equal(normalizeFillAnswer("W = M G"), "w=mg");
  assert.equal(normalizeFillAnswer("N"), "n");
  assert.equal(normalizeFillAnswer("w=MG"), "w=mg");
});

test("يحذف محارف التحكم والاتجاه غير المرئية فقط", () => {
  const withControls = "\u200f\u200e\u200b\u061c\u202b\u2067\ufeffتسعة\u200f";
  assert.equal(normalizeFillAnswer(withControls), "تسعة");
  assert.equal(normalizeFillAnswer("ش\u200cدة"), "شدة");
  assert.equal(normalizeFillAnswer("تس\u00adعة"), "تسعة");
  assert.equal(normalizeFillAnswer("شدة"), "شدة");
  assert.equal(normalizeFillAnswer("ة"), "ة");
  assert.equal(normalizeFillAnswer("ى"), "ى");
});

test("لا يطبّع التشكيل ولا التطويل ولا علامات الترقيم", () => {
  assert.notEqual(normalizeFillAnswer("شَدَّة"), "شدة");
  assert.equal(normalizeFillAnswer("شدةـ"), "شدةـ");
  assert.notEqual(normalizeFillAnswer("شدةـ"), "شدة");
  assert.notEqual(normalizeFillAnswer("تسعة."), "تسعة");
  assert.equal(fillAnswersMatch("تسعة.", ["تسعة"]), false);
});

test("كل قيمة معتمدة تقبل نفسها في كل أسئلة الإكمال", () => {
  let checked = 0;

  for (const quiz of allQuizzes()) {
    for (const question of quiz.questions) {
      if (question.type !== "fill") continue;
      const answer = findAnswer(quiz, question.id);
      if (answer.type !== "fill") continue;

      for (const accepted of answer.accepted) {
        assert.equal(
          fillAnswersMatch(accepted, answer.accepted),
          true,
          `${quiz.id}/${question.id}: ${accepted}`,
        );
        checked += 1;
      }
    }
  }

  assert.equal(checked, countAcceptedValues());
  assert.ok(checked > 0, "يجب أن يحتوي البنك على قيم إكمال معتمدة");
});

test("يقبل الصيغ العددية والنصية المعتمدة في الاختبار التعريفي", () => {
  const accepted = acceptedValues("quiz-orientation", "q5");

  assert.equal(fillAnswersMatch("9", accepted), true);
  assert.equal(fillAnswersMatch("٩", accepted), true);
  assert.equal(fillAnswersMatch("تسع", accepted), true);
  assert.equal(fillAnswersMatch("تسعة", accepted), true);
  assert.equal(fillAnswersMatch(" 9 ", accepted), true);
  assert.equal(fillAnswersMatch("9.0", accepted), true);
  assert.equal(fillAnswersMatch("10", accepted), false);
  assert.equal(fillAnswersMatch("ثمانية", accepted), false);
});

test("يقبل صفر الحركة وصفرًا عشريًا ويحوّل الفاصلة العربية", () => {
  const zero = acceptedValues("quiz-motion-1", "q5");
  const conversion = acceptedValues("quiz-motion-1", "q10");

  assert.equal(fillAnswersMatch("0", zero), true);
  assert.equal(fillAnswersMatch("٠", zero), true);
  assert.equal(fillAnswersMatch("0.0", zero), true);
  assert.equal(fillAnswersMatch("صفر", zero), true);
  assert.equal(fillAnswersMatch("1", zero), false);

  assert.equal(fillAnswersMatch("3.6", conversion), true);
  assert.equal(fillAnswersMatch("٣.٦", conversion), true);
  assert.equal(fillAnswersMatch("٣٫٦", conversion), true);
  assert.equal(fillAnswersMatch("3.60", conversion), true);
  assert.equal(fillAnswersMatch(" 3 . 6 ", conversion), true);
  assert.equal(fillAnswersMatch("3.6000000001", conversion), false);
  assert.equal(fillAnswersMatch("3,6", conversion), false);
  assert.equal(fillAnswersMatch("3.6m", conversion), false);
  assert.equal(fillAnswersMatch("9e0", conversion), false);
});

test("يقبل وحدة القوة وصيغ العلاقة الرياضية المعتمدة", () => {
  const newton = acceptedValues("quiz-force-2", "q5");
  const weight = acceptedValues("quiz-force-2", "q9");

  assert.equal(fillAnswersMatch("N", newton), true);
  assert.equal(fillAnswersMatch("n", newton), true);
  assert.equal(fillAnswersMatch(" N ", newton), true);
  assert.equal(fillAnswersMatch("نيوتن", newton), true);
  assert.equal(fillAnswersMatch("Newton", newton), false);

  assert.equal(fillAnswersMatch("w=mg", weight), true);
  assert.equal(fillAnswersMatch("W = M G", weight), true);
  assert.equal(fillAnswersMatch("w= m g", weight), true);
  assert.equal(fillAnswersMatch("w=m+g", weight), false);
  assert.equal(fillAnswersMatch("w=m×g", weight), false);
});

test("يقبل صيغ المحصلة والعبارة العربية المعتمدة", () => {
  const resultant = acceptedValues("quiz-one-support-3", "q5");
  const reaction = acceptedValues("quiz-one-support-3", "q10");

  for (const accepted of resultant) {
    assert.equal(fillAnswersMatch(accepted, resultant), true, accepted);
  }
  assert.equal(fillAnswersMatch("f = f1 + f2", resultant), true);
  assert.equal(fillAnswersMatch("F=F_1 + F_2", resultant), true);
  assert.equal(fillAnswersMatch("F=F1-F2", resultant), false);
  assert.equal(fillAnswersMatch("F=F1", resultant), false);

  for (const accepted of reaction) {
    assert.equal(fillAnswersMatch(accepted, reaction), true, accepted);
  }
  assert.equal(fillAnswersMatch("  شدة   ويعاكسه   جهة  ", reaction), true);
  assert.equal(fillAnswersMatch("شدة ويعاكسه", reaction), false);
  assert.equal(fillAnswersMatch("شدة ويعاكسه الجهة", reaction), false);
});

test("يطبّق التكافؤ العشري القانوني بلا سماحية ولا أسّ ولا وحدات", () => {
  assert.equal(fillAnswersMatch("3.60", ["3.6"]), true);
  assert.equal(fillAnswersMatch("03.6", ["3.6"]), true);
  assert.equal(fillAnswersMatch("+3.6", ["3.6"]), true);
  assert.equal(fillAnswersMatch("3.6", ["3.600"]), true);
  assert.equal(fillAnswersMatch("09", ["9"]), true);
  assert.equal(fillAnswersMatch("9.", ["9"]), true);
  assert.equal(fillAnswersMatch(".5", ["0.5"]), true);
  assert.equal(fillAnswersMatch("0.10", ["0.1"]), true);
  assert.equal(fillAnswersMatch("00", ["0"]), true);
  assert.equal(fillAnswersMatch("-0", ["0"]), true);

  assert.equal(fillAnswersMatch("-3.6", ["3.6"]), false);
  assert.equal(fillAnswersMatch("3.6000000001", ["3.6"]), false);
  assert.equal(fillAnswersMatch("9e0", ["9"]), false);
  assert.equal(fillAnswersMatch("3,6", ["3.6"]), false);
  assert.equal(fillAnswersMatch("3.6m", ["3.6"]), false);
});

test("لا يحوّل الكلمات إلى أرقام ولا يطابق الحروف العربية المتقاربة", () => {
  assert.equal(fillAnswersMatch("تسع", ["9"]), false);
  assert.equal(fillAnswersMatch("9", ["تسع"]), false);
  assert.equal(fillAnswersMatch("صفر", ["0"]), false);
  assert.equal(fillAnswersMatch("شَدَّة", ["شدة"]), false);
  assert.equal(fillAnswersMatch("تسعه", ["تسعة"]), false);
  assert.equal(fillAnswersMatch("شده", ["شدة"]), false);
  assert.equal(fillAnswersMatch("على", ["علي"]), false);
});

test("يرفض النص الفارغ أو غير المرئي أو قائمة القيم الفارغة", () => {
  assert.equal(fillAnswersMatch("", ["9"]), false);
  assert.equal(fillAnswersMatch("   ", ["9"]), false);
  assert.equal(fillAnswersMatch("\u200f\u200e\u200b", ["9"]), false);
  assert.equal(fillAnswersMatch("9", []), false);
});
