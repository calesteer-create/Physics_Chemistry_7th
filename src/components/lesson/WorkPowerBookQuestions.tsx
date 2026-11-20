"use client";

import { InlineCheck } from "./InlineCheck";
import { BookExercise } from "./BookExercise";
import { WorkCarForcesFigure } from "@/components/figures/work-power-figures";
import { TeX } from "@/components/math/TeX";

export function WorkPowerBookQuestions() {
  return (
    <div className="space-y-7">
      <section aria-labelledby="work-book-mcq">
        <h3 id="work-book-mcq" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الأول — اختر الإجابة الصحيحة (الصفحة 50)</h3>
        <div className="space-y-4">
          <InlineCheck question={[{ t: "يعطى قانون العمل بالعلاقة الرياضية:" }]} options={[
            <TeX key="a">{"W=d-F"}</TeX>, <TeX key="b">{"W=F-d"}</TeX>, <TeX key="c">{"W=F+d"}</TeX>, <TeX key="d">{"W=Fd"}</TeX>,
          ]} correct={3} explain={[{ t: "يعطى العمل في حالة توافق اتجاه القوة والانتقال بالعلاقة " }, { tex: "W=Fd" }, { t: "." }]} />
          <InlineCheck question={[{ t: "تُقدّر الاستطاعة في الجملة الدولية بوحدة:" }]} options={[
            <TeX key="a">{"\\text{J}"}</TeX>, <TeX key="b">{"\\text{kg}"}</TeX>, <TeX key="c">{"\\text{N}"}</TeX>, <TeX key="d">{"\\text{W}"}</TeX>,
          ]} correct={3} explain={[{ t: "وحدة الاستطاعة هي الواط، ورمزه " }, { tex: "\\text{W}" }, { t: ". أما الجول " }, { tex: "\\text{J}" }, { t: " فهو وحدة العمل." }]} />
          <InlineCheck question={[{ t: "تنجز آلة عملاً مقداره " }, { tex: "54000\\,\\text{J}" }, { t: " خلال " }, { tex: "6\\,\\text{s}" }, { t: ". ما استطاعتها؟" }]} options={[
            <TeX key="a">{"54006\\,\\text{W}"}</TeX>, <TeX key="b">{"9000\\,\\text{W}"}</TeX>, <TeX key="c">{"53994\\,\\text{W}"}</TeX>, <TeX key="d">{"9006\\,\\text{W}"}</TeX>,
          ]} correct={1} explain={[{ tex: "P=\\frac{W}{t}=\\frac{54000}{6}=9000\\,\\text{W}" }, { t: ". نقسم العمل على الزمن." }]} />
          <InlineCheck question={[{ t: "ينجز عامل عملاً مقداره " }, { tex: "1500\\,\\text{J}" }, { t: " بقوة " }, { tex: "50\\,\\text{N}" }, { t: ". ما المسافة التي ينتقلها الجسم في اتجاه القوة؟" }]} options={[
            <TeX key="a">{"40\\,\\text{m}"}</TeX>, <TeX key="b">{"50\\,\\text{m}"}</TeX>, <TeX key="c">{"30\\,\\text{m}"}</TeX>, <TeX key="d">{"10\\,\\text{m}"}</TeX>,
          ]} correct={2} explain={[{ tex: "d=\\frac{W}{F}=\\frac{1500}{50}=30\\,\\text{m}" }, { t: "." }]} />
        </div>
      </section>

      <section aria-labelledby="work-book-concepts">
        <h3 id="work-book-concepts" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الثاني — أجب عن الأسئلة (الصفحة 51)</h3>
        <div className="space-y-4">
          <BookExercise number="1" title="دفع جدار لا يتحرك" color="vio" question={[{ t: "عندما يقوم شخص بدفع الجدار فلا يتحرك، هل ينجز عملاً؟ فسّر ذلك." }]} hint={[{ t: "ما مسافة انتقال الجدار؟" }]} solution={[{ t: "لا ينجز الشخص عملاً على الجدار؛ لأن الجدار لم ينتقل، فلا تنتقل نقطة تأثير القوة عليه." }]} />
          <BookExercise number="2" title="أثر مضاعفة الارتفاع" color="vio" question={[{ t: "تحتاج إلى عمل معين لرفع ثقل إلى ارتفاع ما. كم مرة يتضاعف العمل اللازم لرفع الثقل ذاته إلى ثلاثة أمثال الارتفاع؟" }]} hint={[{ t: "القوة والوزن ثابتان هنا؛ قارن مسافتي الانتقال." }]} solution={[{ t: "يتضاعف العمل ثلاث مرات؛ لأن الثقل نفسه يُرفع إلى ارتفاع يساوي ثلاثة أمثال الارتفاع الأول، والعمل يتناسب طرداً مع مسافة الانتقال عند ثبات القوة." }]} />
          <BookExercise number="3" title="استطاعة خلال وحدة الزمن" color="vio" question={[{ t: "إذا كانت استطاعة عامل " }, { tex: "5\\,\\text{W}" }, { t: "، فما مقدار العمل المنجز خلال وحدة الزمن؟" }]} hint={[{ t: "وحدة الزمن هنا ثانية واحدة، والواط الواحد يساوي جولاً واحداً في الثانية." }]} solution={[{ tex: "P=\\frac{W}{t}\\quad\\Longrightarrow\\quad W=Pt=5\\times1=5\\,\\text{J}" }, { t: "." }]} />
          <div className="rounded-2xl border border-[rgba(255,176,58,0.25)] bg-[rgba(255,176,58,0.05)] p-4 text-sm font-bold leading-7 text-[#ffe4b8]">
            سؤال نوع العمل المرتبط بصور العربة الصاعدة والمنزلق الهابط غير مدرج هنا بعد؛ كلمة في نص الصورة غير واضحة، ولن أستبدلها بتخمين. يلزم التحقق من صورة مكبرة قبل إدراجه بصيغته الأصلية.
          </div>
        </div>
      </section>

      <section aria-labelledby="work-book-car">
        <h3 id="work-book-car" className="mb-4 text-lg font-black text-[var(--color-chem)]">السؤال الثالث — القوى المؤثرة في سيارة ساكنة (الصفحة 51)</h3>
        <div className="card space-y-4 p-5">
          <p className="text-sm font-bold leading-7 text-[var(--color-fog)]">تقف سيارة على طريق مستقيم أفقي. تأمل القوى الخارجية المؤثرة فيها، ثم أجب:</p>
          <WorkCarForcesFigure />
          <BookExercise number="1" title="حلّل القوى والعمل" color="phys" question={[{ t: "ما القوتان الخارجيتان المؤثرتان في السيارة؟ ما قيمة الزاوية بين الطريق الأفقي وحامل قوة الثقل؟ وهل تستطيع قوة ثقلها وحدها تحريكها؟ علل إجابتك. ما عمل كل من القوتين؟" }]} hint={[{ t: "ميّز بين اتجاه القوتين العموديتين واتجاه الطريق، ولا تنس أن السيارة لا تنتقل في المسألة." }]} solution={[{ t: "القوتان هما قوة الثقل إلى أسفل وقوة رد فعل الطريق إلى أعلى. الزاوية بين الطريق الأفقي وحامل قوة الثقل " }, { tex: "90^\\circ" }, { t: ". لا تحرك قوة الثقل السيارة أفقياً لأنها عمودية على الطريق. والسيارة ساكنة فلا يحدث انتقال، لذلك عمل كل من القوتين معدوم." }]} />
        </div>
      </section>

      <section aria-labelledby="work-book-applications">
        <h3 id="work-book-applications" className="mb-4 text-lg font-black text-[var(--color-chem)]">مسائل الصفحة 52</h3>
        <div className="space-y-4">
          <BookExercise number="1" title="رفع كيس إلى ارتفاع" color="phys" question={[{ t: "ينقل عامل كيساً كتلته " }, { tex: "80\\,\\text{kg}" }, { t: " إلى ارتفاع " }, { tex: "36\\,\\text{m}" }, { t: " خلال " }, { tex: "10\\,\\text{min}" }, { t: ". باعتبار " }, { tex: "g=10\\,\\text{m.s}^{-2}" }, { t: "، احسب العمل الذي ينجزه والاستطاعة بالحصان البخاري." }]} hint={[{ t: "احسب وزن الكيس أولاً، ثم العمل. حوّل الدقائق إلى ثوانٍ قبل حساب الاستطاعة، واستخدم علاقة الحصان البخاري المذكورة في الكتاب." }]} solution={[{ t: "نحسب وزن الكيس: " }, { tex: "F=mg=80\\times10=800\\,\\text{N}" }, { t: ". في معالجة الرفع المدرسية نأخذ قوة الرفع مساوية للوزن." }, { t: "\nالعمل: " }, { tex: "W=Fd=800\\times36=28800\\,\\text{J}" }, { t: "." }, { t: "\nالزمن: " }, { tex: "t=10\\times60=600\\,\\text{s}" }, { t: "." }, { t: "\nالاستطاعة: " }, { tex: "P=\\frac{W}{t}=\\frac{28800}{600}=48\\,\\text{W}" }, { t: "." }, { t: "\nوبما أن " }, { tex: "1\\,\\text{HP}=750\\,\\text{W}" }, { t: "، فإن " }, { tex: "P=\\frac{48}{750}=0.064\\,\\text{HP}" }, { t: "." }]} />
          <BookExercise number="2" title="صعود الرجل إلى الطابق الرابع" color="phys" question={[{ t: "يصعد رجل وزنه " }, { tex: "750\\,\\text{N}" }, { t: " إلى سطح الطابق الرابع خلال دقيقتين. إذا كان متوسط ارتفاع الطابق " }, { tex: "3\\,\\text{m}" }, { t: "، احسب الاستطاعة الوسطى للرجل." }]} hint={[{ t: "احسب الارتفاع الكلي لأربعة طوابق، ثم حوّل الدقيقتين إلى ثوانٍ." }]} solution={[{ t: "بافتراض الصعود من مستوى الأرض: " }, { tex: "d=4\\times3=12\\,\\text{m}" }, { t: "." }, { t: "\nالعمل: " }, { tex: "W=Fd=750\\times12=9000\\,\\text{J}" }, { t: "." }, { t: "\nالزمن: " }, { tex: "t=2\\times60=120\\,\\text{s}" }, { t: "." }, { t: "\nالاستطاعة الوسطى: " }, { tex: "P=\\frac{W}{t}=\\frac{9000}{120}=75\\,\\text{W}" }, { t: "." }]} />
        </div>
      </section>
    </div>
  );
}
