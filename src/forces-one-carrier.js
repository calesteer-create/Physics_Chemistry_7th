// درس القوى على حامل واحد — الوحدة الأولى، الصفحات 29–40.
// نصوص الكتاب منقولة كما طُبعت (بما فيها: «أقرب» في تجربة ص35، و«الطولة»، و«لأخر»).
// كل توضيح إضافي منفصل بعنوان «توضيح إثرائي»، وكل تدريب من إعداد المنصة موسوم «من إعداد المنصة».
import { formula, quantity, units } from './math.js';
import {
  bookForcePairFigure, tugOfWarFigure, singleForceRayFigure, sameDirectionPairFigure, verticalWeightsFigure, bookOppositeResultFigure,
  oppositePairFigure, resultantScaleFigure, springPairFigure, springScaleReadingFigure, actionReactionFigure,
  teamForcesFigure, riflePerpFigure, carPushFigure, actionReactionExamplesFigure, parachuteFigure,
} from './diagrams.js';
import { notebookSections } from './course.js';
import { resultantLabShell } from './resultant-lab.js';
import { forcesUnderstandingContent, forcesPracticeContentStage as forcesDrillsStage } from './forces-assessments.js';

const section = (pages, title, body, id = '') => `<section class="book-section" ${id ? `id="${id}"` : ''}>
  <div class="source-line"><span class="source-chip">من الكتاب</span><span>الصفحة ${pages}</span></div>
  <h3>${title}</h3>${body}</section>`;
const definition = (term, text) => `<div class="definition"><strong>${term}</strong><p>${text}</p></div>`;
const questionList = items => `<ol class="book-questions">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
const table = (headers, rows, caption) => `<div class="table-scroll" tabindex="0" role="region" aria-label="${caption}"><table><caption>${caption}</caption><thead><tr>${headers.map(head => `<th scope="col">${head}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const experiment = (title, body) => `<div class="experiment"><h4>${title}</h4>${body}</div>`;
const inferBox = (title, body) => `<div class="book-note"><strong>${title}</strong>${body}</div>`;
const learnBox = body => `<div class="learn-box"><h4>تعلَّمُّ:</h4>${body}</div>`;
const extra = (title, body) => `<section class="enrichment"><div class="source-line"><span class="source-chip source-extra">توضيح إثرائي</span></div><h3>${title}</h3>${body}</section>`;
const steps = items => `<ol class="solution-steps">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;

// ————— المرحلة 1: اكتشاف وتمهيد —————
export function forcesDiscoverContent() {
  return `<div class="discovery-card">
    <span class="discovery-icon" aria-hidden="true">📚</span>
    <div><h3>هل تتحرّك الأجسام بشرط وجود قوة مؤثّرة فيها؟</h3><p>هذا سؤال الكتاب ص29 نفسه. في الصورة كتاب ساكن على طاولة، أُثّر فيه بقوة أفقيّة نحو اليمين فتحرّك إلى اليمين، ثم أُثّر فيه بقوة نحو اليسار فتحرّك إلى اليسار. لكن ماذا لو أثّرنا فيه بالقوتين معاً؟ وإذا تحرّك، فبأي اتجاه؟</p></div>
  </div>
  <figure class="discovery-force-figure">${bookForcePairFigure({ id: 'discover-pair' })}<figcaption>الرسم يوضح الاتجاهين فقط؛ لا يُستدل من طولي السهمين على شدتي القوتين في سؤال التوقع.</figcaption></figure>
  <div class="prediction" data-discovery>
    <h3>توقّع قبل أن تبدأ</h3><p>كتاب ساكن على طاولة أُثّر فيه بقوتين أفقيّتين متعاكستين شدّتاهما مختلفتان. إلى أي اتجاه يتحرّك؟</p>
    <div class="choice-row" role="group" aria-label="توقع اتجاه حركة الكتاب تحت قوتين متعاكستين">
      <button class="choice text-choice" data-discovery-answer="bigger" data-discovery-feedback="توقّع موافق لما ستجده في الكتاب: عندما تكون القوتان متعاكستين على الحامل نفسه، تتجه الحركة نحو جهة القوة الأكبر، وتكون شدة المحصّلة فرق الشدّتين." aria-pressed="false">إلى جهة القوة الأكبر</button>
      <button class="choice text-choice" data-discovery-answer="smaller" data-discovery-feedback="الحركة لا تكون نحو القوة الأصغر؛ فقوة أكبر في الجهة المقابلة تغلبها. عد إلى التجربة في الصفحات التالية." aria-pressed="false">إلى جهة القوة الأصغر</button>
      <button class="choice text-choice" data-discovery-answer="still" data-discovery-feedback="يبقى ساكناً إذا تعادلت الشدّتان فقط. لكن الشدّتين مختلفتان هنا، فكّر في الفرق بينهما." aria-pressed="false">يبقى ساكناً دائماً</button>
    </div><p class="feedback" data-discovery-feedback aria-live="polite">اختر توقعك، ثم انتقل إلى محتوى الكتاب لتتأكد.</p>
  </div>
  <section class="book-section"><div class="source-line"><span class="source-chip">من الكتاب · ص29</span></div><h3>الكلمات المفتاحية والهدف من الدرس</h3>
    <p class="keywords">محصّلة القوى – قوة الفعل – قوة ردّ الفعل</p>
    <p><strong>الأهداف كما وردت:</strong></p>
    ${questionList(['يوضّح بالرسم القوى على حامل واحد.', 'يحدّد عناصر محصّلة قوتين على حامل واحد وبجهة واحدة.', 'يحدّد عناصر محصّلة قوتين على حامل واحد وبجهتين متعاكستين.', 'يتعرّف تجريبياً القوتين المتعاكستين مباشرة.', 'يشرح بأسلوبه الخاص مبدأ الفعل وردّ الفعل.', 'يذكر بعض تطبيقات مبدأ الفعل وردّ الفعل في الحياة.'])}
  </section>`;
}

// ————— المرحلة 2: محتوى الكتاب —————
export function forcesBookContent() {
  return `<div class="book-content">
    <div class="source-notice"><strong>حدود هذا القسم:</strong> النصوص والتعريفات والتجارب والتطبيقات والأسئلة هنا من الكتاب (الصفحات 29–40). التوضيحات الإضافية موجودة فقط في المرحلة التالية تحت عنوان «توضيح إثرائي». الكلمات منقولة كما طُبعت في الكتاب.</div>
    <nav class="book-index" role="tablist" aria-label="أجزاء محتوى الكتاب">
      <button type="button" data-book-tab="forces-start" id="forces-tab-start" role="tab" aria-controls="forces-start" aria-selected="true" tabindex="0">البداية والأهداف</button><button type="button" data-book-tab="forces-same" id="forces-tab-same" role="tab" aria-controls="forces-same" aria-selected="false" tabindex="-1">قوتان بجهة واحدة</button><button type="button" data-book-tab="forces-opposite" id="forces-tab-opposite" role="tab" aria-controls="forces-opposite" aria-selected="false" tabindex="-1">قوتان متعاكستان</button><button type="button" data-book-tab="forces-direct" id="forces-tab-direct" role="tab" aria-controls="forces-direct" aria-selected="false" tabindex="-1">المتعاكستان مباشرة</button><button type="button" data-book-tab="forces-reaction" id="forces-tab-reaction" role="tab" aria-controls="forces-reaction" aria-selected="false" tabindex="-1">مبدأ الفعل وردّ الفعل</button><button type="button" data-book-tab="forces-learn" id="forces-tab-learn" role="tab" aria-controls="forces-learn" aria-selected="false" tabindex="-1">تعلَّمُّ وأختبر نفسي</button><button type="button" data-book-tab="forces-problems" id="forces-tab-problems" role="tab" aria-controls="forces-problems" aria-selected="false" tabindex="-1">المسائل والنشاط</button>
    </nav>

    <div id="forces-start" role="tabpanel" aria-labelledby="forces-tab-start" tabindex="0">
    ${section('29', 'الدرس الثالث: القوى على حامل واحد', `
      <div class="book-columns"><div><h4>الأهداف</h4><ul class="check-list"><li>يوضّح بالرسم القوى على حامل واحد.</li><li>يحدّد عناصر محصّلة قوتين على حامل واحد وبجهة واحدة.</li><li>يحدّد عناصر محصّلة قوتين على حامل واحد وبجهتين متعاكستين.</li><li>يتعرّف تجريبياً القوتين المتعاكستين مباشرة.</li><li>يشرح بأسلوبه الخاص مبدأ الفعل وردّ الفعل.</li><li>يذكر بعض تطبيقات مبدأ الفعل وردّ الفعل في الحياة.</li></ul></div>
      <div><h4>الكلمات المفتاحية</h4><p class="keywords">محصّلة القوى – قوة الفعل – قوة ردّ الفعل</p></div></div>
      <p>حينما أشاهد أجساماً تتحرّك، هل يشترط وجود قوة معينة تؤثر فيها؟</p>
      <p>فإذا أثّرت بقوة ما في كتابك الساكن على منضدة أفقيّة باتجاه اليمين، فإنّه يتحرّك إلى اليمين، وإذا أثّرت فيه بقوة باتجاه اليسار، فإنّه يتحرّك إلى اليسار. لكن إذا أثّرت فيه بكلتا القوتين، فهل يتحرّك؟ وإذا تحرّك فبأي اتجاه؟</p>
      ${bookForcePairFigure({ id: 'book-p29-pair', caption: 'كتاب ساكن على طاولة تؤثر فيه قوتان أفقيّتان متعاكستان' })}`)}
    ${section('30', 'أجرِبُ وأستنتجُ: تجربة لعبة شدّ الحبل', `
      ${experiment('أجرِبُ وأستنتجُ:', `
        <p><strong>أدوات التجربة:</strong> لإجراء التجربة أحتاج إلى: حبل.</p>
        <p>ألعبُ مع زميلي لعبة شد الحبل.</p>
        ${tugOfWarFigure({ id: 'book-p30-tug' })}
        <p>نؤثّر على الحبل بقوتين مختلفتين بالشدّة وعلى استقامة واحدة وبجهتين متعاكستين.</p>
        ${questionList(['ما حامل القوة التي أؤثّر بها على الحبل وما جهتها؟', 'ما حامل القوة التي يؤثّر بها زميلي على الحبل وما جهتها؟', 'ماذا يمثّل الحبل بالنسبة للقوتين السابقتين؟'])}`)}
      ${inferBox('أستنتج:', `<ul class="check-list"><li>القوى التي تؤثّر وفق مستقيم واحد تُسمى بالقوى على حامل واحد.</li><li>الحبل في التجربة السابقة هو المستقيم الذي يمثّل حامل كلّ من القوتين.</li></ul>`)}
      ${inferBox('أاحظ وأستنتج:', `
        <p>وقفت سيارة بسبب عطل على طريق أفقيّة مستقيمة، أخذ السائق حبلاً وربطها من الأمام، وبدأ يشدّها، فإذا علمت أنّ سحب السيارة يحتاج إلى قوة شدّتها <span dir="ltr">1000 N</span>.</p>
        ${carPushFigure({ id: 'book-p30-car' })}
        ${questionList(['هل يمكن لشخصين شدّة قوة كلّ منهما <span dir="ltr">400 N</span> أن يسحبا السيارة؟ ولماذا برأيك؟', 'إذا أراد شخص ثالث المساعدة في سحب السيارة. فكم يجب أن تكون شدّة قوته ليتحقّق ذلك؟', 'هل يمكن الاستعاضة عن قوى الأشخاص الثلاثة بقوة سيارة واحدة؟ وكم يجب أن تكون أقل شدّة قوة لها ليتمّ سحب السيارة الأولى؟'])}`)}`)}
    </div>

    <div id="forces-same" role="tabpanel" aria-labelledby="forces-tab-same" tabindex="0" hidden>
    ${section('31', 'محصّلة قوتين على حامل واحد وبجهة واحدة', `
      ${experiment('أجرِبُ وأستنتجُ:', `
        <p><strong>أدوات التجربة:</strong> من حقيبة الميكانيك وربيعة، علبة صنجات.</p>
        <div class="figure-and-text"><div>${springScaleReadingFigure({ id: 'book-p31-scale', first: 1, second: 2 })}</div><div>
        ${questionList(['أعلّق الربيعة بمحور أفقي على اللوح المعدني.', 'أعلّق بالربيعة ثقلاً <span dir="ltr">w₁</span>. وأسجّل دلالة المؤشّر.', 'أعلّق بالربيعة إضافياً ثقلاً <span dir="ltr">w₂</span>. وأسجّل دلالة المؤشّر.', 'أعلّق بالربيعة ثقلاً <span dir="ltr">w=w₁+w₂</span>. وأسجّل دلالة المؤشّر. ماذا أستنتج؟'])}</div></div>`)}
      ${inferBox('أستنتج:', `<p>يمكن لقوة واحدة أن تترك ذاته الأثر الذي تركته قوّتان أو أكثر في الربيعة وتُسمى محصّلة القوى.</p>
        ${definition('محصّلة قوتين (F̄₁، F̄₂) على حامل واحد وبجهة واحدة هي قوة وحيدة عناصرها:', `<ol class="book-questions"><li><strong>نقطة التأثير:</strong> نقطة التأثير المشتركة للقوتين.</li><li><strong>الحامل:</strong> حامل القوتين.</li><li><strong>الجهة:</strong> بجهة القوتين.</li><li><strong>الشدة:</strong> مجموع شدّتي القوتين <span class="formula" dir="ltr">F=F₁+F₂</span>.</li></ol>`)}
        <div class="figure-and-text"><div>${verticalWeightsFigure({ id: 'book-p31-pair' })}</div><div><p>رسم الكتاب لثقلين متتاليين على نقطة تأثيرهما المشتركة، وبجهة واحدة نحو الأسفل، والمحصّلة <span class="formula" dir="ltr">F</span> بطولهما معاً.</p></div></div>`)}`)}
    ${section('32', 'تطبيق محلول: قوتان على حامل واحد وبجهة واحدة', `
      ${resultantScaleFigure({ id: 'book-p32-solution', newtonPerCm: 10, rows: [
        { label: 'F', newton: 50, color: '#dc2626', marker: true },
        { label: 'F₂', newton: 30, color: '#2563eb' },
        { label: 'F₁', newton: 20, color: '#f59e0b' },
      ], caption: 'تمثيل القوتين على حامل واحد بجهة واحدة ومحصلتهما بمقياس: كل 1 cm يمثل 10 N' })}
      <p>قوتان <span class="formula" dir="ltr">F̄₁</span> و<span class="formula" dir="ltr">F̄₂</span> على حامل واحد وبجهة واحدة، شدّتاهما <span class="formula" dir="ltr">F₁=20 N</span> و<span class="formula" dir="ltr">F₂=30 N</span>. تؤثّران في النقطة <span class="formula" dir="ltr">(o)</span>.</p>
      <p><strong>المطلوب:</strong> أحدّد بالكتابة والرسم (بمقياس مناسب) عناصر محصّلة هاتين القوتين، وأحسب شدّتها.</p>
      <p><strong>الحل:</strong></p>
      <p>مقياس الرسم: كل <span class="formula" dir="ltr">1 cm</span> يمثّل <span class="formula" dir="ltr">10 N</span>.</p>
      ${questionList(['نمثّل القوة <span class="formula" dir="ltr">F̄₁</span> بشعاع طوله <span class="formula" dir="ltr">2 cm</span>.', 'نمثّل القوة <span class="formula" dir="ltr">F̄₂</span> بشعاع طوله <span class="formula" dir="ltr">3 cm</span>.', 'نمثّل محصّلة القوتين <span class="formula" dir="ltr">F̄</span> بشعاع طوله <span class="formula" dir="ltr">5 cm</span>.'])}
      <p><strong>عناصر المحصّلة:</strong></p>
      ${questionList(['<strong>نقطة التأثير:</strong> نقطة التأثير المشتركة للقوتين <span class="formula" dir="ltr">(o)</span>.', '<strong>الحامل:</strong> حامل القوتين.', '<strong>الجهة:</strong> بجهة القوتين.', `<strong>الشدة:</strong> مجموع شدّتي القوتين <span class="formula" dir="ltr">F=F₁+F₂</span>، ${formula('F=20+30=50\\,\\mathrm{N}')}`])}
      ${singleForceRayFigure({ id: 'book-p32-ray' })}`)}
    </div>

    <div id="forces-opposite" role="tabpanel" aria-labelledby="forces-tab-opposite" tabindex="0" hidden>
    ${section('33', 'محصّلة قوتين على حامل واحد وبجهتين متعاكستين', `
      ${experiment('أجرِبُ وأستنتجُ:', `
        <p><strong>أدوات التجربة:</strong> من حقيبة الميكانيك ربيعان، خيوط من علبة الملحقات.</p>
        ${questionList(['نأخذ أنا وزميلي ربيعتين مدرّجتين بالنيوتن، ونعلّق خطّيهما بحلقة كما في الشكل.', 'أدع زميلي يشدّ الربيعة الأولى بقوة <span class="formula" dir="ltr">F̄₁</span>، وأشدّ الربيعة الثانية بقوة <span class="formula" dir="ltr">F̄₂</span> وفق الحامل ذاته باتجاهين متعاكسين.', 'إلى أي جهة تتحرّك الحلقة في كلّ من الحالتين الآتيتين: إذا كانت <span class="formula" dir="ltr">F₁ &gt; F₂</span>، إذا كانت <span class="formula" dir="ltr">F₁ &lt; F₂</span>.'])}`)}
      ${springPairFigure({ id: 'book-p33-pair' })}
      ${inferBox('أستنتج:', `${definition('محصّلة قوتين (F̄₁، F̄₂) على حامل واحد وبجهتين متعاكستين هي قوة وحيدة عناصرها:', `<ol class="book-questions"><li><strong>نقطة التأثير:</strong> نقطة التأثير المشتركة للقوتين.</li><li><strong>الحامل:</strong> حامل القوتين.</li><li><strong>الجهة:</strong> بجهة القوة الأكبر.</li><li><strong>الشدة:</strong> حاصل طرح شدّتي القوتين <span class="formula" dir="ltr">F=F₁-F₂</span> إذا كانت <span class="formula" dir="ltr">F₁ &gt; F₂</span>.</li></ol>`)}
        <div class="figure-and-text"><div>${bookOppositeResultFigure({ id: 'book-p33-result' })}</div><div><p>رسم الكتاب: <span class="formula" dir="ltr">F̄</span> نحو اليمين بجهة القوة الأكبر <span class="formula" dir="ltr">F̄₁</span>.</p></div></div>`)}`)}
    ${section('34', 'تطبيق محلول وقوتان متعاكستان مباشرة', `
      <p><strong>تطبيق محلول:</strong> قوتان <span class="formula" dir="ltr">F̄₁</span> و<span class="formula" dir="ltr">F̄₂</span> على حامل واحد وبجهتين متعاكستين، شدّتاهما <span class="formula" dir="ltr">F₁=20 N</span> و<span class="formula" dir="ltr">F₂=30 N</span>. تؤثّران في نقطة <span class="formula" dir="ltr">(o)</span>.</p>
      <p><strong>المطلوب:</strong></p>
      ${questionList(['أحدّد بالكتابة عناصر محصّلة هاتين القوتين وأحسب شدّتها.', 'أمثّل القوتين ومحصّلتهما بمقياس رسم مناسب.'])}
      <p><strong>الحل:</strong></p>
      ${questionList(['<strong>نقطة التأثير:</strong> نقطة التأثير المشتركة للقوتين.', '<strong>الحامل:</strong> حامل القوتين.', '<strong>الجهة:</strong> بجهة القوة الأكبر <span class="formula" dir="ltr">F̄₂</span>.', `<strong>الشدة:</strong> حاصل طرح شدّتي القوتين: ${formula('F=F_2-F_1=30-20=10\\,\\mathrm{N}')}`])}
      ${oppositePairFigure({ id: 'book-p34-result', left: 20, right: 30, showResult: true })}
      <h4>القوتان المتعاكستان مباشرة:</h4>
      <ul class="check-list"><li>أكرّر التجربة السابقة ولتكن <span class="formula" dir="ltr">F₁ = F₂</span>.</li><li>هل تتحرّك الحلقة؟</li><li>أفسّر ذلك.</li></ul>
      ${inferBox('أستنتج:', `${definition('القوتان المتعاكستان مباشرة:', 'قوتان منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، لهما نقطة تأثير مشتركة.')}
        <div class="figure-and-text"><div>${oppositePairFigure({ id: 'book-p34-equal', left: 30, equal: true })}</div><div><p>رسم الكتاب: القوتان على الحامل نفسه، <span class="formula" dir="ltr">F̄₁</span> و<span class="formula" dir="ltr">F̄₂</span> من النقطة <span class="formula" dir="ltr">o</span>، ومتعاكستان ومتساويتان.</p></div></div>`)}`)}
    </div>

    <div id="forces-direct" role="tabpanel" aria-labelledby="forces-tab-direct" tabindex="0" hidden>
    ${section('34', 'القوتان المتعاكستان مباشرة: خلاصة التجربة', `
      <h4>القوتان المتعاكستان مباشرة:</h4>
      <ul class="check-list"><li>أكرّر التجربة السابقة ولتكن <span class="formula" dir="ltr">F₁ = F₂</span>.</li><li>هل تتحرّك الحلقة؟</li><li>أفسّر ذلك.</li></ul>
      ${definition('القوتان المتعاكستان مباشرة:', 'قوتان منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، لهما نقطة تأثير مشتركة.')}
      <p>وبهذا تكون القوتان المتعاكستان متساويتان شدّةً ومتعاكستان جهةً على الحامل نفسه: إحداهما تلغي الأخرى، فلا تتحرّك الحلقة.</p>`)}
    </div>

    <div id="forces-reaction" role="tabpanel" aria-labelledby="forces-tab-reaction" tabindex="0" hidden>
    ${section('35', 'مبدأ الفعل وردّ الفعل', `
      ${experiment('أجرِبُ وأستنتجُ:', `
        <p><strong>أدوات التجربة:</strong> حقيبة مغناطيسية، بالون.</p>
        ${questionList(['أضع مغناطيسين متماثلين على سطح خشبي أفقي أملس.', 'أقرّب القطب الشمالي للمغناطيس الأول من القطب الجنوبي للمغناطيس الثاني. ماذا يحدث؟', 'أقرّب القطب الشمالي للمغناطيس الأول من القطب الشمالي للمغناطيس الثاني. ماذا يحدث؟', 'أنفخ بالوناً وأتركه مباشرة في الهواء. ماذا ألاحظ؟'])}
        <div class="figure-and-text"><div>${actionReactionFigure({ id: 'book-p35-magnets' })}</div><div>${actionReactionFigure({ id: 'book-p35-balloon', mode: 'balloon' })}</div></div>`)}
      ${inferBox('أستنتج:', `${definition('مبدأ الفعل وردّ الفعل:', 'لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً.')}
        <p>وفي «تعلَّمُّ» ص37: <span class="formula" dir="ltr">F̄′=-F̄</span>.</p>`)}`)}
    ${section('36', 'تطبيق محلول: لعبة شدّ الحبل', `
      <p>في لعبة شدّ الحبل بين فريقين كانت شدّة قوة كلّ لاعب من الفريقين، كما هو مبيّن في الجدول الآتي:</p>
      ${table(['الفريق الأول', 'الفريق الثاني'], [
        ['يوسف <span dir="ltr">230 N</span>', 'حسام <span dir="ltr">360 N</span>'],
        ['خالد <span dir="ltr">350 N</span>', 'هلالي <span dir="ltr">340 N</span>'],
        ['عزّام <span dir="ltr">220 N</span>', '—'],
      ], 'قوى لاعبي الفريقين — تطبيق الكتاب ص36')}
      ${teamForcesFigure({ id: 'book-p36-team1', team: 'team1', values: [230, 350, 220], sum: 800 })}
      <p><strong>المطلوب:</strong></p>
      ${questionList(['حساب شدّة محصّلة قوى كلّ فريق.', 'حساب شدّة محصّلة قوّتي الفريقين. مبيّناً من هو الفريق الفائز؟'])}
      <p><strong>الحل:</strong></p>
      <ul class="check-list">
        <li>شدّة محصّلة قوى الفريق الأول:<br>${formula('F^{\\prime}=F_1+F_2+F_3=230+350+220=800\\,\\mathrm{N}', { display: true })}</li>
        <li>شدّة محصّلة قوى الفريق الثاني:<br>${formula('F^{\\prime\\prime}=F_4+F_5=360+340=700\\,\\mathrm{N}', { display: true })}</li>
        <li>بما أنّ القوّتين <span class="formula" dir="ltr">(F̄′، F̄″)</span> على حامل واحد وبجهتين متعاكستين فشدّة محصّلتهما:<br>${formula('F=F^{\\prime}-F^{\\prime\\prime}=800-700=100\\,\\mathrm{N}', { display: true })}<br>يتحرّك الحبل بجهة الفريق الأول، لذلك هو الفريق الفائز.</li>
      </ul>
      ${inferBox('أنفكّر:', '<p>إذا كانت قوى الفعل وردّ الفعل على شكل أزواج، فلماذا لا يلغي أحدهما تأثير الآخر؟</p>')}`)}
    </div>

    <div id="forces-learn" role="tabpanel" aria-labelledby="forces-tab-learn" tabindex="0" hidden>
    ${section('37', 'تعلَّمُّ (خلاصة الدرس)', `
      ${learnBox(`<ul class="check-list">
        <li><strong>القوى على حامل واحد:</strong> هي القوى التي تؤثّر وفق مستقيم واحد.</li>
        <li><strong>محصّلة القوى:</strong> هي قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة.</li>
        <li><strong>محصّلة قوتين <span class="formula" dir="ltr">(F̄₁، F̄₂)</span> على حامل واحد وبجهة واحدة</strong> هي قوة وحيدة <span class="formula" dir="ltr">F̄</span> عناصرها: <ol class="book-questions"><li>نقطة التأثير: نقطة التأثير المشتركة للقوتين.</li><li>الحامل: حامل القوتين.</li><li>الجهة: بجهة القوتين.</li><li>الشدة: مجموع شدّتي القوتين <span class="formula" dir="ltr">F=F₁+F₂</span>.</li></ol></li>
        <li><strong>محصّلة قوتين <span class="formula" dir="ltr">(F̄₁، F̄₂)</span> على حامل واحد وبجهتين متعاكستين</strong> هي قوة وحيدة <span class="formula" dir="ltr">F̄</span> عناصرها: <ol class="book-questions"><li>نقطة التأثير: نقطة التأثير المشتركة للقوتين.</li><li>الحامل: حامل القوتين.</li><li>الجهة: بجهة القوة الأكبر.</li><li>الشدة: حاصل طرح شدّتي القوتين <span class="formula" dir="ltr">F=F₁-F₂</span> إذا كانت <span class="formula" dir="ltr">F₁ &gt; F₂</span>.</li></ol></li>
        <li><strong>القوتان المتعاكستان مباشرة:</strong> هما قوتان منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، لهما نقطة تأثير مشتركة.</li>
        <li><strong>مبدأ الفعل وردّ الفعل:</strong> لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً. <span class="formula" dir="ltr">F̄′=-F̄</span></li>
      </ul>`)}
      ${section('37', 'أختبر نفسي: السؤال الأول', `
        <details class="book-exercises"><summary>السؤال الأول: اختر الإجابة الصحيحة لكلّ ممّا يأتي</summary>
        <p>1. تؤثّر في النقطة <span class="formula" dir="ltr">(o)</span> قوتان <span class="formula" dir="ltr">(F̄₁، F̄₂)</span> على حامل واحد وبجهة واحدة، فإنّ شدّة محصّلتهما تعطى بالعلاقة:</p>
        ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">F=F₁-F₂</span>', '<span dir="ltr">F=F₁+F₂</span>', '<span dir="ltr">F=F₁÷F₂</span>', '<span dir="ltr">F=√(F₁²+F₂²)</span>']], 'خيارات السؤال الأول — البند 1')}
        <p>2. تؤثّر في النقطة <span class="formula" dir="ltr">(o)</span> قوتان <span class="formula" dir="ltr">(F̄₁، F̄₂)</span> حيث <span class="formula" dir="ltr">F₁ &gt; F₂</span> على حامل واحد وبجهتين متعاكستين، فإنّ شدّة محصّلتهما تُعطى بالعلاقة:</p>
        ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">F=F₁-F₂</span>', '<span dir="ltr">F=F₂-F₁</span>', '<span dir="ltr">F=F₁+F₂</span>', '<span dir="ltr">F=F₁÷F₂</span>']], 'خيارات السؤال الأول — البند 2')}</details>`)}`)}
    ${section('38', 'أختبر نفسي: السؤال الأول (تابع)', `
      <details class="book-exercises" open><summary>السؤال الأول: البنود 3 إلى 8</summary>
      <p>3. في لعبة شدّ الحبل بين فريقين كانت شدّة قوة الفريق الأول <span class="formula" dir="ltr">F₁=850 N</span>، وشدّة قوة الفريق الثاني <span class="formula" dir="ltr">F₂=750 N</span>، فإنّ شدّة محصّلة قوّتي الفريقين تساوي:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">F=100 N</span> وبجهة الفريق الأول', '<span dir="ltr">F=50 N</span> وبجهة الفريق الأول', '<span dir="ltr">F=100 N</span> وبجهة الفريق الثاني', '<span dir="ltr">F=50 N</span> وبجهة الفريق الثاني']], 'خيارات السؤال الأول — البند 3')}
      <p>4. في لعبة شدّ الحبل بين فريقين، إذا كانت شدّة قوة الفريق الأول <span class="formula" dir="ltr">F₁=920 N</span>، وشدّة المحصّلة <span class="formula" dir="ltr">F=40 N</span>، فإنّ شدّة قوة الفريق الثاني <span class="formula" dir="ltr">F₂</span> تساوي:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">860 N</span>', '<span dir="ltr">960 N</span>', '<span dir="ltr">23 N</span>', '<span dir="ltr">36800 N</span>']], 'خيارات السؤال الأول — البند 4')}
      <p>5. تؤثّر في النقطة <span class="formula" dir="ltr">(O)</span> قوتان <span class="formula" dir="ltr">(F̄₁، F̄₂)</span> على حامل واحد وبجهة واحدة، إذا كانت شدّة القوة الأولى <span class="formula" dir="ltr">F₁=40 N</span>، وشدّة المحصّلة <span class="formula" dir="ltr">F=80 N</span>، فتكون شدّة القوة الثانية مساوية:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">40 N</span>', '<span dir="ltr">120 N</span>', '<span dir="ltr">3200 N</span>', '<span dir="ltr">2 N</span>']], 'خيارات السؤال الأول — البند 5')}
      <p>6. قوتان متعاكستان مباشرة <span class="formula" dir="ltr">(F̄₁، F̄₂)</span>، شدّة كلّ منهما <span class="formula" dir="ltr">F₁=F₂=30 N</span>، فإنّ شدّة محصّلتهما تساوي:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['<span dir="ltr">60 N</span>', '<span dir="ltr">0 N</span>', '<span dir="ltr">30 N</span>', '<span dir="ltr">15 N</span>']], 'خيارات السؤال الأول — البند 6')}
      <p>7. القوتان المتعاكستان مباشرة هما قوتان:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['متوازيتان حاملاً ومتعاكستان جهةً ومختلفتان شدّةً', 'منطبقتان حاملاً ومتّفقتان جهةً ومتساويتان شدّةً', 'منطبقتان حاملاً ومتّفقتان جهةً ومختلفتان شدّةً', 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً']], 'خيارات السؤال الأول — البند 7')}
      <p>8. لكلّ فعل ردّ فعل:</p>
      ${table(['(a)', '(b)', '(c)', '(d)'], [['يساويه بالقيمة ويماثله بالاتجاه.', 'يساويه بالقيمة ويعاكسه بالاتجاه.', 'يوازيه بالحامل ويماثله بالاتجاه', 'لا يساويه بالقيمة ويعاكسه بالاتجاه.']], 'خيارات السؤال الأول — البند 8')}</details>`)}
    </div>

    <div id="forces-problems" role="tabpanel" aria-labelledby="forces-tab-problems" tabindex="0" hidden>
    ${section('39', 'أختبر نفسي: السؤال الثاني والثالث والرابع', `
      <details class="book-exercises"><summary>السؤال الثاني: حدّد كلاً من قوة الفعل وقوة ردّ الفعل في كلّ من الصور الآتية</summary>
      ${actionReactionExamplesFigure({ id: 'book-p39-examples' })}
      </details>
      <details class="book-exercises"><summary>السؤال الثالث: لاحظ الرسم أدناه، ثم أجب عن السؤال الآتي</summary>
      ${riflePerpFigure({ id: 'book-p39-rifle' })}
      <p>في الرسم، توجد قوة مفقودة، وضّح هذه القوة على الرسم.</p>
      </details>
      <details class="book-exercises"><summary>السؤال الرابع: حلّ المسألتين الآتيتين</summary>
      <h4>المسألة الأولى:</h4>
      <p>تؤثّر في النقطة <span class="formula" dir="ltr">(O)</span> قوتان شدّتاهما <span class="formula" dir="ltr">F₁=15 N</span>، <span class="formula" dir="ltr">F₂=30 N</span> على حامل واحد وبجهة واحدة.</p>
      <p><strong>المطلوب:</strong></p>
      ${questionList(['حدّد عناصر محصّلة القوتين <span class="formula" dir="ltr">F̄</span>.', 'ما قيمة شدّة القوة <span class="formula" dir="ltr">F̄′</span> التي إذا أثّرت في <span class="formula" dir="ltr">(O)</span> بقيت متوازنة؟', 'مثّل بالرسم كلاً من القوى <span class="formula" dir="ltr">(F̄₁، F̄₂، F̄، F̄′)</span> بمقياس رسم مناسب.'])}
      </details>
    `)}
    ${section('40', 'السؤال الرابع (تابع) والنشاط', `
      <details class="book-exercises"><summary>المسألة الثانية</summary>
      <p>تؤثّر في النقطة <span class="formula" dir="ltr">(O)</span> قوتان شدّتاهما <span class="formula" dir="ltr">F₁=25 N</span>، <span class="formula" dir="ltr">F₂=75 N</span>، على حامل واحد وبجهتين متعاكستين.</p>
      <p><strong>المطلوب:</strong></p>
      ${questionList(['حدّد عناصر محصّلة القوتين <span class="formula" dir="ltr">F̄</span>.', 'ما قيمة شدّة القوة <span class="formula" dir="ltr">F̄′</span> التي إذا أثّرت في <span class="formula" dir="ltr">(O)</span> بقيت متوازنة؟', 'مثّل بالرسم كلاً من القوى <span class="formula" dir="ltr">(F̄₁، F̄₂، F̄، F̄′)</span> بمقياس رسم مناسب.', 'إذا كانت شدّة القوة الثانية <span class="formula" dir="ltr">F₂=25 N</span>، فما شدّة محصّلة القوتين عندئذ؟'])}
      </details>
      ${inferBox('نشاط:', `<p>تؤثّر على المظلّي قوة ثقله للأسفل وقوة مقاومة الهواء على المظلّة للأعلى. أكتب موضوعاً مستعيناً بالشابكة تصف فيه كيف يتحكّم المظلّي في حركته؟ وماذا يحدث لو زادت مقاومة الهواء؟</p>${parachuteFigure({ id: 'book-p40-parachute' })}`)}
    `)}
    </div>
  </div>`;
}

// ————— المرحلة 3: شرح مبسط وموسع (توضيح إثرائي) —————
export function forcesExplainContent() {
  return `${extra('1. ما معنى «محصّلة القوى»؟', `
    <p>كلمة <strong>المحصّلة</strong> تعني قوة واحدة «تختصر» أثر قوتين أو أكثر. الكتاب ص31 يقول: قوة واحدة تترك الأثر نفسه الذي تركته قوتان أو أكثر. إذا شدّ شخصان حبلاً واحداً بالاتجاه نفسه، فكأنّ شخصاً واحداً يشدّه بمجموع قوّتهما، وهذه القوة الواحدة هي المحصّلة.</p>
    <div class="important-note"><strong>شرط أساسي قبل الحساب:</strong> لا نجمع قوى اعتباطاً. الحساب الذي في هذا الدرس كلّه مشروط بأن تكون القوى <strong>على حامل واحد</strong>، أي على مستقيم واحد، وبنقطة تأثير مشتركة. هذا هو معنى «القوى على حامل واحد».</div>`)}
  ${extra('2. الحالة الأولى: القوتان بالجهة نفسها', `
    <p>لنتتبّع الحلّ خطوة خطوة. نضع إصبعين على الكتاب ونحسبهما في الجهة نفسها، فالمحصّلة أطول من كل قوة منفردة:</p>
    ${steps([
      `نفحص الشرط: هل القوتان على حامل واحد؟ نعم. هل لهما الجهة نفسها؟ نعم.`,
      `نكتب القاعدة كما في الكتاب: ${formula('F=F_1+F_2')}.`,
      `نعوّض بالشدّتين بوحدة النيوتن (N) فقط، ولا نخلط الغرام مع النيوتن.`,
      `نحصل على الشدّة الناتجة، وجهتها هي جهة القوتين، وحاملها حاملهما، ونقطة تأثيرها نقطتهما المشتركة.`,
    ])}
    <p>مثال من ص31–32: ${formula('F_1=20\\,\\mathrm{N}')} و${formula('F_2=30\\,\\mathrm{N}')} بالجهة نفسها، فالمحصّلة ${formula('F=20+30=50\\,\\mathrm{N}')}.</p>`)}
  ${extra('3. الحالة الثانية: القوتان بجهتين متعاكستين', `
    <p>هنا «تتنازع» القوتان الجسم، فتغلب القوة الأكبر. لذلك نطرح الصغرى من الكبرى، ونجعل جهة المحصّلة جهة القوة الأكبر:</p>
    ${steps([
      `نفحص الشرط: الحامل نفسه، والنقطة نفسها، لكن الجهتان متعاكستان.`,
      `نطرح الشدّة الأصغر من الشدّة الأكبر: ${formula('F=F_{\\max}-F_{\\min}')}.`,
      `النتيجة موجبة دائماً، وهي الشدّة المتبقية بعد أن «ألغت» القوة الأصغر جزءاً من القوة الأكبر.`,
      `الجهة: جهة القوة الأكبر.`,
    ])}
    <div class="example-callout">هذا هو الفرق عن الحالة الأولى: الجمع في الأولى، والطرح في الثانية. السؤال المتكرّر في الامتحان يخلط بين الحالتين، لذلك افحص الجهة أولاً ثم اختر القاعدة.</div>`)}
  ${extra('4. القوتان المتعاكستان مباشرة والتوازن', `
    <p>إذا انطبق الحاملان وتعاكست الجهتان وتساوت الشدّتان، فالطرح يعطي ${formula('F_1-F_2=0')}. أي لا توجد محصّلة، فلا تؤثر القوتان معاً في حركة الحلقة، وتبقى ساكنة كما في ص34.</p>
    ${formula('F=F_1-F_2=30-30=0\\,\\mathrm{N}', { display: true })}
    <p>وهذا هو معنى «توازن» في مسائل ص39 و40: نبحث عن قوة مساوية للمحصّلة بمقدارها ومعاكسة لها بجهتها، فتلغيان معاً.</p>`)}
  ${extra('5. مبدأ الفعل وردّ الفعل: زوجٌ لا ينفكّ', `
    <p>لكلّ فعل ردّ فعل، ينطبق عليه حاملاً، ويعاكسه جهة، ويساويه شدّة. ويتعلّق الأمر دوماً بجسمين لا بجسم واحد:</p>
    ${steps([
      'يسبح الشخص: يدفع الماء نحو الخلف (فعل)، فيدفعه الماء نحو الأمام (ردّ فعل).',
      'ينطلق الصاروخ: يدفع الغاز نحو الأسفل (فعل)، فيدفع الغاز الصاروخ نحو الأعلى (ردّ فعل).',
      'يد تدفع الطاولة (فعل)، والطاولة تردّ على اليد (ردّ فعل).',
    ])}
    <div class="important-note"><strong>لا نخلط بينه وبين التوازن:</strong> في مبدأ الفعل وردّ الفعل، القوتان تؤثّران في <strong>جسمين مختلفين</strong>، لذلك لا تلغي إحداهما الأخرى في حركة جسم واحد. أما القوتان المتعاكستان مباشرة، فتؤثّران في <strong>الجسم نفسه</strong>، فتلغي إحداهما الأخرى.</div>`)}
  ${extra('6. تمثيل القوى الأربع بمقياس في المسائل', `
    <p>في المسائل ص39 و40 يُطلب تمثيل <span class="formula" dir="ltr">F̄₁، F̄₂، F̄، F̄′</span> بمقياس. نتبع الخطوات الآتية:</p>
    ${steps([
      'نختار مقياساً مناسباً، مثل كل 1 cm يقابل قيمة معيّنة بالنيوتن، ونعلنه صريحاً.',
      `نقسم كل شدّة على قيمة المقياس لنحصل على طول السهم: ${formula('\\text{الطول}=\\frac{\\text{الشدّة}}{\\text{قيمة السنتيمتر}}')}.`,
      'نرسم كل قوة من نقطة التأثير نفسها على الحامل نفسه، فإن كانت جهتها نفسها رسمناها بنفس الاتجاه، وإن كانت معاكسة رسمناها بالاتجاه المقابل.',
      'نكتب الشدّة بوحدة النيوتن بجانب كل سهم، ونتحقق أنّ أطوال السهام تتناسب مع الشدّات.',
    ])}`)}`;
}

// ————— المرحلة 4: أمثلة مفصلة —————
const exampleShell = (title, source, given, required, solution, check) => `<article class="worked-example"><div class="source-line"><span class="source-chip ${source === 'توضيح إثرائي' || source.startsWith('من إعداد المنصة') ? 'source-extra' : ''}">${source}</span></div><h3>${title}</h3><div class="given-required"><div><h4>المعطيات</h4>${given}</div><div><h4>المطلوب</h4>${required}</div></div><h4>طريقة التفكير والحل</h4>${solution}<p class="answer-check"><strong>التحقق:</strong> ${check}</p></article>`;

export function forcesExamplesContent() {
  return `${exampleShell('قوتان على حامل واحد وبجهة واحدة', 'تطبيق محلول من الكتاب · ص32',
    `<ul><li>${formula('F_1=20\\,\\mathrm{N}')} و${formula('F_2=30\\,\\mathrm{N}')} على حامل واحد.</li><li>الجهة واحدة، ونقطة التأثير مشتركة.</li><li>المقياس: كل ${formula('1\\,\\mathrm{cm}')} يمثّل ${formula('10\\,\\mathrm{N}')}.</li></ul>`,
    '<p>عناصر المحصّلة بالكتابة، وطول سهام القوى الثلاث بالرسم.</p>',
    steps([
      'القوتان على الحامل نفسه وبالجهة نفسها، فالقاعدة هي الجمع.',
      `الشدة: ${formula('F=F_1+F_2=20+30=50\\,\\mathrm{N}')}`,
      `الأطوال بالمقياس: ${formula('F_1\\to 2\\,\\mathrm{cm}')}, ${formula('F_2\\to 3\\,\\mathrm{cm}')}, ${formula('F\\to 5\\,\\mathrm{cm}')} لأن كل سنتيمتر واحد يمثّل ${formula('10\\,\\mathrm{N}')}.`,
      'الجهة: جهة القوتين نفسها، ونقطة التأثير: نقطتهما المشتركة، والحامل: حاملهما (ص32).',
    ]),
    `الشدة الناتجة أكبر من كل قوة منفردة (50 أكبر من 20 و30)، وهذا متوقّع عند جمع قوتين بالجهة نفسها.`)}
  ${exampleShell('قوتان على حامل واحد وبجهتين متعاكستين', 'تطبيق محلول من الكتاب · ص34',
    `<ul><li>${formula('F_1=20\\,\\mathrm{N}')} و${formula('F_2=30\\,\\mathrm{N}')} على حامل واحد.</li><li>الجهتان متعاكستان، ونقطة التأثير مشتركة.</li></ul>`,
    '<p>عناصر المحصّلة وشدّتها.</p>',
    steps([
      'الجهتان متعاكستان، فالقاعدة هي طرح الأصغر من الأكبر.',
      `الشدة: ${formula('F=F_2-F_1=30-20=10\\,\\mathrm{N}')}`,
      `الجهة: جهة القوة الأكبر ${formula('F_2')}.`,
      'الحامل حاملهما ونقطة التأثير نقطتهما المشتركة.',
    ]),
    `الشدة الناتجة أصغر من القوة الأكبر (10 أصغر من 30) وأصغر من القوة الأصغر أيضاً، وهذا متوقّع عند التعاكس.`)}
  ${exampleShell('محصّلة قوى فريقَي شدّ الحبل', 'تطبيق محلول من الكتاب · ص36',
    `<ul><li>الفريق الأول: ${formula('230')} و${formula('350')} و${formula('220\\,\\mathrm{N}')}.</li><li>الفريق الثاني: ${formula('360')} و${formula('340\\,\\mathrm{N}')}.</li></ul>`,
    '<p>محصّلة قوى كل فريق، ثم محصّلة القوتين والفريق الفائز.</p>',
    steps([
      `قوى الفريق الأول بجهة واحدة، فتُجمع: ${formula('F^{\\prime}=F_1+F_2+F_3=230+350+220=800\\,\\mathrm{N}')}`,
      `قوى الفريق الثاني بجهة واحدة، فتُجمع: ${formula('F^{\\prime\\prime}=F_4+F_5=360+340=700\\,\\mathrm{N}')}`,
      `القوتان ${formula('F^{\\prime}')} و${formula('F^{\\prime\\prime}')} على حامل الحبل وبجهتين متعاكستين، فتُطرح: ${formula('F=F^{\\prime}-F^{\\prime\\prime}=800-700=100\\,\\mathrm{N}')}`,
      'الجهة جهة الأكبر، أي جهة الفريق الأول، فهو الفريق الفائز.',
    ]),
    `مجموع الفريق الأول أكبر، والمحصّلة موجبة بقيمته؛ ولو تساوى المجموعان لكانت المحصّلة صفراً وبقي الحبل ساكناً.`)}
  ${exampleShell('من المحصّلة إلى القوة المجهولة', 'من إعداد المنصة — تدريب إضافي',
    `<ul><li>قوتان على حامل واحد وبجهة واحدة.</li><li>${formula('F_1=25\\,\\mathrm{N}')}، والمحصّلة ${formula('F=60\\,\\mathrm{N}')}.</li></ul>`,
    '<p>شدّة القوة الثانية.</p>',
    steps([
      `نكتب القاعدة: ${formula('F=F_1+F_2')}.`,
      `نحوّل المعادلة لتصبح القوة الثانية هي المجهول: ${formula('F_2=F-F_1')}.`,
      `نعوّض: ${formula('F_2=60-25=35\\,\\mathrm{N}')}`,
    ]),
    `نعيد التعويض بالنتيجة: ${formula('25+35=60\\,\\mathrm{N}')} وهي المحصّلة المعطاة. هذا السؤال نفسه موجود في الكتاب ص38 (البند 5).`)}
  ${exampleShell('قوة موازنة لمحصّلة', 'من إعداد المنصة — تدريب إضافي',
    `<ul><li>قوتان متعاكستان على حامل واحد: ${formula('F_1=25\\,\\mathrm{N}')} و${formula('F_2=75\\,\\mathrm{N}')}.</li><li>المقياس: كل ${formula('1\\,\\mathrm{cm}')} يمثّل ${formula('10\\,\\mathrm{N}')}.</li></ul>`,
    '<p>عناصر المحصّلة، وشدة قوة تُوازن المحصّلة، وأطوال السهام.</p>',
    steps([
      `الجهتان متعاكستان، فالمحصّلة فرق الشدّتين: ${formula('F=75-25=50\\,\\mathrm{N}')}`,
      `الجهة: جهة القوة الأكبر ${formula('F_2')}، والحامل حاملهما، ونقطة التأثير نقطتهما المشتركة.`,
      `قوة التوازن ${formula('F^{\\prime}')} تساوي المحصّلة شدّةً وتعاكسها جهة: ${formula('F^{\\prime}=50\\,\\mathrm{N}')} بالجهة المقابلة.`,
      `الأطوال بالمقياس: ${formula('25\\,\\mathrm{N}\\to 2.5\\,\\mathrm{cm}')}, ${formula('75\\,\\mathrm{N}\\to 7.5\\,\\mathrm{cm}')}, ${formula('50\\,\\mathrm{N}\\to 5\\,\\mathrm{cm}')}.`,
    ]),
    `المحصّلة 50 تساوي طرح 25 من 75، وقوة التوازن 50 تلغيها تماماً فيصبح المجموع صفراً. هذه المسألة هي المسألة الثانية من الكتاب ص40.`)}
  ${exampleShell('القوة الثالثة في سحب السيارة', 'من إعداد المنصة — تدريب إضافي',
    `<ul><li>سحب السيارة يحتاج ${formula('1000\\,\\mathrm{N}')} وفق نص الكتاب ص30.</li><li>شخصان، شدّة قوة كلٍّ منهما ${formula('400\\,\\mathrm{N}')}، بالجهة نفسها وعلى الحامل نفسه.</li></ul>`,
    '<p>شدّة القوة الثالثة اللازمة، وأقل شدّة لقوة بديلة عن الأشخاص الثلاثة.</p>',
    steps([
      `قوتان بجهة واحدة: ${formula('F=400+400=800\\,\\mathrm{N}')}.`,
      `${formula('800\\,\\mathrm{N} < 1000\\,\\mathrm{N}')}، فالشخصان وحدهما لا يسحبان السيارة.`,
      `الثالث يضيف قوة، فالمجموع يجب أن يبلغ ${formula('1000\\,\\mathrm{N}')}: ${formula('F_3=1000-800=200\\,\\mathrm{N}')}.`,
      `القوة البديلة عن الأشخاص الثلاثة قوّة واحدة محصّلتها ${formula('1000\\,\\mathrm{N}')} على الحامل نفسه وبالجهة نفسها.`,
    ]),
    `400+400+200=1000، وهو المقدار المطلوب لسحب السيارة كما في نص الكتاب.`)}`;
}

// ————— المرحلة 5: المختبر التفاعلي —————
export function forcesActivityContent() {
  return `<div class="lab-intro"><h3>مختبر المحصّلة التفاعلي</h3><p>ثلاث محطات عملية: قوتان بجهة واحدة، وقوتان متعاكستان، ومحصّلة قوى فريقين. غيّر الشدّات وراقب الأرقام والأسهم فوراً، ثم أجب لتظهر التغذية الراجعة.</p></div>
  ${resultantLabShell()}`;
}

// ————— المرحلة 6: أسئلة فهم —————
export function forcesQuestionsContent() {
  return `<div class="assessment-intro"><strong>جرّب ثم افهم:</strong> يمكنك تغيير إجابتك، وسيظهر تفسير بعد كل اختيار.</div>${forcesUnderstandingContent()}`;
}

// ————— المرحلة 7: تدريب متدرج —————
export function forcesPracticeContentStage() {
  return forcesDrillsStage();
}

// ————— المرحلة 8: ملخص —————
export function forcesSummaryContent() {
  return `<div class="summary-hero"><h3>الفكرة المحورية</h3><p>القوى على حامل واحد يمكن استبدالها بقوة واحدة تُسمى المحصّلة. إذا كانت الجهة واحدة جمعنا الشدّتين، وإذا كانت الجهتان متعاكستين طرحنا الأصغر من الأكبر وجعلنا الجهة جهة القوة الأكبر. ولكلّ فعل ردّ فعل يساويه شدّة ويعاكسه جهة.</p></div>
  <div class="summary-grid"><section><h3>تعريفات سريعة</h3><dl class="summary-definitions"><dt>القوى على حامل واحد</dt><dd>القوى التي تؤثّر وفق مستقيم واحد.</dd><dt>محصّلة القوى</dt><dd>قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة.</dd><dt>القوتان المتعاكستان مباشرة</dt><dd>قوتان منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، لهما نقطة تأثير مشتركة.</dd><dt>مبدأ الفعل وردّ الفعل</dt><dd>لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً.</dd></dl></section>
  <section><h3>القاعدتان والوحدات</h3>${formula('F=F_1+F_2', { display: true })}<p>قوتان على حامل واحد وبجهة واحدة.</p>${formula('F=F_{\\max}-F_{\\min}', { display: true })}<p>قوتان على حامل واحد وبجهتين متعاكستين، والجهة بجهة القوة الأكبر.</p><p>الشدة بوحدة ${formula(`\\mathrm{N}`)}، والطول في الرسم بالسنتيمتر وفق مقياس معلن.</p></section></div>
  <h3>الرسوم الأساسية</h3><div class="graph-compare"><div>${sameDirectionPairFigure({ id: 'summary-same' })}<p><strong>جهة واحدة:</strong> المحصّلة مجموع الشدّتين.</p></div><div>${oppositePairFigure({ id: 'summary-opposite' })}<p><strong>جهتان متعاكستان:</strong> المحصّلة فرق الشدّتين بجهة الأكبر.</p></div></div>
  <div class="summary-reminders"><span>افحص الجهة قبل اختيار القاعدة</span><span>الجمع للجهة الواحدة، والطرح للجهتين المتعاكستين</span><span>التعادل يعني محصّلة صفر</span><span>الفعل وردّ الفعل على جسمين مختلفين، فلا يلغيان حركة جسم واحد</span></div>`;
}

// ————— المرحلة 9: دفتر الطالب —————
const forcesNotebookBodies = {
  idea: `<p>القوى على حامل واحد تُستبدل بقوة واحدة هي المحصّلة: تُجمع الشدّتان إذا كانت الجهة واحدة، وتُطرح الأصغر من الأكبر إذا كانت الجهتان متعاكستان، والجهة جهة القوة الأكبر. ولكلّ فعل ردّ فعل يساويه شدّة ويعاكسه جهة على الحامل نفسه.</p>`,
  definitions: `<ul><li><strong>القوى على حامل واحد:</strong> القوى التي تؤثّر وفق مستقيم واحد.</li><li><strong>محصّلة القوى:</strong> قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة.</li><li><strong>محصّلة قوتين على حامل واحد وبجهة واحدة:</strong> قوة وحيدة نقطة تأثيرها المشتركة، وحاملها حاملهما، وجهتها جهتهما، وشدّتها مجموع الشدّتين.</li><li><strong>محصّلة قوتين على حامل واحد وبجهتين متعاكستين:</strong> قوة وحيدة جهتها جهة القوة الأكبر، وشدّتها حاصل طرح الشدّتين.</li><li><strong>القوتان المتعاكستان مباشرة:</strong> منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، ولهما نقطة تأثير مشتركة.</li><li><strong>مبدأ الفعل وردّ الفعل:</strong> لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً.</li></ul>`,
  laws: `${formula('F=F_1+F_2', { display: true })}<p>للقوتين على حامل واحد وبجهة واحدة.</p>${formula('F=F_{\\max}-F_{\\min}', { display: true })}<p>للقوتين على حامل واحد وبجهتين متعاكستين، والجهة بجهة القوة الأكبر.</p>${formula('F_1-F_2=0', { display: true })}<p>عند التعادل في القوتين المتعاكستين مباشرة.</p><ul><li>الشدة بوحدة ${formula(`\\mathrm{N}`)}.</li><li>طول السهم في الرسم بالسنتيمتر، ويتبع مقياساً معلناً مثل: كل 1 cm يمثّل 10 N.</li><li>قوة التوازن تساوي المحصّلة شدّةً وتعاكسها جهة.</li></ul>`,
  diagrams: `<div class="notebook-graphs">${sameDirectionPairFigure({ id: 'notebook-same' })}${oppositePairFigure({ id: 'notebook-opposite' })}</div><p>في الرسم الأول: نقطة التأثير المشتركة، والحامل نفسه، والجهة نفسها، والشدّة مجموع الشدّتين. في الرسم الثاني: الجهتان متعاكستان، والجهة جهة القوة الأكبر، والشدّة فرق الشدّتين.</p>`,
  procedures: `<h4>تجربة الربيعة (ص31)</h4><ol><li>أعلّق الربيعة بمحور أفقي على اللوح المعدني.</li><li>أعلّق ثقلاً وأسجّل دلالة المؤشّر.</li><li>أضيف ثقلاً ثانياً وأسجّل الدلالة.</li><li>أعلّق الثقلين معاً وأسجّل الدلالة، ثم أستنتج أنّ القوتين تُجمعان.</li></ol><h4>تجربة الربيعتين (ص33)</h4><ol><li>نعلّق خطّي ربيعتين بحلقة واحدة.</li><li>نشدّ الربيعتين بجهتين متعاكستين على الحامل نفسه.</li><li>نلاحظ جهة حركة الحلقة عند اختلاف الشدّتين، ثم عند تساويهما.</li></ol><h4>خطوات رسم القوى بمقياس</h4><ol><li>أعلن المقياس صراحة.</li><li>أقسم كل شدّة على قيمة المقياس لأحصل على طول السهم.</li><li>أرسم كل سهم من نقطة التأثير على الحامل وبالجهة الصحيحة.</li><li>أكتب الشدّة بوحدة النيوتن بجانب كل سهم.</li></ol>`,
  comparisons: `<div class="table-scroll" tabindex="0"><table><thead><tr><th>وجه المقارنة</th><th>جهة واحدة</th><th>جهتان متعاكستان</th></tr></thead><tbody><tr><td>الجهة</td><td>الجهة نفسها</td><td>جهتان متعاكستان</td></tr><tr><td>الشدة</td><td>مجموع الشدّتين</td><td>فرق الشدّتين</td></tr><tr><td>الجهة الناتجة</td><td>جهة القوتين</td><td>جهة القوة الأكبر</td></tr><tr><td>مثال من الكتاب</td><td><span dir="ltr">20 N + 30 N = 50 N</span></td><td><span dir="ltr">30 N − 20 N = 10 N</span></td></tr></tbody></table></div><p><strong>الفعل وردّ الفعل والتوازن:</strong> في الفعل وردّ الفعل تؤثّر القوتان في جسمين مختلفين، ولا تلغي إحداهما الأخرى؛ أما القوتان المتعاكستان مباشرة فتؤثّران في الجسم نفسه فتلغي إحداهما الأخرى.</p>`,
  mistakes: `<ul><li>جمع القوتين مع أنّهما بجهتين متعاكستين.</li><li>طرح الأكبر من الأصغر فتظهر نتيجة سالبة؛ نطرح الأصغر من الأكبر دائماً.</li><li>نسيان أنّ الجهة جهة القوة الأكبر في المحصّلة المتعاكسة.</li><li>عدم التحقق من شرط «حامل واحد» قبل الجمع أو الطرح.</li><li>الخلط بين مبدأ الفعل وردّ الفعل والتوازن: الأول بين جسمين، والثاني في الجسم نفسه.</li><li>كتابة الشدّة دون وحدة، أو خلط الغرام مع النيوتن.</li></ul>`,
  exam: `<ul><li>احفظ تعريف المحصّلة ونصّي القاعدتين مع شرط كلّ منهما.</li><li>تدرّب على سؤال الاختيار: هل القوتان بجهة واحدة أم متعاكستان؟ ثم اختر الجمع أو الطرح.</li><li>تُعطى القوة المجهولة بقاعدة عكسية: ${formula('F_2=F-F_1')} في حالة الجمع.</li><li>في مسائل التوازن: قوة التوازن = المحصّلة شدّةً، وبالجهة المقابلة.</li><li>احفظ خصائص القوتين المتعاكستين مباشرة الأربع، ونصّ مبدأ الفعل وردّ الفعل.</li><li>مثال لعبة شدّ الحبل: اجمع قوى كل فريق، ثم اطرح المجموعين.</li></ul>`,
  checklist: `<div class="review-checklist">${['أشرح معنى «القوى على حامل واحد».', 'أعرّف محصّلة القوى.', 'أحدّد عناصر المحصّلة في حالة الجهة الواحدة.', 'أحدّد عناصر المحصّلة في حالة الجهتين المتعاكستين.', 'أفرّق بين الجمع والطرح بفحص الجهة.', 'أحسب محصّلة قوى فريقين في لعبة شدّ الحبل.', 'أصف القوتين المتعاكستين مباشرة بخصائصها الأربع.', 'أشرح مبدأ الفعل وردّ الفعل وأذكر تطبيقين عليه.', 'أمثّل القوى والمحصّلة بمقياس رسم معلن.', 'أجد قوة توازن لمحصّلة معطاة.'].map(item => `<label><input type="checkbox"><span>${item}</span></label>`).join('')}</div>`,
};

export function forcesNotebookContent() {
  return `<p class="notebook-note">مواد للمراجعة والدراسة. لا يحتوي الدفتر على إجابات المعلم.</p><div class="note-grid">${notebookSections.map(section => `<article class="note-card ${['checklist', 'definitions', 'mistakes'].includes(section.id) ? 'note-wide' : ''}"><h3>${section.title}</h3>${forcesNotebookBodies[section.id]}</article>`).join('')}</div>`;
}
