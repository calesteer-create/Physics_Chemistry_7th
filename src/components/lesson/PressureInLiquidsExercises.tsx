"use client";

/**
 * أنشطة الكتاب (ص 71–80) وتمارين المنصة الإضافية الثمانية لدرس «الضغط في السوائل».
 *
 * - كل نشاط من الكتاب يحافظ على صياغته ومعطياته وقيمه، وله تلميح/حل بعد المحاولة.
 * - التمارين الإضافية الثمانية موسومة حرفياً «من المنصة وليست من الكتاب» ومتدرّجة.
 * - لا تُدخل هذه الأنشطة قوانين أخرى؛ مسألة السمكتين فرق ضغط بين عمقين فقط.
 * - التصحيح العلمي للضغط الجوي موسوم «من المنصة» ولا يُنسب إلى نصّ الكتاب.
 */
import { useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, FlaskConical, Lightbulb, PenLine, RotateCcw, XCircle } from "lucide-react";
import type { FigureRef, Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { Q } from "@/components/math/TeX";
import { FigureBlock } from "@/components/figures";
import { BookExercise, TrueFalseExercise } from "./BookExercise";
import { rich, liquidFigure } from "@/lib/liquid-pressure-rich";
import styles from "./PressureInLiquidsExercises.module.css";

const R = (s: string) => rich(s);

const T = {
  law: "$P = \\rho g h$",
  total: "$P_t = P_0 + \\rho g h$",
  rho: "$\\rho = \\dfrac{m}{V}$",
  D: "$D = \\dfrac{\\rho}{\\rho_{\\mathrm{H_2O}}}$",
  rhoUnit: "$\\mathrm{kg\\cdot m^{-3}}$",
  gUnit: "$\\mathrm{m\\cdot s^{-2}}$",
  Pa: "$\\mathrm{Pa}$",
  atmCorrect: "$1\\,\\mathrm{atm}=101325\\,\\mathrm{Pa}=760\\,\\mathrm{mmHg}$",
  atmPrinted: "$1\\,\\mathrm{atm}=10135\\,\\mathrm{N/m^2}=760\\,\\mathrm{mmHg}$",
  p0Approx: "$1\\times10^5\\,\\mathrm{Pa}$",
  dP: "$\\Delta P=\\rho g\\Delta h$",
} as const;

const FIG: Record<string, FigureRef> = {
  intro: liquidFigure("liq-intro", "liquid-pressure-intro", "وعاء وسد وكلمات مفتاحية", 71),
  holes: liquidFigure("liq-holes", "liquid-pressure-three-holes", "أنبوب بثلاثة ثقوب", 72),
  tools: liquidFigure("liq-tools", "liquid-pressure-manometer-tools", "أدوات المانومتر", 73),
  manometer: liquidFigure("liq-manometer", "liquid-pressure-manometer-experiment", "تجربة المانومتر", 73),
  depth: liquidFigure("liq-depth", "liquid-pressure-depth", "العمق والضغط", 74),
  density: liquidFigure("liq-density", "liquid-pressure-density", "الكأسان والكثافة", 75),
  law: liquidFigure("liq-law", "liquid-pressure-law", "قانون الضغط", 75),
  atmosphere: liquidFigure("liq-atm", "liquid-pressure-atmosphere", "الضغط الجوي", 76),
  dam: liquidFigure("liq-dam", "liquid-pressure-dam-vessels", "السد والأواني المستطرقة", 77),
  applications: liquidFigure("liq-apps", "liquid-pressure-applications", "تطبيقات الدرس", 78),
  q79: liquidFigure("liq-q79", "liquid-pressure-book-question", "ماء وزيت بارتفاع 60 سم", 79),
  graph: liquidFigure("liq-graph", "liquid-pressure-graph", "الخط البياني للضغط والعمق", 80),
};

type Source = "book" | "platform";

function Badge({ source, page, level }: { source: Source; page?: string; level?: string }) {
  return (
    <>
      <span className={`${styles.badge} ${source === "book" ? styles.badgeBook : styles.badgePlatform}`}>
        {source === "book" ? <BookOpen size={13} /> : <FlaskConical size={13} />}
        {source === "book" ? `من الكتاب${page ? ` — ${page}` : ""}` : "من المنصة وليست من الكتاب"}
      </span>
      {level && <span className={`${styles.badge} ${styles.level}`}>{level}</span>}
    </>
  );
}

function Section({ title, page, source = "book", children }: { title: string; page?: string; source?: Source; children: ReactNode }) {
  return (
    <section className={styles.section} data-source={source}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        <Badge source={source} page={page} />
      </div>
      <div className={styles.stack}>{children}</div>
    </section>
  );
}

function normalizeFill(value: string): string {
  return value.trim()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[ـ_]/g, "")
    .replace(/\s+/g, " ");
}

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

function ChoiceExercise({ number, title, question, options, correct, hint, explanation, solution, source = "book", page, level }: {
  number: string; title: string; question: Rich; options: Rich[]; correct: number;
  hint?: Rich; explanation: Rich; solution: Rich; source?: Source; page?: string; level?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const answered = selected !== null;
  const ok = selected === correct;
  const letters = ["أ", "ب", "ج", "د", "هـ"];
  return (
    <article className={styles.card} data-book-question={source === "book" ? "true" : undefined}
      data-extra-exercise={source === "platform" ? "true" : undefined} data-revealed={answered ? "true" : "false"}>
      <div className={styles.cardHead}>
        <span className={styles.num}>{number}</span>
        <div style={{ minWidth: 0 }}>
          <h4 className={styles.cardTitle}>{title}</h4>
          <div style={{ marginTop: 6 }}><Badge source={source} page={page} level={level} /></div>
        </div>
      </div>
      <div className={styles.question}><RichText rich={question} /></div>
      <div className={styles.options}>
        {options.map((opt, i) => {
          const state = !answered ? "" : i === correct ? styles.optionCorrect : i === selected ? styles.optionWrong : styles.optionDim;
          return (
            <button key={i} type="button" className={`${styles.option} ${state}`} disabled={answered}
              onClick={() => setSelected(i)} aria-pressed={selected === i}>
              <span className={styles.letter}>{letters[i]}</span>
              <span><RichText rich={opt} /></span>
              {answered && i === correct && <CheckCircle2 size={17} style={{ marginInlineStart: "auto", color: "#6ee7b7" }} />}
              {answered && i === selected && !ok && <XCircle size={17} style={{ marginInlineStart: "auto", color: "#fca5a5" }} />}
            </button>
          );
        })}
      </div>
      <div className={styles.actions}>
        {hint && <button type="button" className={`${styles.btn} ${styles.btnHint}`} onClick={() => setShowHint((v) => !v)}>
          <Lightbulb size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />تلميح
        </button>}
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!answered} onClick={() => setShowSolution(true)}>
          <PenLine size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />الحل بعد المحاولة
        </button>
        {answered && <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setSelected(null); setShowHint(false); setShowSolution(false); }}>
          <RotateCcw size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />إعادة المحاولة
        </button>}
      </div>
      {showHint && hint && <div className={styles.hint}><RichText rich={hint} /></div>}
      {answered && <div className={`${styles.feedback} ${ok ? "" : styles.feedbackWarn}`}>
        {ok ? "إجابتك صحيحة. " : "الإجابة الصحيحة معلّمة بالأخضر. "}<RichText rich={explanation} />
      </div>}
      {answered && showSolution && <div className={styles.solution}><strong>الحل المفصّل:</strong> <RichText rich={solution} /></div>}
    </article>
  );
}

function FillExercise({ number, title, parts, blanks, hint, solution, source = "book", page, level }: {
  number: string; title: string; parts: string[]; blanks: { label: string; accepted: string[] }[];
  hint?: Rich; solution: Rich; source?: Source; page?: string; level?: string;
}) {
  const [values, setValues] = useState<string[]>(blanks.map(() => ""));
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const oks = blanks.map((b, i) => b.accepted.map(normalizeFill).includes(normalizeFill(values[i] ?? "")));
  const allOk = oks.every(Boolean);
  return (
    <article className={styles.card} data-book-question={source === "book" ? "true" : undefined}
      data-extra-exercise={source === "platform" ? "true" : undefined} data-revealed={checked ? "true" : "false"}>
      <div className={styles.cardHead}>
        <span className={styles.num}>{number}</span>
        <div style={{ minWidth: 0 }}>
          <h4 className={styles.cardTitle}>{title}</h4>
          <div style={{ marginTop: 6 }}><Badge source={source} page={page} level={level} /></div>
        </div>
      </div>
      <div className={styles.fillLine}>
        {parts.map((part, i) => (
          <span key={i}>
            <RichText rich={R(part)} />
            {i < blanks.length && (
              <input className={`${styles.fillInput} ${checked ? (oks[i] ? styles.fillInputOk : styles.fillInputBad) : ""}`}
                aria-label={blanks[i].label} placeholder="........" value={values[i] ?? ""}
                onChange={(e) => { const next = [...values]; next[i] = e.target.value; setValues(next); setChecked(false); setShowSolution(false); }} />
            )}
          </span>
        ))}
      </div>
      <div className={styles.actions}>
        {hint && <button type="button" className={`${styles.btn} ${styles.btnHint}`} onClick={() => setShowHint((v) => !v)}>
          <Lightbulb size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />تلميح
        </button>}
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setChecked(true)}>
          <CheckCircle2 size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />تحقّق
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!checked} onClick={() => setShowSolution(true)}>
          <PenLine size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />الحل بعد المحاولة
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setValues(blanks.map(() => "")); setChecked(false); setShowHint(false); setShowSolution(false); }}>
          <RotateCcw size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />إعادة
        </button>
      </div>
      {showHint && hint && <div className={styles.hint}><RichText rich={hint} /></div>}
      {checked && <div className={`${styles.feedback} ${allOk ? "" : styles.feedbackWarn}`}>
        {allOk ? "جميع الفراغات صحيحة. " : `راجع الفراغ ${oks.findIndex((x) => !x) + 1}. `}
        <RichText rich={solution} />
      </div>}
      {checked && showSolution && <div className={styles.solution}><strong>الحل المفصّل:</strong> <RichText rich={solution} /></div>}
    </article>
  );
}

function NumericExercise({ number, title, question, expected, tolerance = 0.02, unit, hint, steps, source = "book", page, level }: {
  number: string; title: string; question: Rich; expected: number; tolerance?: number; unit?: string;
  hint?: Rich; steps: Rich[]; source?: Source; page?: string; level?: string;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const parsed = normalizeNumber(value);
  const ok = checked && parsed !== null && Math.abs(parsed - expected) <= tolerance;
  return (
    <article className={styles.card} data-book-question={source === "book" ? "true" : undefined}
      data-extra-exercise={source === "platform" ? "true" : undefined} data-revealed={checked ? "true" : "false"}>
      <div className={styles.cardHead}>
        <span className={styles.num}>{number}</span>
        <div style={{ minWidth: 0 }}>
          <h4 className={styles.cardTitle}>{title}</h4>
          <div style={{ marginTop: 6 }}><Badge source={source} page={page} level={level} /></div>
        </div>
      </div>
      <div className={styles.question}><RichText rich={question} /></div>
      <div className={styles.numberRow}>
        <input className={styles.numberInput} type="text" inputMode="decimal" dir="ltr" value={value}
          aria-label={`إجابة ${number}`} placeholder="أدخل العدد فقط"
          onChange={(e) => { setValue(e.target.value); setChecked(false); setShowSolution(false); }} />
        {unit && <span className={styles.unit}><Q v="" u={unit} /></span>}
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setChecked(true)}>
          <CheckCircle2 size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />تحقّق
        </button>
      </div>
      <div className={styles.actions}>
        {hint && <button type="button" className={`${styles.btn} ${styles.btnHint}`} onClick={() => setShowHint((v) => !v)}>
          <Lightbulb size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />تلميح
        </button>}
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} disabled={!checked} onClick={() => setShowSolution(true)}>
          <PenLine size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />خطوات الحل
        </button>
        <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setValue(""); setChecked(false); setShowHint(false); setShowSolution(false); }}>
          <RotateCcw size={14} style={{ verticalAlign: "middle", marginInlineEnd: 5 }} />إعادة
        </button>
      </div>
      {showHint && hint && <div className={styles.hint}><RichText rich={hint} /></div>}
      {checked && <div className={`${styles.feedback} ${ok ? "" : styles.feedbackWarn}`}>
        {ok ? "إجابتك صحيحة. " : "الإجابة الصحيحة: "}
        {!ok && <span dir="ltr"><Q v={String(expected)} u={unit} /></span>}
        {ok && " الحساب مطابق للقانون."}
      </div>}
      {checked && showSolution && <div className={styles.solution}>
        <strong>خطوات الحل:</strong>
        <ol>{steps.map((s, i) => <li key={i}><RichText rich={s} /></li>)}</ol>
      </div>}
    </article>
  );
}

/* ═════════════════════════════ أنشطة وأسئلة الكتاب ═════════════════════════════ */

export function PressureInLiquidsBookQuestions() {
  return (
    <div className={styles.wrap} data-book-questions="pressure-in-liquids" aria-label="أنشطة وأسئلة كتاب الضغط في السوائل">
      <Section title="التهيئة والاستكشاف — الصفحة 71" page="ص 71">
        <ChoiceExercise
          number="١" title="ماذا تسبّب السوائل في أوعيتها؟"
          question={R("السوائل تسبّب ضغطاً على ______ الوعاء الذي يحتوي السائل وعلى ______.")}
          options={[R("القاعدة فقط"), R("الجدران فقط"), R("القاعدة والجدران"), R("سطح السائل فقط")]}
          correct={2}
          hint={R("تذكّر أنّ ضغط السائل يؤثّر عمودياً على كلّ سطح يلامسه.")}
          explanation={R("القاعدة والجدران معاً؛ ويضغط السائل بقوة عمودية على جدران الوعاء.")}
          solution={R("من الكتاب: «السوائل تسبّب ضغطاً على قاعدة الوعاء الذي يحتوي السائل وعلى جدرانه»، و«يضغط السائل بقوة عمودية على جدران الوعاء الذي يحتويه، وتزداد هذه القوة بازدياد عمق السائل».")}
        />
        <BookExercise number="٢" title="من الكتاب — ص 71" question={R("الكلمات المفتاحية: ضغط السائل – الكتلة الحجمية – الأواني المستطرقة – المانومتر. ما أهداف الدرس الخمسة كما وردت في الصفحة 71؟")}
          hint={R("الأهداف تبدأ بـ: أشرح، أستدلّ، أقوم، أستنتج، أثمّن.")}
          solution={R("١. أشرح مفهوم الضغط في السوائل. ٢. أستدلّ على تغيّر الضغط مع العمق في السوائل. ٣. أقوم بتجارب قياس الضغط داخل سائل بواسطة مقياس ضغط السوائل (المانومتر). ٤. أستنتج مفهوم الأواني المستطرقة. ٥. أثمّن تطبيقات الضغط في الحياة.")}>
          <div className={styles.figure}><FigureBlock figure={FIG.intro} /></div>
        </BookExercise>
      </Section>

      <Section title="تجربة الأنبوب ذي الثقوب الثلاثة — الصفحة 72" page="ص 72">
        <BookExercise number="٣" title="من الكتاب — ص 72" question={R("آخذ أنبوباً زجاجياً مدرّجاً ومثقّباً بثلاثة ثقوب، لكلٍّ منها سدادة بلاستيكية؛ أغلق الثقوب بواسطة سدادات مطاطية؛ أملأ الوعاء بالماء ثم أضعه على حافة حوض تصريف ماء؛ أنزع السدادات بآن واحد. ماذا نلاحظ؟")}
          hint={R("قارن اندفاع الماء من الثقب الأعمق بالثقب الأقرب لسطح السائل.")}
          solution={R("يندفع الماء من الثقوب الثلاثة بشكل مختلف، ويكون اندفاعه من الثقب الأعمق أكثر من اندفاعه من الثقب الأقرب لسطح السائل. النتيجة: يضغط السائل بقوة عمودية على جدران الوعاء الذي يحتويه، وتزداد هذه القوة بازدياد عمق السائل. الأدوات: حقيبة ميكانيك السوائل، ماء.")}>
          <div className={styles.figure}><FigureBlock figure={FIG.holes} /></div>
        </BookExercise>
        <ChoiceExercise
          number="٤" title="أيّ ثقب يندفع ماؤه أكثر؟"
          question={R("في تجربة الأنبوب ذي الثقوب الثلاثة، أيّ ثقب يكون اندفاع الماء منه أكثر؟")}
          options={[R("الأقرب لسطح السائل"), R("الأوسط"), R("الأعمق"), R("الثلاثة بالتساوي")]}
          correct={2}
          hint={R("ربط الكتاب بين عمق السائل والقوة العمودية على الجدران.")}
          explanation={R("الأعمق؛ لأنّ القوة العمودية تزداد بازدياد عمق السائل.")}
          solution={R("الثقب الأعمق له أكبر عمق $h$، وبحسب $P=\\rho g h$ يكون ضغط السائل عنده أكبر؛ وهذا يفسّر ملاحظة الكتاب دون استنتاج سرعة مقاسة.")}
        />
      </Section>

      <Section title="تجربة المانومتر — الصفحة 73" page="ص 73">
        <FillExercise number="٥" title="أدوات تجربة المانومتر" parts={["أدوات التجربة: ", "، ", "، ", "، ", "، ", "."]}
          blanks={[
            { label: "الأداة الأولى", accepted: ["مقياس ضغط السوائل (المانومتر)", "مقياس ضغط السوائل", "المانومتر"] },
            { label: "الأداة الثانية", accepted: ["أوعية شفافة"] },
            { label: "الأداة الثالثة", accepted: ["ماء"] },
            { label: "الأداة الرابعة", accepted: ["ماء ملون"] },
            { label: "الأداة الخامسة", accepted: ["محلول ملحي"] },
          ]}
          hint={R("خمس أدوات؛ إحداها تسمّى أيضاً المانومتر.")}
          solution={R("مقياس ضغط السوائل (المانومتر)، أوعية شفافة، ماء، ماء ملون، محلول ملحي.")}
        />
        <BookExercise number="٦" title="من الكتاب — ص 73" question={R("أركّب مقياس ضغط السوائل، ثم أضع كمية من الماء الملون في أنبوب مقياس الضغط بحيث يكون على سوية أفقية واحدة في شعبتي المقياس المثبّتين على اللوح المدرّج. ثم أغمر الحفّة الضغطية وأغيّر اتجاه الغشاء وأنقلها على السوية ذاتها. ماذا يمثّل اختلاف مستوى الماء الملون؟ وماذا يبقى ثابتاً؟")}
          hint={R("فرق السويتين يدلّ على ضغط عمود الماء على الغشاء المرن للحفّة الضغطية.")}
          solution={R("اختلاف مستوى الماء الملون في شعبتي المقياس يدلّ على وجود ضغط يسبّبه عمود الماء على الغشاء المرن الذي يُغطّي علبة الحفّة الضغطية. أمّا ضغط السائل المتوازن فمتساوٍ في جميع النقاط التي تقع في مستوٍ أفقي واحد داخل السائل، ويتساوى عند النقطة الواحدة من جميع الاتجاهات؛ فتثبيت مركز الغشاء المرن وتغيير اتجاهه لا يغيّر فرق سويتي السائل الملون، ونقل الحفّة الضغطية في السوية الأفقية ذاتها لا يغيّره أيضاً.")}>
          <div className={styles.figure}><FigureBlock figure={FIG.tools} /></div>
          <div className={styles.figure}><FigureBlock figure={FIG.manometer} /></div>
        </BookExercise>
        <TrueFalseExercise number="٧" statement={R("ضغط السائل المتوازن متساوٍ في جميع النقاط التي تقع في مستوٍ أفقي واحد داخل السائل.")} isTrue correction={R("صحيح؛ هذا ما استنتجه الكتاب من تجربة المانومتر على السوية الأفقية الواحدة.")} />
        <TrueFalseExercise number="٨" statement={R("ضغط الماء المؤثِّر في نقطة بداخله يتساوى من جميع الاتجاهات.")} isTrue correction={R("صحيح؛ تغيير اتجاه الغشاء المرن لا يغيّر فرق سويتي السائل الملون.")} />
      </Section>

      <Section title="العمق والكتلة الحجمية — الصفحتان 74–75" page="ص 74–75">
        <TrueFalseExercise number="٩" statement={R("يزداد ضغط السائل المتوازن في نقطة منه بازدياد عمق النقطة $h$ عن سطح السائل وينقص بنقصان عمقها.")} isTrue correction={R("صحيح؛ العاملان المؤثّران هما عمق النقطة عن سطح السائل والكتلة الحجمية للسائل.")} />
        <BookExercise number="١٠" title="من الكتاب — ص 74" question={R("ما الكتلة الحجمية $\\rho$ وما وحدتها؟ وما الكثافة النسبية للأجسام الصلبة والسائلة؟")}
          hint={R("الكتلة الحجمية هي كتلة وحدة الحجم؛ والكثافة النسبية نسبة إلى كثافة الماء.")}
          solution={R(`الكتلة الحجمية ${T.rho} هي كتلة وحدة الحجم؛ حيث $m$ بالـ$\\mathrm{kg}$ و$V$ بالـ$\\mathrm{m^3}$ و$\\rho$ بالـ${T.rhoUnit}. والكثافة النسبية ${T.D}.`)}>
          <div className={styles.figure}><FigureBlock figure={FIG.depth} /></div>
        </BookExercise>
        <FillExercise number="١١" title="أدوات تجربة الكأسين" parts={["أدوات تجربة الكأسين: ", "، الماء، ", ". أضع في الأولى كمية من الماء، وفي الثانية كمية من محلول ملح الطعام، وأغمر الحفّة الضغطية لعمق محدّد في الأولى ثم إلى العمق ذاته في الثانية."]}
          blanks={[
            { label: "الأداة الأولى", accepted: ["كأسان زجاجيان متماثلان"] },
            { label: "الأداة الثانية", accepted: ["ملح الطعام"] },
          ]}
          hint={R("الكأسان متماثلان، والفرق بين السائلين هو الملح.")}
          solution={R("كأسان زجاجيان متماثلان، الماء، ملح الطعام. إنّ الضغط الذي يسبّبه محلول ملح الطعام أكبر من الضغط الذي يسبّبه الماء عند العمق ذاته.")}
        />
        <ChoiceExercise number="١٢" title="نتيجة تجربة الكأسين" question={R("عند العمق ذاته، أيّ ضغط أكبر؟")}
          options={[R("ضغط الماء"), R("ضغط محلول ملح الطعام"), R("متساويان"), R("لا يوجد ضغط")]} correct={1}
          hint={R("قارن الكتلة الحجمية للمحلول والماء عند ثبات العمق.")}
          explanation={R("ضغط محلول ملح الطعام أكبر؛ لأنّ كتلته الحجمية أكبر.")}
          solution={R(`يزداد ضغط السائل المتوازن في نقطة منه بازدياد الكتلة الحجمية للسائل $\\rho$؛ والقانون ${T.law}.`)} />
        <BookExercise number="١٣" title="من الكتاب — ص 75" question={R("اكتب قانون الضغط في السوائل المتوازنة وحدّد معنى كل رمز ووحدته.")}
          hint={R("القانون يربط الضغط بالكتلة الحجمية وتسارع الجاذبية والعمق.")}
          solution={R(`القانون ${T.law}؛ حيث $P$ ضغط السائل بالـ${T.Pa}، و$\\rho$ بالـ${T.rhoUnit}، و$g$ بالـ${T.gUnit}، و$h$ بالـ$\\mathrm{m}$. ليكون الضغط بالباسكال تُستعمل هذه الوحدات، وفي مسائل الدرس $g=10\\,\\mathrm{m\\cdot s^{-2}}$ حين تُعطى.`)}>
          <div className={styles.figure}><FigureBlock figure={FIG.law} /></div>
          <div className={styles.figure}><FigureBlock figure={FIG.density} /></div>
        </BookExercise>
      </Section>

      <Section title="الضغط الكلي والضغط الجوي — الصفحة 76" page="ص 76">
        <NumericExercise number="١٤" title="مثال الكتاب المحلول" question={R(`احسب قيمة الضغط الذي يسبّبه ماء كتلته الحجمية $\\rho=1000\\,\\mathrm{kg\\cdot m^{-3}}$ في نقطة على عمق $h=1.3\\,\\mathrm{m}$، باعتبار $g=10\\,\\mathrm{m\\cdot s^{-2}}$.`)} expected={13000} unit="Pa"
          hint={R(`استعمل ${T.law} ولا تُضف الضغط الجوي؛ المطلوب ضغط السائل.`)}
          steps={[R(`القانون: ${T.law}.`), R("التعويض: $P=1000\\times10\\times1.3$."), R("النتيجة: $P=13000\\,\\mathrm{Pa}$.")]} />
        <BookExercise number="١٥" title="من الكتاب — ص 76" question={R(`سطح السائل المعرّض للهواء يخضع لضغط جوي $P_0$. ما العلاقة التي تعبّر عن الضغط الكلي $P_t$؟ وما تركيب الغلاف الجوي كما ورد في الكتاب؟`)}
          hint={R("الضغط الكلي = ضغط جوي + ضغط عمود السائل؛ واحفظ spelling «التروجين» كما طُبع.")}
          solution={R(`العلاقة ${T.total}. والغلاف الجوي طبقة من الأكسجين والتروجين وغازات أخرى تحيط بالأرض؛ تؤثّر الجاذبية الأرضية على جزيئات الغازات فتشدّها نحو الأسفل، فيمتلك الغلاف الجوي وزناً، والضغط الناتج عن وزنه يُسمّى الضغط الجوي. لا نشعر به بسبب ضغط داخلي يكافئه؛ ونشعر بنقصانه على قمم الجبال أو بازدياده في المناجم العميقة.`)}>
          <div className={styles.figure}><FigureBlock figure={FIG.atmosphere} /></div>
        </BookExercise>
        <ChoiceExercise number="١٦" title="القيمة المصحّحة للضغط الجوي" question={R(`ورد في الكتاب المطبوع ${T.atmPrinted}. ما الذي اعتمدته المنصة؟`)}
          options={[R("إبقاء 10135 دون تنبيه"), R(T.atmCorrect), R("$1\\,\\mathrm{atm}=10135\\,\\mathrm{Pa}$"), R("$760\\,\\mathrm{mmHg}$ فقط")]} correct={1}
          hint={R("القيمة المطبوعة 10135 غير صحيحة؛ والتصحيح من المنصة لا يُنسب للكتاب.")}
          explanation={R(`اعتمدت المنصة ${T.atmCorrect}، مع بيان أنّ 10135 هي القيمة المطبوعة في الكتاب وأنّ التصحيح من المنصة.`)}
          solution={R(`ملاحظة تصحيح علمي من المنصة: القيمة المطبوعة في الكتاب $10135$ غير صحيحة؛ والقيمة العلمية المعتمدة ${T.atmCorrect}. هذا التصحيح من المنصة ولا يُنسب إلى نصّ الكتاب الأصلي.`)} />
        <ChoiceExercise number="١٧" title="وحدة قياس الضغط" question={R("وحدة قياس الضغط هي:")}
          options={[R("الباسكال $\\mathrm{Pa}$"), R("النيوتن $\\mathrm{N}$"), R("الراديان $\\mathrm{rad}$"), R("الجول $\\mathrm{J}$")]} correct={0}
          hint={R("وحدة الضغط ليست وحدة قوة ولا زاوية ولا طاقة.")}
          explanation={R("الباسكال $\\mathrm{Pa}$ هي وحدة الضغط.")}
          solution={R("وحدة قياس الضغط هي الباسكال $\\mathrm{Pa}$، لا النيوتن $\\mathrm{N}$ ولا الراديان $\\mathrm{rad}$ ولا الجول $\\mathrm{J}$.")} />
      </Section>

      <Section title="السدّ والأواني المستطرقة — الصفحة 77" page="ص 77">
        <ChoiceExercise number="١٨" title="لماذا يُصمَّم السدّ عريضاً من الأسفل؟" question={R("يُصمَّم جسم السدّ بحيث يكون عريضاً من الأسفل وضيقاً من الأعلى؛ لأنّ:")}
          options={[R("الضغط عند الأعلى أكبر"), R("الضغط عند الأسفل أكبر"), R("الضغط متساوٍ في كل العمق"), R("الضغط لا يتعلّق بالعمق")]} correct={1}
          hint={R(`اربط تصميم السد بـ${T.law}.`)}
          explanation={R("ضغط السائل عند أسفل الجدار كبير، وفي الأعلى أقل.")}
          solution={R("السدّ جدار عالٍ يسدّ مجرى النهر ويختزن خلفه ماءً؛ ويكون عريضاً من الأسفل ليقاوم ضغط السائل الكبير عند أسفل الجدار، بينما في الأعلى يكون الضغط أقل فيقلّ عرض الجدار.")} />
        <BookExercise number="١٩" title="من الكتاب — ص 77" question={R("ما الأواني المستطرقة؟ ولماذا يرتفع السطح الحرّ للسائل إلى المستوى الأفقي ذاته في الأوعية كافة؟")}
          hint={R("ابدأ من النقاط $A,B,C,D,E$ على سوية أفقية واحدة.")}
          solution={R(`الأواني المستطرقة مجموعة من أوعية مختلفة الأشكال مفتوحة من الأعلى وتتصل مع بعضها من الأسفل. وبما أنّ النقاط $A,B,C,D,E$ على سوية أفقية واحدة فإنّ $P_A=P_B=P_C=P_D=P_E$، و$\\rho g h_A=\\rho g h_B=\\rho g h_C=\\rho g h_D=\\rho g h_E$، إذاً $h_A=h_B=h_C=h_D=h_E$؛ فتكون سوية الماء الأفقية ذاتها في الفروع كافّة.`)}>
          <div className={styles.figure}><FigureBlock figure={FIG.dam} /></div>
        </BookExercise>
        <ChoiceExercise number="٢٠" title="سوية السائل في أوعية مختلفة" question={R("عند ملء أوعية مستطرقة بسائل ما، أين يكون السطح الحرّ؟")}
          options={[R("أعلى في الوعاء الأوسع"), R("أعلى في الفرع الأضيق"), R("المستوى الأفقي ذاته في الفروع كافّة"), R("مستويات مختلفة بحسب الشكل")]} correct={2}
          hint={R("تساوي الضغط على سوية واحدة يقود إلى تساوي الأعماق.")}
          explanation={R("المستوى الأفقي ذاته في الفروع كافّة.")}
          solution={R("عند ملئها بسائل ما يرتفع فيها السطح الحرّ للسائل إلى المستوى الأفقي ذاته في الأوعية كافة.")} />
      </Section>

      <Section title="تعلّمت وأتأمّل — الصفحة 78" page="ص 78">
        <BookExercise number="٢١" title="من الكتاب — ص 78" question={R("لخّص ما تعلّمته في «تعلّمت» عن جدران الوعاء، والنقاط الواقعة على سوية أفقية واحدة، والعاملين المؤثّرين، والعلاقة الأساسية، والكتلة الحجمية.")}
          hint={R("أربع نقاط: الجدران، السوية الأفقية، العاملان، ثم العلاقات.")}
          solution={R(`يضغط السائل على جدران الوعاء بقوة عمودية؛ وضغط السائل متساوٍ في جميع النقاط الواقعة في مستوٍ أفقي واحد؛ ويزداد بازدياد العمق والكتلة الحجمية؛ والعلاقة الأساسية في «تعلّمت» ${T.total}؛ والكتلة الحجمية ${T.rho}.`)} />
        <ChoiceExercise number="٢٢" title="أتأمّل: الأنبوب الشفاف الرفيع" question={R("أنبوب شفاف رفيع موصول من أسفل مستودع لسائل ما (ماء–مازوت) ومثبَّت شاقولياً على جدار المستودع. إلى أين يرتفع السائل في الأنبوب؟")}
          options={[R("أعلى من سوية المستودع"), R("أخفض من سوية المستودع"), R("سوية سطح السائل في المستودع نفسها"), R("لا يرتفع")]}
          correct={2}
          hint={R("المستودع والأنبوب وعاءان مستطرقان.")}
          explanation={R("إلى سوية سطح السائل في المستودع نفسها، فيُعرف بها منسوب السائل.")}
          solution={R("المستودع والأنبوب وعاءان مستطرقان؛ فيرتفع السائل في الأنبوب إلى سوية سطح السائل في المستودع نفسها، فيُعرف بها منسوب السائل.")} />
        <BookExercise number="٢٣" title="من الكتاب — ص 78" question={R("يعتمد كرسي طبيب الأسنان في رفعه على انتقال الضغط في السوائل المتوازنة؛ أبحث مع زميلي عن آلية رفع الكرسي مستعيناً بالشابكة.")}
          hint={R("هذا نشاط بحثي ورد في الكتاب؛ المطلوب الحفاظ على سياقه كما هو.")}
          solution={R("يُبقى النصّ كما ورد: نشاط بحث مع الزميل مستعيناً بالشابكة حول آلية رفع كرسي طبيب الأسنان، دون إضافة قانون جديد أو معلومة خارجية منسوبة للكتاب.")}>
          <div className={styles.figure}><FigureBlock figure={FIG.applications} /></div>
        </BookExercise>
      </Section>

      <Section title="أختبر نفسي — الصفحة 79" page="ص 79">
        <FillExercise number="٢٤" title="السؤال الأول: أملأ الفراغات الآتية بالكلمات المناسبة" parts={[
          "١. يزداد ضغط السائل المتوازن في نقطة منه بازدياد ", " وبازدياد ", ".\n٢. الأواني المستطرقة هي مجموعة ", " متصلة مع بعضها من ", " وتكون ", " من الأعلى.",
        ]} blanks={[
          { label: "الفراغ الأول", accepted: ["عمق النقطة عن سطح السائل", "العمق", "عمق النقطة"] },
          { label: "الفراغ الثاني", accepted: ["الكتلة الحجمية للسائل", "الكتلة الحجمية"] },
          { label: "الفراغ الثالث", accepted: ["أوعية مختلفة الأشكال", "أوعية"] },
          { label: "الفراغ الرابع", accepted: ["الأسفل", "من الأسفل"] },
          { label: "الفراغ الخامس", accepted: ["مفتوحة", "مفتوحة من الأعلى"] },
        ]} hint={R("العاملان من الدرس، والأواني المستطرقة: أوعية مختلفة الأشكال، متصلة من الأسفل، مفتوحة من الأعلى.")}
          solution={R("١. عمق النقطة عن سطح السائل؛ الكتلة الحجمية للسائل. ٢. أوعية مختلفة الأشكال؛ الأسفل؛ مفتوحة.")} />

        <ChoiceExercise number="٢٥/١" title="السؤال الثاني: يقلّ ضغط السائل المتوازن في نقطة منه" question={R("اختر الإجابة الصحيحة: يقلّ ضغط السائل المتوازن في نقطة منه:")}
          options={[R("بازدياد عمق النقطة عن سطح السائل"), R("بازدياد كتلة السائل"), R("بنقصان عمق النقطة عن سطح السائل"), R("بزيادة الكتلة الحجمية للسائل")]}
          correct={2} hint={R(`انظر إلى ${T.law}:$m$ مع $h$ علاقة طردية.`)}
          explanation={R("بنقصان عمق النقطة عن سطح السائل.")}
          solution={R("لأن $P=\\rho g h$؛ فنقصان $h$ عند ثبات $\\rho$ و$g$ ينقص $P$. الإجابة (ج).")} />
        <ChoiceExercise number="٢٥/٢" title="السؤال الثاني: كلما ازداد عمق السائل" question={R("اختر الإجابة الصحيحة: كلما ازداد عمق السائل:")}
          options={[R("ازداد ضغط السائل"), R("ازدادت كتلته الحجمية"), R("نقص ضغط السائل"), R("نقصت الكتلة الحجمية للسائل")]}
          correct={0} hint={R("الكتلة الحجمية للسائل نفسه لا تتغيّر بتغيّر العمق في هذا الدرس.")}
          explanation={R("ازداد ضغط السائل.")}
          solution={R("الإجابة (أ): يزداد ضغط السائل بازدياد عمقه، أمّا كتلته الحجمية فتبقى ثابتة للسائل نفسه.")} />
        <ChoiceExercise number="٢٥/٣" title="السؤال الثاني: وحدة قياس الضغط" question={R("اختر الإجابة الصحيحة: وحدة قياس الضغط:")}
          options={[R("الباسكال $\\mathrm{Pa}$"), R("النيوتن $\\mathrm{N}$"), R("الراديان $\\mathrm{rad}$"), R("الجول $\\mathrm{J}$")]}
          correct={0} hint={R("وحدة الضغط في هذا الدرس هي الباسكال.")}
          explanation={R("الباسكال $\\mathrm{Pa}$.")}
          solution={R("الإجابة (أ) الباسكال $\\mathrm{Pa}$؛ لا النيوتن ولا الراديان ولا الجول.")} />

        <BookExercise number="٢٦" title="من الكتاب — ص 79" question={R("أعطِ تفسيراً علمياً لكلٍّ ممّا يأتي:\n١. يرتدي الغوّاص بدلة خاصة للغوص تحت الماء.\n٢. لا يستطيع الغوّاص الغوص إلى أعماق كبيرة في الماء.\n٣. ضغط الماء أكبر من ضغط الزيت عند تساوي الارتفاعات.\n٤. اندفاع الماء من الثقب الأعلى أقلّ منه في الثقب الأسفل.")}
          hint={R("فسّر بزيادة الضغط مع العمق ومع الكتلة الحجمية فقط، دون إدخال قوانين أخرى.")}
          solution={R("١–٢: يزداد ضغط السائل بازدياد العمق، لذلك يُذكر في الكتاب أنّ الغوّاص يرتدي بدلة خاصة ولا يستطيع الغوص إلى أعماق كبيرة؛ ويُكتفى بهذا السياق كما ورد. ٣: عند تساوي الارتفاعات، الكتلة الحجمية للماء أكبر من الكتلة الحجمية للزيت، فضغط الماء أكبر بحسب $P=\\rho g h$. ٤: عمق الثقب الأسفل أكبر من عمق الثقب الأعلى، فضغطه واندفاع الماء منه أكبر.")}>
          <div className={styles.figure}><FigureBlock figure={FIG.q79} /></div>
        </BookExercise>
      </Section>

      <Section title="مسائل الكتاب والخط البياني — الصفحة 80" page="ص 80">
        <BookExercise number="٢٧/أ" title="من الكتاب — ص 80" question={R("تبلغ قيمة الضغط $24000\\,\\mathrm{Pa}$ في نقطة تقع على عمق $h$ من السطح الحرّ لماء البحر الذي تبلغ كتلته الحجمية $1025\\,\\mathrm{kg\\cdot m^{-3}}$، فإذا علمت أنّ قيمة تسارع الجاذبية الأرضية $g=10\\,\\mathrm{m\\cdot s^{-2}}$، المطلوب حساب: ١. عمق النقطة $h$. ٢. كتلة $3\\,\\mathrm{m^3}$ من ماء البحر.")}
          hint={R("المطلوب ضغط السائل؛ استعمل $P=\\rho g h$ للعمق، ثم $m=\\rho V$ من دروس سابقة للكتلة.")}
          solution={R("١. $h=\\dfrac{P}{\\rho g}=\\dfrac{24000}{1025\\times10}\\approx2.34\\,\\mathrm{m}$. ٢. $m=\\rho V=1025\\times3=3075\\,\\mathrm{kg}$. العلاقة $m=\\rho V$ من دروس سابقة، لا قانون جديد في هذا الدرس.")} />
        <NumericExercise number="٢٧/أ-١" title="عمق النقطة" question={R("احسب عمق النقطة $h$ من المعطيات السابقة.")} expected={2.34} tolerance={0.02} unit="m"
          hint={R("اقسم الضغط على حاصل $\\rho g$.")} steps={[R("$P=\\rho g h$ ⇒ $h=\\dfrac{P}{\\rho g}$."), R("$h=\\dfrac{24000}{1025\\times10}$."), R("$h\\approx2.34\\,\\mathrm{m}$.")]} />
        <NumericExercise number="٢٧/أ-٢" title="كتلة 3 m³ من ماء البحر" question={R("احسب كتلة $3\\,\\mathrm{m^3}$ من ماء البحر.")} expected={3075} unit="kg"
          hint={R("استعمل $m=\\rho V$ من دروس سابقة.")} steps={[R("$m=\\rho V$ (علاقة من دروس سابقة)."), R("$m=1025\\times3$."), R("$m=3075\\,\\mathrm{kg}$.")]} />

        <BookExercise number="٢٧/ب" title="من الكتاب — ص 80" question={R("يبلغ عمق نقطة من سائل متوازن $2\\,\\mathrm{m}$ وقيمة الضغط عند ذلك العمق $20000\\,\\mathrm{Pa}$، وقيمة تسارع الجاذبية الأرضية $g=10\\,\\mathrm{m\\cdot s^{-2}}$، المطلوب حساب: ١. قيمة الكتلة الحجمية للسائل. ٢. ثقل $5\\,\\mathrm{m^3}$ من هذا السائل.")}
          hint={R("للكتلة الحجمية: $\\rho=\\dfrac{P}{gh}$؛ وللثقل: $m=\\rho V$ ثم $w=mg$ من دروس سابقة.")}
          solution={R("١. $\\rho=\\dfrac{P}{gh}=\\dfrac{20000}{10\\times2}=1000\\,\\mathrm{kg\\cdot m^{-3}}$. ٢. نستعمل العلاقتين المستفادتين من دروس سابقة لا قانونين جديدين: $m=\\rho V=1000\\times5=5000\\,\\mathrm{kg}$، ثم $w=mg=5000\\times10=50000\\,\\mathrm{N}$.")} />
        <NumericExercise number="٢٧/ب-١" title="الكتلة الحجمية" question={R("احسب قيمة الكتلة الحجمية للسائل.")} expected={1000} unit="kg·m⁻³"
          hint={R("$\\rho=P/(gh)$.")} steps={[R("$\\rho=\\dfrac{P}{gh}$."), R("$\\rho=\\dfrac{20000}{10\\times2}$."), R("$\\rho=1000\\,\\mathrm{kg\\cdot m^{-3}}$.")]} />
        <NumericExercise number="٢٧/ب-٢" title="ثقل 5 m³" question={R("احسب ثقل $5\\,\\mathrm{m^3}$ من هذا السائل.")} expected={50000} unit="N"
          hint={R("احسب الكتلة أولاً ثم الثقل؛ العلاقتان من دروس سابقة.")} steps={[R("$m=\\rho V=1000\\times5=5000\\,\\mathrm{kg}$."), R("$w=mg=5000\\times10$."), R("$w=50000\\,\\mathrm{N}$.")]} />

        <BookExercise number="٢٧/ج" title="من الكتاب — ص 80" question={R("تسبح سمكتان الأولى على عمق $6\\,\\mathrm{m}$ والثانية على عمق $5\\,\\mathrm{m}$ في ماء كتلته الحجمية $1100\\,\\mathrm{kg\\cdot m^{-3}}$، فإذا علمت أنّ قيمة تسارع الجاذبية الأرضية $g=10\\,\\mathrm{m\\cdot s^{-2}}$، احسب فرق الضغط المطبّق على السمكتين.")}
          hint={R("المسألة فرق ضغط بين عمقين فقط: $\\Delta h=1\\,\\mathrm{m}$.")}
          solution={R("تُعالَج بوصفها فرق ضغط بين عمقين فقط: $\\Delta P=\\rho g\\Delta h=1100\\times10\\times1=11000\\,\\mathrm{Pa}$. لا تُستعمل هنا قوانين أخرى.")} />
        <NumericExercise number="٢٧/ج-١" title="فرق الضغط بين العمقين" question={R("احسب فرق الضغط المطبّق على السمكتين.")} expected={11000} unit="Pa"
          hint={R("$\\Delta h=6-5=1\\,\\mathrm{m}$.")} steps={[R("$\\Delta h=1\\,\\mathrm{m}$."), R("$\\Delta P=\\rho g\\Delta h$."), R("$\\Delta P=1100\\times10\\times1=11000\\,\\mathrm{Pa}$.")]} />

        <BookExercise number="٢٨" title="من الكتاب — ص 80" question={R("ادرس الخط البياني ثم أجب عن الأسئلة الآتية:\n١. ما العلاقة بين الضغط في السائل وعمقه؟\n٢. اكتب العلاقة الرياضية المعبّرة عن قانون الضغط.\n٣. علّل عدم مرور الخط البياني من المبدأ.\n٤. استنتج قيمة الضغط الجوي على سطح السائل.")}
          hint={R("المحور الأفقي مكتوب في رسم الكتاب بالرمز $\\mathrm{m}$، والمقصود العمق $h$ بالمتر؛ وهذا توضيح من المنصة.")}
          solution={R(`١. العلاقة طردية خطية. ٢. قانون ضغط السائل ${T.law}، والضغط الكلي ${T.total}. ٣. لا يمرّ الخط من المبدأ لأنّ سطح السائل يخضع للضغط الجوي $P_0$. ٤. من تقاطع الخط مع محور الضغط ${T.p0Approx} كما في رسم الكتاب (قيمة تقريبية)، والقيمة العلمية المصحّحة المعتمدة في المنصة $101325\\,\\mathrm{Pa}$. المحور الأفقي يمثّل العمق $h$ بالمتر، وهو مكتوب في رسم الكتاب بالرمز $\\mathrm{m}$، وشكل الرسم محفوظ كما ورد في الكتاب.`)}>
          <div className={styles.figure}><FigureBlock figure={FIG.graph} /></div>
        </BookExercise>
      </Section>
    </div>
  );
}

/* ═════════════════════════════ ٨ تمارين إضافية من المنصة ═════════════════════════════ */

export function PressureInLiquidsExtraExercises() {
  return (
    <div className={styles.wrap} data-extra-count="8" aria-label="ثمانية تمارين إضافية من المنصة">
      <p className={styles.platformNotice}>من المنصة وليست من الكتاب — ثمانية تمارين متدرّجة (٣ أساسية، ٣ متوسطة، ٢ متقدّمة)، تظهر التغذية الراجعة والحل بعد المحاولة فقط.</p>

      <Section title="تمارين المنصة الإضافية" source="platform">
        <ChoiceExercise source="platform" level="أساسي ١" number="١" title="قانون ضغط السائل"
          question={R(`أيّ علاقة تعبّر عن ضغط السائل وحده في نقطة على عمق $h$؟`)}
          options={[R(T.law), R(T.total), R("$P=\\rho g/h$"), R("$P=P_0-\\rho g h$")]} correct={0}
          hint={R("المطلوب ضغط السائل فقط، لا الضغط الكلي.")}
          explanation={R(`${T.law} هو قانون ضغط السائل؛ أمّا ${T.total} فللضغط الكلي.`)}
          solution={R(`مسائل الكتاب التي تطلب ضغط السائل تُحل بـ${T.law} وحده، ولا يُضاف $P_0$ إلا عند طلب الضغط الكلي.`)} />
        <ChoiceExercise source="platform" level="أساسي ٢" number="٢" title="اتجاه ضغط السائل"
          question={R("عند نقطة داخل سائل متوازن، كيف يكون الضغط؟")}
          options={[R("من الأعلى فقط"), R("من الأسفل فقط"), R("متساوٍ من جميع الاتجاهات"), R("يختفي عند السوية الأفقية")]} correct={2}
          hint={R("تجربة المانومتر: تدوير الغشاء لا يغيّر فرق السويتين.")}
          explanation={R("ضغط الماء المؤثِّر في نقطة بداخله يتساوى من جميع الاتجاهات.")}
          solution={R("ثبت في تجربة المانومتر أنّ ضغط السائل عند النقطة الواحدة متساوٍ من جميع الاتجاهات، ومتساوٍ كذلك في جميع نقاط مستوٍ أفقي واحد.")} />
        <NumericExercise source="platform" level="أساسي ٣" number="٣" title="حساب ضغط السائل"
          question={R(`احسب $P$ لسائل كتلته الحجمية $1000\\,\\mathrm{kg\\cdot m^{-3}}$ عند عمق $0.8\\,\\mathrm{m}$، إذا كان $g=10\\,\\mathrm{m\\cdot s^{-2}}$.`)}
          expected={8000} unit="Pa" hint={R("عوّض مباشرة في $P=\\rho g h$.")}
          steps={[R("$P=\\rho g h$."), R("$P=1000\\times10\\times0.8$."), R("$P=8000\\,\\mathrm{Pa}$.")]} />
        <ChoiceExercise source="platform" level="متوسط ٤" number="٤" title="قراءة محور الرسم البياني"
          question={R("في رسم الكتاب للضغط الكلي بدلالة العمق، ماذا يمثّل المحور الأفقي المكتوب عليه $\\mathrm{m}$؟")}
          options={[R("الكتلة الحجمية"), R("العمق $h$ بالمتر"), R("الضغط الجوي"), R("مساحة السطح")]} correct={1}
          hint={R("هذا توضيح من المنصة لرمز المحور، مع الحفاظ على شكل الرسم.")}
          explanation={R("يمثّل العمق $h$ بالمتر؛ وهو مكتوب في رسم الكتاب بالرمز $\\mathrm{m}$.")}
          solution={R("المحور الأفقي يمثّل العمق $h$ بالمتر، والمحور الشاقولي يمثّل الضغط بالـ$\\mathrm{Pa}$؛ وشكل الرسم محفوظ كما ورد في الكتاب.")} />
        <NumericExercise source="platform" level="متوسط ٥" number="٥" title="استنتاج العمق"
          question={R(`إذا كان ضغط السائل $15000\\,\\mathrm{Pa}$، و$\\rho=1000\\,\\mathrm{kg\\cdot m^{-3}}$، و$g=10\\,\\mathrm{m\\cdot s^{-2}}$، فما العمق $h$؟`)}
          expected={1.5} unit="m" hint={R("من $P=\\rho g h$ نحصل على $h=P/(\\rho g)$.")}
          steps={[R("$h=\\dfrac{P}{\\rho g}$."), R("$h=\\dfrac{15000}{1000\\times10}$."), R("$h=1.5\\,\\mathrm{m}$.")]} />
        <ChoiceExercise source="platform" level="متوسط ٦" number="٦" title="ترتيب خطوات تجربة المانومتر"
          question={R("اختر الترتيب الصحيح لخطوات تجربة المانومتر كما وردت:")}
          options={[
            R("نزع السدادات ← ملء الوعاء ← تركيب المقياس ← قراءة الفرق"),
            R("تركيب المقياس ← وضع الماء الملون على سوية واحدة ← غمر الحفّة ← ملاحظة فرق السويتين"),
            R("غمر الحفّة ← تفريغ المقياس ← تدوير الوعاء ← إضافة الملح"),
            R("وزن السائل ← حساب الثقل ← رسم الخط البياني ← قراءة الضغط"),
          ]} correct={1}
          hint={R("ابدأ بتركيب المقياس ثم ضبط الماء الملون في الشعبتين.")}
          explanation={R("الترتيب الثاني يطابق خطوات الكتاب: تركيب، ضبط سوية، غمر الحفّة، ملاحظة الفرق.")}
          solution={R("يُركَّب مقياس ضغط السوائل، ثم يُوضع الماء الملون على سوية أفقية واحدة في الشعبتين، ثم تُغمر الحفّة الضغطية، ثم يُلاحظ اختلاف مستوى الماء الملون الدالّ على الضغط.")} />
        <NumericExercise source="platform" level="متقدم ٧" number="٧" title="فرق ضغط بين عمقين"
          question={R(`في ماء كتلته الحجمية $1000\\,\\mathrm{kg\\cdot m^{-3}}$ و$g=10\\,\\mathrm{m\\cdot s^{-2}}$، احسب فرق الضغط بين عمقين $3\\,\\mathrm{m}$ و$1.2\\,\\mathrm{m}$.`)}
          expected={18000} unit="Pa" hint={R("الفرق $\\Delta P=\\rho g\\Delta h$، و$\\Delta h=1.8\\,\\mathrm{m}$.")}
          steps={[R("$\\Delta h=3-1.2=1.8\\,\\mathrm{m}$."), R("$\\Delta P=\\rho g\\Delta h$."), R("$\\Delta P=1000\\times10\\times1.8=18000\\,\\mathrm{Pa}$.")]} />
        <ChoiceExercise source="platform" level="متقدم ٨" number="٨" title="تمييز القانونين والقيمة المصحّحة"
          question={R("أيّ مجموعة عبارات صحيحة كلّها؟")}
          options={[
            R(`${T.law} لضغط السائل، و${T.total} للضغط الكلي، و${T.atmCorrect}`),
            R(`${T.total} لضغط السائل، و${T.law} للضغط الكلي، والقيمة المطبوعة $10135$ صحيحة`),
            R("$P=\\rho g h$ للضغط الكلي، ولا تصحيح للضغط الجوي"),
            R("$P_t=P_0-\\rho g h$، و$1\\,\\mathrm{atm}=10135\\,\\mathrm{Pa}$"),
          ]} correct={0}
          hint={R("افصل بين ضغط السائل والضغط الكلي، وتذكّر أنّ التصحيح من المنصة.")}
          explanation={R("المجموعة الأولى فقط تجمع القانونين الصحيحين والقيمة العلمية المصحّحة.")}
          solution={R(`ضغط السائل ${T.law}، والضغط الكلي ${T.total}؛ والقيمة العلمية المعتمدة ${T.atmCorrect} مع بيان أنّ $10135$ هي القيمة المطبوعة في الكتاب وأنّ التصحيح من المنصة ولا يُنسب إلى نصّه الأصلي.`)} />
      </Section>
    </div>
  );
}
