"use client";

import { useState, type ReactNode } from "react";
import { CheckCircle2, ChevronDown, Eye, Lightbulb, XCircle } from "lucide-react";
import { TeX } from "@/components/math/TeX";
import { HangingBallForcesDiagram, ForceScaleDrawing } from "@/components/figures/force-figures";

/* ─── atom: بطاقة سؤال بزر إظهار الحل ─── */
function QuestionCard({
  number, title, type, question, answer, children,
}: {
  number: string; title: string; type: string;
  question: ReactNode; answer: ReactNode; children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const typePalette: Record<string, { bg: string; border: string; text: string }> = {
    "اختيار": { bg: "rgba(37,99,235,0.08)", border: "rgba(37,99,235,0.3)", text: "#1d4ed8" },
    "تفسير": { bg: "rgba(5,150,105,0.08)", border: "rgba(5,150,105,0.3)", text: "#065f46" },
    "رسم": { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.3)", text: "#5b21b6" },
    "مسألة": { bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.3)", text: "#991b1b" },
  };
  const p = typePalette[type] ?? typePalette["اختيار"];

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: p.border, background: p.bg }}>
      <div className="px-5 pt-5 pb-3">
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl text-[14px] font-black text-white"
            style={{ background: p.text }}>{number}</span>
          <span className="rounded-full px-3 py-1 text-[11.5px] font-black" style={{ background: p.border, color: p.text }}>{type}</span>
          <h4 className="text-[15px] font-black text-[var(--color-fog)]">{title}</h4>
        </div>
        <div className="text-[14.5px] font-bold leading-9 text-[var(--color-fog)]">{question}</div>
        {children && <div className="mt-4">{children}</div>}
      </div>
      <div className="border-t px-5 py-3" style={{ borderColor: p.border }}>
        <button onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-black transition-all"
          style={{
            background: open ? p.text : "transparent",
            color: open ? "#fff" : p.text,
            border: `1.5px solid ${p.border}`,
          }}>
          {open ? <Eye className="h-4 w-4" /> : <Lightbulb className="h-4 w-4" />}
          {open ? "إخفاء الحل" : "إظهار الحل التفصيلي"}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="mt-4 rounded-2xl border p-5" style={{ borderColor: p.border, background: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5" style={{ color: p.text }} />
              <span className="text-[13px] font-black" style={{ color: p.text }}>الحل التفصيلي</span>
            </div>
            <div className="text-[14px] font-bold leading-9 text-[var(--color-fog)]">{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── atom: سؤال صح/خطأ تفاعلي ─── */
function TrueFalseItem({ number, text, correct, explanation }: {
  number: number; text: string; correct: boolean; explanation: string;
}) {
  const [ans, setAns] = useState<boolean | null>(null);
  const done = ans !== null;
  const right = ans === correct;

  return (
    <div className="rounded-xl border border-[var(--color-line2)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)] mb-3">
        <span className="ml-2 text-[12px] font-black text-[var(--color-mist)]">{number}.</span>
        {text}
      </p>
      <div className="flex gap-2">
        {[true, false].map(val => {
          const selected = ans === val;
          const isCorrectBtn = val === correct;
          let cls = "rounded-xl px-5 py-2 text-[13px] font-black border transition-all ";
          if (!done) cls += "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[rgba(60,224,244,0.4)] hover:text-[var(--color-phys)]";
          else if (selected && right) cls += "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.1)] text-[#6ee7b7]";
          else if (selected && !right) cls += "border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.1)] text-[#fca5a5]";
          else if (!selected && done && isCorrectBtn) cls += "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.07)] text-[#6ee7b7] opacity-80";
          else cls += "border-[var(--color-line)] text-[var(--color-dim)] opacity-40";
          return (
            <button key={String(val)} onClick={() => { if (!done) setAns(val); }} className={cls}>
              {selected && done && (right ? <CheckCircle2 className="inline h-4 w-4 ml-1" /> : <XCircle className="inline h-4 w-4 ml-1" />)}
              {val ? "✓ صح" : "✗ خطأ"}
            </button>
          );
        })}
      </div>
      {done && (
        <div className={`mt-3 rounded-xl border p-3 text-[13px] font-bold leading-7 ${
          right ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.07)] text-[#a7f3d0]"
                : "border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] text-[#fde68a]"
        }`}>
          {!correct ? `✗ خطأ — ${explanation}` : `✓ صحيحة — ${explanation}`}
        </div>
      )}
    </div>
  );
}

/* ─── atom: اختيار من متعدد تفاعلي ─── */
function MCQItem({ number, text, options, correct, explanation, formula }: {
  number: number; text: string; options: string[]; correct: number;
  explanation: string; formula?: string;
}) {
  const [sel, setSel] = useState<number | null>(null);
  const done = sel !== null;
  const letters = ["a", "b", "c", "d"];
  return (
    <div className="rounded-xl border border-[var(--color-line2)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)] mb-3">
        <span className="ml-2 text-[12px] font-black text-[var(--color-mist)]">{number}.</span>
        {text}
        {formula && <span className="mr-1"><TeX>{formula}</TeX></span>}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt, i) => {
          const state = !done ? "idle" : i === correct ? "correct" : i === sel ? "wrong" : "dim";
          return (
            <button key={i} disabled={done} onClick={() => setSel(i)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right text-[13px] font-bold transition-all ${
                state === "correct" ? "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.1)] text-[#6ee7b7]"
                : state === "wrong" ? "border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.1)] text-[#fca5a5]"
                : state === "dim" ? "border-[var(--color-line)] opacity-40 text-[var(--color-dim)]"
                : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[rgba(60,224,244,0.35)] hover:text-white"
              }`}>
              <span className="font-black text-[11px] opacity-70">{letters[i]})</span>
              {opt}
              {state === "correct" && <CheckCircle2 className="ml-auto h-4 w-4" />}
              {state === "wrong" && <XCircle className="ml-auto h-4 w-4" />}
            </button>
          );
        })}
      </div>
      {done && (
        <div className={`mt-3 rounded-xl border p-3 text-[13px] font-bold leading-7 ${
          sel === correct ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.07)] text-[#a7f3d0]"
                         : "border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] text-[#fde68a]"
        }`}>
          {explanation}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   المكوّن الرئيسي: أسئلة اختبر نفسي من الكتاب ص 27–28
   ═══════════════════════════════════════════════════════════ */
export function ForceBookQuestions() {
  return (
    <div className="space-y-8">
      {/* رأس القسم */}
      <div className="card relative overflow-hidden border-[rgba(255,176,58,0.3)] p-6">
        <div className="absolute inset-0 opacity-20 grid-bg" />
        <div className="relative">
          <span className="eyebrow eyebrow-amber">📖 أسئلة الكتاب المدرسي</span>
          <h2 className="mt-3 text-[20px] font-black text-white">أختبر نفسي — ص 27 و 28</h2>
          <p className="mt-2 text-[13.5px] font-bold leading-7 text-[var(--color-mist)]">
            جميع أسئلة الكتاب بتصميم تفاعلي: اختر إجابتك في أسئلة الاختيار، اضغط صح/خطأ في أسئلة التحقق،
            واكشف الحل التفصيلي فقط بعد المحاولة.
          </p>
        </div>
      </div>

      {/* ═══ السؤال الأول — اختيار من متعدد (ص 27) ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-1.5 rounded-full bg-[var(--color-phys)]" />
          <h3 className="text-[17px] font-black text-[var(--color-phys)]">السؤال الأول — اختر الإجابة الصحيحة (ص 27)</h3>
        </div>
        <div className="space-y-3">
          <MCQItem number={1}
            text="لتمثيل القوة هندسيًا (شعاعيًا) يجب تحديد:"
            options={["حامل القوة فقط", "نقطة تأثير القوة فقط", "جهة القوة فقط", "جميع عناصر القوة"]}
            correct={3}
            explanation="لتمثيل القوة شعاعيًا يجب تحديد عناصرها الأربعة جميعها: نقطة التأثير (مبدأ الشعاع O)، الحامل (المستقيم xx')، الجهة (من O إلى B)، والشدة (طول الشعاع)." />
          <MCQItem number={2}
            text="عند قذف جسم للأعلى فإنه يصل إلى ارتفاع معين، ثم يعود إلى سطح الأرض، بسبب:"
            options={["كتلة الجسم", "ثقل الجسم", "حجم الجسم", "طول الجسم"]}
            correct={1}
            explanation="قوة الثقل (جذب الأرض للجسم) هي المسؤولة عن إعادته إلى الأسفل. الكتلة والحجم والطول ليست قوى وليست الملاحظة الصحيحة هنا." />
          <MCQItem number={3}
            text="جسم كتلته 4 kg، وبفرض تسارع الجاذبية الأرضية"
            formula="g = 10\\,\\text{m.s}^{-2}"
            options={["400 N", "40 N", "0.4 N", "4 N"]}
            correct={1}
            explanation="نطبق: w = m·g = 4 × 10 = 40 N. الجواب b." />
          <MCQItem number={4}
            text="شدة قوة ثقل جسم تتناسب طردًا مع:"
            options={["طول الجسم", "لون الجسم", "كتلة الجسم", "ارتفاع الجسم عن سطح البحر"]}
            correct={2}
            explanation="العلاقة w = m·g تُظهر أن الثقل يتناسب طردًا مع الكتلة m. اللون والطول وارتفاع الجسم لا علاقة لها بالمعادلة." />
          <MCQItem number={5}
            text="لقياس شدة قوة الثقل، نستخدم:"
            options={["ميزان ذو كفتين", "شريط متري", "ربيعة", "ميزان حرارة"]}
            correct={2}
            explanation="الربيعة (الميزان الزنبركي) تقيس القوة مباشرة بالنيوتن N، وهي الأداة المناسبة لقياس شدة الثقل. ميزان الكفتين يقيس الكتلة (بالـ kg)، والشريط المتري للطول." />
        </div>
      </div>

      {/* ═══ السؤال الثاني — أعطِ تفسيرًا علميًا (ص 27) ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-1.5 rounded-full bg-[var(--color-success)]" />
          <h3 className="text-[17px] font-black text-[var(--color-success)]">السؤال الثاني — أعطِ تفسيرًا علميًا (ص 27)</h3>
        </div>
        <div className="space-y-4">
          <QuestionCard number="1" title="" type="تفسير"
            question={<>عندما نُعلّق جسمًا ثقيلاً نسبيًا بحبل، يصبح الحبل مشدودًا شاقوليًا.</>}
            answer={<>
              قوة ثقل الجسم تؤثر نحو الأسفل، فتشد الحبل. الحبل يقاوم هذه القوة بشدّه من الأعلى (شد الحبل <TeX>{"\\vec{t}"}</TeX>)، وهذا الشد يوازن قوة الثقل. لأن قوة الثقل عمودية (شاقولية)، يصبح الحبل شاقوليًا في حالة الاتزان.
            </>} />
          <QuestionCard number="2" title="" type="تفسير"
            question={<>تتساقط الأمطار وثمار الأشجار نحو سطح الأرض.</>}
            answer={<>
              قوة الثقل (الجذب الأرضي) تؤثر في كل الأجسام القريبة من الأرض باتجاه مركزها. لذا تسقط الأمطار والثمار نحو الأسفل بشكل طبيعي تحت تأثير هذه القوة. اتجاه قوة الثقل دائمًا نحو الأسفل باتجاه سطح الأرض.
            </>} />
          <QuestionCard number="3" title="" type="تفسير"
            question={<>تختلف شدة ثقل الجسم من مكان إلى آخر على سطح الأرض.</>}
            answer={<>
              قيمة تسارع الجاذبية الأرضية <TeX>{"g"}</TeX> تتغير من مكان لآخر على سطح الأرض (عند خط الاستواء <TeX>{"g = 9.78\\,N\\cdot kg^{-1}"}</TeX>، وعند القطب <TeX>{"g = 9.83\\,N\\cdot kg^{-1}"}</TeX>). بما أن <TeX>{"w = m\\,g"}</TeX> والكتلة <TeX>{"m"}</TeX> ثابتة، فإن تغيّر <TeX>{"g"}</TeX> يؤدي إلى تغيّر الثقل <TeX>{"w"}</TeX>.
            </>} />
        </div>
      </div>

      {/* ═══ السؤال الثالث — رسم بمقياس (ص 27) ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-1.5 rounded-full bg-[var(--color-vio)]" />
          <h3 className="text-[17px] font-black text-[var(--color-vio)]">السؤال الثالث — رسم بمقياس (ص 27)</h3>
        </div>
        <QuestionCard number="3" title="تمثيل القوى بمقياس رسم" type="رسم"
          question={<>
            مثّل بالرسم القوى الآتية المؤثرة في نقطة B باستخدام مقياس رسم مناسب (كل <TeX>{"1\\,\\text{cm}"}</TeX> يقابل <TeX>{"10\\,N"}</TeX>):
            <ol className="mt-3 space-y-1.5 text-[13.5px]">
              <li>1. قوة أفقية متجهة نحو اليمين شدتها <TeX>{"40\\,N"}</TeX>.</li>
              <li>2. قوة شاقولية متجهة نحو الأسفل شدتها <TeX>{"30\\,N"}</TeX>.</li>
              <li>3. قوة شدتها <TeX>{"50\\,N"}</TeX> تميل عن الأفق نحو الأعلى بزاوية <TeX>{"45^\\circ"}</TeX>.</li>
            </ol>
          </>}
          answer={<>
            <div className="mb-4 text-[13px]">
              <p className="font-black text-[var(--color-chem)] mb-2">خطوات الحل:</p>
              <ul className="space-y-2">
                <li>• القوة 1: <TeX>{"40 \\div 10 = 4\\,\\text{cm}"}</TeX> → سهم أفقي طوله 4 cm نحو اليمين من B.</li>
                <li>• القوة 2: <TeX>{"30 \\div 10 = 3\\,\\text{cm}"}</TeX> → سهم عمودي طوله 3 cm نحو الأسفل من B.</li>
                <li>• القوة 3: <TeX>{"50 \\div 10 = 5\\,\\text{cm}"}</TeX> → سهم طوله 5 cm بزاوية 45° فوق الأفق من B.</li>
              </ul>
            </div>
            <ForceScaleDrawing />
          </>} />
      </div>

      {/* ═══ السؤال الرابع — الكرة المعلقة بحبل (ص 28) ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-1.5 rounded-full bg-[var(--color-chem)]" />
          <h3 className="text-[17px] font-black text-[var(--color-chem)]">السؤال الرابع — الكرة المعلقة (ص 28)</h3>
        </div>
        <QuestionCard number="4" title="كرة معلقة بحبل" type="تفسير"
          question={<>
            يمثّل الشكل المجاور كرة كتلتها <TeX>{"100\\,g"}</TeX> معلقة بحبل، وتؤثر فيها قوتان. وباعتبار <TeX>{"g = 10\\,\\text{m.s}^{-2}"}</TeX>:
            <ol className="mt-3 space-y-1.5 text-[13.5px]">
              <li>1. اكتب اسم كل من القوتين المؤثرتين في الكرة.</li>
              <li>2. حدّد القوة التي تحاول تحريك الكرة نحو الأرض، ثم اكتب عناصرها.</li>
              <li>3. حدّد القوة التي تمنع سقوط الكرة نحو الأرض، ثم اكتب عناصرها.</li>
            </ol>
          </>}
          answer={<>
            <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
              <HangingBallForcesDiagram />
              <div className="space-y-4 text-[13.5px] font-bold leading-8">
                <div>
                  <p className="font-black text-[var(--color-chem)] mb-1">1. أسماء القوتين:</p>
                  <p>• قوة الثقل <TeX>{"\\vec{w}"}</TeX> (نحو الأسفل)</p>
                  <p>• قوة شد الحبل <TeX>{"\\vec{t}"}</TeX> (نحو الأعلى)</p>
                </div>
                <div>
                  <p className="font-black text-[var(--color-chem)] mb-1">2. قوة الثقل (تسبب السقوط):</p>
                  <ul className="space-y-1 text-[13px]">
                    <li>• نقطة التأثير: مركز ثُقل الكرة</li>
                    <li>• الحامل: الشاقول المار من مركز الكرة</li>
                    <li>• الجهة: نحو الأسفل</li>
                    <li>• الشدة: <TeX>{"w = m\\,g = 0.1 \\times 10 = 1\\,N"}</TeX></li>
                  </ul>
                </div>
                <div>
                  <p className="font-black text-[var(--color-chem)] mb-1">3. قوة شد الحبل (تمنع السقوط):</p>
                  <ul className="space-y-1 text-[13px]">
                    <li>• نقطة التأثير: نقطة اتصال الحبل بالكرة (أعلى الكرة)</li>
                    <li>• الحامل: خط الحبل (شاقولي)</li>
                    <li>• الجهة: نحو الأعلى</li>
                    <li>• الشدة: <TeX>{"t = w = 1\\,N"}</TeX> (في حالة الاتزان)</li>
                  </ul>
                </div>
              </div>
            </div>
          </>} />
      </div>

      {/* ═══ السؤال الخامس — مسائل (ص 28) ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <span className="h-8 w-1.5 rounded-full bg-[var(--color-error)]" />
          <h3 className="text-[17px] font-black text-[var(--color-error)]">السؤال الخامس — حل المسائل (ص 28)</h3>
        </div>
        <div className="space-y-4">
          <QuestionCard number="5-أ" title="المسألة الأولى: حساب الثقل" type="مسألة"
            question={<>
              جسم كتلته <TeX>{"m = 10\\,\\text{kg}"}</TeX>، باعتبار أن <TeX>{"g = 10\\,N\\cdot kg^{-1}"}</TeX>. المطلوب حساب شدة ثقله <TeX>{"w"}</TeX>.
            </>}
            answer={<>
              <div className="space-y-2 text-[13.5px]">
                <p><span className="font-black text-[var(--color-chem)]">المعطيات:</span> <TeX>{"m = 10\\,\\text{kg}"}</TeX>، <TeX>{"g = 10\\,N\\cdot kg^{-1}"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">المطلوب:</span> <TeX>{"w = ?"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">القانون:</span> <TeX>{"w = m\\,g"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">التعويض:</span> <TeX>{"w = 10 \\times 10"}</TeX></p>
                <div className="rounded-xl border border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.07)] px-4 py-3 text-center font-black text-[var(--color-success)]">
                  <TeX>{"w = 100\\,N"}</TeX>
                </div>
              </div>
            </>} />

          <QuestionCard number="5-ب" title="المسألة الثانية: حساب الكتلة من الثقل" type="مسألة"
            question={<>
              جسم شدة ثقله <TeX>{"w = 3000\\,N"}</TeX>، باعتبار أن تسارع الجاذبية الأرضية <TeX>{"g = 10\\,N\\cdot kg^{-1}"}</TeX>. المطلوب حساب كتلة الجسم.
            </>}
            answer={<>
              <div className="space-y-2 text-[13.5px]">
                <p><span className="font-black text-[var(--color-chem)]">المعطيات:</span> <TeX>{"w = 3000\\,N"}</TeX>، <TeX>{"g = 10\\,N\\cdot kg^{-1}"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">المطلوب:</span> <TeX>{"m = ?"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">القانون (مقلوب):</span> <TeX>{"m = \\dfrac{w}{g}"}</TeX></p>
                <p><span className="font-black text-[var(--color-chem)]">التعويض:</span> <TeX>{"m = \\dfrac{3000}{10}"}</TeX></p>
                <div className="rounded-xl border border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.07)] px-4 py-3 text-center font-black text-[var(--color-success)]">
                  <TeX>{"m = 300\\,\\text{kg}"}</TeX>
                </div>
                <p className="text-[12.5px] text-[var(--color-mist)]">ملاحظة: 300 kg تعادل تقريبًا وزن 4 أشخاص بالغين.</p>
              </div>
            </>} />
        </div>
      </div>
    </div>
  );
}
