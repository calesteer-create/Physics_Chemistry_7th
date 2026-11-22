"use client";

/**
 * عناصر مشتركة لبطاقات المراجعة: إطار البطاقة، التغذية الراجعة، التلميح،
 * خطوات الحل، وحقول الإدخال. تُبقي كل بطاقات القسم متناسقة الشكل والسلوك.
 */
import { useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  Lightbulb,
  ListChecks,
  RotateCcw,
} from "lucide-react";
import type { Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import styles from "./unit1-review.module.css";

export type Status = "idle" | "correct" | "wrong";

/** حالة البند: محاولة، تلميح، كشف الحل بعد محاولتين. */
export function useAttempt(onResult: (ok: boolean) => void) {
  const [status, setStatus] = useState<Status>("idle");
  const [attempts, setAttempts] = useState(0);
  const [revealed, setRevealed] = useState(false);

  function check(ok: boolean) {
    setStatus(ok ? "correct" : "wrong");
    if (!ok) setAttempts((a) => a + 1);
    else setRevealed(false);
    onResult(ok);
  }

  return {
    status,
    attempts,
    check,
    retry: () => setStatus("idle"),
    reveal: () => setRevealed(true),
    showSolution: revealed || attempts >= 2,
  };
}

export function Steps({ steps }: { steps: Rich[] }) {
  return (
    <div className={styles.steps}>
      <span className={styles.stepsTitle}>
        <ListChecks className="h-4 w-4" aria-hidden="true" />
        خطوات الحل
      </span>
      <ol className={styles.stepsList}>
        {steps.map((step, i) => (
          <li key={i}>
            <RichText rich={step} />
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ItemFrame({
  label,
  source,
  status,
  showSolution,
  explain,
  hint,
  steps,
  note,
  canCheck,
  checkLabel = "تحقّق من الإجابة",
  onCheck,
  onRetry,
  onReveal,
  children,
}: {
  label: string;
  source: string;
  status: Status;
  showSolution: boolean;
  explain: Rich;
  hint?: Rich;
  steps?: Rich[];
  note?: Rich;
  canCheck: boolean;
  checkLabel?: string;
  onCheck: () => void;
  onRetry: () => void;
  onReveal: () => void;
  children: ReactNode;
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const hintVisible = Boolean(hint) && (hintOpen || status === "wrong");
  const solutionVisible = showSolution && status !== "correct";

  return (
    <article
      className={`${styles.item} ${
        status === "correct" ? styles.itemOk : status === "wrong" ? styles.itemBad : ""
      }`}
    >
      <header className={styles.itemHead}>
        <span className={styles.itemLabel}>{label}</span>
        <span className={styles.itemSource}>{source}</span>
      </header>

      {children}

      <div className={styles.actions}>
        {status === "idle" && (
          <button type="button" className={styles.primary} onClick={onCheck} disabled={!canCheck}>
            <Check className="h-4 w-4" aria-hidden="true" />
            {checkLabel}
          </button>
        )}
        {status === "wrong" && (
          <button type="button" className={styles.primary} onClick={onRetry}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            حاول مرة أخرى
          </button>
        )}
        {status === "correct" && (
          <span className={styles.stationCount} role="status">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            إجابة صحيحة
          </span>
        )}
        {hint && status !== "correct" && (
          <button
            type="button"
            className={styles.ghost}
            onClick={() => setHintOpen((v) => !v)}
            aria-expanded={hintOpen || status === "wrong"}
          >
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            {hintOpen ? "إخفاء التلميح" : "تلميح"}
          </button>
        )}
        {status !== "idle" && status !== "correct" && !showSolution && (
          <button type="button" className={styles.ghost} onClick={onReveal}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            أظهر الحل والخطوات
          </button>
        )}
      </div>

      {hintVisible && hint && (
        <div className={styles.hintBox}>
          <span className={styles.hintHead}>
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            تلميح
          </span>
          <div className={styles.hintText}>
            <RichText rich={hint} />
          </div>
        </div>
      )}

      {status === "correct" && (
        <div className={`${styles.feedback} ${styles.feedbackOk}`} role="status">
          <span className={styles.feedbackHead}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            أحسنت — لماذا؟
          </span>
          <div className={styles.feedbackBody}>
            <RichText rich={explain} />
          </div>
          {steps ? <Steps steps={steps} /> : null}
        </div>
      )}

      {status === "wrong" && !solutionVisible && (
        <div className={`${styles.feedback} ${styles.feedbackBad}`} role="status">
          <span className={styles.feedbackHead}>
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            ليست الإجابة الصحيحة بعد
          </span>
          <div className={styles.feedbackBody}>
            اقرأ التلميح أعلاه، وراجع معطيات السؤال، ثم أعد المحاولة. يمكنك أيضًا إظهار
            الحل والخطوات.
          </div>
        </div>
      )}

      {solutionVisible && (
        <div className={`${styles.feedback} ${styles.feedbackShow}`}>
          <span className={styles.feedbackHead}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            الحل الكامل
          </span>
          <div className={styles.feedbackBody}>
            <RichText rich={explain} />
          </div>
          {note ? (
            <div className={styles.answerNote}>
              <RichText rich={note} />
            </div>
          ) : null}
          {steps ? <Steps steps={steps} /> : null}
        </div>
      )}
    </article>
  );
}

export function OptionButton({
  index,
  selected,
  state,
  disabled,
  onSelect,
  children,
}: {
  index: number;
  selected: boolean;
  state: "right" | "wrong" | "dim" | null;
  disabled: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  const letters = ["أ", "ب", "ج", "د"];
  const cls = [
    styles.option,
    selected && state === null ? styles.optionOn : "",
    state === "right" ? styles.optionRight : "",
    state === "wrong" ? styles.optionWrong : "",
    state === "dim" ? styles.optionDim : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className={styles.optionLetter} aria-hidden="true">
        {letters[index] ?? index + 1}
      </span>
      <span className={styles.optionText}>{children}</span>
      {state === "right" ? (
        <Check className={`${styles.optionMark} text-[#16706b]`} aria-hidden="true" />
      ) : null}
      {state === "wrong" ? (
        <AlertTriangle className={`${styles.optionMark} text-[#b42318]`} aria-hidden="true" />
      ) : null}
    </button>
  );
}

export function NumberField({
  label,
  value,
  unit,
  onChange,
  state = null,
  disabled = false,
  ariaLabel,
}: {
  label: string;
  value: string;
  unit?: string;
  onChange: (value: string) => void;
  state?: "right" | "wrong" | null;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        dir="ltr"
        aria-label={ariaLabel ?? label}
        className={`${styles.input} ${
          state === "right" ? styles.inputRight : state === "wrong" ? styles.inputWrong : ""
        }`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
      {unit ? <span className={styles.unit}>{unit}</span> : null}
    </label>
  );
}
