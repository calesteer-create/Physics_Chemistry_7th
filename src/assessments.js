import { formula, quantity, units } from './math.js';

export const assessmentState = {
  choices: {},
  numeric: {},
  matching: {},
  matchingChecked: false,
};

const choice = (id, prompt, options, answer, explanation) => ({ id, prompt, options, answer, explanation });

export const understandingQuestions = [
  choice('u-reference', 'راكب جالس في حافلة متحركة. ما وصفه بالنسبة إلى السائق؟', ['متحرك', 'ساكن', 'متسارع'], 'ساكن', 'لا يتغيّر موضع الراكب الجالس بالنسبة إلى السائق؛ لذلك هو ساكن بالنسبة إليه. أما بالنسبة إلى شاخصة على الطريق فهو متحرك.'),
  choice('u-uniform', 'يقطع متزلج 8 أمتار في كل ثانية. كيف تصف حركته؟', ['منتظمة', 'غير منتظمة', 'ساكنة'], 'منتظمة', 'المسافات متساوية في فواصل زمنية متساوية؛ لذلك الحركة منتظمة والسرعة ثابتة.'),
  choice('u-rest-graph', `بقيت قيمة بُعد جسم عن المرجع ${quantity('5', units.metre)} من اللحظة صفر إلى اللحظة السابعة. ما المسافة التي قطعها الجسم خلال هذه الفترة؟`, ['صفر', '5 أمتار', '35 متراً'], 'صفر', 'القيمة 5 أمتار هي البُعد الثابت عن المرجع. لم يغيّر الجسم موضعه، لذلك المسافة التي قطعها خلال الفترة صفر.'),
  choice('u-roundtrip', `ذهب طفل ${quantity('900', units.metre)} ثم عاد إلى نقطة البداية. ما المسافة المقطوعة؟`, ['صفر', '900 متر', '1800 متر'], '1800 متر', 'المسافة طول المسار الكلي: 900 متر ذهاباً و900 متر عودة. تغيّر الاتجاه يمنع استخدام فرق موضعي البداية والنهاية وحده.'),
  choice('u-average', `قطعت حافلة ${quantity('400', units.kilometre)} في خمس ساعات مع توقف خلال الرحلة. ما سرعتها المتوسطة؟`, ['80 كيلومتراً/ساعة', '400 كيلومتر/ساعة', '5 كيلومترات/ساعة'], '80 كيلومتراً/ساعة', `نستخدم المسافة الكلية والزمن الكلي للرحلة، ويشمل الزمن التوقف: ${formula('v_{avg}=\\frac{400}{5}=80\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}')}.`),
  choice('u-instant', 'أي عبارة صحيحة عن السرعة اللحظية؟', ['تخص فترة كاملة دائماً', 'يقرؤها السائق من العداد عند لحظة معينة', 'تساوي المتوسطة في كل الحركات'], 'يقرؤها السائق من العداد عند لحظة معينة', 'اللحظية تخص لحظة معينة. تساوي المتوسطة في الحركات المنتظمة، وليس في كل الحركات.'),
];

const tf = (id, prompt, answer, explanation) => choice(id, prompt, ['صح', 'خطأ'], answer, explanation);
export const trueFalseQuestions = [
  tf('tf-1', 'الحركة والسكون مفهومان نسبيان يتعلقان بالجسم المتحرك.', 'خطأ', 'يتعلق الوصف بالجسم المرجع؛ فقد يختلف وصف الجسم باختلاف المرجع.'),
  tf('tf-2', 'تكون حركة جسم غير منتظمة، عندما يقطع مسافات متساوية خلال أزمنة متساوية.', 'خطأ', 'هذا وصف الحركة المنتظمة. غير المنتظمة تقطع مسافات غير متساوية في أزمنة متساوية.'),
  tf('tf-3', 'يُعدّ الجسم ساكناً، إذا تغيّر موضعه بالنسبة للجسم المرجع.', 'خطأ', 'تغيّر الموضع بالنسبة إلى المرجع يدل على أن الجسم متحرك.'),
  tf('tf-4', 'الخط البياني للمسافة المقطوعة بدلالة الزمن في الحركة المستقيمة المنتظمة منحنٍ.', 'خطأ', 'يكون الخط مستقيماً في الحركة المستقيمة المنتظمة.'),
  tf('tf-5', 'تكون حركة جسم مستقيمة منتظمة، إذا كانت سرعته متغيّرة ومسار حركته مستقيماً.', 'خطأ', 'يلزم أن يكون المسار مستقيماً والسرعة ثابتة.'),
  tf('tf-6', 'تكون السرعة اللحظية مساوية للسرعة المتوسطة في الحركات المتسارعة.', 'خطأ', 'التساوي يكون في الحركات المنتظمة، وليس في الحركات المتسارعة.'),
];

export const bookChoiceQuestions = [
  choice('mc-1', 'حركة المتزلج الممثلة بمواضع متساوية الفواصل في أزمنة متساوية هي:', ['متغيّرة', 'متباطئة', 'منتظمة', 'متسارعة'], 'منتظمة', 'تساوي المسافات في أزمنة متساوية يعني حركة منتظمة.'),
  choice('mc-2', 'في صورة سيارة متحركة بجانب شجرة، أي جسم يصلح مرجعاً ساكناً على الطريق؟', ['السيارة', 'الشجرة', 'الغيوم', 'سائق السيارة'], 'الشجرة', 'الشجرة ثابتة بالنسبة إلى الطريق، لذلك يمكن مقارنة موضع السيارة بها.'),
  choice('mc-3', `سيارة سرعتها الوسطية ${quantity('108', units.kilometrePerHour)}. قيمتها في الجملة الدولية هي:`, ['10 متر/ثانية', '300 متر/ثانية', '30 متراً/ثانية', '20 متراً/ثانية'], '30 متراً/ثانية', `نضرب في 1000 ونقسم على 3600: ${formula('\\frac{108\\times1000}{3600}=30\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}.`),
  choice('mc-4', `جسم يتحرك بسرعة ثابتة ${quantity('20', units.metrePerSecond)}. ما الزمن اللازم لقطع ${quantity('500', units.metre)}؟`, ['520 ثانية', '25 ثانية', '10000 ثانية', '20 ثانية'], '25 ثانية', `الزمن = المسافة ÷ السرعة: ${formula('t=\\frac{500}{20}=25\\,\\mathrm{s}')}.`),
];

export const numericQuestions = [
  { id: 'boat-kmh', level: 3, title: 'القارب: السرعة بالكيلومتر/ساعة', prompt: `قارب يقطع ${quantity('18', units.kilometre)} خلال نصف ساعة. احسب سرعته الوسطية.`, expected: 36, unit: units.kilometrePerHour, explanation: `السرعة: ${formula('v_{avg}=\\frac{18}{0.5}=36\\,\\mathrm{km}\\cdot\\mathrm{h}^{-1}')}.` },
  { id: 'boat-ms', level: 3, title: 'القارب: تحويل السرعة', prompt: 'حوّل سرعة القارب 36 كيلومتراً/ساعة إلى متر/ثانية.', expected: 10, unit: units.metrePerSecond, explanation: `التحويل: ${formula('\\frac{36\\times1000}{3600}=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}.` },
  { id: 'boat-distance', level: 3, title: 'القارب: المسافة', prompt: `بسرعة ثابتة ${quantity('10', units.metrePerSecond)}، ما المسافة خلال ${quantity('20', units.second)}؟`, expected: 200, unit: units.metre, explanation: `المسافة = السرعة × الزمن: ${formula('d=10\\times20=200\\,\\mathrm{m}')}.` },
  { id: 'bike-time', level: 4, title: 'الدراجة: الزمن', prompt: `دراجة سرعتها ${quantity('9', units.kilometrePerHour)} أي ${quantity('2.5', units.metrePerSecond)}. ما زمن قطع ${quantity('2700', units.metre)} بالدقائق؟`, expected: 18, unit: units.minute, explanation: `الزمن: ${formula('t=\\frac{2700}{2.5}=1080\\,\\mathrm{s}')}، و${formula('\\frac{1080}{60}=18\\,\\mathrm{min}')}.` },
  { id: 'bike-distance', level: 4, title: 'الدراجة: مسافة خلال 25 دقيقة', prompt: `ما المسافة بالكيلومتر التي تقطعها دراجة سرعتها ${quantity('9', units.kilometrePerHour)} خلال ${quantity('25', units.minute)}؟`, expected: 3.75, unit: units.kilometre, explanation: `الزمن ${formula('t=\\frac{25}{60}\\,\\mathrm{h}')}، والمسافة ${formula('d=9\\times\\frac{25}{60}=3.75\\,\\mathrm{km}')}.` },
  { id: 'child-distance', level: 4, title: 'الذهاب والعودة: المسافة', prompt: `طفل يقطع طريقاً طوله ${quantity('900', units.metre)} ذهاباً وإياباً. ما المسافة الكلية؟`, expected: 1800, unit: units.metre, explanation: `المسافة طول المسار الكلي: ${formula('d=900+900=1800\\,\\mathrm{m}')}.` },
  { id: 'child-speed', level: 4, title: 'الذهاب والعودة: السرعة الوسطية', prompt: `احسب السرعة الوسطية لمسافة ${quantity('1800', units.metre)} خلال ربع ساعة (${quantity('900', units.second)}).`, expected: 2, unit: units.metrePerSecond, explanation: `السرعة الوسطية: ${formula('v_{avg}=\\frac{1800}{900}=2\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}')}.` },
];

function questionView(question, group) {
  const selected = assessmentState.choices[question.id];
  return `<article class="question-card ${selected ? 'is-answered' : ''}" data-question-card="${question.id}">
    <h3>${question.prompt}</h3><div class="answer-options" role="group" aria-label="خيارات الإجابة">
      ${question.options.map(option => `<button type="button" class="answer-option" data-assessment-choice data-group="${group}" data-qid="${question.id}" data-value="${option}" aria-pressed="${selected === option}">${option}</button>`).join('')}
    </div>
    ${selected ? `<div class="answer-feedback ${selected === question.answer ? 'correct' : 'incorrect'}" role="status"><strong>${selected === question.answer ? 'إجابة صحيحة.' : `ليست الإجابة الصحيحة؛ الإجابة: ${question.answer}.`}</strong><p>${question.explanation}</p></div>` : '<p class="answer-hint">اختر إجابة لترى التفسير.</p>'}
  </article>`;
}

export function understandingContent() {
  return `<div class="assessment-intro"><strong>جرّب ثم افهم:</strong> يمكنك تغيير إجابتك، وسيظهر تفسير بعد كل اختيار.</div>${understandingQuestions.map(question => questionView(question, 'understanding')).join('')}`;
}

function matchingView() {
  const definitions = [
    { id: 'path', text: 'مجموعة النقاط التي يمر بها الجسم المتحرك في أثناء حركته.', answer: 'المسار' },
    { id: 'speed', text: 'قسمة المسافة المقطوعة على الزمن المستغرق في قطع هذه المسافة.', answer: 'السرعة الوسطية' },
    { id: 'distance', text: 'طول المسار الذي يسلكه جسم معين خلال حركته، وانتقاله من مكان لآخر.', answer: 'المسافة' },
  ];
  const terms = ['المسار', 'السرعة الوسطية', 'المسافة', 'الزمن'];
  const checked = assessmentState.matchingChecked;
  const correctCount = definitions.filter(item => assessmentState.matching[item.id] === item.answer).length;
  return `<section class="practice-level"><span class="level-chip">المستوى 1 · أساسي</span><h2>الوصل بين التعريف والمصطلح — من الكتاب</h2>${definitions.map(item => `<div class="matching-row"><p>${item.text}</p><label>المصطلح<select data-match-select="${item.id}" aria-label="اختر المصطلح المناسب"><option value="">اختر…</option>${terms.map(term => `<option value="${term}" ${assessmentState.matching[item.id] === term ? 'selected' : ''}>${term}</option>`).join('')}</select></label></div>`).join('')}
  <button class="btn btn-primary" type="button" data-check-matching>تحقق من الوصل</button>${checked ? `<div class="answer-feedback ${correctCount === 3 ? 'correct' : 'incorrect'}" role="status"><strong>أجبت عن ${correctCount} من 3 بصورة صحيحة.</strong><p>المسار: مجموعة النقاط. السرعة الوسطية: المسافة ÷ الزمن. المسافة: طول المسار.</p></div>` : ''}</section>`;
}

function numericView(question) {
  const record = assessmentState.numeric[question.id] || {};
  const answered = record.checked;
  const correct = answered && Math.abs(record.value - question.expected) < 0.001;
  return `<article class="numeric-question" data-numeric-card="${question.id}"><h3>${question.title}</h3><p>${question.prompt}</p><div class="numeric-answer"><label for="input-${question.id}">القيمة العددية</label><input id="input-${question.id}" inputmode="decimal" autocomplete="off" data-numeric-input="${question.id}" value="${record.raw || ''}" aria-describedby="feedback-${question.id}"><span>${formula(question.unit)}</span><button class="btn btn-secondary" type="button" data-check-numeric="${question.id}">تحقق</button></div>
  <div id="feedback-${question.id}">${answered ? `<div class="answer-feedback ${correct ? 'correct' : 'incorrect'}" role="status"><strong>${correct ? 'صحيح!' : `راجع الحساب؛ النتيجة ${question.expected}.`}</strong><p>${question.explanation}</p></div>` : ''}</div></article>`;
}

export function practiceContent() {
  return `${matchingView()}
  <section class="practice-level"><span class="level-chip">المستوى 1 · أساسي</span><h2>صح وخطأ مع التصحيح — من الكتاب</h2>${trueFalseQuestions.map(question => questionView(question, 'practice')).join('')}</section>
  <section class="practice-level"><span class="level-chip">المستوى 2 · تطبيق</span><h2>اختر الإجابة الصحيحة — من الكتاب</h2>${bookChoiceQuestions.map(question => questionView(question, 'practice')).join('')}</section>
  <section class="practice-level"><span class="level-chip">المستوى 3 · حساب</span><h2>مسألة القارب — من الكتاب</h2>${numericQuestions.filter(question => question.level === 3).map(numericView).join('')}</section>
  <section class="practice-level"><span class="level-chip">المستوى 4 · تحدٍ متدرج</span><h2>الدراجة والذهاب والعودة — من الكتاب</h2>${numericQuestions.filter(question => question.level === 4).map(numericView).join('')}</section>`;
}

export function parseNumeric(value) {
  const normalized = String(value).trim().replace(/[٠-٩]/g, digit => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)).replace(',', '.');
  return normalized === '' ? Number.NaN : Number(normalized);
}

export function chooseAnswer(qid, value) {
  assessmentState.choices[qid] = value;
}

export function checkNumeric(qid, raw) {
  assessmentState.numeric[qid] = { raw, value: parseNumeric(raw), checked: true };
}

export function checkMatching(values) {
  assessmentState.matching = values;
  assessmentState.matchingChecked = true;
}
