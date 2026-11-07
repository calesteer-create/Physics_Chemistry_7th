// درس القوة والحركة — الوحدة الأولى، الصفحات 17–28.
// نصوص الكتاب منقولة كما طُبعت دون تصحيح (بما فيها: توصصلنا، أُضعُ، أسدُّ خطلفها، نايث، المسحود،
// متجهه، تأثيق، وفقعها، الطولة، باهمال، تمار، وحبدتها). كل توضيح إضافي منفصل بعنوان «توضيح إثرائي».
import { formula, quantity, units } from './math.js';
import { forceVectorDiagram, carForceScene, springScaleFigure, hangingBallFigure } from './diagrams.js';
import { notebookSections } from './course.js';
import { forceLabShell } from './force-lab.js';
import { forceUnderstandingContent, forcePracticeContent } from './assessments.js';

const section = (pages, title, body, id = '') => `<section class="book-section" ${id ? `id="${id}"` : ''}>
  <div class="source-line"><span class="source-chip">من الكتاب</span><span>الصفحة ${pages}</span></div>
  <h3>${title}</h3>${body}</section>`;
const definition = (term, text) => `<div class="definition"><strong>${term}</strong><p>${text}</p></div>`;
const questionList = items => `<ol class="book-questions">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
const table = (headers, rows, caption) => `<div class="table-scroll" tabindex="0" role="region" aria-label="${caption}"><table><caption>${caption}</caption><thead><tr>${headers.map(head => `<th scope="col">${head}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const experiment = (title, body) => `<div class="experiment"><h4>${title}</h4>${body}</div>`;
const inferBox = (title, body) => `<div class="book-note"><strong>${title}</strong>${body}</div>`;
const learnBox = body => `<div class="learn-box"><h4>تعلَّمُّ:</h4>${body}</div>`;

// ————— المرحلة 1: اكتشاف وتمهيد —————
export function forceDiscoverContent() {
  return `<div class="discovery-card">
    <span class="discovery-icon" aria-hidden="true">🧲</span>
    <div><h3>ما الذي يُحرِّك الكرة ويوقف الدراجة ويسحب المسامير نحو المغناطيس؟</h3><p>في صور الكتاب: لاعب يركل الكرة فتنطلق، ومغناطيس يجذب مسامير حديدية، وطفل يقود دراجته. اسأل نفسك سؤال الكتاب: ما المفهوم الذي يربط بين الحالات السابقة؟</p></div>
  </div>
  <div class="prediction" data-discovery>
    <h3>توقّع قبل أن تبدأ</h3><p>ما الذي يغيّر الحالة الحركية للأجسام (من سكون إلى حركة أو العكس) أو يغيّر سرعتها واتجاهها؟</p>
    <div class="choice-row" role="group" aria-label="توقع سبب تغيّر الحالة الحركية">
      <button class="choice text-choice" data-discovery-answer="hand" data-discovery-feedback="الدفع باليد مثال صحيح، لكن المغناطيس جذب المسامير دون أن يلمسها. فكّر بمؤثر أعم يشمل الدفع والجذب." aria-pressed="false">الدفع باليد فقط</button>
      <button class="choice text-choice" data-discovery-answer="force" data-discovery-feedback="توقع صحيح! كل مؤثر قادر على تغيير الحالة الحركية للجسم أو تغيير شكله هو القوة. تابع لتتأكد بالتجارب." aria-pressed="false">مؤثر يؤثر في الجسم: دفعاً أو جذباً</button>
      <button class="choice text-choice" data-discovery-answer="time" data-discovery-feedback="مرور الزمن وحده لا يغيّر حركة الجسم؛ الكرة تبقى ساكنة حتى يؤثر فيها مؤثر ما." aria-pressed="false">مرور الزمن وحده</button>
    </div><p class="feedback" data-discovery-feedback aria-live="polite">اختر توقعك، ثم انتقل إلى محتوى الكتاب لتتأكد.</p>
  </div>
  <section class="book-section"><div class="source-line"><span class="source-chip">من الكتاب · ص17–18</span></div><h3>أسئلة الكتاب قبل التجارب</h3>
  ${questionList(['كيف يمكن تحريك الكرة؟', 'كيف جذب المغناطيس المسامير؟', 'كيف يمكن زيادة سرعة الدراجة؟', 'كيف يمكن إيقاف الدراجة؟', 'ما المفهوم الذي يربط بين الحالات السابقة؟'])}
  <p class="observation-prompt"><strong>سؤال الملاحظة:</strong> اذكر من حياتك اليومية حالة تغيّر فيها اتجاه جسم متحرك. ما الذي أثّر فيه؟</p></section>`;
}

// ————— المرحلة 2: محتوى الكتاب —————
export function forceBookContent() {
  return `<div class="book-content">
    <div class="source-notice"><strong>حدود هذا القسم:</strong> النصوص والتعريفات والتجارب والتطبيقات هنا من الكتاب (الصفحات 17–28). التوضيحات الإضافية موجودة فقط في المرحلة التالية تحت عنوان «توضيح إثرائي». الكلمات منقولة كما طُبعت في الكتاب، بما فيها الخطوط الطباعية الظاهرة في النسخة المصوّرة.</div>
    <nav class="book-index" role="tablist" aria-label="أجزاء محتوى الكتاب">
      <button type="button" data-book-tab="force-start" id="force-tab-start" role="tab" aria-controls="force-start" aria-selected="true" tabindex="0">البداية والأهداف</button><button type="button" data-book-tab="force-concept" id="force-tab-concept" role="tab" aria-controls="force-concept" aria-selected="false" tabindex="-1">مفهوم القوة</button><button type="button" data-book-tab="force-elements" id="force-tab-elements" role="tab" aria-controls="force-elements" aria-selected="false" tabindex="-1">عناصر القوة</button><button type="button" data-book-tab="force-represent" id="force-tab-represent" role="tab" aria-controls="force-represent" aria-selected="false" tabindex="-1">تمثيل القوة وتطبيقها</button><button type="button" data-book-tab="force-weight" id="force-tab-weight" role="tab" aria-controls="force-weight" aria-selected="false" tabindex="-1">قوة الثقل والكتلة</button><button type="button" data-book-tab="force-relation" id="force-tab-relation" role="tab" aria-controls="force-relation" aria-selected="false" tabindex="-1">العلاقة بين الكتلة والثقل</button><button type="button" data-book-tab="force-review" id="force-tab-review" role="tab" aria-controls="force-review" aria-selected="false" tabindex="-1">تعلَّمُّ واختبر نفسي</button>
    </nav>

    <div id="force-start" role="tabpanel" aria-labelledby="force-tab-start" tabindex="0">
    ${section('17', 'الوحدة الأولى: الحركة والتحريك — الدرس الثاني: القوة والحركة', `
      <div class="book-columns"><div><h4>الأهداف</h4><ul class="check-list"><li>يشرح مفهوم القوة.</li><li>يوضّح العلاقة بين القوة والحركة.</li><li>يحدّد عناصر القوة ووحدة قياس شدتها.</li><li>يحدّد بعض القوى واستخداماتها.</li><li>يحدّد العلاقة بين الكتلة والثقل.</li></ul></div>
      <div><h4>الكلمات المفتاحية</h4><p class="keywords">الحركة – عناصر القوة – النيوتن – الكتلة – الثقل</p></div></div>
      <p>توصلنا سابقاً إلى أنّ الأجسام تُصنَّف من حيث حالتها الحركية إلى أجسام متحركة أو أجسام ساكنة.</p>
      ${questionList(['ما سبب تغيّر الحالة الحركية للجسم من السكون إلى الحركة أو من الحركة إلى السكون؟', 'ما سبب تغيّر سرعة الأجسام المتحركة أو اتجاه حركتها؟'])}
      <h3>مفهوم القوة:</h3>
      <p>ألاحظ الإجابة عمّا يأتي:</p>
      <ul class="check-list"><li>لاعب يركل كرة القدم فتتحرك.</li><li>مغناطيس يجذب مجموعة مسامير حديدية.</li><li>دراجة هوائية يقودها طفل.</li></ul>`)}
    </div>

    <div id="force-concept" role="tabpanel" aria-labelledby="force-tab-concept" tabindex="0" hidden>
    ${section('18', 'ألاحظ وأسأل قبل التجارب', `
      ${questionList(['كيف يمكن تحريك الكرة؟', 'كيف جذب المغناطيس المسامير؟', 'كيف يمكن زيادة سرعة الدراجة؟', 'كيف يمكن إيقاف الدراجة؟', 'ما المفهوم الذي يربط بين الحالات السابقة؟'])}
      ${experiment('أجرِبُ وأستنتج:', `
        <p><strong>أدوات التجربة:</strong> نايلون، مغناطيس.</p>
        ${questionList(['أُضعُ النايلون على سطح طاولة أفقية. هل يتحرك النايلون إذا لم تؤثر عليه قوة؟', 'أقرّب المغناطيس من النايلون. هل يتحرك النايلون؟'])}`)}
      ${experiment('أجرِبُ وأستنتج:', `
        <p>أعلّق الربيعة إلى نقطة ثابتة، ثم أسدُّ خطلفها.</p>
        ${questionList(['هل تغيّر شكل نايث الربيعة؟'])}`)}
      ${inferBox('أستنتج:', definition('القوة:', 'هي كل مؤثر قادر على تغيير الحالة الحركية للجسم، أو تغيير شكله.'))}`)}
    </div>

    <div id="force-elements" role="tabpanel" aria-labelledby="force-tab-elements" tabindex="0" hidden>
    ${section('19', 'عناصر القوة:', `
      ${experiment('أجرِبُ وأستنتج:', `
        <p><strong>أدوات التجربة:</strong> سيارات العاب أطفال، مجموعة خيوط، سطح أملس.</p>
        <div class="car-grid">${carForceScene({ id: 'book-p19-1', alt: 'سيارة عند النقطة A مع سهم يمتد نحو اليسار', arrows: [{ x1: 80, y1: 155, x2: 16, y2: 155, label: 'A', labelDy: 28 }] })}${carForceScene({ id: 'book-p19-2', alt: 'سيارة عند النقطة B مع سهم يمتد نحو اليمين', arrows: [{ x1: 328, y1: 155, x2: 404, y2: 155, label: 'B', labelDy: 28 }] })}</div>
        ${questionList(['أعلّق الخطّ بمقدمة السيارة في نقطة A، ثم أشدّ الخطّ. ماذا يحدث؟', 'أعلّق خطاً آخر في النقطة B، ثم أشدّ الخطّ. ماذا يحدث؟'])}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>ندعو النقطة التي أثّرت بها القوة في السيارة بنقطة تأثير القوة.</li></ul>`)}
      ${experiment('أجرِبُ وأستنتج:', `
        <div class="car-grid">${carForceScene({ id: 'book-p19-3', alt: 'سهم عند النقطة A يمتد نحو اليسار أفقياً', arrows: [{ x1: 80, y1: 155, x2: 16, y2: 155, label: 'A', labelDy: 28 }] })}${carForceScene({ id: 'book-p19-4', alt: 'سهم عند النقطة A يميل نحو الأعلى واليسار', arrows: [{ x1: 82, y1: 155, x2: 20, y2: 80, label: 'A', labelDx: 16 }] })}</div>
        ${questionList(['أربط مقدمة السيارة في نقطة A بخيط، ثم أشدّ الخط بقوة كما في الشكل (1).', 'أربط مقدمة السيارة في نقطة A بخيط، ثم أشدّ الخط بقوة مماثلة للقوة الأولى كما في الشكل (2).', 'هل اختلفت تأثير القوة على حركة السيارة في كلّ من الحالتين؟ ولماذا؟'])}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>إنّ تأثير القوة المطبَّقة على السيارة يتعلَّق باستقامة الخطّ المسحود الذي طُبِّقت وقعة القوة. ويُسمّى هذا المستقيم بحامل القوة.</li></ul>`)} `)}
    ${section('20', 'اتجاه القوة وشدتها', `
      ${experiment('أجرِبُ وأستنتج:', `
        <div class="car-grid">${carForceScene({ id: 'book-p20-1', alt: 'سهمان: A عند مقدمة السيارة نحو اليسار وB عند مؤخرتها نحو اليمين', arrows: [{ x1: 80, y1: 155, x2: 16, y2: 155, label: 'A', labelDy: 28 }, { x1: 328, y1: 155, x2: 404, y2: 155, label: 'B', labelDy: 28 }] })}</div>
        ${questionList(['أشدّ الخط من النقطة A فقط.', 'أشدّ الخط من النقطة B فقط.', 'هل يتغيّر اتجاه حركة السيارة؟'])}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>إنّ جهة حركة السيارة تتعلقُ بجهة القوة.</li></ul>`)}
      ${experiment('أجرِبُ وأستنتج:', `
        <div class="car-grid">${carForceScene({ id: 'book-p20-2', alt: 'سهم قصير عند النقطة A نحو اليسار', arrows: [{ x1: 80, y1: 155, x2: 32, y2: 155, label: 'A', labelDy: 28 }] })}${carForceScene({ id: 'book-p20-3', alt: 'سهم أطول عند النقطة A نحو اليسار', arrows: [{ x1: 80, y1: 155, x2: 2, y2: 155, label: 'A', labelDy: 28 }] })}</div>
        ${questionList(['أربط مقدمة السيارة في نقطة A بخيط، ثم أشدّ الخطّ بقوة كما في الشكل (1).', 'أربط مقدمة السيارة في نقطة A بخيط، ثم أشدّ الخطّ بقوة أكبر من القوة الأولى كما في الشكل (2).', 'هل اختلفت تأثير القوة على الحركة في كلّ من الحالتين؟ ولماذا؟'])}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>إنّ تأثير القوة يتعلقُ بشدّتها.</li></ul>`)}`)}
    </div>

    <div id="force-represent" role="tabpanel" aria-labelledby="force-tab-represent" tabindex="0" hidden>
    ${section('21', 'تعلَّمُّ: عناصر القوة وتمثيلها', `
      ${learnBox(`
        <ul class="check-list"><li>القوة مقدار متجهه (شعاعي) لها أربعة عناصر:</li></ul>
        <ol class="book-questions"><li><strong>نقطة التأثير:</strong> هي النقطة التي تُطبَّق فيها القوة.</li><li><strong>الحامل:</strong> هو المستقيم الذي تؤثر وقعة القوة.</li><li><strong>الجهة:</strong> هي الجهة التي تؤثر وفقهها القوة.</li><li><strong>الشدة:</strong> مقدار قابل للقياس يعبر عن القيمة العددية للقوة.</li></ol>
        <p>يُرمز لشدّة القوة بـ: ${formula('F')} وتقدَّر في الجملة الدولية ${formula('SI')} بوحدة ${formula('N')} (نيوتن).</p>`)}
      <div class="scientist-card"><div class="scientist-portrait" role="img" aria-label="صورة إسحاق نيوتن">👨‍🔬</div><p><strong>إسحاق نيوتن</strong><br>(1642–1727)</p></div>
      ${inferBox('تعرَّف:', `<p><strong>النيوتن N:</strong> قوة جدب الأرض لجسم كتلته ${formula('\\frac{1}{9.8}\\,\\mathrm{kg}')} يقع على خط عرض ${formula('45^\\circ')} ومستوى سطح البحر. سمّيت وحدة نيوتن نسبة للعالم الإنجليزي إسحاق نيوتن.</p>`)}
      <h3>تمثيل القوة:</h3>
      <p>تُمثَّل القوة هندسياً بشعاع ${formula('\\overrightarrow{OB}')} عناصره:</p>
      <ol class="book-questions"><li>المبدأ: نقطة تأثير القوة ${formula('(o)')}.</li><li>الحامل: المستقيم ${formula("xx'")} حامل القوة.</li><li>الجهة: من ${formula('o')} إلى ${formula('B')} جهة القوة.</li><li>الطولة: تناسب طولاً مع شدة القوة.</li></ol>
      ${forceVectorDiagram({ id: 'force-vector-book' })}`)}
    ${section('22', 'تطبيق:', `
      <p>مثّل بمقياس رسم مناسب (اعتبر كل ${formula('1\\,\\mathrm{cm}')} يقابل ${formula('1\\,\\mathrm{N}')} ) القوى الآتية المؤثرة في النقطة B:</p>
      <div class="figure-and-text"><div>${springScaleFigure({ id: 'book-p22-scale', needle: 1, caption: 'ربيعة القوة في صورة الكتاب' })}</div><div>
      ${questionList([`قوة أفقية متجهة نحو اليمين شدّتها ${formula('4\\,\\mathrm{N}')}.`, `قوة شاقولية متجهة نحو الأعلى شدّتها ${formula('3\\,\\mathrm{N}')}.`, `قوة شدّتها ${formula('5\\,\\mathrm{N}')} تميل عن الأفق نحو الأعلى بزاوية ${formula('30^\\circ')}.`])}
      </div></div>`)}
    </div>

    <div id="force-weight" role="tabpanel" aria-labelledby="force-tab-weight" tabindex="0" hidden>
    ${section('22–23', 'قوة الثقل وتجاربها', `
      <h3>قوة الثقل ${formula('\\vec{w}')}:</h3>
      ${experiment('أجرِبُ وأستنتج:', `
        <p><strong>أدوات التجربة:</strong> ريباع، أثقال مختلفة.</p>
        ${questionList(['أعلّق حلة الربيعة بحامل أفقي.', 'أعلّق جسماً بخطاف الربيعة، وأسجّل دلالة مؤشّر الربيعة.', ])}
        <div class="figure-and-text"><div>${springScaleFigure({ id: 'book-p22-lab', needle: 1, caption: 'الربيعة في تجربة الكتاب' })}</div></div>`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>يدلّ مؤشّر الربيعة على شدة ثقل الجسم، والتي تختلف من جسم لآخر.</li></ul>`)}
      ${inferBox('تعرَّف:', `<p><strong>ثقل الجسم:</strong> هو القوة التي تجذب بها الأرض الأجسام إليها، وتختلف من مكان لآخر. (باهمال قوة جذب الكواكب الأخرى ودوران الأرض)</p>`)}
      ${experiment('أجرِبُ وأستنتج:', `
        ${questionList(['جسمَان لهما الحجم ذاته، الأول من الحديد والثاني من البلاستيك.', 'أيهما أسهل تحريكها؟ ولماذا؟', 'أيهما أسهل تغيير حالة حركته؟ ولماذا؟', 'جسمَان من الخشب مختلفَين بالحجم.', 'أيهما أسهل تحريكها؟ ولماذا؟', 'أيهما أسهل تغيير حالة حركته؟ ولماذا؟'])}`)}
      ${inferBox('أستنتج:', `<p>إنّ مقدار ممانعة الجسم لتغيير حالته الحركية، يتوقف على كتلته، فكلما كانت كتلة الجسم أكبر كانت الممانعة أكبر.</p>`)} `)}
    </div>

    <div id="force-relation" role="tabpanel" aria-labelledby="force-tab-relation" tabindex="0" hidden>
    ${section('23', 'تعرَّف: الكتلة', `
      ${inferBox('تعرَّف:', `<p>تُعرَّف الكتلة بأنها عدد حقيقي موجب يعبر عمّا يحويه الجسم من مادة. يرمز لها بـ ${formula('m')} وتقدَّر في الجملة الدولية SI بوحدة الكيلو غرام ويرمز لها بـ ${formula('kg')}.</p>`)}
      <h3>العلاقة بين الكتلة والثقل</h3>
      ${experiment('أجرِبُ وأستنتج:', `
        <p><strong>1.</strong> أكمل الجدول الآتي:</p>
        ${table(['الجسم', `الكتلة ${formula('m\\,(\\mathrm{kg})')}`, `الثقل ${formula('w_i\\,(\\mathrm{N})')}`, `${formula('\\frac{w}{m}')} ${formula('(\\mathrm{N}\\cdot\\mathrm{kg}^{-1})')}`], [
          ['الأول', formula('m_1=0.25'), formula('w_1=2.5'), ''],
          ['الثاني', formula('m_2=0.5'), formula('w_2=5'), ''],
          ['الثالث', formula('m_3=1'), formula('w_3=10'), ''],
        ], 'جدول العلاقة بين الكتلة والثقل — أكمل عمود w/m')}
        <p><strong>2.</strong> أرسم الخط البياني الذي يمثّل تغيّر شدة الثقل مع تغيّر الكتلة</p>
        ${questionList(['ما شكل الخط البياني؟', 'ماذا أستنتج؟'])}
        <p><strong>3.</strong> أملاً الفراغات الآتية مستعيناً بالجدول السابق:</p>
        ${formula('\\frac{w_1}{......}=\\frac{......}{m_3}=\\frac{w_3}{m_3}=const', { display: true })}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>إنّ النسبة ${formula('\\frac{w}{m}')} في المكان ذاته هي مقدار ثابت يُسمّى تسارع الجاذبية الأرضية ${formula('g')} ويقدَّر في الجملة الدولية SI بوحدة ${formula('(\\mathrm{N}\\cdot\\mathrm{kg}^{-1})')}.</li></ul>`)}
      ${inferBox('ملاحظة:', `<p>قيمة تسارع الجاذبية الأرضية على سطح الأرض تختلف من مكان إلى آخر، ممّا يؤدّي إلى اختلاف شدة قوة الثقل، مع بقاء الكتلة مقداراً ثابتاً.</p>`)}
      ${inferBox('تطبيق:', `
        <p><strong>1.</strong> أحسب قيمة ثقل جسم كتلته ${quantity('10', units.kilogram)} باكمال الجدول الآتي:</p>
        ${table(['المنطقة', `تسارع الجاذبية ${formula('g(\\mathrm{N}\\cdot\\mathrm{kg}^{-1})')}`, `الثقل ${formula('w=mg\\,(\\mathrm{N})')}`], [
          ['خط الاستواء', formula('9.78'), ''],
          ['القطب الشمالي', formula('9.83'), ''],
          ['سوريا', formula('9.796'), ''],
        ], 'جدول حساب الثقل في ثلاث مناطق')}
        <p><strong>2.</strong> أقارن النتائج التي حصلت عليها، ماذا أستنتج؟</p>`)}`)}
    </div>

    <div id="force-review" role="tabpanel" aria-labelledby="force-tab-review" tabindex="0" hidden>
    ${section('26', 'تعلَّمُّ (خلاصة الدرس)', `
      <ul class="check-list">
        <li>القوة: هي كل مؤثر قادر على تغيير الحالة الحركية للجسم، أو تغيير شكله.</li>
        <li>القوة أربعة عناصر: 1. نقطة التأثير: هي النقطة التي تُطبَّق فيها القوة. 2. الحامل: هو المستقيم الذي تؤثر وقعة القوة. 3. الجهة: هي الجهة التي تؤثر وفقهها القوة. 4. الشدة: مقدار قابل للقياس يعبر عن القيمة العددية للقوة، ورمزها ${formula('F')}، وحدتها في الجملة الدولية ${formula('\\mathrm{N}')} (نيوتن).</li>
        <li>ثقل الجسم (وزنه) ${formula('w')}: هو القوة التي تجذب بها الأرض الأجسام إليها، وتختلف من مكان لآخر.</li>
        <li>عناصر قوة الثقل: 1. نقطة التأثير: مركز ثقل الجسم. 2. الحامل: الشاقول المار من نقطة التأثير. 3. الجهة: نحو الأسفل. (باتجاه سطح الأرض) 4. الشدة: تتناسب طردياً مع كتلة الجسم، وتُقدَّر في الجملة الدولية بوحدة النيوتن ${formula('\\mathrm{N}')}.</li>
        <li>كتلة الجسم: تمثّل كمية المادة التي تؤلّف الجسم وهي مقدار ثابت لا يتغيّر من مكان إلى آخر على سطح الأرض ويرمز لها بـ ${formula('m')}، وتقدَّر في الجملة الدولية SI بوحدة الكيلو غرام ${formula('\\mathrm{kg}')}.</li>
        <li>يُسمّى المقدار الثابت ${formula('\\frac{w}{m}')} بتسارع الجاذبية الأرضية، ويرمز له بـ ${formula('g')}، ويقدَّر في الجملة الدولية بوحدة ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}.</li>
        <li>تعطى شدة ثقل الجسم بالعلاقة: ${formula('w=mg')}.</li>
      </ul>`)}
    ${section('26', 'أنفكر ونشاط', `
      ${inferBox('أنفكر:', `<p>أفسِّر تغيُّر شدة ثقل رائد فضاء يهبط على سطح القمر وبقاء كتلته ثابتة.</p>`)}
      ${inferBox('نشاط:', `<p>أبحثُ في الشابكة كيف تغلُّب الإنسان على قوة الجاذبية الأرضية واستطاع أن يغزو الفضاء الخارجي. وأكتب موضوعاً عن ذلك.</p>`)}`)}
    ${section('27', 'أختبر نفسي: السؤال الأول والثاني والثالث', `
      <details class="book-exercises"><summary>السؤال الأول: اختر الإجابة الصحيحة لكلّ ممّا يأتي</summary>
      <p>1. لتمثيل القوة هندسياً (شعاعياً) يجب تحديد:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['حامل القوة فقط', 'نقطة تأثير القوة فقط', 'جهة القوة فقط', 'جميع عناصر القوة']], 'خيارات السؤال الأول — البند 1')}
      <p>2. عند قذف جسم للأعلى فإنه يصل إلى ارتفاع معين، ثم يعود إلى سطح الأرض، بسبب:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['كتلة الجسم', 'ثقل الجسم', 'حجم الجسم', 'طول الجسم']], 'خيارات السؤال الأول — البند 2')}
      <p>3. جسم كتلته ${quantity('4', units.kilogram)}، وبافتراض تسارع الجاذبية الأرضية ${formula('g=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}، فإنّ شدة قوة ثقله ${formula('w')} تساوي:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [[`400 ${formula(units.newton)}`, `40 ${formula(units.newton)}`, `0.4 ${formula(units.newton)}`, `4 ${formula(units.newton)}`]], 'خيارات السؤال الأول — البند 3')}
      <p>4. شدة قوة ثقل جسم تتناسب طردياً مع:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['طول الجسم', 'لون الجسم', 'كتلة الجسم', 'ارتفاع الجسم عن سطح البحر']], 'خيارات السؤال الأول — البند 4')}
      <p>5. لقياس شدة قوة الثقل، نستخدم:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['ميزان ذي كفتين', 'شريط مطاطي', 'ربيعة', 'ميزان حرارة']], 'خيارات السؤال الأول — البند 5')}</details>
      <details class="book-exercises"><summary>السؤال الثاني: أعطِ تفسيراً علمياً لكلّ ممّا يأتي</summary>
      ${questionList(['عندما نعلّق جسماً ثقيلاً نسبياً بحبل، يصبح الحبل مشدوداً شاقولياً.', 'تتساقط الأمطار وتمار الأشجار نحو سطح الأرض.', 'تختلف شدة ثقل الجسم من مكان إلى آخر على سطح الأرض.'])}</details>
      <details class="book-exercises"><summary>السؤال الثالث: مثِّل بالرمز القوى الآتية المؤثرة في نقطة B باستخدام مقياس رسم مناسب (كل ${formula('1\\,\\mathrm{cm}')} يقابل ${formula('10\\,\\mathrm{N}')} )</summary>
      ${questionList([`قوة أفقية متجهة نحو اليمين وشدتها ${formula('40\\,\\mathrm{N}')}.`, `قوة شاقولية متجهة نحو الأعلى شدتها ${formula('30\\,\\mathrm{N}')}.`, `قوة شدتها ${formula('50\\,\\mathrm{N}')} تميل عن الأفق نحو الأعلى بزاوية ${formula('45^\\circ')}.`])}</details>`)}
    ${section('28', 'السؤال الرابع والسؤال الخامس', `
      <details class="book-exercises"><summary>السؤال الرابع: الكرة المعلقة بحبل</summary>
      <div class="figure-and-text"><div>${hangingBallFigure({ id: 'book-p28-ball' })}</div><div>
      <p>يمثّل الشكل المجاور كرةَ كتلتها ${quantity('100', units.gram)} معلّقةً بحبل، وتؤثر فيها قوتان. وباعتبار ${formula('g=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}.</p>
      <p><strong>المطلوب:</strong></p>
      ${questionList(['اكتب اسم كل من القوتين المؤثرتين في الكرة.', 'حدّد القوة التي تحاول تحريك الكرة نحو الأرض، ثم اكتب عناصرها.', 'حدّد القوة التي تمنع سقوط الكرة نحو الأرض، ثم اكتب عناصرها.'])}
      </div></div></details>
      <details class="book-exercises"><summary>السؤال الخامس: حل المسألتين الآتيتين</summary>
      <h4>المسألة الأولى:</h4>
      <p>جسم كتلته ${formula('m=10\\,\\mathrm{kg}')}، باعتبار أنّ ${formula('g=10\\,\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}، المطلوب حساب شدة ثقله ${formula('w')}.</p>
      <h4>المسألة الثانية:</h4>
      <p>جسم شدة ثقله ${formula('w=3000\\,\\mathrm{N}')}، باعتبار أنّ تسارع الجاذبية الأرضية ${formula('g=10\\,\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}، المطلوب حساب كتلة الجسم.</p></details>`)}
    </div>
  </div>`;
}


// ————— المرحلة 3: شرح مبسط وموسع (توضيح إثرائي) —————
const extra = (title, body) => `<section class="enrichment"><div class="source-line"><span class="source-chip source-extra">توضيح إثرائي</span></div><h3>${title}</h3>${body}</section>`;
const steps = items => `<ol class="solution-steps">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;

export function forceExplainContent() {
  return `${extra('1. أربع كلمات تحدد القوة تماماً', `
    <p>حتى نقول «قوة مؤثرة» وصفاً كاملاً نذكر <strong>أربعة عناصر</strong> بلا نقصان:</p>
    ${steps([`<strong>نقطة التأثير:</strong> أين لامست القوة الجسم؟ مثل نقطة ربط الخيط بمقدمة السيارة.`, `<strong>الحامل:</strong> على أي مستقيم تقع القوة؟ هو خط وهمي يمر بنقطة التأثير.`, `<strong>الجهة:</strong> نحو أي جهة يشير السهم على الحامل؟`, `<strong>الشدة:</strong> كم مقدار القوة؟ تقاس بوحدة ${formula('N')} (نيوتن) ويرمز لها بـ ${formula('F')}.`])}
    <div class="example-callout">إذا غيّرنا عنصراً واحداً فقط تغيّر التأثير: شدُّ السيارة من الخلف بدل المقدمة يغيّر الجهة فينقلب اتجاه الحركة، كما في تجربة الكتاب ص20.</div>`)}
  ${extra('2. كيف نرسم قوة بمقياس؟', `
    <p>القوة مقدار متجه (شعاعي)، فنمثلها بسهم طوله يتناسب مع شدتها. خطوات الرسم على ورق مربعات:</p>
    ${steps([`اختر المقياس: مثلاً ${formula('1\\,\\mathrm{cm}')} تمثل ${formula('1\\,\\mathrm{N}')}.`, `احسب طول السهم: قوة ${formula('4\\,\\mathrm{N}')} تُرسم بطول ${formula('4\\,\\mathrm{cm}')}.`, `حدد نقطة التأثير، وارسم الحامل المار بها باتجاه القوة.`, `ارسم السهم من نقطة التأثير في الجهة المطلوبة، واكتب الشدة بجانبه.`])}
    ${forceVectorDiagram({ id: 'explain-force-draw' })}
    <p>في تطبيق الكتاب ص22 كل ${formula('1\\,\\mathrm{cm}')} تقابل ${formula('1\\,\\mathrm{N}')}، أما في السؤال الثالث ص27 فالمقياس أكبر: كل ${formula('1\\,\\mathrm{cm}')} تقابل ${formula('10\\,\\mathrm{N}')}، فقوة ${formula('40\\,\\mathrm{N}')} يبلغ طول سهمها ${formula('4\\,\\mathrm{cm}')} فقط.</p>`)}
  ${extra('3. ماذا تفعل القوة بالأجسام؟', `
    <p>لتأثير القوة وجهان كما في تعريف الكتاب:</p>
    <ul><li><strong>تغيّر الحالة الحركية:</strong> جسم ساكن ينطلق، أو متحرك يتسارع أو يتباطأ أو ينحرف عن اتجاهه، أو يتوقف.</li><li><strong>تغيّر الشكل:</strong> يطول النابض عند شدّه، وينضغط الإسفنج عند الضغط عليه.</li></ul>
    <p>لاحظ أن قوة المغناطيس حرّكت المسامير من بعيد دون لمسها؛ فالقوة لا تشترط التلامس، لكنها تشترط دائماً وجود مؤثر.</p>`)}
  ${extra('4. الكتلة والثقل ليسا اسماً لشيء واحد', `
    <div class="table-scroll" tabindex="0" role="region" aria-label="مقارنة بين الكتلة والثقل"><table><caption>مقارنة سريعة بين الكتلة والثقل</caption><thead><tr><th scope="col">وجه المقارنة</th><th scope="col">الكتلة ${formula('m')}</th><th scope="col">الثقل ${formula('w')}</th></tr></thead><tbody>
    <tr><td>المفهوم</td><td>كمية المادة في الجسم</td><td>قوة جذب الأرض للجسم</td></tr>
    <tr><td>الوحدة في SI</td><td>${formula('\\mathrm{kg}')}</td><td>${formula('\\mathrm{N}')}</td></tr>
    <tr><td>الثبات</td><td>ثابتة في كل مكان</td><td>يتغير بتغير المكان</td></tr>
    <tr><td>أداة القياس</td><td>الميزان ذو الكفتين</td><td>الربيعة (ميزان النابض)</td></tr>
    </tbody></table></div>
    <div class="important-note"><strong>لماذا يتغير الثقل؟</strong> لأن قيمة ${formula('g')} تختلف من مكان لآخر على سطح الأرض، والعلاقة ${formula('w=mg')} تربط الثقل بتسارع الجاذبية في مكان الجسم. وعلى سطح القمر يصبح ${formula('g')} أصغر بكثير، فيقل ثقل رائد الفضاء وبقيت كتلته كما هي تماماً.</div>`)}
  ${extra('5. وحدتان لكمية واحدة: N·kg⁻¹ و m·s⁻²', `
    <p>قرأت ${formula('g')} في صفحات الكتاب أحياناً بوحدة ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')} وأحياناً بوحدة ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}. لا تندهش: الكمية واحدة، لأن النيوتن نفسه يساوي ${formula('\\mathrm{kg}\\cdot\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}، وعند قسمته على الكيلو غرام تبقى ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}:</p>
    ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}=\\frac{\\mathrm{kg}\\cdot\\mathrm{m}\\cdot\\mathrm{s}^{-2}}{\\mathrm{kg}}=\\mathrm{m}\\cdot\\mathrm{s}^{-2}', { display: true })}
    <p>لذلك نكتب في حساب الثقل ${formula('g=10\\,\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}، ونقرأ في مسائل التسارع ${formula('g=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}، والقيمة العددية نفسها: ${formula('10')}.</p>`)}`;
}

// ————— المرحلة 4: أمثلة مفصلة —————
const exampleShell = (title, source, given, required, solution, check) => `<article class="worked-example"><div class="source-line"><span class="source-chip ${source === 'توضيح إثرائي' ? 'source-extra' : ''}">${source}</span></div><h3>${title}</h3><div class="given-required"><div><h4>المعطيات</h4>${given}</div><div><h4>المطلوب</h4>${required}</div></div><h4>طريقة التفكير والحل</h4>${solution}<p class="answer-check"><strong>التحقق:</strong> ${check}</p></article>`;

export function forceExamplesContent() {
  return `${exampleShell('تمثيل قوة مائلة بالمقياس', 'تطبيق من الكتاب · ص22',
    `<ul><li>قوة شدتها ${formula('5\\,\\mathrm{N}')} تميل عن الأفق نحو الأعلى بزاوية ${formula('30^\\circ')}.</li><li>المقياس: كل ${formula('1\\,\\mathrm{cm}')} يقابل ${formula('1\\,\\mathrm{N}')}.</li></ul>`,
    '<p>طول سهم القوة واتجاهه عن الأفق.</p>',
    steps([`من المقياس: طول السهم يوازي الشدة، لذلك ${formula('5\\,\\mathrm{N} \\rightarrow 5\\,\\mathrm{cm}')}.`, `أرسم الحامل خطاً يصنع مع الأفق زاوية ${formula('30^\\circ')} ماراً بنقطة التأثير.`, `أرسم السهم من نقطة التأثير نحو الأعلى على الحامل، وأكتب الشدة بجانبه.`]),
    `المركبة القائمة للمثال ${formula('5\\sin30^\\circ=2.5\\,\\mathrm{N}')} والأفقية ${formula('5\\cos30^\\circ \\approx 4.33\\,\\mathrm{N}')}؛ والسهم الواحد يمثل القوة كاملة بطول ${formula('5\\,\\mathrm{cm}')}.`)}
  ${exampleShell('حساب الثقل من الكتلة', 'من أسئلة الكتاب · ص27',
    `<ul><li>${formula('m=4\\,\\mathrm{kg}')}</li><li>${formula('g=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}</li></ul>`,
    `<p>شدة قوة الثقل ${formula('w')} بوحدة النيوتن.</p>`,
    steps([`أكتب علاقة الكتاب:${formula('w=mg', { display: true })}`, `أعوّض بالقيم:${formula('w=4\\times10=40\\,\\mathrm{N}', { display: true })}`]),
    `الكتلة بالكيلو غرام والتسارع بوحدته الدولية، فتكون النتيجة بالنيوتن مباشرة. لو اختلّت وحدة واحدة لاختلّ الناتج.`)}
  ${exampleShell('الثقل في ثلاث مناطق من الأرض', 'تطبيق من الكتاب · ص25',
    `<ul><li>${formula('m=10\\,\\mathrm{kg}')} ثابتة في كل مكان.</li><li>${formula('g=9.78')} عند خط الاستواء، و${formula('9.796')} في سوريا، و${formula('9.83')} عند القطب الشمالي، جميعها بوحدة ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}.</li></ul>`,
    '<p>شدة الثقل في كل منطقة، ثم المقارنة والاستنتاج.</p>',
    steps([`عند خط الاستواء:${formula('w=10\\times9.78=97.8\\,\\mathrm{N}', { display: true })}`, `في سوريا:${formula('w=10\\times9.796=97.96\\,\\mathrm{N}', { display: true })}`, `عند القطب الشمالي:${formula('w=10\\times9.83=98.3\\,\\mathrm{N}', { display: true })}`]),
    `القيم الثلاث متقاربة لأن اختلاف ${formula('g')} على سطح الأرض صغير، وهي تتصاعد من خط الاستواء إلى القطب، بينما بقيت الكتلة ${formula('10\\,\\mathrm{kg}')} بلا تغيير.`)}
  ${exampleShell('من الثقل إلى الكتلة (المسألة العكسية)', 'مسألة من الكتاب · ص28',
    `<ul><li>${formula('w=3000\\,\\mathrm{N}')}</li><li>${formula('g=10\\,\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}</li></ul>`,
    '<p>كتلة الجسم.</p>',
    steps([`من علاقة الكتاب ${formula('w=mg')} نحسب الكتلة بقسمة الطرفين على ${formula('g')}:${formula('m=\\frac{w}{g}', { display: true })}`, `أعوّض:${formula('m=\\frac{3000}{10}=300\\,\\mathrm{kg}', { display: true })}`]),
    `نتحقق بالعكس: ${formula('w=mg=300\\times10=3000\\,\\mathrm{N}')} وهي المعطى نفسه.`)}
  ${exampleShell('القوتان في الكرة المعلقة', 'من السؤال الرابع · ص28',
    `<ul><li>كرة كتلتها ${formula('100\\,\\mathrm{g}=0.1\\,\\mathrm{kg}')} معلقة بحبل.</li><li>${formula('g=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}.</li></ul>`,
    '<p>اسم كل قوة، والقوة التي تحاول تحريك الكرة نحو الأرض وعناصرها، والقوة التي تمنع سقوطها وعناصرها.</p>',
    steps([`شدة الثقل:${formula('w=mg=0.1\\times10=1\\,\\mathrm{N}', { display: true })}`, `<strong>الثقل ${formula('w')}:</strong> نقطة التأثير مركز ثقل الكرة، والحامل الشاقول المار بها، والجهة نحو الأسفل (باتجاه سطح الأرض)، والشدة ${formula('1\\,\\mathrm{N}')}. هو القوة التي تحاول تحريك الكرة نحو الأرض.`, `<strong>شد الحبل ${formula('t')}:</strong> نقطة التأثير نقطة اتصال الحبل بالكرة، والحامل الشاقول نفسه، والجهة نحو الأعلى، والشدة ${formula('1\\,\\mathrm{N}')} أيضاً لأن الكرة تبقى معلقة.`]),
    'القوتان متعاكستان على الحامل نفسه وتتساوى شدتاهما، لذلك تبقى الكرة معلقة لا تهبط ولا تصعد.')}
  ${exampleShell('لماذا نستخدم الربيعة لقياس الثقل؟', 'توضيح إثرائي',
    `<ul><li>الربيعة نابض يدل مؤشرها على شدة القوة الشاقولة المسحوبة.</li><li>الميزان ذو الكفتين يقارن كتلتين.</li></ul>`,
    '<p>الأداة المناسبة لقياس شدة قوة الثقل في السؤال الخامس ص27.</p>',
    steps(['أعلق جسماً بخطاف الربيعة كما في تجربة الكتاب ص22.', 'يتمدد النابض حتى يتوازن مع قوة الثقل.', 'يقرأ المؤشر شدة الثقل مباشرة بوحدة النيوتن.']),
    'هذا يوافق استنتاج الكتاب: «يدل مؤشر الربيعة على شدة ثقل الجسم، والتي تختلف من جسم لآخر»، وهو سبب إجابة السؤال الخامس: الربيعة.')}
  `;
}

// ————— المرحلة 5: المختبر التفاعلي —————
export function forceActivityContent() {
  return `<div class="lab-intro"><h3>مختبر القوة التفاعلي</h3><p>ثلاث محطات عملية: عناصر القوة على سيارة، والعلاقة بين الكتلة والثقل في مناطق الأرض، والتدرب على رسم القوى بمقياس. غيّر القيم وراقب النتائج فوراً.</p></div>
  ${forceLabShell()}`;
}

// ————— المرحلة 6: أسئلة فهم —————
export function forceQuestionsContent() {
  return `<div class="assessment-intro"><strong>جرّب ثم افهم:</strong> يمكنك تغيير إجابتك، وسيظهر تفسير بعد كل اختيار.</div>${forceUnderstandingContent()}`;
}

// ————— المرحلة 7: تدريب متدرج —————
export function forcePracticeContentStage() {
  return forcePracticeContent();
}

// ————— المرحلة 8: ملخص —————
export function forceSummaryContent() {
  return `<div class="summary-hero"><h3>الفكرة المحورية</h3><p>القوة مؤثر يغير الحالة الحركية للجسم أو شكله، وتوصف بأربعة عناصر. أما ثقل الجسم فهو قوة جذب الأرض له، تُحسب من كتلته وعلاقة ${formula('w=mg')}.</p></div>
  <div class="summary-grid"><section><h3>تعريفات سريعة</h3><dl class="summary-definitions"><dt>القوة</dt><dd>كل مؤثر قادر على تغيير الحالة الحركية للجسم أو تغيير شكله.</dd><dt>عناصر القوة</dt><dd>نقطة التأثير، الحامل، الجهة، الشدة.</dd><dt>النيوتن ${formula('N')}</dt><dd>وحدة شدة القوة في الجملة الدولية.</dd><dt>الكتلة ${formula('m')}</dt><dd>كمية المادة في الجسم، ثابتة في كل مكان، ووحدتها ${formula('\\mathrm{kg}')}.</dd><dt>الثقل ${formula('w')}</dt><dd>قوة جذب الأرض للجسم، يتغير من مكان لآخر، ووحدته ${formula('N')}.</dd><dt>تسارع الجاذبية ${formula('g')}</dt><dd>النسبة الثابتة ${formula('\\frac{w}{m}')} في المكان الواحد.</dd></dl></section>
  <section><h3>القانون والوحدات</h3>${formula('w=mg', { display: true })}${formula('m=\\frac{w}{g}', { display: true })}<p>${formula('[g]=\\mathrm{N}\\cdot\\mathrm{kg}^{-1}=\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}</p><p>على سطح الأرض: من ${formula('9.78')} إلى ${formula('9.83\\,\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')} بحسب المكان</p><p>قياس الثقل بالربيعة، وقياس الكتلة بالميزان ذي الكفتين</p></section></div>
  <h3>عناصر القوة وقوة الثقل</h3><div class="graph-compare"><div>${forceVectorDiagram({ id: 'summary-vector' })}<p><strong>قوة عامة ${formula('F')}:</strong> عناصرها الأربعة تُقرأ من الرسم: المبدأ والحامل والجهة والطول.</p></div><div>${hangingBallFigure({ id: 'summary-ball' })}<p><strong>الكرة المعلقة:</strong> الشد ${formula('t')} نحو الأعلى والثقل ${formula('w')} نحو الأسفل.</p></div></div>
  <div class="summary-reminders"><span>القوة متجهة: أربعة عناصر إلزامية</span><span>الرسم بالمقياس: كل 1 cm يقابل 1 N أو كما يحدد السؤال</span><span>الكتلة ثابتة والثقل متغير</span><span>ربط بالدرس الأول: القوة هي ما يغيّر الحالة الحركية التي وصفناها</span></div>`;
}

// ————— المرحلة 9: دفتر الطالب —————
const forceNotebookBodies = {
  idea: `<p>القوة مؤثر يغير الحالة الحركية للجسم أو شكله. أصف القوة بأربعة عناصر، وأمثلها بسهم بمقياس، وأميز بين الكتلة الثابتة والثقل المتغير عبر علاقة ${formula('w=mg')}.</p>`,
  definitions: `<ul><li><strong>القوة:</strong> كل مؤثر قادر على تغيير الحالة الحركية للجسم، أو تغيير شكله.</li><li><strong>نقطة التأثير:</strong> النقطة التي تُطبق فيها القوة.</li><li><strong>الحامل:</strong> المستقيم الذي تؤثر وفقه القوة.</li><li><strong>الجهة:</strong> الجهة التي تؤثر وفقه القوة.</li><li><strong>الشدة:</strong> مقدار قابل للقياس يعبر عن القيمة العددية للقوة، رمزها ${formula('F')} ووحدتها النيوتن.</li><li><strong>ثقل الجسم:</strong> القوة التي تجذب بها الأرض الأجسام إليها، وتختلف من مكان لآخر.</li><li><strong>الكتلة:</strong> كمية المادة المؤلفة للجسم، مقدار ثابت لا يتغير من مكان لآخر على سطح الأرض.</li></ul>`,
  laws: `${formula('w=mg', { display: true })}${formula('m=\\frac{w}{g}', { display: true })}${formula('g=\\frac{w}{m}=\\text{const}', { display: true })}<ul><li>${formula('m')}: الكتلة بوحدة ${formula('\\mathrm{kg}')}.</li><li>${formula('w')}: الثقل بوحدة ${formula('N')}.</li><li>${formula('g')}: تسارع الجاذبية، وحدته ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')} أي ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-2}')}.</li></ul><p>التمثيل الشعاعي: ${formula('\\overrightarrow{OB}')} بمقياس مناسب (كل 1 cm يقابل 1 N أو 10 N بحسب السؤال).</p>`,
  diagrams: `<div class="notebook-graphs">${forceVectorDiagram({ id: 'notebook-vector' })}${hangingBallFigure({ id: 'notebook-ball' })}</div><p>سهم يمثل القوة على الحامل: المبدأ نقطة التأثير، والجهة نحو رأس السهم، والطول يناسب الشدة. الكرة المعلقة: شد الحبل نحو الأعلى والثقل نحو الأسفل.</p>`,
  procedures: `<ol><li>أعلق حلقة الربيعة بحامل أفقي وأضبط المؤشر على الصفر.</li><li>أعلق جسماً بخطاف الربيعة وأسجل دلالة المؤشر.</li><li>أكرر بجسوم مختلفة وأسجل في جدول للكتلة والثقل.</li><li>أحسب ${formula('\\frac{w}{m}')} لكل صف وألاحظ ثباته في المكان الواحد.</li><li>أرسم الخط البياني للثقل بدلالة الكتلة فأحصل على مستقيم يمر بالمبدأ.</li></ol><p><strong>للرسم بالمقياس:</strong> أختار المقياس ← أحسب الطول ← أرسم الحامل ← أرسم السهم من نقطة التأثير بالجهة المطلوبة.</p>`,
  comparisons: `<div class="table-scroll" tabindex="0"><table><thead><tr><th>وجه المقارنة</th><th>الكتلة</th><th>الثقل</th></tr></thead><tbody><tr><td>المفهوم</td><td>كمية المادة</td><td>قوة جذب الأرض</td></tr><tr><td>الرمز والوحدة</td><td>${formula('m')} (${formula('\\mathrm{kg}')})</td><td>${formula('w')} (${formula('N')})</td></tr><tr><td>الثبات</td><td>ثابتة في كل مكان</td><td>يتغير بتغير ${formula('g')}</td></tr><tr><td>أداة القياس</td><td>ميزان ذو كفتين</td><td>ربيعة</td></tr></tbody></table></div><p>قيم ${formula('g')} في تطبيق الكتاب: خط الاستواء ${formula('9.78')}، سوريا ${formula('9.796')}، القطب الشمالي ${formula('9.83')} بوحدة ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')}.</p>`,
  mistakes: `<ul><li>نسيان أحد عناصر القوة الأربعة عند التمثيل، وخاصة نقطة التأثير.</li><li>رسم سهم لا يتناسب طوله مع الشدة دون مقياس معلن.</li><li>الخلط بين الكتلة والثقل: الكتلة بوحدة ${formula('\\mathrm{kg}')} والثقل بوحدة ${formula('N')}.</li><li>تعويض ${formula('g')} بقيمة مكان آخر عند حساب الثقل في مكان محدد.</li><li>نسيان تحويل الغرام إلى كيلوغرام: ${formula('100\\,\\mathrm{g}=0.1\\,\\mathrm{kg}')}.</li><li>كتابة النتيجة دون وحدة.</li></ul>`,
  exam: `<ul><li>احفظ تعريف القوة وعناصرها الأربعة كما وردت.</li><li>تدرب على ${formula('w=mg')} وعكسها ${formula('m=\\frac{w}{g}')}.</li><li>اعرف الوحدات: ${formula('N')} للقوة والثقل، ${formula('\\mathrm{kg}')} للكتلة، ${formula('\\mathrm{N}\\cdot\\mathrm{kg}^{-1}')} أو ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-2}')} للتسارع ${formula('g')}.</li><li>في الرسم: كل 1 cm يقابل 1 N في تطبيق ص22 و10 N في السؤال الثالث ص27.</li><li>في الكرة المعلقة: الثقل نحو الأسفل وشد الحبل نحو الأعلى.</li><li>اختلاف الثقل بين مكانين سببه اختلاف ${formula('g')} مع ثبات الكتلة.</li></ul>`,
  checklist: `<div class="review-checklist">${['أعرف تعريف القوة وأمثلة عليها.', 'أعدد عناصر القوة الأربعة دون نقصان.', 'أمثل قوة بسهم بمقياس مناسب على الحامل الصحيح.', 'أفرق بين الكتلة والثقل مفهوماً ووحدة وأداة.', 'أحسب الثقل من الكتلة والعكس بوحدات صحيحة.', 'أفسر اختلاف الثقل بين مكانين على سطح الأرض.', 'أحدد القوتين في جسم معلق وأسمي عناصرهما.'].map(item => `<label><input type="checkbox"><span>${item}</span></label>`).join('')}</div>`,
};

export function forceNotebookContent() {
  return `<p class="notebook-note">مواد للمراجعة والدراسة. لا يحتوي الدفتر على إجابات المعلم.</p><div class="note-grid">${notebookSections.map(section => `<article class="note-card ${['checklist', 'definitions', 'mistakes'].includes(section.id) ? 'note-wide' : ''}"><h3>${section.title}</h3>${forceNotebookBodies[section.id]}</article>`).join('')}</div>`;
}
