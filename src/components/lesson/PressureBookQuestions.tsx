"use client";

import { useState } from "react";
import { CheckCircle2, PenLine, XCircle } from "lucide-react";
import type { Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { BookExercise } from "./BookExercise";
import { PressureApplicationsFigure, PressureBlockWeightFigure } from "@/components/figures/pressure-figures";

/* ═══════════════ إكمال فراغات تفاعلي (السؤال الأول — ص 69) ═══════════════ */

function normalizeFill(value: string): string {
  return value
    .trim()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

function FillStatement({ number, before, between, after, accepted1, accepted2, explain }: {
  number: string;
  before: string;
  between: string;
  after: string;
  accepted1: string[];
  accepted2: string[];
  explain: Rich;
}) {
  const [v1, setV1] = useState("");
  const [v2, setV2] = useState("");
  const [checked, setChecked] = useState(false);
  const ok1 = accepted1.map(normalizeFill).includes(normalizeFill(v1));
  const ok2 = accepted2.map(normalizeFill).includes(normalizeFill(v2));
  const allOk = ok1 && ok2;

  const inputCls = (ok: boolean) =>
    `mx-1 inline-block w-36 rounded-lg border-2 px-2.5 py-1.5 text-center text-[14px] font-black outline-none transition-colors ${
      !checked
        ? "border-[rgba(60,224,244,0.35)] bg-[rgba(6,14,30,0.35)] text-white"
        : ok
          ? "border-[rgba(52,211,153,0.55)] bg-[rgba(52,211,153,0.12)] text-[#12645d]"
          : "border-[rgba(248,113,113,0.55)] bg-[rgba(248,113,113,0.1)] text-[#b42318]"
    }`;

  return (
    <div className="card p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-[rgba(60,224,244,0.35)] bg-[rgba(60,224,244,0.1)] text-[13px] font-black text-[#26406e]">{number}</span>
        <div className="flex-1">
          <p className="text-[15px] font-bold leading-10 text-white">
            {before}
            <input aria-label={`الفراغ الأول في العبارة ${number}`} className={inputCls(ok1)} value={v1} onChange={(e) => { setV1(e.target.value); setChecked(false); }} placeholder="........" />
            {between}
            <input aria-label={`الفراغ الثاني في العبارة ${number}`} className={inputCls(ok2)} value={v2} onChange={(e) => { setV2(e.target.value); setChecked(false); }} placeholder="........" />
            {after}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button type="button" onClick={() => setChecked(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#33568f] px-4 text-[13px] font-black text-white hover:bg-[#27436f]">
              <PenLine className="h-4 w-4" /> تحقّق من إجابتي
            </button>
            {checked && (
              <span className={`inline-flex items-center gap-1.5 text-[13px] font-black ${allOk ? "text-[#12645d]" : "text-[#b42318]"}`}>
                {allOk ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
                {allOk ? "صحيحة بالكامل" : `راجع الفراغ ${!ok1 ? "الأول" : "الثاني"}`}
              </span>
            )}
          </div>
          {checked && (
            <div className="mt-3 rounded-xl border border-[rgba(60,224,244,0.25)] bg-[rgba(60,224,244,0.06)] px-4 py-3 text-[13.5px] font-bold leading-8 text-[#26406e]">
              <RichText rich={explain} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════ خريطة المفاهيم التفاعلية (السؤال الرابع — ص 70) ═══════════════ */

const FACTOR_OPTIONS = ["", "شدة القوة الضاغطة", "مساحة السطح", "كتلة الجسم"];

function ConceptMapCheck() {
  const [unit, setUnit] = useState("");
  const [factor1, setFactor1] = useState("");
  const [factor2, setFactor2] = useState("");
  const [checked, setChecked] = useState(false);
  const unitOk = unit === "الباسكال";
  const factorsOk =
    factor1 !== factor2 &&
    [factor1, factor2].includes("شدة القوة الضاغطة") &&
    [factor1, factor2].includes("مساحة السطح");
  const allOk = unitOk && factorsOk;

  const selectCls = (ok: boolean, filled: boolean) =>
    `min-h-11 w-full rounded-xl border-2 bg-white px-3 text-[14px] font-black text-[#1a2438] outline-none ${
      !checked ? "border-[#c9cfd8]" : ok ? "border-[#34d399]" : filled ? "border-[#f87171]" : "border-[#c9cfd8]"
    }`;

  return (
    <div className="card p-5">
      <p className="text-[15px] font-bold leading-8 text-white">أتمم خريطة المفاهيم الآتية باختيار الكلمة المناسبة في كل فراغ:</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <label className="block text-[13px] font-black text-[#26406e]">
          الضغط ← وحدة قياسه الدولية
          <select aria-label="وحدة قياس الضغط الدولية" className={`mt-2 ${selectCls(unitOk, unit !== "")}`} value={unit} onChange={(e) => { setUnit(e.target.value); setChecked(false); }}>
            <option value="">اختر الوحدة...</option>
            <option value="الباسكال">الباسكال</option>
            <option value="النيوتن">النيوتن</option>
            <option value="المتر المربع">المتر المربع</option>
          </select>
        </label>
        <label className="block text-[13px] font-black text-[#26406e]">
          الضغط يتعلّق بـ (العامل الأول)
          <select aria-label="العامل الأول للضغط" className={`mt-2 ${selectCls(factorsOk, factor1 !== "")}`} value={factor1} onChange={(e) => { setFactor1(e.target.value); setChecked(false); }}>
            <option value="">اختر العامل...</option>
            {FACTOR_OPTIONS.slice(1).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="block text-[13px] font-black text-[#26406e]">
          الضغط يتعلّق بـ (العامل الثاني)
          <select aria-label="العامل الثاني للضغط" className={`mt-2 ${selectCls(factorsOk, factor2 !== "")}`} value={factor2} onChange={(e) => { setFactor2(e.target.value); setChecked(false); }}>
            <option value="">اختر العامل...</option>
            {FACTOR_OPTIONS.slice(1).map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="button" onClick={() => setChecked(true)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#33568f] px-4 text-[13px] font-black text-white hover:bg-[#27436f]">
          <PenLine className="h-4 w-4" /> تحقّق من الخريطة
        </button>
        {checked && (
          <span className={`inline-flex items-center gap-1.5 text-[13px] font-black ${allOk ? "text-[#12645d]" : "text-[#b42318]"}`}>
            {allOk ? <CheckCircle2 className="h-4.5 w-4.5" /> : <XCircle className="h-4.5 w-4.5" />}
            {allOk ? "خريطة مكتملة صحيحة" : "ما تزال هناك فراغات غير صحيحة"}
          </span>
        )}
      </div>
      {checked && (
        <div className="mt-3 rounded-xl border border-[rgba(60,224,244,0.25)] bg-[rgba(60,224,244,0.06)] px-4 py-3 text-[13.5px] font-bold leading-8 text-[#26406e]">
          الوحدة الدولية للضغط هي الباسكال، أما النيوتن فوحدة القوة والمتر المربع فوحدة المساحة.
          والعاملان هما شدة القوة الضاغطة (طردًا) ومساحة السطح (عكسًا)؛ الكتلة وحدها لا تحدد الضغط ما لم تتحول إلى قوة ضاغطة وتتوزع على مساحة.
        </div>
      )}
    </div>
  );
}

/* ═══════════════ أسئلة الكتاب كاملة (ص 67–70) ═══════════════ */

export function PressureBookQuestions() {
  return (
    <div className="space-y-7">
      <section aria-labelledby="pressure-book-explain67">
        <h3 id="pressure-book-explain67" className="mb-4 text-lg font-black text-[var(--color-chem)]">أعطِ تفسيرًا علميًا (الصفحة 67)</h3>
        <BookExercise number="1" title="المسمار واللوح الخشبي" color="phys" accent="#23608f"
          question={[{ t: "يُدخل النجّار المسمار من طرفه الحاد في اللوح الخشبي. أعطِ تفسيرًا علميًا لذلك." }]}
          hint={[{ t: "قارن مساحة الطرف الحاد بمساحة الطرف العريض عند قوة الطرق نفسها." }]}
          solution={[{ t: "مساحة سطح الطرف الحاد صغيرة جدًا؛ فعند تأثير قوة الطرق نفسها يكون الضغط " }, { tex: "P=F/s" }, { t: " كبيرًا لأن " }, { tex: "s" }, { t: " صغيرة، فيخترق المسمار الخشب بسهولة. أما الطرف العريض فمساحته أكبر فيكون الضغط أصغر ولا يخترق بسهولة." }]} />
      </section>

      <section aria-labelledby="pressure-book-self68">
        <h3 id="pressure-book-self68" className="mb-4 text-lg font-black text-[var(--color-chem)]">أختبر نفسي (الصفحة 68)</h3>
        <div className="space-y-4">
          <BookExercise number="1" title="جسم على سطح أفقي" color="phys" accent="#23608f"
            question={[{ t: "جسم كتلته " }, { tex: "m=5\\,\\text{kg}" }, { t: "، يستند إلى سطح أفقي مساحته " }, { tex: "s=0.01\\,\\text{m}^2" }, { t: ". احسب الضغط الذي يؤثّر به الجسم على السطح الأفقي، علمًا أنّ " }, { tex: "g=10\\,\\text{m.s}^{-2}" }, { t: "." }]}
            hint={[{ t: "ابدأ بحساب شدة الثقل؛ فهي شدة القوة الضاغطة هنا." }]}
            solution={[{ t: "شدة القوة الضاغطة هي شدة الثقل: " }, { tex: "F=mg=5\\times10=50\\,\\text{N}" }, { t: ".\nثم نطبق قانون الضغط: " }, { tex: "P=\\dfrac{F}{s}=\\dfrac{50}{0.01}=5000\\,\\text{Pa}" }, { t: "." }]}>
            <PressureBlockWeightFigure />
          </BookExercise>
          <BookExercise number="2" title="أتأمّل: السيارة والبالونات" color="gold" accent="#8a5a00"
            question={[{ t: "تستطيع السيارة أن تقف على عدّة بالونات مملوءة بالهواء. فسّر ذلك." }]}
            hint={[{ t: "فكّر في توزّع ثقل السيارة على البالونات كلها وعلى ما يحدث لمساحة تماسّ البالون الواحد." }]}
            solution={[{ t: "يتوزّع ثقل السيارة على عدّة بالونات، ويزداد سطح تماسّ كل بالون مع الأرض والسيارة عند استنادها إليه؛ فتكون المساحة الكلية التي يتوزّع عليها الثقل كبيرة، فيقلّ الضغط المؤثّر في كل بالون فلا ينفجر." }]} />
        </div>
      </section>

      <section aria-labelledby="pressure-book-fill">
        <h3 id="pressure-book-fill" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الأول — املأ الفراغات بالكلمات المناسبة (الصفحة 69)</h3>
        <div className="space-y-4">
          <FillStatement number="1"
            before="الضغط هو القوة المؤثّرة "
            between=" على وحدة المساحة من "
            after=" الذي تؤثّر فيه."
            accepted1={["عموديا", "عمودياً"]}
            accepted2={["السطح"]}
            explain={[{ t: "التعريف كاملًا: الضغط هو القوة المؤثّرة " }, { tex: "\\text{عموديًا}" }, { t: " على وحدة المساحة من السطح الذي تؤثّر فيه؛ الاتجاه العمودي جزء من التعريف، والسطح هو الذي تتوزّع عليه القوة." }]} />
          <FillStatement number="2"
            before="يزداد الضغط "
            between=" شدّة القوة الضاغطة، وينقص بازدياد "
            after="."
            accepted1={["بازدياد", "بزيادة"]}
            accepted2={["مساحة السطح", "المساحة", "مساحة سطح التماس"]}
            explain={[{ t: "العلاقة طردية مع شدة القوة الضاغطة وعكسية مع مساحة السطح: " }, { tex: "P=F/s" }, { t: "؛ فتكبير البسط يكبّر الضغط، وتكبير المقام يصغّره." }]} />
        </div>
      </section>

      <section aria-labelledby="pressure-book-explain69">
        <h3 id="pressure-book-explain69" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الثاني — أعطِ تفسيرًا علميًا لكلّ مما يأتي (الصفحة 69)</h3>
        <div className="card mb-4 overflow-hidden">
          <div className="flex justify-center bg-[rgba(6,14,30,0.45)] px-6 py-6">
            <PressureApplicationsFigure />
          </div>
        </div>
        <div className="space-y-4">
          <BookExercise number="1" title="الجمال في الصحراء" color="phys" accent="#23608f"
            question={[{ t: "تسير الجمال في الصحراء ولا يغوص خفّها في الرمال رغم ثقلها." }]}
            hint={[{ t: "ما الذي يعوّض كبر ثقل الجمل؟ انظر إلى خفّه." }]}
            solution={[{ t: "خفّ الجمل واسع وعريض، فتتوزّع شدّة ثقله على مساحة كبيرة؛ فيكون الضغط على الرمل صغيرًا رغم كبر الثقل، فلا يغوص خفّه." }]} />
          <BookExercise number="2" title="إطارات سيارات النقل الثقيلة" color="phys" accent="#23608f"
            question={[{ t: "تكون إطارات سيارات النقل الثقيلة عريضة، وعددها كبير." }]}
            hint={[{ t: "ما المساحة الكلية التي يتوزّع عليها ثقل السيارة وحمولتها؟" }]}
            solution={[{ t: "عرض الإطارات وكثرة عددها يجعلان مساحة التماس الكلية مع الطريق كبيرة؛ فتتوزّع شدّة ثقل السيارة وحمولتها على هذه المساحة فيقلّ الضغط على الطريق، فلا تغوص الإطارات ولا يتضرر الطريق بسرعة." }]} />
          <BookExercise number="3" title="أربطة الجروح العريضة" color="phys" accent="#23608f"
            question={[{ t: "تُربط الجروح بأربطة عريضة." }]}
            hint={[{ t: "قارن أثر الرباط العريض بأثر خيط رفيع يشدّ بقوة الشدّ نفسها." }]}
            solution={[{ t: "الرباط العريض يوزّع قوة شدّه على مساحة أكبر من الجلد حول الجرح، فيقلّ الضغط على موضع الجرح؛ فيثبّت الرباط الجرح دون أن يؤلمه أو يضغط عليه بشدة كما يفعل الرباط الرفيع." }]} />
          <BookExercise number="4" title="حقيبة بحزام من سلك رفيع" color="phys" accent="#23608f"
            question={[{ t: "تجد صعوبة في حمل حقيبتك المدرسية التي لها حزام مصنوع من سلك رفيع وقوي." }]}
            hint={[{ t: "أين تتركّز شدة ثقل الحقيبة على يدك أو كتفك؟" }]}
            solution={[{ t: "مساحة تماسّ السلك الرفيع مع اليد أو الكتف صغيرة جدًا؛ فتتركّز شدّة ثقل الحقيبة عليها ويكون الضغط كبيرًا، فيؤلم موضع الحمل ويصعب حمل الحقيبة مدة طويلة. الحزام العريض يوزّع الثقل نفسه على مساحة أكبر فيقلّ الضغط." }]} />
        </div>
      </section>

      <section aria-labelledby="pressure-book-problems">
        <h3 id="pressure-book-problems" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الثالث — حلّ المسائل الآتية (الصفحتان 69–70)</h3>
        <div className="space-y-4">
          <BookExercise number="1" title="المسألة الأولى: حجر على أرض أفقية" color="phys" accent="#0f6b52"
            question={[{ t: "يستند حجر إلى أرض أفقية بقاعدة مساحتها " }, { tex: "s=1.6\\,\\text{m}^2" }, { t: "، فيكون ضغطه عليها " }, { tex: "P=3000\\,\\text{Pa}" }, { t: ". احسب: ١) شدّة القوة الضاغطة على الأرض الأفقية. ٢) كتلة الحجر، باعتبار " }, { tex: "g=10\\,\\text{m.s}^{-2}" }, { t: "." }]}
            hint={[{ t: "من " }, { tex: "P=F/s" }, { t: " استنتج " }, { tex: "F" }, { t: "، ثم اربطها بالكتلة عبر الثقل." }]}
            solution={[{ t: "١) من قانون الضغط: " }, { tex: "F=P\\,s=3000\\times1.6=4800\\,\\text{N}" }, { t: ".\n٢) القوة الضاغطة هي ثقل الحجر: " }, { tex: "F=mg" }, { t: "، إذن " }, { tex: "m=\\dfrac{F}{g}=\\dfrac{4800}{10}=480\\,\\text{kg}" }, { t: "." }]} />
          <BookExercise number="2" title="المسألة الثانية: جسم شدة ثقله 500 N" color="phys" accent="#0f6b52"
            question={[{ t: "جسم شدّة ثقله " }, { tex: "w=500\\,\\text{N}" }, { t: " يستند إلى سطح أفقي مساحته " }, { tex: "s" }, { t: "، فيؤثّر عليه بضغط قدره " }, { tex: "50\\,\\text{Pa}" }, { t: ". احسب: ١) كتلة الجسم، باعتبار تسارع الجاذبية الأرضية " }, { tex: "g=10\\,\\text{m.s}^{-2}" }, { t: ". ٢) مساحة السطح الأفقي " }, { tex: "s" }, { t: "." }]}
            hint={[{ t: "الكتلة من الثقل مباشرة، والمساحة من إعادة ترتيب قانون الضغط." }]}
            solution={[{ t: "١) " }, { tex: "m=\\dfrac{w}{g}=\\dfrac{500}{10}=50\\,\\text{kg}" }, { t: ".\n٢) القوة الضاغطة هي الثقل " }, { tex: "F=500\\,\\text{N}" }, { t: "، ومن " }, { tex: "P=F/s" }, { t: " نحصل على " }, { tex: "s=\\dfrac{F}{P}=\\dfrac{500}{50}=10\\,\\text{m}^2" }, { t: "." }]} />
          <BookExercise number="3" title="المسألة الثالثة: شدة ثقل الحجر" color="phys" accent="#0f6b52"
            question={[{ t: "يستند حجر على أرض أفقية، مساحة سطح الحجر الملامس للأرض " }, { tex: "1.2\\,\\text{m}^2" }, { t: "، فتكون قيمة الضغط المؤثّر على الأرض " }, { tex: "P=4000\\,\\text{Pa}" }, { t: ". احسب شدّة ثقل الحجر." }]}
            hint={[{ t: "شدة الثقل هي نفسها شدة القوة الضاغطة على الأرض." }]}
            solution={[{ t: "من قانون الضغط: " }, { tex: "F=P\\,s=4000\\times1.2=4800\\,\\text{N}" }, { t: ".\nوهذه هي شدّة ثقل الحجر، لأنّه يستند بثقله إلى الأرض الأفقية." }]} />
        </div>
      </section>

      <section aria-labelledby="pressure-book-map">
        <h3 id="pressure-book-map" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الرابع — أتمم خريطة المفاهيم الآتية (الصفحة 70)</h3>
        <ConceptMapCheck />
      </section>
    </div>
  );
}
