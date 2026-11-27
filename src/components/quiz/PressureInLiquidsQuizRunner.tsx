"use client";

/**
 * مُشغّل اختبار «الضغط في السوائل» — تصحيح محلي كامل.
 *
 * صفحة الخادم تمرّر الأسئلة العامة فقط؛ مفاتيح الإجابة والتفسيرات مستوردة
 * هنا في وحدة العميل ولا تُعرض في الواجهة قبل التسليم. لا خادم، ولا API،
 * ولا قاعدة بيانات، ولا حفظ للدرجة. درجة واحدة لكل سؤال دون خصم.
 *
 * `pil-8` ترتيب تفاعلي حقيقي: البنود مخلوطة في البداية، ويغيّر الطالب
 * مواضعها بأزرار نقل، ولا يُصحَّح الترتيب ولا تظهر الخطوات الصحيحة إلا بعد
 * تسليم الاختبار.
 */
import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, CheckCircle2, ClipboardCheck, Lightbulb, ListOrdered, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { RichText } from "@/components/content/RichText";
import { Q } from "@/components/math/TeX";
import { FigureBlock } from "@/components/figures";
import type { LiquidQuizOrderingQuestion, LiquidQuizPublic, LiquidQuizQuestion } from "@/content/pressure-in-liquids-quiz";
import { pressureInLiquidsAnswerKey, type LiquidQuizAnswer } from "@/content/pressure-in-liquids-answers";
import styles from "./PressureInLiquidsQuizRunner.module.css";

type Answers = Record<string, LiquidQuizAnswer>;

function normalizeNumber(value: string): number | null {
  const ascii = value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06F0))
    .replace(/٫/g, ".")
    .replace(/,/g, "")
    .replace(/\s/g, "");
  if (!/^[+-]?\d*(?:\.\d+)?$/.test(ascii) || ascii === "") return null;
  const n = Number(ascii);
  return Number.isFinite(n) ? n : null;
}

function answered(q: LiquidQuizQuestion, answers: Answers): boolean {
  const v = answers[q.id];
  return v !== undefined && String(v).trim() !== "";
}

function isCorrect(q: LiquidQuizQuestion, answers: Answers): boolean {
  const key = pressureInLiquidsAnswerKey[q.id];
  const mine = answers[q.id];
  if (!key || mine === undefined) return false;
  if (q.type === "ordering") {
    const expected = key.answer;
    return Array.isArray(expected) && Array.isArray(mine)
      && expected.length === mine.length
      && expected.every((n, i) => n === mine[i]);
  }
  if (q.type === "mcq") return mine === key.answer;
  if (q.type === "tf") return mine === key.answer;
  const expected = Number(key.answer);
  const got = normalizeNumber(String(mine));
  return Number.isFinite(expected) && got !== null && Math.abs(got - expected) <= (key.tolerance ?? 0.02);
}

function orderingSequence(q: LiquidQuizOrderingQuestion, order: number[], marker: "mine" | "correct"): ReactNode {
  return (
    <ol className={styles.orderReviewList} data-ordering-list={marker}>
      {order.map((itemIndex, i) => (
        <li key={`${itemIndex}-${i}`}>
          <RichText rich={q.items[itemIndex] ?? [{ t: "—" }]} />
        </li>
      ))}
    </ol>
  );
}

function correctDisplay(q: LiquidQuizQuestion): ReactNode {
  const key = pressureInLiquidsAnswerKey[q.id];
  if (!key) return "—";
  if (q.type === "ordering") {
    return orderingSequence(q, Array.isArray(key.answer) ? key.answer : [], "correct");
  }
  if (q.type === "mcq") return <RichText rich={q.options?.[Number(key.answer)] ?? [{ t: "—" }]} />;
  if (q.type === "tf") return key.answer ? "صح" : "خطأ";
  return <span dir="ltr"><Q v={String(key.answer)} u={key.unit} /></span>;
}

function mineDisplay(q: LiquidQuizQuestion, answers: Answers): ReactNode {
  const key = pressureInLiquidsAnswerKey[q.id];
  const mine = answers[q.id];
  if (mine === undefined) return "—";
  if (q.type === "ordering") {
    return orderingSequence(q, Array.isArray(mine) ? mine : [], "mine");
  }
  if (q.type === "mcq") return <RichText rich={q.options?.[Number(mine)] ?? [{ t: String(mine) }]} />;
  if (q.type === "tf") return mine ? "صح" : "خطأ";
  return <span dir="ltr"><Q v={String(mine)} u={key?.unit} /></span>;
}

export function PressureInLiquidsQuizRunner({ quiz }: { quiz: LiquidQuizPublic }) {
  // الترتيب الابتدائي مخلوط، لكنه يُسجَّل كإجابة كي يُحسب السؤال ضمن الإكمال.
  const initialAnswers = useMemo<Answers>(() => {
    const init: Answers = {};
    for (const q of quiz.questions) {
      if (q.type === "ordering") init[q.id] = q.items.map((_, i) => i);
    }
    return init;
  }, [quiz.questions]);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const complete = quiz.questions.filter((q) => answered(q, answers)).length;
  const score = submitted ? quiz.questions.filter((q) => isCorrect(q, answers)).length : 0;
  const percentage = Math.round((score / quiz.questions.length) * 100);

  function choose(q: LiquidQuizQuestion, value: LiquidQuizAnswer) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [q.id]: value }));
    setError("");
  }

  function moveOrderingItem(q: LiquidQuizOrderingQuestion, index: number, delta: -1 | 1) {
    if (submitted) return;
    setAnswers((a) => {
      const current: number[] = Array.isArray(a[q.id])
        ? [...(a[q.id] as number[])]
        : q.items.map((_, i) => i);
      const target = index + delta;
      if (target < 0 || target >= current.length) return a;
      [current[index], current[target]] = [current[target], current[index]];
      return { ...a, [q.id]: current };
    });
    setError("");
  }

  function submit() {
    if (complete !== quiz.questions.length) {
      setError("أجب عن جميع الأسئلة قبل التسليم. انتقلنا إلى أول سؤال غير مكتمل.");
      const missing = quiz.questions.find((q) => !answered(q, answers));
      if (missing) {
        document.getElementById(missing.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById(missing.id)?.focus();
      }
      return;
    }
    setSubmitted(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function retry() {
    setAnswers(initialAnswers);
    setSubmitted(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!started) {
    return (
      <div className={styles.scope} data-quiz-count="10" data-submitted="false" data-answer-revealed="false">
        <section className={styles.intro}>
          <div className={styles.meta}>
            <span className={styles.chip}><ClipboardCheck size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />{quiz.questions.length} أسئلة مستقلة</span>
            <span className={`${styles.chip} ${styles.chipGold}`}>٣ مستويات: أساسي · متوسط · متقدم</span>
          </div>
          <h2 className={styles.heading}>{quiz.title}</h2>
          <p className={styles.lede}>{quiz.description}</p>
          <p className={styles.lede}>
            أنواع متنوعة: اختيار من متعدد مع قراءة رسم، صح وخطأ، مسائل عددية، وترتيب تفاعلي.
            درجة واحدة لكل سؤال، دون خصم على الخطأ. الزمن الإرشادي {quiz.durationMin} دقيقة.
          </p>
          <p className={styles.note}>
            <ShieldCheck size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />
            التصحيح محلي في متصفحك؛ لا تُحفظ الإجابات أو الدرجات ولا تُرسل إلى خادم. لا تظهر الإجابات الصحيحة ولا التفسيرات قبل تسليم الاختبار.
          </p>
          <div className={styles.actions}>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={() => setStarted(true)}>ابدأ الاختبار</button>
            <Link href="/lessons/pressure-in-liquids" className={`${styles.button} ${styles.ghost}`}>العودة إلى الدرس</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.scope} data-quiz-count={quiz.questions.length} data-submitted={submitted ? "true" : "false"} data-answer-revealed={submitted ? "true" : "false"}>
      {submitted ? (
        <section className={`${styles.panel} ${styles.result}`} aria-live="polite">
          <h2 className={styles.heading}>نتيجتك</h2>
          <div className={styles.resultScore}>{score} من {quiz.questions.length} — {percentage}%</div>
          <p className={styles.lede}>هذه نتيجة المحاولة الحالية فقط. راجع التفسيرات أدناه ثم أعد المحاولة إن أردت.</p>
          <button type="button" className={`${styles.button} ${styles.primary}`} onClick={retry}>
            <RotateCcw size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />محاولة جديدة
          </button>
        </section>
      ) : (
        <section className={styles.panel}>
          <div className={styles.progress}>
            <span className={styles.progressText}>أجبت عن {complete} من {quiz.questions.length} — يمكنك تعديل إجاباتك قبل التسليم.</span>
            <div className={styles.progressBar}><span style={{ width: `${(complete / quiz.questions.length) * 100}%` }} /></div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={submit}>سلّم الاختبار</button>
            <Link href="/lessons/pressure-in-liquids" className={`${styles.button} ${styles.ghost}`}>العودة إلى الدرس</Link>
          </div>
        </section>
      )}

      {quiz.questions.map((q, index) => {
        const key = pressureInLiquidsAnswerKey[q.id];
        const ok = submitted && isCorrect(q, answers);
        const chosen = answers[q.id];
        const orderingQuestion = q.type === "ordering" ? q : null;
        const order: number[] = orderingQuestion
          ? Array.isArray(chosen) ? [...(chosen as number[])] : orderingQuestion.items.map((_, i) => i)
          : [];
        return (
          <section id={q.id} tabIndex={-1} key={q.id} className={styles.question} aria-label={`السؤال ${index + 1}`}>
            <div className={styles.questionHead}>
              <span className={styles.status}>السؤال {index + 1} من {quiz.questions.length}</span>
              <span className={styles.level}>{q.level}{q.kind === "ordering" ? " · ترتيب تفاعلي" : ""}</span>
            </div>
            <p className={styles.prompt}><RichText rich={q.prompt} /></p>
            {q.figure && <div className={styles.figure}><FigureBlock figure={q.figure} /></div>}

            {q.type === "mcq" && (
              <div className={styles.options}>
                {(q.options ?? []).map((opt, i) => {
                  const selected = chosen === i;
                  const state = submitted
                    ? key?.answer === i ? styles.optionCorrect : selected ? styles.optionWrong : styles.optionDim
                    : selected ? styles.optionSelected : "";
                  return (
                    <button key={i} type="button" disabled={submitted} className={`${styles.option} ${state}`}
                      aria-pressed={selected} onClick={() => choose(q, i)}>
                      <span className={styles.letter}>{["أ", "ب", "ج", "د"][i]}</span>
                      <span><RichText rich={opt} /></span>
                      {submitted && key?.answer === i && <CheckCircle2 size={17} style={{ marginInlineStart: "auto", color: "#6ee7b7" }} />}
                      {submitted && selected && !ok && <XCircle size={17} style={{ marginInlineStart: "auto", color: "#fca5a5" }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "tf" && (
              <div className={styles.options}>
                {[true, false].map((v, i) => {
                  const selected = chosen === v;
                  const state = submitted
                    ? key?.answer === v ? styles.optionCorrect : selected ? styles.optionWrong : styles.optionDim
                    : selected ? styles.optionSelected : "";
                  return (
                    <button key={i} type="button" disabled={submitted} className={`${styles.option} ${state}`}
                      aria-pressed={selected} onClick={() => choose(q, v)}>
                      <span className={styles.letter}>{i === 0 ? "✓" : "✗"}</span>
                      <span>{i === 0 ? "صح" : "خطأ"}</span>
                      {submitted && key?.answer === v && <CheckCircle2 size={17} style={{ marginInlineStart: "auto", color: "#6ee7b7" }} />}
                      {submitted && selected && !ok && <XCircle size={17} style={{ marginInlineStart: "auto", color: "#fca5a5" }} />}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "fill" && !submitted && (
              <div>
                <input className={styles.input} type="text" inputMode="decimal" dir="ltr" value={typeof chosen === "string" ? chosen : ""}
                  aria-label={`إجابة السؤال ${index + 1}`} placeholder={q.placeholder ?? "أدخل العدد فقط"}
                  onChange={(e) => choose(q, e.target.value)} />
                {q.unit && <span className={styles.unit}><Q v="" u={q.unit} /></span>}
              </div>
            )}

            {orderingQuestion && !submitted && (
              <div className={styles.ordering} data-ordering-question="true" data-ordering-current={order.join(",")}>
                <p className={styles.orderingHint}>
                  <ListOrdered size={15} style={{ verticalAlign: "middle", marginInlineEnd: 6 }} />
                  استعمل أزرار النقل لترتيب مراحل الاستنتاج من الأعلى إلى الأسفل.
                </p>
                <ol className={styles.orderingList}>
                  {order.map((itemIndex, pos) => (
                    <li key={itemIndex} className={styles.orderingItem}
                      data-ordering-item={itemIndex} data-ordering-position={pos + 1}>
                      <span className={styles.orderNumber}>{pos + 1}</span>
                      <span className={styles.orderText}><RichText rich={orderingQuestion.items[itemIndex] ?? [{ t: "—" }]} /></span>
                      <span className={styles.orderControls}>
                        <button type="button" className={styles.orderMove} data-ordering-move="up"
                          aria-label={`انقل البند ${pos + 1} للأعلى`} disabled={pos === 0}
                          onClick={() => moveOrderingItem(orderingQuestion, pos, -1)}>
                          <ArrowUp size={16} />
                        </button>
                        <button type="button" className={styles.orderMove} data-ordering-move="down"
                          aria-label={`انقل البند ${pos + 1} للأسفل`} disabled={pos === order.length - 1}
                          onClick={() => moveOrderingItem(orderingQuestion, pos, 1)}>
                          <ArrowDown size={16} />
                        </button>
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {submitted && key && (
              <div className={`${styles.review} ${ok ? "" : styles.reviewWrong}`}>
                <div>
                  {ok ? <CheckCircle2 size={16} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} /> : <XCircle size={16} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />}
                  <strong>{ok ? "إجابة صحيحة" : "إجابة غير صحيحة"}</strong>
                </div>
                {q.type === "ordering" ? (
                  <>
                    <div>ترتيبك: {mineDisplay(q, answers)}</div>
                    <div data-ordering-correct="true">الترتيب الصحيح: {correctDisplay(q)}</div>
                    <div className={styles.explainLine}><Lightbulb size={15} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} /><RichText rich={key.explain} /></div>
                    {key.steps && (
                      <ol className={styles.reviewSteps} data-ordering-steps="true">
                        {key.steps.map((s, i) => <li key={i}><RichText rich={s} /></li>)}
                      </ol>
                    )}
                  </>
                ) : (
                  <>
                    <div>إجابتك: {mineDisplay(q, answers)}</div>
                    {!ok && <div>الإجابة الصحيحة: {correctDisplay(q)}</div>}
                    <div className={styles.explainLine}><Lightbulb size={15} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} /><RichText rich={key.explain} /></div>
                    {key.steps && <ol className={styles.reviewSteps}>{key.steps.map((s, i) => <li key={i}><RichText rich={s} /></li>)}</ol>}
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}

      {!submitted && (
        <section className={styles.panel}>
          <p className={styles.lede}>راجع إجاباتك، ثم سلّم الاختبار لتظهر الدرجة والتفسيرات.</p>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button type="button" className={`${styles.button} ${styles.primary}`} onClick={submit}>سلّم الاختبار</button>
          </div>
        </section>
      )}
    </div>
  );
}
