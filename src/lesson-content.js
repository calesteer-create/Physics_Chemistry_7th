import { formula, quantity, units } from './math.js';
import { miniComparisonGraph, pathSketch } from './diagrams.js';
import { notebookSections } from './course.js';

const extra = (title, body) => `<section class="enrichment"><div class="source-line"><span class="source-chip source-extra">توضيح إثرائي</span></div><h3>${title}</h3>${body}</section>`;
const steps = items => `<ol class="solution-steps">${items.map(item => `<li>${item}</li>`).join('')}</ol>`;

export function discoverContent() {
  return `<div class="discovery-card">
    <span class="discovery-icon" aria-hidden="true">🚌</span>
    <div><h3>هل يمكن أن يكون الراكب ساكناً ومتحركاً في الوقت نفسه؟</h3><p>تخيّل أنك تجلس في حافلة تتحرك بجانب شاخصة مرورية. انظر إلى السائق مرة، وإلى الشاخصة مرة أخرى. هل يتغيّر بُعدك عن كل منهما بالطريقة نفسها؟</p></div>
  </div>
  <div class="prediction" data-discovery>
    <h3>توقّع قبل أن تبدأ</h3><p>بالنسبة إلى الراكب نفسه، أي وصف تتوقعه؟</p>
    <div class="choice-row" role="group" aria-label="توقع وصف الراكب">
      <button class="choice text-choice" data-discovery-answer="driver" aria-pressed="false">ساكن بالنسبة إلى السائق</button>
      <button class="choice text-choice" data-discovery-answer="sign" aria-pressed="false">متحرك بالنسبة إلى الشاخصة</button>
      <button class="choice text-choice" data-discovery-answer="both" aria-pressed="false">الوصفان معاً ممكنان</button>
    </div><p class="feedback" data-discovery-feedback aria-live="polite">اختر توقعك، ثم اختبره في المختبر.</p>
  </div>
  <section class="book-section"><div class="source-line"><span class="source-chip">من الكتاب · ص4</span></div><h3>تجربة صفية قصيرة</h3><p><strong>الأدوات:</strong> سيارة لعب بجهاز تحكم، كرة، أسطوانة، مكعب.</p><ol><li>ضع الأجسام بجانب بعضها على أرضية الصف.</li><li>حرّك السيارة عن بُعد، وسجّل الأجسام التي تغيّر بُعدها عن المكعب.</li><li>ادفع الكرة، ولاحظ الأسطوانة والمكعب.</li></ol><p class="observation-prompt"><strong>سؤال الملاحظة:</strong> أي جسم ستختاره مرجعاً للمقارنة؟ ولماذا؟</p></section>`;
}

export function explainContent() {
  return `${extra('1. كيف نحدد «متحرك» أو «ساكن»؟', `
    <p>لا نكتفي بالنظر إلى الجسم. نختار أولاً <strong>جسماً مرجعياً</strong>، ثم نقارن البُعد أو الموضع مع مرور الزمن:</p>
    ${steps(['اختر الجسم المرجع.', 'راقب موضع الجسم المطلوب بالنسبة إليه.', 'إذا تغيّر الموضع فالجسم متحرك بالنسبة إلى هذا المرجع، وإذا لم يتغيّر فهو ساكن بالنسبة إليه.'])}
    <div class="example-callout">الراكب الجالس لا يتغيّر موضعه بالنسبة إلى سائق الحافلة، لكن موضعه يتغيّر بالنسبة إلى الشاخصة المرورية. لذلك يختلف الوصف باختلاف المرجع.</div>`)}
  ${extra('2. الموضع والمسافة المقطوعة ليسا شيئاً واحداً', `
    <p><strong>الموضع</strong> يحدد أين يوجد الجسم بالنسبة إلى مرجع ومحور مختار، ونرمز له في رسوم الدرس بـ ${formula('x')}. أما <strong>المسافة المقطوعة</strong> فهي طول المسار الذي سلكه الجسم.</p>
    <p>في رسم الدراجة، يكون الموضع الابتدائي ${formula('x_1=30\\,\\mathrm{m}')}. هذا لا يعني أن الدراجة قطعت ${quantity('30', units.metre)} قبل بدء القياس؛ بل يعني أنها بدأت على بُعد ${quantity('30', units.metre)} من المرجع.</p>
    <div class="important-note"><strong>متى نستعمل فرق الموضع لحساب المسافة؟</strong><p>إذا تحرك الجسم على خط مستقيم <strong>وفي اتجاه واحد فقط</strong> خلال الفترة المدروسة، تكون المسافة المقطوعة:</p>${formula('d=|x_2-x_1|', { display: true })}<p>مثال: من ${formula('x_1=30\\,\\mathrm{m}')} إلى ${formula('x_2=70\\,\\mathrm{m}')} باتجاه واحد:</p>${formula('d=|70-30|=40\\,\\mathrm{m}', { display: true })}</div>
    <p>إذا عاد الجسم في الاتجاه المعاكس، فلا يكفي فرق موضعي البداية والنهاية؛ نجمع أطوال أجزاء المسار. في مسألة الطفل: الذهاب ${quantity('900', units.metre)} والعودة ${quantity('900', units.metre)}، لذلك المسافة الكلية ${quantity('1800', units.metre)}.</p>`)}
  ${extra('3. المسار ثم المسافة', `<p>تتبع النقاط التي يمر بها الجسم لتحدد شكل المسار أولاً. بعد ذلك يمكنك قياس طول هذا المسار لتحصل على المسافة.</p><div class="path-grid">${['straight', 'circular', 'curved'].map(type => `<div>${pathSketch(type, { id: `explain-${type}` })}<span>${type === 'straight' ? 'مستقيم' : type === 'circular' ? 'دائري' : 'منحنٍ'}</span></div>`).join('')}</div>`)}
  ${extra('4. قراءة الرسم البياني دون خلط', `
    ${steps(['اقرأ عنوان المحور الأفقي: الزمن، ووحدته الثانية في رسوم الدرس.', 'اقرأ المحور الرأسي وحدد هل المعروض موضع أم مسافة بحسب النص والبيانات.', 'اختر لحظتين، واقرأ القيمتين المقابلتين لهما.', 'قارن التغيرات خلال فواصل زمنية متساوية، ثم استنتج نوع الحركة.'])}
    <div class="graph-compare"><div>${miniComparisonGraph('uniform')}<p>مواضع الدراجة: يزداد الموضع بالمقدار نفسه كل ثانية.</p></div><div>${miniComparisonGraph('rest')}<p>يبقى البُعد عن المرجع ثابتاً؛ أما المسافة التي يقطعها الجسم الساكن خلال الفترة فهي صفر.</p></div><div>${miniComparisonGraph('changing')}<p>المسافات المتتالية غير متساوية رغم تساوي الفواصل الزمنية.</p></div></div><div class="important-note"><strong>تفسير السكون:</strong> المعيار هو ثبات البُعد بين الجسم والجسم المرجع. ظهور عدد ثابت على المحور لا يعني أن الجسم قطع تلك المسافة؛ ففي حالة السكون يبقى البُعد ثابتاً، وتكون المسافة المقطوعة خلال الفترة صفراً.</div>`)}
  ${extra('5. الحركة المنتظمة والمستقيمة المنتظمة', `
    <p><strong>منتظمة</strong> تصف ثبات السرعة: مسافات متساوية في أزمنة متساوية. أما <strong>مستقيمة منتظمة</strong> فتجمع شرطين: المسار مستقيم والسرعة ثابتة.</p><p>الخط المنحني في الصفحة 9 يبيّن مسافات متزايدة في الثواني المتتالية: ${formula('1,3,5,7\\,\\mathrm{m}')}؛ لذلك الحركة في هذا المثال متسارعة، وليست منتظمة.</p>`)}
  ${extra('6. السرعة الوسطية والسرعة المتوسطة والسرعة اللحظية', `
    <p>يستعمل الكتاب <strong>السرعة الوسطية</strong> في التعريف والقانون، ويستعمل <strong>السرعة المتوسطة</strong> في فقرة السرعة اللحظية والرحلة. يشير المصطلحان في هذا الدرس إلى المفهوم نفسه، ولذلك نحافظ على صياغة الكتاب في كل موضع.</p>
    ${formula('v_{avg}=\\frac{d}{t}', { display: true })}
    <p>السرعة الوسطية تخص <strong>فترة كاملة</strong> وتستخدم مسافتها الكلية وزمنها الكلي، بما في ذلك التوقف في مثال الرحلة. أما السرعة اللحظية فتخص <strong>لحظة معينة</strong> ويقرؤها السائق من العداد.</p>
    <p>إذا كانت الحركة منتظمة، لا تتغير السرعة، لذلك تتساوى السرعة اللحظية والسرعة المتوسطة. أما في الحركة المتسارعة فلا يجوز افتراض تساويهما.</p>`)}
  ${extra('7. الوحدات والتحويل', `<p>استعمل وحدات متناسقة قبل التعويض:</p>${formula('1\\,\\mathrm{km}=1000\\,\\mathrm{m}', { display: true })}${formula('1\\,\\mathrm{h}=3600\\,\\mathrm{s}', { display: true })}<p>ولتحويل سرعة من ${formula('\\mathrm{km}\\cdot\\mathrm{h}^{-1}')} إلى ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-1}')} نستبدل الكيلومتر بـ${quantity('1000', units.metre)} والساعة بـ${quantity('3600', units.second)}، ثم نبسّط.</p>`)}`;
}

function exampleShell(title, source, given, required, solution, check) {
  return `<article class="worked-example"><div class="source-line"><span class="source-chip ${source === 'توضيح إثرائي' ? 'source-extra' : ''}">${source}</span></div><h3>${title}</h3><div class="given-required"><div><h4>المعطيات</h4>${given}</div><div><h4>المطلوب</h4>${required}</div></div><h4>طريقة التفكير والحل</h4>${solution}<p class="answer-check"><strong>التحقق:</strong> ${check}</p></article>`;
}

export function examplesContent() {
  return `${exampleShell('السيارة: تحويل السرعة وحساب المسافة', 'تطبيق محلول من الكتاب · ص13',
    `<ul><li>سرعة ثابتة ${quantity('36', units.kilometrePerHour)}.</li><li>طريق أفقية مستقيمة.</li><li>الزمن نصف ساعة.</li></ul>`,
    '<ol><li>طبيعة الحركة.</li><li>اسم أثر العجلات.</li><li>السرعة بوحدة النظام الدولي.</li><li>المسافة خلال نصف ساعة.</li></ol>',
    steps(['السرعة ثابتة والمسار مستقيم؛ إذن الحركة <strong>مستقيمة منتظمة</strong>.', 'أثر العجلات يمثل النقاط التي مرت بها السيارة؛ إذن هو <strong>مسار الحركة</strong>.', `نوحّد الوحدات:${formula('v_{avg}=\\frac{36\\,\\mathrm{km}}{1\\,\\mathrm{h}}=\\frac{36\\times1000\\,\\mathrm{m}}{3600\\,\\mathrm{s}}=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}', { display: true })}`, `نحوّل نصف الساعة إلى ${quantity('1800', units.second)}، ثم نعوّض:${formula('d=v_{avg}t=10\\times1800=18000\\,\\mathrm{m}=18\\,\\mathrm{km}', { display: true })}`]),
    `الطريقة الثانية في الكتاب تعطي ${formula('d=36\\times0.5=18\\,\\mathrm{km}')}، وهي توافق ${quantity('18000', units.metre)}.`)}
  ${exampleShell('المسألة الأولى: القارب', 'مسألة من الكتاب · ص16',
    `<ul><li>${formula('d=18\\,\\mathrm{km}')}</li><li>${formula('t=0.5\\,\\mathrm{h}')}</li><li>الزمن في الجزء الثاني ${quantity('20', units.second)}.</li></ul>`,
    '<p>السرعة الوسطية بوحدتي الكيلومتر/ساعة والمتر/ثانية، ثم المسافة خلال 20 ثانية.</p>',
    steps([`نحسب السرعة بوحدة الكيلومتر والساعة:${formula('v_{avg}=\\frac{18}{0.5}=36\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}', { display: true })}`, `نحوّل السرعة:${formula('v_{avg}=\\frac{36\\times1000}{3600}=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}', { display: true })}`, `السرعة ثابتة، لذلك:${formula('d=v_{avg}t=10\\times20=200\\,\\mathrm{m}', { display: true })}`]),
    'الزمن 20 ثانية أقل من نصف ساعة بكثير، والمسافة 200 متر أقل من 18 كيلومتراً؛ والوحدات متناسقة.')}
  ${exampleShell('المسألة الثانية: الدراجة الهوائية', 'مسألة من الكتاب · ص16',
    `<ul><li>السرعة الوسطية ${quantity('9', units.kilometrePerHour)}.</li><li>المسافة في الجزء الأول ${quantity('2700', units.metre)}.</li><li>الزمن في الجزء الثاني ${quantity('25', units.minute)}.</li></ul>`,
    '<p>الزمن اللازم لقطع 2700 متر، ثم المسافة المقطوعة خلال 25 دقيقة.</p>',
    steps([`نوحّد السرعة مع المتر والثانية:${formula('v_{avg}=\\frac{9\\times1000}{3600}=2.5\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}', { display: true })}`, `من قانون الكتاب نشتق علاقة الزمن:${formula('t=\\frac{d}{v_{avg}}=\\frac{2700}{2.5}=1080\\,\\mathrm{s}=18\\,\\mathrm{min}', { display: true })}`, `للجزء الثاني نبقي السرعة بالكيلومتر/ساعة ونحوّل الزمن إلى ساعة:${formula('t=\\frac{25}{60}\\,\\mathrm{h}', { display: true })}${formula('d=9\\times\\frac{25}{60}=3.75\\,\\mathrm{km}=3750\\,\\mathrm{m}', { display: true })}`]),
    'استخدمنا مسافة طول المسار، والزمن الكلي، ولم نخلط الدقائق بالثواني أو الساعات.')}
  ${exampleShell('المسألة الثالثة: الذهاب والعودة', 'مسألة من الكتاب · ص16',
    `<ul><li>طول الطريق ${quantity('900', units.metre)}.</li><li>يذهب الطفل إلى النهاية ثم يعود إلى نقطة الانطلاق.</li><li>الزمن الكلي ربع ساعة: ${formula('t=15\\,\\mathrm{min}=900\\,\\mathrm{s}')}</li></ul>`,
    '<p>المسافة التي قطعها الطفل، ثم سرعته الوسطية.</p>',
    steps([`المسافة طول المسار الكلي، لذلك نجمع الذهاب والعودة:${formula('d=900+900=1800\\,\\mathrm{m}', { display: true })}`, `نحسب السرعة الوسطية بالمسافة الكلية والزمن الكلي:${formula('v_{avg}=\\frac{d}{t}=\\frac{1800}{900}=2\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}', { display: true })}`]),
    'لا نستخدم فرق موضعي البداية والنهاية وحده هنا، لأن الحركة تغيّر اتجاهها. المسافة المقطوعة ليست صفراً.')}`;
}

export function summaryContent() {
  return `<div class="summary-hero"><h3>الفكرة المحورية</h3><p>لوصف الحركة أو السكون نحتاج إلى جسم مرجع. ثم نصف المسار، ونقيس المسافة والزمن لنحسب السرعة الوسطية.</p></div>
  <div class="summary-grid"><section><h3>تعريفات سريعة</h3><dl class="summary-definitions"><dt>الجسم المرجع</dt><dd>الجسم الذي نقارن مواضع الأجسام الأخرى به.</dd><dt>المسار</dt><dd>مجموعة النقاط التي يمر بها الجسم المتحرك.</dd><dt>المسافة</dt><dd>طول المسار المقطوع.</dd><dt>السرعة الوسطية</dt><dd>المسافة المقطوعة ÷ الزمن المستغرق.</dd><dt>السرعة اللحظية</dt><dd>مقدار السرعة عند لحظة معينة.</dd></dl></section>
  <section><h3>القانون والوحدات</h3>${formula('v_{avg}=\\frac{d}{t}', { display: true })}${formula('d=v_{avg}t', { display: true })}<p>${formula('[v_{avg}]=\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}</p><p>${formula('1\\,\\mathrm{km}=1000\\,\\mathrm{m}')}</p><p>${formula('1\\,\\mathrm{h}=3600\\,\\mathrm{s}')}</p></section></div>
  <h3>قارن من الرسم</h3><div class="graph-compare"><div>${miniComparisonGraph('uniform')}<p><strong>منتظمة:</strong> مسافات متساوية في أزمنة متساوية.</p></div><div>${miniComparisonGraph('changing')}<p><strong>غير منتظمة:</strong> مسافات غير متساوية في أزمنة متساوية.</p></div><div>${miniComparisonGraph('rest')}<p><strong>ساكن بالنسبة إلى المرجع:</strong> البُعد لا يتغير.</p></div></div>
  <div class="summary-reminders"><span>الحركة والسكون نسبيان</span><span>المستقيمة المنتظمة = مسار مستقيم + سرعة ثابتة</span><span>في الحركات المنتظمة: اللحظية = المتوسطة</span></div>`;
}

const notebookBodies = {
  idea: `<p>الحركة والسكون مفهومان نسبيان يعتمدان على الجسم المرجع. أصف المسار، وأقيس المسافة والزمن، ثم أحسب السرعة الوسطية.</p>`,
  definitions: `<ul><li><strong>المتحرك:</strong> يتغير بُعده عن جسم آخر ساكن.</li><li><strong>الساكن:</strong> لا يتغير بُعده عن جسم آخر ساكن.</li><li><strong>الجسم المرجعي:</strong> الجسم الساكن الذي يُقارن تغير بُعد الأجسام الأخرى عنه.</li><li><strong>المسار:</strong> مجموعة النقاط التي يمر بها الجسم المتحرك.</li><li><strong>المسافة:</strong> طول المسار المقطوع.</li><li><strong>السرعة اللحظية:</strong> مقدار السرعة عند لحظة معينة.</li></ul>`,
  laws: `${formula('v_{avg}=\\frac{d}{t}', { display: true })}${formula('d=v_{avg}t', { display: true })}<ul><li>${formula('d')}: المسافة بالمتر أو الكيلومتر.</li><li>${formula('t')}: الزمن بالثانية أو الدقيقة أو الساعة.</li><li>${formula('v_{avg}')}: السرعة الوسطية، ووحدتها الدولية ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}</li></ul><p>${formula('1\\,\\mathrm{km}=1000\\,\\mathrm{m}')}</p><p>${formula('1\\,\\mathrm{h}=3600\\,\\mathrm{s}')}</p>`,
  diagrams: `<div class="notebook-graphs">${miniComparisonGraph('uniform')}${miniComparisonGraph('rest')}</div><p>خط مستقيم للحركة المنتظمة، وخط أفقي للسكون بالنسبة إلى المرجع. الخط المنحني في مثال الكتاب يدل على حركة غير منتظمة.</p>`,
  procedures: `<ol><li>أضع السيارة والكرة والمكعب والأسطوانة بجانب بعضها.</li><li>أحرك السيارة وألاحظ تغير البُعد عن المكعب.</li><li>أدفع الكرة وألاحظ.</li><li>أحدد المتحرك والساكن والمرجع.</li></ol><p><strong>للحساب:</strong> أحدد المعطيات ← أوحّد الوحدات ← أختار العلاقة ← أعوّض ← أكتب النتيجة مع الوحدة.</p>`,
  comparisons: `<div class="table-scroll" tabindex="0"><table><thead><tr><th>الحالة</th><th>المسافات في أزمنة متساوية</th><th>الرسم</th></tr></thead><tbody><tr><td>منتظمة</td><td>متساوية</td><td>مستقيم</td></tr><tr><td>غير منتظمة</td><td>غير متساوية</td><td>منحنٍ في المثال</td></tr><tr><td>ساكن بالنسبة للمرجع</td><td>لا يتغير البُعد</td><td>أفقي</td></tr></tbody></table></div><p>السرعة الوسطية لفترة كاملة، واللحظية عند لحظة معينة. تتساويان في الحركات المنتظمة.</p>`,
  mistakes: `<ul><li>وصف الجسم بأنه متحرك دون ذكر المرجع.</li><li>الخلط بين الموضع والمسافة المقطوعة.</li><li>استخدام ${formula('|x_2-x_1|')} عند الذهاب والعودة بدل جمع طولي المسار.</li><li>نسيان أن المستقيمة المنتظمة تحتاج مساراً مستقيماً وسرعة ثابتة.</li><li>التعويض بالكيلومتر والثانية معاً دون توحيد الوحدات.</li><li>كتابة النتيجة من دون وحدة.</li></ul>`,
  exam: `<ul><li>اذكر المرجع في إجابة السكون والحركة.</li><li>احفظ تعريف المسار والمسافة والسرعة الوسطية.</li><li>تدرّب على ${formula('v_{avg}=\\frac{d}{t}')} و${formula('d=v_{avg}t')}.</li><li>حوّل ${formula('\\mathrm{km}\\cdot\\mathrm{h}^{-1}')} إلى ${formula('\\mathrm{m}\\cdot\\mathrm{s}^{-1}')} باستعمال ${formula('\\frac{1000}{3600}')}.</li><li>اقرأ قيم البداية والنهاية والفواصل الزمنية من الرسم.</li><li>في الذهاب والعودة: المسافة الكلية هي مجموع أطوال المسار.</li></ul>`,
  checklist: `<div class="review-checklist">${['أميّز المتحرك والساكن بالنسبة إلى مرجع.', 'أصنف المسار مستقيماً أو دائرياً أو منحنياً.', 'أفرّق بين الموضع والمسافة المقطوعة.', 'أقرأ خطاً بيانياً وأستنتج نوع الحركة.', 'أحسب السرعة الوسطية والمسافة والزمن.', 'أحوّل الوحدات وأكتب النتيجة مع وحدتها.', 'أشرح الفرق بين السرعة الوسطية واللحظية.'].map(item => `<label><input type="checkbox"><span>${item}</span></label>`).join('')}</div>`,
};

export function notebookContent() {
  return `<p class="notebook-note">مواد للمراجعة والدراسة. لا يحتوي الدفتر على إجابات المعلم.</p><div class="note-grid">${notebookSections.map(section => `<article class="note-card ${['checklist', 'definitions', 'mistakes'].includes(section.id) ? 'note-wide' : ''}"><h3>${section.title}</h3>${notebookBodies[section.id]}</article>`).join('')}</div>`;
}

export function testPendingContent() {
  return `<div class="state-panel" data-state="empty"><span class="state-icon" aria-hidden="true">🔒</span><div><strong>اختبار الدرس لم يُؤلَّف بعد</strong><p>التزاماً بترتيب الاعتماد، سيُنشأ الاختبار المستقل بعد موافقة صاحب المشروع على المحتوى التعليمي. هذه المرحلة محفوظة في ترتيبها الثامن، ولا تحتوي حالياً على أسئلة أو نتيجة.</p></div></div>`;
}
