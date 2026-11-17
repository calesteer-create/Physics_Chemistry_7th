"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Eye, EyeOff, Lightbulb } from "lucide-react";
import { TeX } from "@/components/math/TeX";
import { ActionReactionExamplesGrid, ParachuteFigure } from "@/components/figures/one-support-figures";
import { ForceScaleDrawing, HangingBallForcesDiagram } from "@/components/figures/force-figures";

function QuestionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-5">
      <h4 className="mb-4 text-[16px] font-black text-[var(--color-phys)]">{title}</h4>
      {children}
    </div>
  );
}

function RevealAnswer({ answer }: { answer: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button onClick={() => setOpen(!open)} className="btn btn-ghost !py-2 !text-[12px]">
        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {open ? "إخفاء الحل" : "إظهار الحل التفصيلي"}
      </button>
      {open && (
        <div className="mt-3 rounded-2xl border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.06)] p-4 text-[13.5px] font-bold leading-8 text-[#fde68a]">
          <div className="mb-2 flex items-center gap-2 text-[var(--color-gold)]"><Lightbulb className="h-4 w-4" />الحل التفصيلي</div>
          {answer}
        </div>
      )}
    </div>
  );
}

function MCQ({ n, q, options, correct, explain }: { n: number; q: React.ReactNode; options: React.ReactNode[]; correct: number; explain: React.ReactNode }) {
  const [sel, setSel] = useState<number | null>(null);
  const done = sel !== null;
  const letters = ["a", "b", "c", "d"];
  return (
    <div className="rounded-xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
      <p className="mb-3 text-[14px] font-bold leading-8 text-[var(--color-fog)]"><span className="ml-2 text-[12px] font-black text-[var(--color-mist)]">{n}.</span>{q}</p>
      <div className="grid gap-2 md:grid-cols-2">
        {options.map((opt, i) => {
          const state = !done ? "idle" : i === correct ? "correct" : i === sel ? "wrong" : "dim";
          return (
            <button key={i} disabled={done} onClick={() => setSel(i)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-right text-[13px] font-bold transition-all ${
              state === "correct" ? "border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.1)] text-[#6ee7b7]"
              : state === "wrong" ? "border-[rgba(248,113,113,0.4)] bg-[rgba(248,113,113,0.1)] text-[#fca5a5]"
              : state === "dim" ? "border-[var(--color-line)] text-[var(--color-dim)] opacity-50"
              : "border-[var(--color-line2)] text-[var(--color-mist)] hover:border-[var(--color-phys)] hover:text-white"
            }`}>
              <span className="font-black text-[11px] opacity-70">{letters[i]})</span>
              <span className="flex-1">{opt}</span>
              {state === "correct" && <CheckCircle2 className="h-4 w-4" />}
              {state === "wrong" && <XCircle className="h-4 w-4" />}
            </button>
          );
        })}
      </div>
      {done && <div className={`mt-3 rounded-xl border p-3 text-[13px] font-bold leading-7 ${sel === correct ? "border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.07)] text-[#a7f3d0]" : "border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.07)] text-[#fde68a]"}`}>{explain}</div>}
    </div>
  );
}

export function OneSupportBookQuestions() {
  return (
    <div className="space-y-8">
      <div className="card border-[rgba(255,176,58,0.3)] p-6">
        <span className="eyebrow eyebrow-amber">📖 أسئلة الكتاب المدرسي</span>
        <h2 className="mt-3 text-[20px] font-black text-white">أختبر نفسي — ص 37–40</h2>
        <p className="mt-2 text-[13.5px] font-bold leading-7 text-[var(--color-mist)]">جميع أسئلة الكتاب للدرس الثالث مع التفاعلية والحلول التفصيلية حيث يلزم.</p>
      </div>

      {/* السؤال 1 ص37-38 */}
      <QuestionCard title="السؤال الأول — اختر الإجابة الصحيحة (ص 37–38)">
        <div className="space-y-3">
          <MCQ n={1} q={<><TeX>{"F_1, F_2"}</TeX> قوتان على حامل واحد وبجهة واحدة، فإن شدة محصلتهما تعطى بالعلاقة:</>} options={[<TeX key="a">{"F = F_1 - F_2"}</TeX>,<TeX key="b">{"F = F_1 + F_2"}</TeX>,<TeX key="c">{"F = \\frac{F_1}{F_2}"}</TeX>,<TeX key="d">{"F = \\sqrt{F_1^2 + F_2^2}"}</TeX>]} correct={1} explain={<><TeX>{"F = F_1 + F_2"}</TeX> لأن الجهة واحدة والحامل واحد، فتتعاون القوتان.</>} />
          <MCQ n={2} q={<><TeX>{"F_1, F_2"}</TeX> قوتان على حامل واحد وبجهتين متعاكستين حيث <TeX>{"F_1 > F_2"}</TeX>، فإن شدة محصلتهما تعطى بالعلاقة:</>} options={[<TeX key="a">{"F = F_1 - F_2"}</TeX>,<TeX key="b">{"F = F_2 - F_1"}</TeX>,<TeX key="c">{"F = F_1 + F_2"}</TeX>,<TeX key="d">{"F = \\frac{F_1}{F_2}"}</TeX>]} correct={0} explain={<><TeX>{"F = F_1 - F_2"}</TeX> لأن الجهتين متعاكستان والجهة النهائية جهة القوة الأكبر.</>} />
          <MCQ n={3} q={<>إذا كانت <TeX>{"F_1 = 850\,N"}</TeX> و <TeX>{"F_2 = 750\,N"}</TeX> في شد الحبل، فالمحصلة:</>} options={["100 N وبجهة الفريق الأول","50 N وبجهة الفريق الأول","100 N وبجهة الفريق الثاني","50 N وبجهة الفريق الثاني"]} correct={0} explain={<><TeX>{"F = 850 - 750 = 100\,N"}</TeX> وجهتها جهة الفريق الأول لأن قوته أكبر.</>} />
          <MCQ n={4} q={<>إذا كانت <TeX>{"F_1 = 920\,N"}</TeX> والمحصلـة <TeX>{"F = 40\,N"}</TeX>، فإن <TeX>{"F_2"}</TeX> تساوي:</>} options={["880 N","960 N","23 N","36800 N"]} correct={0} explain={<><TeX>{"F = F_1 - F_2"}</TeX> → <TeX>{"40 = 920 - F_2"}</TeX> → <TeX>{"F_2 = 880\,N"}</TeX>.</>} />
          <MCQ n={5} q={<>إذا كانت <TeX>{"F_1 = 40\,N"}</TeX> ومحصلـة قوتين في جهة واحدة <TeX>{"F = 80\,N"}</TeX>، فإن <TeX>{"F_2"}</TeX> تساوي:</>} options={["40 N","120 N","3200 N","2 N"]} correct={0} explain={<><TeX>{"F = F_1 + F_2"}</TeX> → <TeX>{"80 = 40 + F_2"}</TeX> → <TeX>{"F_2 = 40\,N"}</TeX>.</>} />
          <MCQ n={6} q={<>قوتان متعاكستان مباشرة شدة كل منهما <TeX>{"30\,N"}</TeX>، فالمحصلة:</>} options={["60 N","0 N","30 N","15 N"]} correct={1} explain={<>لأن القوتين متساويتان ومتعاكستان مباشرةً، فالمحصلة <TeX>{"0\,N"}</TeX>.</>} />
          <MCQ n={7} q={<>القوتان المتعاكستان مباشرة هما قوتان:</>} options={["متوازيتان حاملاً ومتعاكستان جهة ومختلفتان شدة","منطبقتان حاملاً ومتعاكستان جهة ومتساويتان شدة","منطبقتان حاملاً ومتفقتان جهة ومختلفتان شدة","منطبقتان حاملاً ومتعاكستان جهة ومتساويتان شدة"]} correct={1} explain={<>التعريف الدقيق: منطبقتان حاملاً، متعاكستان جهة، ومتساويتان شدة.</>} />
          <MCQ n={8} q={<>لكل فعل رد فعل:</>} options={["يساويه بالقيمة ويماثله بالاتجاه","يساويه بالقيمة ويعاكسه بالاتجاه","يوازيه بالحامل ويماثله بالاتجاه","لا يساويه بالقيمة ويعاكسه بالاتجاه"]} correct={1} explain={<>مبدأ نيوتن الثالث: رد الفعل يساوي الفعل شدة ويعاكسه جهة.</>} />
        </div>
      </QuestionCard>

      {/* السؤال 2 ص39 */}
      <QuestionCard title="السؤال الثاني — حدّد قوة الفعل وقوة رد الفعل (ص 39)">
        <div className="max-w-3xl mx-auto">
          <ActionReactionExamplesGrid />
        </div>
        <RevealAnswer answer={<>
          <p>1. <strong>الصاروخ:</strong> الفعل = خروج الغازات إلى الأسفل. رد الفعل = دفع الصاروخ إلى الأعلى.</p>
          <p>2. <strong>اليد والطاولة:</strong> الفعل = ضغط اليد على حافة الطاولة. رد الفعل = دفع الطاولة لليد بقوة معاكسة.</p>
          <p>3. <strong>الكتاب والطاولة:</strong> الفعل = ضغط الكتاب على الطاولة نحو الأسفل. رد الفعل = دفع الطاولة للكتاب نحو الأعلى.</p>
          <p className="mt-2">لاحظ دائمًا: القوتان متساويتان في الشدة، متعاكستان في الجهة، وتؤثران في جسمين مختلفين.</p>
        </>} />
      </QuestionCard>

      {/* السؤال 3 ص39 */}
      <QuestionCard title="السؤال الثالث — قوة مفقودة (ص 39)" >
        <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)]">لاحظ شكل البندقية في الرسم ثم أجب: في الرسم قوة مفقودة، وضح هذه القوة على الرسم.</p>
        <div className="mt-4 max-w-2xl mx-auto rounded-2xl border border-[var(--color-line)] p-4 bg-white/5">
          <div className="rounded-2xl overflow-hidden border border-[var(--color-line)] bg-[#dbeafe] p-4">
            <svg viewBox="0 0 520 200" className="w-full h-auto">
              <circle cx="122" cy="98" r="22" fill="#1f2937" />
              <rect x="110" y="116" width="24" height="48" rx="6" fill="#556b2f" />
              <line x1="122" y1="126" x2="90" y2="162" stroke="#556b2f" strokeWidth="8" strokeLinecap="round" />
              <line x1="132" y1="126" x2="156" y2="164" stroke="#556b2f" strokeWidth="8" strokeLinecap="round" />
              <line x1="132" y1="108" x2="312" y2="54" stroke="#8b5a1f" strokeWidth="14" strokeLinecap="round" />
              <line x1="176" y1="98" x2="390" y2="42" stroke="#9ca3af" strokeWidth="16" strokeLinecap="round" />
              <path d="M168 118 C210 150 252 166 300 170" fill="none" stroke="#3f2a16" strokeWidth="5" />
              <line x1="392" y1="42" x2="434" y2="30" stroke="#f59e0b" strokeWidth="4" />
              <polygon points="434,30 422,24 424,37" fill="#f59e0b" />
              <circle cx="446" cy="28" r="6" fill="#6b7280" />
              {/* القوة المفقودة */}
              <line x1="164" y1="102" x2="116" y2="116" stroke="#ef4444" strokeWidth="4" strokeDasharray="7 6" />
              <polygon points="116,116 130,110 128,124" fill="#ef4444" />
            </svg>
          </div>
        </div>
        <RevealAnswer answer={<>
          <p>القوة المفقودة هي <strong>قوة رد الفعل</strong> الناتجة عن اندفاع الرصاصة والغازات إلى الأمام. هذه القوة تؤثر في البندقية نفسها نحو الخلف (الارتداد).</p>
          <p>إذن:</p>
          <p>• الفعل: اندفاع الرصاصة إلى الأمام.</p>
          <p>• رد الفعل: ارتداد البندقية إلى الخلف.</p>
        </>} />
      </QuestionCard>

      {/* السؤال 4 ص39-40 */}
      <QuestionCard title="السؤال الرابع — حل المسألتين (ص 39–40)">
        <div className="space-y-5">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)]"><strong>المسألة الأولى:</strong> تؤثر في النقطة <TeX>{"(O)"}</TeX> قوتان شدتهما <TeX>{"F_1 = 15\,N"}</TeX> و <TeX>{"F_2 = 30\,N"}</TeX> على حامل واحد وبجهة واحدة.</p>
            <RevealAnswer answer={<>
              <p><strong>1) عناصر محصلة القوتين:</strong></p>
              <p>• نقطة التأثير: النقطة <TeX>{"(O)"}</TeX>.</p>
              <p>• الحامل: حامل القوتين نفسه.</p>
              <p>• الجهة: نفس جهة القوتين.</p>
              <p>• الشدة: <TeX>{"F = F_1 + F_2 = 15 + 30 = 45\,N"}</TeX>.</p>
              <p className="mt-2"><strong>2) إذا أثرت في النقطة (O) قوة أخرى F&apos; بقيت متوازنة:</strong></p>
              <p>حتى يبقى الجسم متوازنًا، يجب أن تكون القوة الجديدة <TeX>{"F'"}</TeX> مساوية للمحصلة في الشدة ومعاكسة لها في الجهة:</p>
              <p><TeX>{"F' = 45\,N"}</TeX> في الجهة المعاكسة.</p>
              <p className="mt-2"><strong>3) التمثيل البياني:</strong> نرسم <TeX>{"F_1"}</TeX> و <TeX>{"F_2"}</TeX> في الجهة نفسها من O، ثم نرسم المحصلة <TeX>{"F"}</TeX> بطول 4.5 cm إذا كان المقياس 1cm = 10N، ثم نرسم <TeX>{"F'"}</TeX> بطول مماثل في الجهة المعاكسة.</p>
            </>} />
          </div>
          <div className="rounded-2xl border border-[var(--color-line)] bg-[rgba(255,255,255,0.02)] p-4">
            <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)]"><strong>المسألة الثانية:</strong> تؤثر في النقطة <TeX>{"(O)"}</TeX> قوتان شدتهما <TeX>{"F_1 = 25\,N"}</TeX> و <TeX>{"F_2 = 75\,N"}</TeX> على حامل واحد وبجهتين متعاكستين.</p>
            <RevealAnswer answer={<>
              <p><strong>1) عناصر محصلة القوتين:</strong></p>
              <p>• نقطة التأثير: النقطة <TeX>{"(O)"}</TeX>.</p>
              <p>• الحامل: حامل القوتين نفسه.</p>
              <p>• الجهة: جهة القوة الأكبر <TeX>{"F_2"}</TeX>.</p>
              <p>• الشدة: <TeX>{"F = F_2 - F_1 = 75 - 25 = 50\,N"}</TeX>.</p>
              <p className="mt-2"><strong>2) إذا أثرت في O قوة أخرى F&apos; وبقيت متوازنة:</strong></p>
              <p>يجب أن تكون <TeX>{"F' = 50\,N"}</TeX> في الجهة المعاكسة للمحصلة.</p>
              <p className="mt-2"><strong>3) التمثيل البياني:</strong> نرسم <TeX>{"F_1"}</TeX> و <TeX>{"F_2"}</TeX> متعاكسين، ثم نرسم المحصلة في جهة القوة الأكبر بطول يتناسب مع 50N، وأخيرًا نرسم <TeX>{"F'"}</TeX> بالعكس للموازنة.</p>
              <p className="mt-2"><strong>4) إذا كانت شدة القوة الثانية F₂ = 25N، فما شدة محصلة القوتين عندئذ؟</strong></p>
              <p>تصبح القوتان <TeX>{"F_1 = 25\,N"}</TeX> و <TeX>{"F_2 = 25\,N"}</TeX> متساويتين ومتعاكستين، لذلك:</p>
              <p><TeX>{"F = 0\,N"}</TeX></p>
            </>} />
          </div>
        </div>
      </QuestionCard>

      {/* نشاط ص40 */}
      <QuestionCard title="نشاط — المظلي (ص 40)">
        <p className="text-[14px] font-bold leading-8 text-[var(--color-fog)]">تؤثر على المظلي قوة ثقله للأسفل وقوة مقاومة الهواء على المظلة للأعلى. اكتب موضوعًا تصف فيه كيف يتحكم المظلي في حركته، وماذا يحدث لو زادت مقاومة الهواء؟</p>
        <div className="mt-4 max-w-3xl mx-auto"><ParachuteFigure /></div>
        <RevealAnswer answer={<>
          <p>عندما يفتح المظلي مظلته، تزداد مساحة السطح المعرضة للهواء، فتزداد مقاومة الهواء إلى الأعلى. في البداية تكون قوة الثقل أكبر، فيتسارع المظلي إلى الأسفل. لكن مع ازدياد مقاومة الهواء، تبدأ السرعة بالتناقص تدريجيًا حتى تصل القوتان إلى حالة تقارب أو توازن، فينخفض المظلي بسرعة أصغر وأكثر أمانًا.</p>
          <p className="mt-2">إذا زادت مقاومة الهواء أكثر:</p>
          <p>• تقل السرعة أكثر.</p>
          <p>• يصبح الهبوط أبطأ وأكثر أمانًا.</p>
          <p>• وعند التوازن التام تقريبًا، تصبح المحصلة صغيرة جدًا فيهبط المظلي بسرعة ثابتة تقريبًا.</p>
        </>} />
      </QuestionCard>
    </div>
  );
}
