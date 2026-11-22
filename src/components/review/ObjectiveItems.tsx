"use client";

/** بنود الموضوعية: صح/خطأ مع التصحيح، الاختيار المفرد، اختيار جسمين، والإجابة العددية. */
import { useState } from "react";
import { Check, X } from "lucide-react";
import type {
  NumberItem,
  PairItem,
  SingleItem,
  TrueFalseItem,
} from "@/content/unit1-review";
import { RichText } from "@/components/content/RichText";
import { numberAnswerMatches } from "@/lib/unit1-review";
import {
  ItemFrame,
  NumberField,
  OptionButton,
  useAttempt,
} from "./ReviewPrimitives";
import styles from "./unit1-review.module.css";

export function TrueFalseFix({
  item,
  onResult,
}: {
  item: TrueFalseItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [correction, setCorrection] = useState<number | null>(null);
  const done = attempt.status === "correct";

  const needsCorrection = !item.isTrue && item.corrections.length > 0;
  const canCheck =
    verdict !== null && (!needsCorrection || verdict === true || correction !== null);

  function check() {
    if (verdict === null) return;
    const verdictOk = verdict === item.isTrue;
    const correctionOk =
      !needsCorrection || verdict === true
        ? true
        : correction !== null && item.corrections[correction]?.correct === true;
    attempt.check(verdictOk && correctionOk);
  }

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      canCheck={canCheck}
      onCheck={check}
      onRetry={attempt.retry}
      onReveal={attempt.reveal}
    >
      <div className={styles.itemStatement}>
        <RichText rich={item.statement} />
      </div>

      <div className={styles.tfRow} role="group" aria-label="حدّد صحة العبارة">
        {[true, false].map((value) => {
          const label = value ? "صح" : "خطأ";
          const selected = verdict === value;
          const reveal = attempt.status !== "idle";
          const isRight = reveal && value === item.isTrue;
          const isWrong = reveal && selected && value !== item.isTrue;
          return (
            <button
              key={label}
              type="button"
              aria-pressed={selected}
              disabled={done}
              className={`${styles.tfBtn} ${
                isRight ? styles.tfRight : isWrong ? styles.tfWrong : selected ? styles.tfOn : ""
              }`}
              onClick={() => {
                setVerdict(value);
                if (value !== false) setCorrection(null);
              }}
            >
              {value ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4" aria-hidden="true" />
              )}
              {label}
            </button>
          );
        })}
      </div>

      {needsCorrection && verdict === false && (
        <div className={styles.options} style={{ marginTop: 12 }}>
          <span className={styles.itemSource}>اختر التصحيح الصحيح للعبارة</span>
          {item.corrections.map((option, i) => {
            const selected = correction === i;
            const reveal = attempt.status !== "idle" && verdict === false;
            const state = !reveal
              ? null
              : option.correct
                ? ("right" as const)
                : selected
                  ? ("wrong" as const)
                  : ("dim" as const);
            return (
              <OptionButton
                key={i}
                index={i}
                selected={selected}
                state={state}
                disabled={done}
                onSelect={() => setCorrection(i)}
              >
                <RichText rich={option.text} />
              </OptionButton>
            );
          })}
        </div>
      )}

      {attempt.status === "wrong" && needsCorrection && verdict === false && correction === null && (
        <p className={styles.answerNote}>اختر التصحيح المناسب ثم أعد التحقق.</p>
      )}
    </ItemFrame>
  );
}

export function SingleChoice({
  item,
  onResult,
}: {
  item: SingleItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [selected, setSelected] = useState<number | null>(null);
  const done = attempt.status === "correct";

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      canCheck={selected !== null}
      onCheck={() => {
        if (selected === null) return;
        attempt.check(item.options[selected]?.correct === true);
      }}
      onRetry={attempt.retry}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>
      <div className={styles.options} role="group" aria-label="خيارات الإجابة">
        {item.options.map((option, i) => {
          const reveal = attempt.status !== "idle";
          const state = !reveal
            ? null
            : option.correct
              ? ("right" as const)
              : selected === i
                ? ("wrong" as const)
                : ("dim" as const);
          return (
            <OptionButton
              key={i}
              index={i}
              selected={selected === i}
              state={state}
              disabled={done}
              onSelect={() => setSelected(i)}
            >
              <RichText rich={option.text} />
            </OptionButton>
          );
        })}
      </div>
    </ItemFrame>
  );
}

export function PairChoice({
  item,
  onResult,
}: {
  item: PairItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [picked, setPicked] = useState<number[]>([]);
  const done = attempt.status === "correct";

  function toggle(index: number) {
    setPicked((current) => {
      if (current.includes(index)) return current.filter((i) => i !== index);
      if (current.length >= 2) return [current[1], index];
      return [...current, index];
    });
  }

  const canCheck = picked.length === 2;
  const wanted = [...item.answer].sort((a, b) => a - b);

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      canCheck={canCheck}
      checkLabel="تحقّق من الجسمين"
      onCheck={() => {
        if (picked.length !== 2) return;
        const sorted = [...picked].sort((a, b) => a - b);
        attempt.check(sorted[0] === wanted[0] && sorted[1] === wanted[1]);
      }}
      onRetry={attempt.retry}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>
      <div className={styles.options} role="group" aria-label="اختر جسمين">
        {item.options.map((option, i) => {
          const selected = picked.includes(i);
          const reveal = attempt.status !== "idle";
          const state = !reveal
            ? null
            : wanted.includes(i)
              ? ("right" as const)
              : selected
                ? ("wrong" as const)
                : ("dim" as const);
          return (
            <OptionButton
              key={i}
              index={i}
              selected={selected}
              state={state}
              disabled={done}
              onSelect={() => toggle(i)}
            >
              <RichText rich={option} />
            </OptionButton>
          );
        })}
      </div>
      <p className={styles.answerNote}>
        اختر جسمين فقط ({picked.length} من 2 مختار).
      </p>
    </ItemFrame>
  );
}

export function NumberItemView({
  item,
  onResult,
}: {
  item: NumberItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [value, setValue] = useState("");
  const [tried, setTried] = useState(false);
  const done = attempt.status === "correct";

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      steps={item.steps}
      note={item.answerNote}
      canCheck={value.trim().length > 0}
      onCheck={() => {
        const ok = numberAnswerMatches(value, item.answer, item.alternates);
        setTried(true);
        attempt.check(ok);
      }}
      onRetry={() => {
        attempt.retry();
        setValue("");
      }}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>
      <div className={styles.inputs} style={{ gridTemplateColumns: "minmax(0, 300px)" }}>
        <NumberField
          label="إجابتك"
          value={value}
          unit={item.unit}
          disabled={done}
          state={
            !tried ? null : attempt.status === "correct" ? "right" : attempt.status === "wrong" ? "wrong" : null
          }
          onChange={(next) => {
            setValue(next);
            if (attempt.status === "wrong") setTried(false);
          }}
          ariaLabel={`إجابة السؤال: ${item.label}`}
        />
      </div>
    </ItemFrame>
  );
}
