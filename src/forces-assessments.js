// بنوك أسئلة درس «القوى على حامل واحد» (الوحدة الأولى، ص29–40) بمعرّفات fh-.
// كل إجابة مشتقة من نصوص الكتاب: قاعدة الجمع في حالة الجهة الواحدة (ص31–32 وص37)،
// وقاعدة الطرح في حالة الجهتين المتعاكستين (ص33–34 وص37)، وأرقام التطبيق ص36 وأسئلة ص38–40.
import { formula, quantity, units } from './math.js';
import { assessmentState, parseNumeric, chooseAnswer, checkNumeric, checkMatching } from './assessments.js';

const choice = (id, prompt, options, answer, explanation) => ({ id, prompt, options, answer, explanation });

export const forcesUnderstandingQuestions = [
  choice('fh-u-mean', 'ما المقصود بمحصّلة القوى؟', ['قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة', 'مجموع كتل الأجسام المؤثّر فيها', 'قوة أكبر قوة بين القوى المؤثّرة', 'قوة معاكسة لكل قوة مؤثّرة'], 'قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة', 'هذا تعريف الكتاب للمحصّلة في ص31 وص37: قوة واحدة تترك الأثر نفسه الذي تركته قوتان أو أكثر.'),
  choice('fh-u-same', `قوتان على حامل واحد وبجهة واحدة شدّتاهما ${quantity('15', units.newton)} و${quantity('25', units.newton)}. ما شدّة محصّلتهما؟`, ['10 نيوتن', '40 نيوتن', '25 نيوتن', '625 نيوتن'], '40 نيوتن', `الجهة واحدة، فتُجمع الشدّتان: ${formula('F=15+25=40\\,\\mathrm{N}')} كما في ص31–32.`),
  choice('fh-u-opposite', `قوتان على حامل واحد وبجهتين متعاكستين شدّتاهما ${quantity('30', units.newton)} و${quantity('50', units.newton)}. ما شدّة محصّلتهما وإلى أي جهة؟`, ['80 نيوتن بجهة القوة الأكبر', '20 نيوتن بجهة القوة الأكبر', '20 نيوتن بجهة القوة الأصغر', 'صفر'], '20 نيوتن بجهة القوة الأكبر', `الجهتان متعاكستان، فنطرح الأصغر من الأكبر: ${formula('F=50-30=20\\,\\mathrm{N}')}، والجهة بجهة القوة الأكبر (ص33–34).`),
  choice('fh-u-direct', 'ما شرط القوتين المتعاكستين مباشرة؟', ['متوازيتان حاملاً ومختلفتان شدّةً', 'منطبقتان حاملاً ومتّفقتان جهةً ومتساويتان شدّةً', 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً', 'منطبقتان حاملاً ومتعاكستان جهةً ومختلفتان شدّةً'], 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً', 'هذا نص الكتاب ص34 وص37: منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، ولهما نقطة تأثير مشتركة.'),
  choice('fh-u-reaction', 'أيُّ العبارات يعبّر عن مبدأ الفعل وردّ الفعل؟', ['لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً', 'لكلّ فعل ردّ فعل يساويه شدّةً وبماثله جهةً', 'لكلّ فعل ردّ فعل يخالفه حاملاً ويساويه شدّةً', 'لا يوجد ردّ فعل إلا عند التلامس'], 'لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً', 'هذا نص مبدأ الفعل وردّ الفعل في ص35: ينطبق عليه حاملاً، ويعاكسه جهة، ويساويه شدّةً؛ وقد جذبت المغناطيسان وهما لا يتلامسان.'),
  choice('fh-u-balance', 'قوتان على حامل واحد وبجهتين متعاكستين، متساويتان شدّةً، ولهما نقطة تأثير مشتركة. ماذا يحدث للجسم؟', ['يتحرّك بجهة القوة الأولى', 'يتحرّك بجهة القوة الثانية', 'يبقى ساكناً لأن إحداهما تلغي الأخرى', 'تتضاعف الشدّة المؤثّرة فيه'], 'يبقى ساكناً لأن إحداهما تلغي الأخرى', 'هذا نتيجة تجربة ص34: عند تساوي الشدّتين لا تتحرّك الحلقة، لأن إحدى القوتين تلغي الأخرى؛ وهما عندئذٍ «قوتان متعاكستان مباشرة».'),
];

export const forcesTrueFalseQuestions = [
  choice('fh-tf-1', 'تُجمع شدّتا القوتين إذا كانتا على حامل واحد وبجهتين متعاكستين.', ['صح', 'خطأ'], 'خطأ', 'المتعاكستان تُطرح فيهما الشدّة الأصغر من الأكبر، والجمع يكون عندما تكون الجهة واحدة (ص31 و33).'),
  choice('fh-tf-2', 'جهة محصّلة قوتين متعاكستين هي جهة القوة الأكبر.', ['صح', 'خطأ'], 'صح', 'هذا نص الكتاب ص33 وص37: «الجهة: بجهة القوة الأكبر».'),
  choice('fh-tf-3', 'في مبدأ الفعل وردّ الفعل، القوتان تؤثّران في الجسم نفسه.', ['صح', 'خطأ'], 'خطأ', 'الفعل وردّ الفعل يحدثان بين جسمين مختلفين (اليد والطاولة، المغناطيسان، الصاروخ والغاز)؛ أما «الجسم نفسه» فخاص بالقوتين المتعاكستين مباشرة.'),
  choice('fh-tf-4', 'محصّلة قوى الفريق الأول في التطبيق ص36 هي 800 نيوتن.', ['صح', 'خطأ'], 'صح', 'قوى الفريق الأول 230 و350 و220 بجهة واحدة، فتُجمع: 230+350+220=800 N (ص36).'),
  choice('fh-tf-5', 'القوى على حامل واحد هي القوى التي تؤثّر وفق مستقيم واحد.', ['صح', 'خطأ'], 'صح', 'هذا نص الكتاب ص30 وص37.'),
];

export const forcesBookChoiceQuestions = [
  choice('fh-mc-1', 'تؤثّر في النقطة (o) قوتان (F̄₁، F̄₂) على حامل واحد وبجهة واحدة، فإنّ شدّة محصّلتهما تعطى بالعلاقة:', ['F = F₁ − F₂', 'F = F₁ + F₂', 'F = F₁ ÷ F₂', 'F = √(F₁² + F₂²)'], 'F = F₁ + F₂', 'الجهة واحدة، فالشدة مجموع الشدّتين كما في «تعلَّمُّ» ص37 والسؤال الأول ص37.'),
  choice('fh-mc-2', 'تؤثّر في النقطة (o) قوتان (F̄₁، F̄₂) حيث F₁ < F₂ على حامل واحد وبجهتين متعاكستين، فإنّ شدّة محصّلتهما تُعطى بالعلاقة:', ['F = F₁ − F₂', 'F = F₂ − F₁', 'F = F₁ + F₂', 'F = F₁ ÷ F₂'], 'F = F₂ − F₁', 'نطرح الصغرى من الكبرى حتى تكون الشدّة موجبة، وهنا الأكبر هي F₂؛ وهذا نص الكتاب ص37 (البند 2).'),
  choice('fh-mc-3', `في لعبة شدّ الحبل بين فريقين كانت شدّة قوة الفريق الأول ${quantity('850', units.newton)}، وشدّة قوة الفريق الثاني ${quantity('750', units.newton)}، فإنّ شدّة محصّلة قوّتي الفريقين تساوي:`, ['F = 100 N وبجهة الفريق الأول', 'F = 50 N وبجهة الفريق الأول', 'F = 100 N وبجهة الفريق الثاني', 'F = 50 N وبجهة الفريق الثاني'], 'F = 100 N وبجهة الفريق الأول', `المحصّلة طرح الشدّتين، والجهة بجهة الأكبر: ${formula('F=850-750=100\\,\\mathrm{N}')} بجهة الفريق الأول (البند 3 ص38).`),
  choice('fh-mc-4', `في لعبة شدّ الحبل، إذا كانت شدّة قوة الفريق الأول ${quantity('920', units.newton)}، وشدّة المحصّلة ${quantity('40', units.newton)}، فإنّ شدّة قوة الفريق الثاني تساوي:`, ['860 N', '960 N', '23 N', '36800 N'], '960 N', `المحصّلة فرق الشدّتين على حامل الحبل: ${formula('F=|F_1-F_2|')}. ومنها ${formula('F_2=920+40=960\\,\\mathrm{N}')} أو ${formula('F_2=920-40=880\\,\\mathrm{N}')}. وبما أنّ 880 غير موجود بين الخيارات المطبوعة و960 موجود، فإنّ المحصّلة بجهة الفريق الثاني وشدّة الفريق الثاني 960 N (البند 4 ص38).`),
  choice('fh-mc-5', `تؤثّر في النقطة (O) قوتان على حامل واحد وبجهة واحدة، ${formula('F_1=40\\,\\mathrm{N}')} والمحصّلة ${formula('F=80\\,\\mathrm{N}')}. شدّة القوة الثانية:`, ['40 N', '120 N', '3200 N', '2 N'], '40 N', `من قاعدة الجمع ${formula('F=F_1+F_2')} نجد ${formula('F_2=80-40=40\\,\\mathrm{N}')} (البند 5 ص38).`),
  choice('fh-mc-6', `قوتان متعاكستان مباشرة شدّة كلّ منهما ${formula('F_1=F_2=30\\,\\mathrm{N}')}، فإنّ شدّة محصّلتهما:`, ['60 N', '0 N', '30 N', '15 N'], '0 N', `المتعاكستان مباشرة متساويتان ومتعاكستان، فتُلغیان: ${formula('F=30-30=0\\,\\mathrm{N}')} (البند 6 ص38).`),
  choice('fh-mc-7', 'القوتان المتعاكستان مباشرة هما قوتان:', ['متوازيتان حاملاً ومتعاكستان جهةً ومختلفتان شدّةً', 'منطبقتان حاملاً ومتّفقتان جهةً ومتساويتان شدّةً', 'منطبقتان حاملاً ومتّفقتان جهةً ومختلفتان شدّةً', 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً'], 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً', 'هذا نص تعريف الكتاب ص34 وص37، ويشترط معه نقطة التأثير المشتركة (البند 7 ص38).'),
  choice('fh-mc-8', 'لكلّ فعل ردّ فعل:', ['يساويه بالقيمة وبماثله بالاتجاه.', 'يساويه بالقيمة ويعاكسه بالاتجاه.', 'يوازيه بالحامل وبماثله بالاتجاه', 'لا يساويه بالقيمة ويعاكسه بالاتجاه.'], 'يساويه بالقيمة ويعاكسه بالاتجاه.', 'نصّ مبدأ الفعل وردّ الفعل ص35 وص37: ينطبق عليه حاملاً، ويعاكسه جهةً، ويساويه شدّةً (البند 8 ص38).'),
];

// مسائل حسابية متدرجة: القيم من الكتاب أو مضاعفات تعتمد القاعدتين نفسيهما.
export const forcesNumericQuestions = [
  { id: 'fh-num-same', level: 3, title: 'قوتان بجهة واحدة', prompt: `قوتان على حامل واحد وبجهة واحدة شدّتاهما ${quantity('20', units.newton)} و${quantity('30', units.newton)}. احسب شدّة المحصّلة بالنيوتن.`, expected: 50, unit: units.newton, explanation: `${formula('F=20+30=50\\,\\mathrm{N}')} كما في تطبيق الكتاب ص32.` },
  { id: 'fh-num-opposite', level: 3, title: 'قوتان متعاكستان', prompt: `قوتان على حامل واحد وبجهتين متعاكستين شدّتاهما ${quantity('20', units.newton)} و${quantity('30', units.newton)}. احسب شدّة المحصّلة بالنيوتن.`, expected: 10, unit: units.newton, explanation: `${formula('F=30-20=10\\,\\mathrm{N}')} بجهة القوة الأكبر، كما في تطبيق الكتاب ص34.` },
  { id: 'fh-num-team1', level: 3, title: 'محصّلة الفريق الأول', prompt: `في التطبيق ص36: اجمع قوى الفريق الأول ${quantity('230', units.newton)} و${quantity('350', units.newton)} و${quantity('220', units.newton)}.`, expected: 800, unit: units.newton, explanation: `${formula('230+350+220=800\\,\\mathrm{N}')} لأن القوى بجهة واحدة تُجمع (ص36).` },
  { id: 'fh-num-net', level: 4, title: 'محصّلة الفريقين', prompt: `في التطبيق ص36: محصّلة قوى الفريق الأول ${quantity('800', units.newton)} وقوى الفريق الثاني ${quantity('700', units.newton)} بجهتين متعاكستين. احسب شدّة المحصّلة.`, expected: 100, unit: units.newton, explanation: `${formula('F=800-700=100\\,\\mathrm{N}')} بجهة الفريق الأول، فهو الفائز (ص36).` },
  { id: 'fh-num-problem1', level: 4, title: 'المسألة الأولى ص39', prompt: `تؤثّر قوتان بجهة واحدة شدّتاهما ${quantity('15', units.newton)} و${quantity('30', units.newton)}. احسب شدّة المحصّلة.`, expected: 45, unit: units.newton, explanation: `${formula('F=15+30=45\\,\\mathrm{N}')} لأن الجهة واحدة (المسألة الأولى ص39).` },
  { id: 'fh-num-balance2', level: 4, title: 'قوة التوازن في المسألة الثانية ص40', prompt: `قوتان متعاكستان شدّتاهما ${quantity('25', units.newton)} و${quantity('75', units.newton)}. ما شدّة القوة اللازمة لتتوازن المحصّلة؟`, expected: 50, unit: units.newton, explanation: `المحصّلة ${formula('F=75-25=50\\,\\mathrm{N}')}، وقوة التوازن تساويها شدّةً وتعاكسها جهة (المسألة الثانية ص40).` },
  { id: 'fh-num-balance1', level: 5, title: 'قوة التوازن في المسألة الأولى ص39', prompt: `قوتان بجهة واحدة شدّتاهما ${quantity('15', units.newton)} و${quantity('30', units.newton)}. ما شدّة القوة التي تُوازن محصّلتهما؟`, expected: 45, unit: units.newton, explanation: `المحصّلة ${formula('F=15+30=45\\,\\mathrm{N}')}، والقوة التي توازنها تساويها شدّةً وتعاكسها جهة (المسألة الأولى ص39).` },
  { id: 'fh-num-equal', level: 5, title: 'المسألة الثانية عند تغيّر الشدّة', prompt: `في المسألة الثانية ص40 إذا كانت شدّة القوة الثانية ${quantity('25', units.newton)} والأولى ${quantity('25', units.newton)} أيضاً فما شدّة محصّلة القوتين؟`, expected: 0, unit: units.newton, explanation: `${formula('F=25-25=0\\,\\mathrm{N}')}: القوتان متساويتان ومتعاكستان، فهما متعاكستان مباشرة ولا تتحرّك الحلقة (ص34 وص40).` },
];

const forcesMatchingDefinitions = [
  { id: 'fh-match-carrier', text: 'القوى التي تؤثّر وفق مستقيم واحد.', answer: 'القوى على حامل واحد' },
  { id: 'fh-match-resultant', text: 'قوة وحيدة تُحدث في الجسم الأثر نفسه الذي تحدثه القوى مجتمعة.', answer: 'محصّلة القوى' },
  { id: 'fh-match-direct', text: 'قوتان منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً، لهما نقطة تأثير مشتركة.', answer: 'القوتان المتعاكستان مباشرة' },
  { id: 'fh-match-reaction', text: 'لكلّ فعل ردّ فعل ينطبق عليه حاملاً ويعاكسه جهة ويساويه شدّةً.', answer: 'مبدأ الفعل وردّ الفعل' },
];

function forcesQuestionView(question, group) {
  const selected = assessmentState.choices[question.id];
  return `<article class="question-card ${selected ? 'is-answered' : ''}" data-question-card="${question.id}">
    <h3>${question.prompt}</h3><div class="answer-options" role="group" aria-label="خيارات الإجابة">
      ${question.options.map(option => `<button type="button" class="answer-option" data-assessment-choice data-group="${group}" data-qid="${question.id}" data-value="${option}" aria-pressed="${selected === option}">${option}</button>`).join('')}
    </div>
    ${selected ? `<div class="answer-feedback ${selected === question.answer ? 'correct' : 'incorrect'}" role="status"><strong>${selected === question.answer ? 'إجابة صحيحة.' : `ليست الإجابة الصحيحة؛ الإجابة: ${question.answer}.`}</strong><p>${question.explanation}</p></div>` : '<p class="answer-hint">اختر إجابة لترى التفسير.</p>'}
  </article>`;
}

function forcesNumericView(question) {
  const record = assessmentState.numeric[question.id] || {};
  const answered = record.checked;
  const correct = answered && Math.abs(record.value - question.expected) < 0.001;
  return `<article class="numeric-question" data-numeric-card="${question.id}"><h3>${question.title}</h3><p>${question.prompt}</p><div class="numeric-answer"><label for="input-${question.id}">القيمة العددية</label><input id="input-${question.id}" inputmode="decimal" autocomplete="off" data-numeric-input="${question.id}" value="${record.raw || ''}" aria-describedby="feedback-${question.id}"><span>${formula(question.unit)}</span><button class="btn btn-secondary" type="button" data-check-numeric="${question.id}">تحقق</button></div>
  <div id="feedback-${question.id}">${answered ? `<div class="answer-feedback ${correct ? 'correct' : 'incorrect'}" role="status"><strong>${correct ? 'صحيح!' : `راجع الحساب؛ النتيجة ${question.expected}.`}</strong><p>${question.explanation}</p></div>` : ''}</div></article>`;
}

function forcesMatchingView() {
  const terms = ['القوى على حامل واحد', 'محصّلة القوى', 'القوتان المتعاكستان مباشرة', 'مبدأ الفعل وردّ الفعل', 'قوة الفعل'];
  const checked = assessmentState.matchingChecked;
  const correctCount = forcesMatchingDefinitions.filter(item => assessmentState.matching[item.id] === item.answer).length;
  return `<section class="practice-level"><span class="level-chip">المستوى 1 · أساسي</span><h2>الوصل بين التعريف والمصطلح — من الكتاب</h2>${forcesMatchingDefinitions.map(item => `<div class="matching-row"><p>${item.text}</p><label>المصطلح<select data-match-select="${item.id}" aria-label="اختر المصطلح المناسب"><option value="">اختر…</option>${terms.map(term => `<option value="${term}" ${assessmentState.matching[item.id] === term ? 'selected' : ''}>${term}</option>`).join('')}</select></label></div>`).join('')}
  <button class="btn btn-primary" type="button" data-check-matching>تحقق من الوصل</button>${checked ? `<div class="answer-feedback ${correctCount === 4 ? 'correct' : 'incorrect'}" role="status"><strong>أجبت عن ${correctCount} من 4 بصورة صحيحة.</strong><p>القوى على حامل واحد: على مستقيم واحد. محصّلة القوى: قوة وحيدة بالأثر نفسه. المتعاكستان مباشرة: منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً. مبدأ الفعل وردّ الفعل: لكلّ فعل ردّ فعل مساوٍ ومعاكس. ويبقى مصطلح «قوة الفعل» دون ربط.</p></div>` : ''}</section>`;
}

export function forcesUnderstandingContent() {
  return forcesUnderstandingQuestions.map(question => forcesQuestionView(question, 'understanding')).join('');
}

export function forcesPracticeContentStage() {
  return `${forcesMatchingView()}
  <section class="practice-level"><span class="level-chip">المستوى 2 · تطبيق</span><h2>صح وخطأ مع التصحيح — على قواعد الدرس</h2>${forcesTrueFalseQuestions.map(question => forcesQuestionView(question, 'practice')).join('')}</section>
  <section class="practice-level"><span class="level-chip">المستوى 3 · أسئلة الكتاب</span><h2>اختر الإجابة الصحيحة — من أسئلة ص37–38</h2>${forcesBookChoiceQuestions.map(question => forcesQuestionView(question, 'practice')).join('')}</section>
  <section class="practice-level"><span class="level-chip">المستوى 4 · حساب</span><h2>مسائل المحصّلة وقوة التوازن — من الكتاب ص36 وص39–40</h2>${forcesNumericQuestions.map(forcesNumericView).join('')}</section>`;
}

export { parseNumeric, chooseAnswer, checkNumeric, checkMatching };
