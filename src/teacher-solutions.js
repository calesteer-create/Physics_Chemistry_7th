// حلول أسئلة نهاية الدروس للمعلم. تُعرض فقط داخل منطقة المعلم بعد إدخال كلمة المرور.
// المفتاح هو معرّف الدرس في course.js. لكل درس معتمد يُضاف إدخال هنا بالترتيب نفسه للكتاب.
//
// المصدر: قسم «أختبر نفسي وحل المسائل» في محتوى الكتاب (الصفحات 14–16)، كما هو منقول في src/book-content.js.
// كل حل مبني على المعطيات والتعريفات الواردة في الكتاب، ولا توجد إجابة تخمينية.
import { formula } from './math.js';

const display = tex => formula(tex, { display: true });
const answer = html => `<p class="solution-answer"><strong>الجواب:</strong> ${html}</p>`;
const enrich = html => `<div class="solution-enrich"><strong>توضيح إثرائي:</strong> ${html}</div>`;

const matchingTable = `<div class="table-scroll" tabindex="0" role="region" aria-label="ربط العبارات بالمصطلحات">
  <table><caption>الربط الصحيح</caption><thead><tr><th scope="col">العبارة (العمود A)</th><th scope="col">المصطلح (العمود B)</th></tr></thead><tbody>
    <tr><td>مجموعة النقاط التي يمر بها الجسم المتحرك في أثناء حركته.</td><td><strong>المسار</strong></td></tr>
    <tr><td>قسمة المسافة المقطوعة على الزمن المستغرق في قطع هذه المسافة.</td><td><strong>السرعة الوسطية</strong></td></tr>
    <tr><td>طول المسار الذي يسلكه جسم معين خلال حركته، وانتقاله من مكان لآخر.</td><td><strong>المسافة</strong></td></tr>
  </tbody></table>
</div>
<p>يبقى مصطلح «الزمن» دون ربط، لأنه لا يطابق أيّاً من العبارات الثلاث.</p>`;

const correction = (statement, fixed, reason) => `<li>
  <p class="judgement"><span class="mark mark-false">✗ غير صحيحة</span> ${statement}</p>
  <p class="solution-answer"><strong>التصحيح:</strong> ${fixed}</p>
  <p class="solution-reason">${reason}</p>
</li>`;

const choiceItem = (statement, result, body) => `<li>
  <p class="solution-question-text">${statement}</p>
  ${answer(result)}
  ${body}
</li>`;

const problem = (title, statement, parts) => `<div class="solution-problem">
  <h5>${title}</h5>
  <p class="solution-question-text">${statement}</p>
  <ol class="solution-parts">${parts.map(part => `<li><p class="solution-part-title">${part.title}</p>${part.body}</li>`).join('')}</ol>
</div>`;

export const teacherSolutions = {
  'motion-rest': {
    sourceTitle: 'أختبر نفسي وحل المسائل',
    sourceNote: 'نص الأسئلة من محتوى الكتاب المنقول في المستودع. الشكلان المرفقان بالسؤال الثالث غير متاحين للتحقق بعد، وصفحات الكتاب المطبوعة لم تُفحص مباشرة؛ انظر ملاحظات التحقق عند كل سؤال.',
    questions: [
      {
        id: 'q1',
        title: 'السؤال الأول',
        instruction: 'صل بخط بين العبارة في العمود A والمصطلح العلمي المناسب في العمود B.',
        body: matchingTable,
      },
      {
        id: 'q2',
        title: 'السؤال الثاني',
        instruction: 'ضع إشارة صح (✓) أمام العبارة الصحيحة، وإشارة غلط (✗) أمام العبارة غير الصحيحة، ثم صحّحها.',
        body: `<ol class="solution-list judgement-list">
          ${correction('الحركة والسكون مفهومان نسبيان يتعلقان بالجسم المتحرك.', 'الحركة والسكون مفهومان نسبيان يتعلقان بالجسم <strong>المرجع</strong>.', 'الحالة الحركية (متحرك أو ساكن) تُحدَّد بمقارنة موضع الجسم بموضع جسم مرجع يُفترض ثابتاً، فالجسم الواحد قد يكون متحركاً بالنسبة إلى جسم وساكناً بالنسبة إلى آخر. ويذكر الكتاب في خلاصة «تعلمت»: «عند تغيّر المرجع يمكن أن تتغيّر حالة حركة الجسم أو سكونه».')}
          ${correction('تكون حركة جسم غير منتظمة، عندما يقطع مسافات متساوية خلال أزمنة متساوية.', 'تكون حركة جسم <strong>منتظمة</strong>، عندما يقطع مسافات متساوية خلال أزمنة متساوية.', 'هذا تعريف الحركة المنتظمة. الحركة غير المنتظمة تقطع مسافات غير متساوية خلال أزمنة متساوية.')}
          ${correction('يُعدّ الجسم ساكناً، إذا تغيّر موضعه بالنسبة للجسم المرجع.', 'يُعدّ الجسم ساكناً، إذا <strong>لم يتغيّر</strong> موضعه بالنسبة للجسم المرجع.', 'تغيّر الموضع بالنسبة إلى المرجع دليل على أن الجسم متحرك، لذلك تُعكس العبارة الصحيحة الشرط.')}
          ${correction('الخط البياني الممثّل للمسافة المقطوعة بدلالة الزمن، في الحركة المستقيمة المنتظمة منحنٍ.', 'الخط البياني في الحركة المستقيمة المنتظمة <strong>خطٌّ مستقيم</strong>.', 'المسافات المتساوية في أزمنة متساوية تُعطي نقاطاً تقع على استقامة واحدة عند رسمها بدلالة الزمن.')}
          ${correction('تكون حركة جسم مستقيمة منتظمة، إذا كانت سرعته متغيّرة، ومسار حركته مستقيماً.', 'تكون حركة جسم مستقيمة منتظمة، إذا كانت سرعته <strong>ثابتة</strong>، ومسار حركته مستقيماً.', 'الحركة المستقيمة المنتظمة تشترط شرطين معاً: مسار مستقيم وسرعة ثابتة.')}
          ${correction('تكون السرعة اللحظية مساوية للسرعة المتوسطة في الحركات المتسارعة.', 'تكون السرعة اللحظية مساوية للسرعة المتوسطة في <strong>الحركات المنتظمة</strong>.', 'في الحركة المنتظمة تكون السرعة ثابتة فتتساوى اللحظية مع المتوسطة. في الحركة المتسارعة تتغيّر السرعة فلا يتساويان عموماً.')}
        </ol>`,
        check: 'مفتاح إجابات متداول على الإنترنت يعدّ العبارة الأولى صحيحة (✓)، ولم نتمكن من مطابقة صفحة الكتاب المطبوعة. الحكم «غير صحيحة» مبني على تعريف الحالة الحركية في فقرة «أستنتج» (الحافلة والجسم المرجع) وعلى خلاصة «تعلمت» في الكتاب نفسه. قرار الإبقاء على هذا الحكم أو تغييره للمالك بعد مراجعة الصفحة المطبوعة.',
      },
      {
        id: 'q3',
        title: 'السؤال الثالث',
        instruction: 'اختر الإجابة الصحيحة لكلّ ممّا يأتي.',
        body: `<ol class="solution-list">
          ${choiceItem('حركة المتزلج الممثلة بمواضع متساوية الفواصل في الشكل المرفق: (a) متغيّرة (b) متباطئة (c) منتظمة (d) متسارعة.', '(c) منتظمة.', `<p class="solution-reason">إذا كانت المواضع المتتالية متساوية الفواصل، فالمسافات المقطوعة متساوية خلال فواصل زمنية متساوية، والسرعة ثابتة، فتكون الحركة منتظمة. الخيارات الأخرى تعني تغيّر السرعة.</p>`)}
          ${choiceItem('يمكن اعتبار الجسم المرجع في الصورة المرفقة: (a) السيارة (b) الشجرة (c) الغيوم (d) سائق السيارة.', '(b) الشجرة.', `<p class="solution-reason">الشجرة مثبتة بالأرض فهي ساكنة بالنسبة إلى الطريق، ويمكن مقارنة موضع السيارة بها. السيارة لا تصلح مرجعاً لحركتها نفسها، وسائق السيارة يتحرك معها، والغيوم تتحرك مع الهواء.</p>`)}
          ${choiceItem(`سيارة سرعتها الوسطية <span dir="ltr">108 km·h⁻¹</span>، تكون سرعتها في الجملة الدولية مساوية: (a) <span dir="ltr">10 m·s⁻¹</span> (b) <span dir="ltr">300 m·s⁻¹</span> (c) <span dir="ltr">30 m·s⁻¹</span> (d) <span dir="ltr">20 m·s⁻¹</span>.`, `(c) <span dir="ltr">30 m·s⁻¹</span>.`, `${display('\\frac{108\\,\\mathrm{km}}{1\\,\\mathrm{h}}=\\frac{108\\times1000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}=30\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}<p class="solution-reason">الخطأ الشائع هو ضرب 108 في 3.6 بدلاً من القسمة عليه.</p>`)}
          ${choiceItem(`يتحرك جسم بسرعة ثابتة <span dir="ltr">20 m·s⁻¹</span>، فيقطع مسافة <span dir="ltr">500 m</span> خلال زمن قدره: (a) <span dir="ltr">520 s</span> (b) <span dir="ltr">25 s</span> (c) <span dir="ltr">10000 s</span> (d) <span dir="ltr">20 s</span>.`, `(b) <span dir="ltr">25 s</span>.`, `${display('t=\\frac{d}{v}=\\frac{500\\,\\mathrm{m}}{20\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}}=25\\,\\mathrm{s}')}<p class="solution-reason">الخيار (a) ناتج جمع 500 و20، والخيار (c) ناتج ضربهما، والخيار (d) هو السرعة نفسها. هذه الخيارات لا تحقق قانون الزمن.</p>`)}
        </ol>`,
        check: 'الصورتان (المتزلج، والسيارة مع الشجرة) غير متاحتين للتحقق: روابط الكتاب لا تعمل، ونتائج البحث لا تطابقهما. جوابا البندين 1 و2 مؤقتان حتى مطابقتهما مع الشكلين المطبوعين.',
      },
      {
        id: 'q4',
        title: 'السؤال الرابع',
        instruction: 'حل المسائل الآتية.',
        body: [
          problem('المسألة الأولى', `يتحرك قارب بسرعة ثابتة، فيقطع مسافة <span dir="ltr">18 km</span> خلال نصف ساعة.`, [
            { title: `السرعة الوسطية للقارب بالوحدتين <span dir="ltr">km·h⁻¹</span> ثم <span dir="ltr">m·s⁻¹</span>`, body: `${display('v_{avg}=\\frac{d}{t}=\\frac{18\\,\\mathrm{km}}{0.5\\,\\mathrm{h}}=36\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}')}${display('36\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}=\\frac{36\\times1000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}${answer(`<span dir="ltr">36 km·h⁻¹</span> = <span dir="ltr">10 m·s⁻¹</span>.`)}` },
            { title: `المسافة التي يقطعها القارب خلال <span dir="ltr">20 s</span>`, body: `${display('d=v_{avg}\\times t=10\\times20=200\\,\\mathrm{m}')}${answer(`<span dir="ltr">200 m</span>.`)}<p class="solution-reason">لأن الزمن بالثانية نستخدم السرعة بوحدة <span dir="ltr">m·s⁻¹</span>. بما أن السرعة ثابتة، فالسرعة الوسطية تساوي السرعة اللحظية.</p>` },
          ]),
          problem('المسألة الثانية', `يقود رجل دراجته الهوائية على طريق مستقيمة بسرعة وسطية <span dir="ltr">9 km·h⁻¹</span>.`, [
            { title: `الزمن اللازم لقطع مسافة مقدارها <span dir="ltr">2700 m</span>`, body: `${display('9\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}=\\frac{9000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}=2.5\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}${display('t=\\frac{d}{v_{avg}}=\\frac{2700\\,\\mathrm{m}}{2.5\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}}=1080\\,\\mathrm{s}=\\frac{1080}{60}\\,\\mathrm{min}=18\\,\\mathrm{min}')}${answer(`<span dir="ltr">18 min</span>.`)}` },
            { title: `المسافة التي يقطعها خلال زمن قدره <span dir="ltr">25 min</span>`, body: `${display('25\\,\\mathrm{min}=25\\times60\\,\\mathrm{s}=1500\\,\\mathrm{s}')}${display('d=v_{avg}\\times t=2.5\\times1500=3750\\,\\mathrm{m}=3.75\\,\\mathrm{km}')}${answer(`<span dir="ltr">3750 m</span>، أي <span dir="ltr">3.75 km</span>.`)}<p class="solution-reason">للتحقق: 9 × 25 ÷ 60 = <span dir="ltr">3.75 km</span>.</p>` },
          ]),
          problem('المسألة الثالثة', `ينطلق طفل بدراجته الهوائية من بداية طريق أفقي مستقيم طوله <span dir="ltr">900 m</span> ليصل إلى نهاية الطريق، ثم يعود إلى نقطة انطلاقه، مستغرقاً زمن قدره ربع ساعة.`, [
            { title: 'المسافة التي قطعها الطفل في أثناء حركته', body: `${display('d=900\\,\\mathrm{m}+900\\,\\mathrm{m}=1800\\,\\mathrm{m}')}${answer(`<span dir="ltr">1800 m</span>، أي <span dir="ltr">1.8 km</span>.`)}<p class="solution-reason">المسافة هي طول المسار كله ذهاباً وعودة، وليست الفرق بين موضعي البداية والنهاية.</p>` },
            { title: 'سرعته الوسطية', body: `${display('t=\\frac{1}{4}\\,\\mathrm{h}=15\\,\\mathrm{min}=15\\times60\\,\\mathrm{s}=900\\,\\mathrm{s}')}${display('v_{avg}=\\frac{d}{t}=\\frac{1800\\,\\mathrm{m}}{900\\,\\mathrm{s}}=2\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}${answer(`<span dir="ltr">2 m·s⁻¹</span>، أي <span dir="ltr">7.2 km·h⁻¹</span>.`)}${enrich('نقطة النهاية هي نقطة الانطلاق نفسها، فالفرق بين موضعي البداية والنهاية يساوي صفراً. لكن الكتاب يُعرّف السرعة الوسطية بقسمة المسافة المقطوعة على الزمن، لذلك تُحسب هنا بالمسافة الكلية.')}` },
          ]),
        ].join(''),
      },
    ],
  },
};
