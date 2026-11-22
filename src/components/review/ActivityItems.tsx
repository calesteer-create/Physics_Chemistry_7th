"use client";

/**
 * الأنشطة التفاعلية للمراجعة:
 * - إكمال جدول الكتاب (خمسة أعمدة كما طُبعت).
 * - تخطيط النقاط على شبكة بيانية ثم تحديد شكل الخط.
 * - قراءة ثلاث ربيعات مدرّجة.
 * - بناء مخطط القوى بالسحب والإفلات (مع بديل اللمس ولوحة المفاتيح).
 */
import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eraser, MousePointerClick } from "lucide-react";
import type {
  DiagramItem,
  PlotItem,
  ScalesItem,
  TableItem,
} from "@/content/unit1-review";
import { AutoTex, SvgTeX } from "@/components/math/TeX";
import { RichText } from "@/components/content/RichText";
import {
  gradeDiagram,
  gradePlot,
  gradeScales,
  gradeTable,
  type Slot,
  type TableGrade,
} from "@/lib/unit1-review";
import {
  ItemFrame,
  NumberField,
  OptionButton,
  useAttempt,
} from "./ReviewPrimitives";
import styles from "./unit1-review.module.css";

/* ═══════════════ إكمال الجدول ═══════════════ */

export function TableItemView({
  item,
  onResult,
}: {
  item: TableItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const blankIndexByColumn = new Map<number, number>();
  item.columns.forEach((column, i) => {
    if (column.d === null) blankIndexByColumn.set(i, blankIndexByColumn.size);
  });
  const blankCount = blankIndexByColumn.size;

  const [interpolation, setInterpolation] = useState("");
  const [blank, setBlank] = useState<{ d: number | null; t: string }[]>(
    Array.from({ length: blankCount }, () => ({ d: null, t: "" })),
  );
  const [grade, setGrade] = useState<TableGrade | null>(null);
  const done = attempt.status === "correct";

  const complete =
    interpolation.trim().length > 0 &&
    blank.every((cell) => cell.d !== null && cell.t.trim().length > 0);

  function check() {
    const result = gradeTable(item, { interpolation, blank });
    setGrade(result);
    attempt.check(result.ok);
  }

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      steps={item.steps}
      canCheck={complete}
      onCheck={check}
      onRetry={() => {
        attempt.retry();
        setGrade(null);
      }}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.dataTable}>
          <caption className={styles.srOnly}>جدول المسافة المقطوعة والمدة الزمنية</caption>
          <tbody>
            <tr>
              <th scope="row">
                <AutoTex text="المسافة المقطوعة d (cm)" />
              </th>
              {item.columns.map((column, i) => {
                if (column.d !== null) {
                  return (
                    <td key={`d-${i}`} className={styles.cellFixed} dir="ltr">
                      {column.d}
                    </td>
                  );
                }
                const index = blankIndexByColumn.get(i) ?? 0;
                const cell = blank[index];
                const state =
                  grade && !done
                    ? grade.columnOk[index]
                      ? styles.cellOk
                      : styles.cellBad
                    : "";
                return (
                  <td key={`d-${i}`}>
                    <select
                      aria-label={`اختر المسافة للعمود ${index + 1}`}
                      className={`${styles.cellSelect} ${state}`}
                      disabled={done}
                      value={cell?.d ?? ""}
                      onChange={(e) => {
                        const value = e.target.value === "" ? null : Number(e.target.value);
                        setBlank((current) =>
                          current.map((c, j) => (j === index ? { ...c, d: value } : c)),
                        );
                        setGrade(null);
                      }}
                    >
                      <option value="">—</option>
                      {(column.dChoices ?? []).map((choice) => (
                        <option key={choice} value={choice}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </td>
                );
              })}
            </tr>
            <tr>
              <th scope="row">
                <AutoTex text="المدة الزمنية t (s)" />
              </th>
              {item.columns.map((column, i) => {
                if (column.t !== null) {
                  return (
                    <td key={`t-${i}`} className={styles.cellFixed} dir="ltr">
                      {column.t}
                    </td>
                  );
                }
                if (column.d === 5) {
                  const state =
                    grade && !done ? (grade.interpolationOk ? styles.cellOk : styles.cellBad) : "";
                  return (
                    <td key={`t-${i}`}>
                      <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        aria-label="الزمن اللازم لقطع 5 cm"
                        className={`${styles.cellInput} ${state}`}
                        value={interpolation}
                        disabled={done}
                        onChange={(e) => {
                          setInterpolation(e.target.value);
                          setGrade(null);
                        }}
                      />
                    </td>
                  );
                }
                const index = blankIndexByColumn.get(i) ?? 0;
                const cell = blank[index];
                const state =
                  grade && !done
                    ? grade.columnOk[index]
                      ? styles.cellOk
                      : styles.cellBad
                    : "";
                return (
                  <td key={`t-${i}`}>
                    <input
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      aria-label={`أدخل الزمن للعمود ${index + 1}`}
                      className={`${styles.cellInput} ${state}`}
                      value={cell?.t ?? ""}
                      disabled={done || cell?.d == null}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBlank((current) =>
                          current.map((c, j) => (j === index ? { ...c, t: value } : c)),
                        );
                        setGrade(null);
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.answerNote}>
        الأعمدة الثلاثة الفارغة في الكتاب: اختر لكل عمود قيمة مسافة من الشكل، ثم أدخل
        الزمن المقابل. الخانتان 0 و0 مطبوعتان في الكتاب.
      </p>
      {grade && !grade.ok && grade.message ? (
        <p className={styles.answerNote} role="status">
          {grade.message}
        </p>
      ) : null}
    </ItemFrame>
  );
}

/* ═══════════════ تخطيط النقاط ═══════════════ */

const GRID_MAX = 80;
const STEP = 10;

export function PlotItemView({
  item,
  onResult,
}: {
  item: PlotItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [points, setPoints] = useState<[number, number][]>([]);
  const [shape, setShape] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const done = attempt.status === "correct";

  const W = 380;
  const H = 380;
  const ML = 46;
  const MB = 42;
  const MT = 32;
  const MR = 14;
  const iw = W - ML - MR;
  const ih = H - MT - MB;
  const sx = (v: number) => ML + (v / GRID_MAX) * iw;
  const sy = (v: number) => H - MB - (v / GRID_MAX) * ih;

  function toggle(t: number, d: number) {
    if (done) return;
    setPoints((current) =>
      current.some(([a, b]) => a === t && b === d)
        ? current.filter(([a, b]) => !(a === t && b === d))
        : [...current, [t, d]],
    );
    setMessage(null);
  }

  function check() {
    const result = gradePlot(item, points, shape);
    setMessage(result.message ?? null);
    setSolved(result.ok);
    attempt.check(result.ok);
  }

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      steps={item.steps}
      canCheck={points.length > 0 && shape !== null}
      onCheck={check}
      onRetry={() => {
        attempt.retry();
        setSolved(false);
        setMessage(null);
      }}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>

      <div className={styles.plotWrap}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={styles.plot}
          role="group"
          aria-label="شبكة رسم بياني: الزمن على المحور الأفقي والمسافة على المحور الشاقولي"
        >
          <rect
            x={ML}
            y={MT}
            width={iw}
            height={ih}
            fill="#fbfcfe"
            stroke="#b9c3cf"
            strokeWidth="1.4"
          />
          {Array.from({ length: GRID_MAX / STEP + 1 }, (_, i) => i * STEP).map((v) => (
            <g key={`g-${v}`}>
              <line x1={sx(v)} y1={MT} x2={sx(v)} y2={H - MB} stroke="#e2e7ee" strokeWidth="1" />
              <line x1={ML} y1={sy(v)} x2={W - MR} y2={sy(v)} stroke="#e2e7ee" strokeWidth="1" />
              <text
                x={sx(v)}
                y={H - MB + 16}
                textAnchor="middle"
                fontSize="12.5"
                fontWeight="700"
                fill="#4b5568"
              >
                {v}
              </text>
              <text
                x={ML - 7}
                y={sy(v) + 4}
                textAnchor="end"
                fontSize="12.5"
                fontWeight="700"
                fill="#4b5568"
              >
                {v}
              </text>
            </g>
          ))}
          <line x1={ML} y1={MT} x2={ML} y2={H - MB} stroke="#33404f" strokeWidth="2" />
          <line x1={ML} y1={H - MB} x2={W - MR} y2={H - MB} stroke="#33404f" strokeWidth="2" />
          <SvgTeX
            tex="d(\mathrm{cm})"
            x={ML - 44}
            y={2}
            width={130}
            height={24}
            align="start"
            color="#33568f"
            fontSize="13px"
          />
          <SvgTeX
            tex="t(\mathrm{s})"
            x={W - MR - 74}
            y={H - 24}
            width={74}
            height={22}
            align="end"
            color="#33568f"
            fontSize="13px"
          />

          {solved && (
            <line
              x1={sx(0)}
              y1={sy(0)}
              x2={sx(GRID_MAX)}
              y2={sy(GRID_MAX)}
              stroke="#c0392b"
              strokeWidth="2.4"
              strokeDasharray="7 5"
            />
          )}

          {Array.from({ length: GRID_MAX / STEP + 1 }, (_, i) => i * STEP).flatMap((t) =>
            Array.from({ length: GRID_MAX / STEP + 1 }, (_, j) => j * STEP).map((d) => {
              const placed = points.some(([a, b]) => a === t && b === d);
              return (
                <g
                  key={`p-${t}-${d}`}
                  role="button"
                  tabIndex={done ? -1 : 0}
                  aria-label={`نقطة الزمن ${t} ثانية والمسافة ${d} سنتيمترًا${placed ? "، مختارة" : ""}`}
                  aria-pressed={placed}
                  className={styles.plotPoint}
                  onClick={() => toggle(t, d)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(t, d);
                    }
                  }}
                >
                  <circle cx={sx(t)} cy={sy(d)} r={11} fill="transparent" />
                  <circle
                    cx={sx(t)}
                    cy={sy(d)}
                    r={placed ? 5.4 : 2.6}
                    fill={placed ? "#c0392b" : "#ffffff"}
                    stroke={placed ? "#ffffff" : "#c9d2dd"}
                    strokeWidth={placed ? 1.4 : 1}
                  />
                </g>
              );
            }),
          )}
        </svg>

        <div className={styles.plotTools}>
          <span className={styles.plotCount}>
            النقاط الموضوعة: <span dir="ltr">{points.length}</span>
          </span>
          <button
            type="button"
            className={styles.ghost}
            disabled={done || points.length === 0}
            onClick={() => {
              setPoints([]);
              setMessage(null);
            }}
          >
            <Eraser className="h-4 w-4" aria-hidden="true" />
            امسح النقاط
          </button>
        </div>
        <p className={styles.answerNote}>
          <MousePointerClick className="ml-1 inline h-4 w-4" aria-hidden="true" />
          اضغط على تقاطع في الشبكة لوضع نقطة، واضغطها مرة أخرى لإزالتها.
        </p>
      </div>

      <p className={styles.itemPrompt} style={{ marginTop: 14 }}>
        <RichText rich={item.shapePrompt} />
      </p>
      <div className={styles.options} role="group" aria-label="شكل الخط البياني">
        {item.shapeOptions.map((option, i) => {
          const reveal = attempt.status !== "idle" && solved;
          const state = !reveal
            ? null
            : option.correct
              ? ("right" as const)
              : shape === i
                ? ("wrong" as const)
                : ("dim" as const);
          return (
            <OptionButton
              key={i}
              index={i}
              selected={shape === i}
              state={state}
              disabled={done}
              onSelect={() => setShape(i)}
            >
              <RichText rich={option.text} />
            </OptionButton>
          );
        })}
      </div>
      {message ? (
        <p className={styles.answerNote} role="status">
          {message}
        </p>
      ) : null}
    </ItemFrame>
  );
}

/* ═══════════════ قراءة الربيعات ═══════════════ */

export function ScalesItemView({
  item,
  onResult,
}: {
  item: ScalesItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [values, setValues] = useState<Record<string, string>>({});
  const [details, setDetails] = useState<{ key: string; ok: boolean }[] | null>(null);
  const done = attempt.status === "correct";

  const complete = item.readings.every((r) => (values[r.key] ?? "").trim().length > 0);

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      steps={item.steps}
      canCheck={complete}
      onCheck={() => {
        const result = gradeScales(item, values);
        setDetails(result.details);
        attempt.check(result.ok);
      }}
      onRetry={() => {
        attempt.retry();
        setDetails(null);
      }}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>
      <div className={styles.inputs}>
        {item.readings.map((reading) => {
          const state = details
            ? details.find((d) => d.key === reading.key)?.ok
              ? "right"
              : "wrong"
            : null;
          return (
            <NumberField
              key={reading.key}
              label={`الربيعة (${reading.key})`}
              value={values[reading.key] ?? ""}
              unit="N"
              disabled={done}
              state={details ? state : null}
              onChange={(next) => {
                setValues((current) => ({ ...current, [reading.key]: next }));
                setDetails(null);
              }}
              ariaLabel={`قراءة الربيعة ${reading.key} بالنيوتن`}
            />
          );
        })}
      </div>
      <p className={styles.answerNote}>
        يقبل الحقل الأرقام العربية أو اللاتينية، مثل ١ أو 1.
      </p>
    </ItemFrame>
  );
}

/* ═══════════════ مخطط القوى ═══════════════ */

const SLOT_LABEL: Record<Slot, string> = {
  up: "أعلى الصندوق",
  down: "أسفل الصندوق",
  right: "يمين الصندوق",
  left: "يسار الصندوق",
};

const SLOT_ARROW: Record<Slot, typeof ArrowRight> = {
  up: ArrowUp,
  down: ArrowDown,
  right: ArrowRight,
  left: ArrowLeft,
};

export function DiagramItemView({
  item,
  onResult,
}: {
  item: DiagramItem;
  onResult: (ok: boolean) => void;
}) {
  const attempt = useAttempt(onResult);
  const [placement, setPlacement] = useState<Record<string, Slot | undefined>>({});
  const [active, setActive] = useState<string | null>(null);
  const [details, setDetails] = useState<{ id: string; ok: boolean }[] | null>(null);
  const done = attempt.status === "correct";

  const placedCount = Object.keys(placement).filter((k) => placement[k]).length;
  const complete = placedCount === item.tokens.length;

  function place(slot: Slot) {
    if (done) return;
    const occupant = item.tokens.find((t) => placement[t.id] === slot);
    if (!active) {
      if (occupant) {
        setPlacement((current) => ({ ...current, [occupant.id]: undefined }));
        setDetails(null);
      }
      return;
    }
    setPlacement((current) => {
      const next = { ...current };
      if (occupant) next[occupant.id] = undefined;
      next[active] = slot;
      return next;
    });
    setActive(null);
    setDetails(null);
  }

  return (
    <ItemFrame
      label={item.label}
      source={item.source}
      status={attempt.status}
      showSolution={attempt.showSolution}
      explain={item.explain}
      hint={item.hint}
      steps={item.steps}
      canCheck={complete}
      checkLabel="تحقّق من مخطط القوى"
      onCheck={() => {
        const result = gradeDiagram(item, placement);
        setDetails(result.details);
        attempt.check(result.ok);
      }}
      onRetry={() => {
        attempt.retry();
        setDetails(null);
      }}
      onReveal={attempt.reveal}
    >
      <p className={styles.itemPrompt}>
        <RichText rich={item.prompt} />
      </p>

      <div className={styles.diagram}>
        <div className={styles.slots}>
          {(["up", "right", "left", "down"] as Slot[]).map((slot) => {
            const occupant = item.tokens.find((t) => placement[t.id] === slot);
            const Icon = SLOT_ARROW[slot];
            const detail = occupant
              ? details?.find((d) => d.id === occupant.id)
              : undefined;
            return (
              <button
                key={slot}
                type="button"
                className={`${styles.slot} ${styles[`slot${slot[0].toUpperCase()}${slot.slice(1)}`]} ${
                  occupant ? styles.slotFilled : ""
                } ${active ? styles.slotDrag : ""}`}
                style={
                  detail
                    ? {
                        borderColor: detail.ok ? "#bfdcd6" : "#f2c7c2",
                        background: detail.ok ? "#eef5f3" : "#fff1f0",
                      }
                    : undefined
                }
                aria-label={`${SLOT_LABEL[slot]}: ${occupant ? "مشغول" : "فارغ"}`}
                onClick={() => place(slot)}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id) {
                    setActive(id);
                    setTimeout(() => place(slot), 0);
                  }
                }}
              >
                <Icon className={styles.slotArrow} aria-hidden="true" />
                {occupant ? (
                  <span className={styles.slotText}>
                    <RichText rich={occupant.text} />
                  </span>
                ) : (
                  <span className={styles.slotText}>{SLOT_LABEL[slot]}</span>
                )}
              </button>
            );
          })}
          <div className={styles.box}>الصندوق</div>
        </div>

        <div className={styles.tokens}>
          {item.tokens.map((token) => {
            const used = Boolean(placement[token.id]);
            const detail = details?.find((d) => d.id === token.id);
            return (
              <button
                key={token.id}
                type="button"
                draggable={!done && !used}
                className={`${styles.token} ${active === token.id ? styles.tokenOn : ""} ${
                  used ? styles.tokenUsed : ""
                }`}
                style={
                  detail && !detail.ok ? { borderColor: "#f2c7c2", background: "#fff1f0" } : undefined
                }
                aria-pressed={active === token.id}
                disabled={done}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", token.id);
                  setActive(token.id);
                }}
                onClick={() => {
                  if (used) {
                    setPlacement((current) => ({ ...current, [token.id]: undefined }));
                    setDetails(null);
                    return;
                  }
                  setActive((current) => (current === token.id ? null : token.id));
                }}
              >
                <RichText rich={token.text} />
              </button>
            );
          })}
        </div>
        <p className={styles.tokenHint}>
          اسحب القوة إلى موضعها، أو اضغط القوة ثم اضغط الموضع. اضغط موضعًا مشغولًا أو قوة
          موضوعة لإزالتها.
        </p>
      </div>
    </ItemFrame>
  );
}
