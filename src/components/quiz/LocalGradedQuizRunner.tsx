"use client";
import { useState } from "react";
import Link from "next/link";
import {
  unit1Assessment,
  lessonNames,
  lessonSlugs,
  type AssessmentItem,
} from "@/content/unit1-assessment";
import {
  gradeAssessment,
  PREVIOUS_FORM_KEY,
  selectUnit1,
} from "@/lib/unit1-assessment";
import { machineRich } from "@/content/simple-machines-text";
import { RichText } from "@/components/content/RichText";
import { TeX } from "@/components/math/TeX";
import { AssessmentDiagram } from "@/components/figures/simple-machines-figures";
import styles from "@/components/figures/simple-machines.module.css";
export function ScienceText({ text }: { text: string }) {
  return /\\(?:frac|times|mathrm)/.test(text) &&
    !/[\u0600-\u06ff]/.test(text) ? (
    <TeX block>{text}</TeX>
  ) : (
    <RichText rich={machineRich(text)} />
  );
}
export function LocalGradedQuizRunner({
  lessonQuestions,
}: {
  lessonQuestions?: readonly AssessmentItem[];
}) {
  const [questions, Q] = useState<readonly AssessmentItem[] | null>(null),
    [answers, A] = useState<Record<string, number | boolean | string>>({}),
    [submitted, S] = useState(false),
    [error, E] = useState("");
  const unit = !lessonQuestions;
  function start() {
    let previous: unknown = null;
    if (unit)
      try {
        previous = JSON.parse(
          localStorage.getItem(PREVIOUS_FORM_KEY) || "null",
        );
      } catch {}
    const form = lessonQuestions ?? selectUnit1(previous);
    Q(form);
    A({});
    S(false);
    E("");
    if (unit)
      try {
        localStorage.setItem(
          PREVIOUS_FORM_KEY,
          JSON.stringify(form.map((q) => q.id)),
        );
      } catch {}
  }
  if (!questions)
    return (
      <div className={`${styles.scope} ${styles.panel}`}>
        <h2 className={styles.heading}>
          {unit
            ? "اختبار الوحدة الأولى الشامل — الحركة والتحريك"
            : "اختبار الدرس الخامس — الآلات البسيطة"}
        </h2>
        <p>
          {unit
            ? "30 سؤالاً، 6 لكل درس: 10 أساسية، و15 متوسطة، و5 متقدمة. من بنك معتمد يحتوي 60 سؤالاً."
            : "10 أسئلة مستقلة للتدرب على مفاهيم الدرس وتطبيقاتها."}
        </p>
        <p>
          درجة واحدة لكل سؤال، دون خصم للإجابة الخاطئة. الزمن إرشادي:{" "}
          {unit ? "45–50" : "15–20"} دقيقة. تظهر الدرجة والتفسيرات بعد التسليم
          فقط.
        </p>
        <p className={styles.note}>
          التصحيح محلي في متصفحك. لا تُحفظ الإجابات أو الدرجات ولا تُرسل إلى خادم.{" "}
          {unit
            ? "نحفظ معرّفات أسئلة النموذج السابق فقط لتنويع المحاولة التالية؛ ويعمل الاختبار إذا تعذر التخزين."
            : ""}{" "}
          مفاتيح الإجابة في ملفات الموقع الثابت ليست سرية تقنياً.
        </p>
        <button className={styles.button} onClick={start}>
          ابدأ الاختبار
        </button>
      </div>
    );
  const complete = questions.filter(
    (q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== "",
  ).length;
  const grade = submitted ? gradeAssessment(questions, answers) : null;
  function submit() {
    if (complete !== questions!.length) {
      E("أجب عن جميع الأسئلة قبل التسليم. انتقل إلى أول سؤال غير مكتمل.");
      const missing = questions!.find(
        (q) =>
          answers[q.id] === undefined || String(answers[q.id]).trim() === "",
      );
      document
        .getElementById(missing!.id)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById(missing!.id)?.focus();
      return;
    }
    S(true);
    E("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  return (
    <div className={styles.scope}>
      {grade ? (
        <section
          className={`${styles.panel} ${styles.result}`}
          aria-live="polite"
        >
          <h2 className={styles.heading}>
            نتيجتك: {grade.score} من {grade.total} — {grade.percentage}%
          </h2>
          <p>
            هذه نتيجة هذه المحاولة فقط؛ لا تُحفظ الدرجة. راجع التفسيرات ثم أعد
            المحاولة.
          </p>
          {unit && (
            <ul>
              {lessonNames.map((name, i) => (
                <li key={name}>
                  <Link href={`/lessons/${lessonSlugs[i]}`}>{name}</Link>:{" "}
                  {grade.lessons[i]} من 6
                </li>
              ))}
            </ul>
          )}
          <button className={styles.button} onClick={start}>
            محاولة جديدة
          </button>
        </section>
      ) : (
        <div className={styles.panel}>
          <p>
            أجبت عن {complete} من {questions.length}. يمكنك تعديل إجاباتك قبل
            التسليم.
          </p>
          <progress
            aria-label="اكتمال الإجابات"
            value={complete}
            max={questions.length}
            style={{ width: "100%" }}
          />
        </div>
      )}
      {questions.map((q, index) => {
        const result = grade?.results.find((r) => r.id === q.id);
        const correct =
          q.type === "mcq"
            ? q.options![q.answer as number]
            : q.type === "tf"
              ? q.answer
                ? "صح"
                : "خطأ"
              : String(q.answer);
        const mine = answers[q.id];
        const displayMine =
          q.type === "mcq"
            ? q.options![mine as number]
            : q.type === "tf"
              ? mine
                ? "صح"
                : "خطأ"
              : String(mine ?? "");
        return (
          <section
            id={q.id}
            tabIndex={-1}
            key={q.id}
            className={`${styles.panel} ${styles.question} ${result ? `${styles.review} ${!result.correct ? styles.wrong : ""}` : ""}`}
          >
            <p className={styles.status}>
              السؤال {index + 1} — {lessonNames[q.lesson - 1]}
            </p>
            <h3 className={styles.heading}>
              <ScienceText text={q.prompt} />
            </h3>
            {q.conditions && (
              <p className={styles.note}>
                <ScienceText text={q.conditions} />
              </p>
            )}
            {q.diagram && <AssessmentDiagram q={q} />}
            {!submitted ? (
              <>
                {q.type === "number" ? (
                  <label className={styles.control}>
                    إجابتك — أدخل العدد فقط{" "}
                    <span dir="ltr">
                      <input
                        aria-label={`إجابة السؤال ${index + 1}`}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={String(mine ?? "")}
                        onChange={(e) =>
                          A({ ...answers, [q.id]: e.target.value })
                        }
                        style={{
                          width: 130,
                          padding: 10,
                          border: "1px solid #78879c",
                          borderRadius: 8,
                        }}
                      />{" "}
                      {q.unit === "بلا وحدة" ? (
                        "بلا وحدة"
                      ) : (
                        <TeX>{`\\mathrm{${q.unit}}`}</TeX>
                      )}
                    </span>
                  </label>
                ) : (
                  <div
                    className={styles.options}
                    role="group"
                    aria-label={`خيارات السؤال ${index + 1}`}
                  >
                    {(q.type === "tf" ? ["صح", "خطأ"] : q.options!).map(
                      (option, i) => {
                        const value = q.type === "tf" ? i === 0 : i;
                        return (
                          <button
                            key={i}
                            aria-pressed={mine === value}
                            className={`${styles.button} ${styles.option} ${mine === value ? styles.selected : ""}`}
                            onClick={() => A({ ...answers, [q.id]: value })}
                          >
                            <span aria-hidden="true">
                              {q.type === "mcq"
                                ? ["أ", "ب", "ج", "د"][i] + ". "
                                : ""}
                            </span>
                            <ScienceText text={option} />
                          </button>
                        );
                      },
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <strong>
                  {result?.correct ? "إجابة صحيحة" : "إجابة غير صحيحة"}
                </strong>
                <p>
                  إجابتك: <ScienceText text={displayMine} />
                </p>
                <p>
                  الإجابة الصحيحة: <ScienceText text={correct} />
                  {q.type === "number" && q.unit !== "بلا وحدة" && (
                    <>
                      {" "}
                      <TeX>{`\\mathrm{${q.unit}}`}</TeX>
                    </>
                  )}
                </p>
                <div className={styles.result}>
                  <ScienceText text={q.explain} />
                </div>
                <Link href={`/lessons/${lessonSlugs[q.lesson - 1]}`}>
                  راجع الدرس
                </Link>
              </div>
            )}
          </section>
        );
      })}
      {!submitted && (
        <div className={styles.panel}>
          {error && (
            <p role="alert" style={{ color: "#b42318" }}>
              {error}
            </p>
          )}
          <button className={styles.button} onClick={submit}>
            تسليم الاختبار وإظهار النتيجة
          </button>
        </div>
      )}
    </div>
  );
}
// Explicit reference prevents accidental replacement of the approved bank by a generated one.
export const approvedBankSize = unit1Assessment.length;
