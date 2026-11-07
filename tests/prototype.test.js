import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { WHATSAPP_URL, ENGINEER_NAME, ENGINEER_PHONE } from '../src/demo-data.js';
import { units, lessons, stages, notebookSections, SUBJECT_LABELS } from '../src/course.js';
import { formula, quantity, units as mathUnits } from '../src/math.js';
import { bookContent } from '../src/book-content.js';
import { explainContent, examplesContent, summaryContent, notebookContent } from '../src/lesson-content.js';
import { parseNumeric, practiceContent, understandingContent, understandingQuestions, trueFalseQuestions, bookChoiceQuestions, numericQuestions, forceUnderstandingQuestions, forceTrueFalseQuestions, forceBookChoiceQuestions, forceNumericQuestions } from '../src/assessments.js';
import { REFERENCE_GEOMETRY, referenceSnapshot, graphSnapshot, GRAPH_SYMBOLS } from '../src/motion-lab.js';
import { FORCE_REGIONS, weightSnapshot, drawTargets } from '../src/force-lab.js';
import { forceDiscoverContent, forceBookContent, forceExplainContent, forceExamplesContent, forceActivityContent, forceQuestionsContent, forcePracticeContentStage, forceSummaryContent, forceNotebookContent } from '../src/force-motion.js';
import { miniComparisonGraph } from '../src/diagrams.js';

const sourceText = readdirSync('src').filter(file => /\.(js|css)$/.test(file)).map(file => readFileSync(`src/${file}`, 'utf8')).join('\n');

test('owner identity and WhatsApp destination remain unchanged', () => {
  assert.equal(WHATSAPP_URL, 'https://wa.me/963930210222');
  assert.equal(ENGINEER_NAME, 'المهندس سومر شاهين');
  assert.equal(ENGINEER_PHONE, '0930215022');
});

test('one approved unit with three approved lessons, with subject only as a tag', () => {
  assert.equal(units.length, 1);
  assert.equal(units[0].fullTitle, 'الوحدة الأولى: الحركة والتحريك');
  assert.equal(lessons.length, 3);
  assert.deepEqual(lessons.map(lesson => lesson.title), ['الحركة والسكون', 'القوة والحركة', 'القوى على حامل واحد']);
  assert.equal(lessons[0].number, 1);
  assert.equal(lessons[0].pages, '3–16');
  assert.equal(lessons[1].number, 2);
  assert.equal(lessons[1].pages, '17–28');
  assert.equal(lessons[1].id, 'force-motion');
  assert.equal(lessons[2].number, 3);
  assert.equal(lessons[2].pages, '29–40');
  assert.equal(lessons[2].id, 'forces-one-carrier');
  assert.equal(lessons[2].unitId, 'motion');
  assert.deepEqual(Object.keys(SUBJECT_LABELS).sort(), ['chemistry', 'physics']);
  assert.doesNotMatch(sourceText, /رحلة في عالم الاكتشاف|درس تجريبي/);
});

test('lesson has nine stages after moving assessment outside the lesson; notebook remains last', () => {
  assert.deepEqual(stages.map(stage => stage.id), ['discover', 'book', 'explain', 'examples', 'activity', 'questions', 'practice', 'summary', 'notebook']);
  assert.equal(stages.at(-1).kind, 'notebook');
  assert.equal(new Set(stages.map(stage => stage.id)).size, 9);
  assert.ok(!stages.some(stage => stage.id === 'test'));
});

test('test content is not embedded in the lesson stage module', () => {
  const course = readFileSync('src/course.js', 'utf8');
  assert.doesNotMatch(course, /id: 'test'|kind: 'test'/);
});

test('notebook has all nine required sections and no teacher answers', () => {
  assert.deepEqual(notebookSections.map(section => section.title), ['الفكرة الأساسية', 'التعريفات', 'القوانين والوحدات', 'الرسوم والمخططات', 'خطوات التجارب والإجراءات', 'المقارنات', 'الأخطاء الشائعة', 'النقاط المهمة للامتحان', 'قائمة المراجعة']);
  const html = notebookContent();
  assert.equal((html.match(/class="note-card/g) || []).length, 9);
  assert.doesNotMatch(html, /إجابة المعلم:|حل المعلم/);
});

test('book content retains the principal sequence, definitions, tables, application and exercises', () => {
  const html = bookContent();
  for (const text of ['أدوات التجربة', 'الجسم المرجعي', 'مسار الجسم المتحرك', 'السرعة الوسطية', 'السرعة اللحظية', 'تطبيق محلول', 'أختبر نفسي وحل المسائل', 'المسألة الثالثة']) assert.match(html, new RegExp(text));
  assert.ok(html.indexOf('مفهوم الحركة') < html.indexOf('مفهوم المسار'));
  assert.ok(html.indexOf('مفهوم المسار') < html.indexOf('مفهوم السرعة'));
  assert.ok(html.indexOf('مفهوم السرعة') < html.indexOf('تطبيق محلول'));
  assert.ok((html.match(/class="motion-graph/g) || []).length >= 5);
  assert.doesNotMatch(html, /math-fallback/);
});

test('enrichment distinguishes position, one-way distance and round trips', () => {
  const html = explainContent() + examplesContent();
  const source = readFileSync('src/lesson-content.js', 'utf8');
  assert.match(html, /وفي اتجاه واحد فقط/);
  assert.match(source, /d=\|x_2-x_1\|/);
  assert.match(source, /900\+900=1800/);
  assert.match(html, /لا نستخدم فرق موضعي البداية والنهاية/);
});

test('practice is graduated and includes book questions without becoming the final test', () => {
  const html = practiceContent();
  for (const level of ['المستوى 1', 'المستوى 2', 'المستوى 3', 'المستوى 4']) assert.match(html, new RegExp(level));
  assert.match(html, /صح وخطأ/);
  assert.match(html, /مسألة القارب/);
  assert.match(html, /الذهاب والعودة/);
});

test('book wording is preserved while enrichment uses fixed reference distance for rest', () => {
  const original = 'إذا لم تتغيّر المسافات المقطوعة بمرور الزمن فإن الجسم يكون ساكناً';
  assert.match(bookContent(), new RegExp(original));
  const additional = explainContent() + summaryContent() + notebookContent() + understandingContent() + practiceContent();
  assert.doesNotMatch(additional, new RegExp(original));
  assert.match(explainContent(), /المعيار هو ثبات البُعد بين الجسم والجسم المرجع/);
  assert.match(explainContent(), /المسافة المقطوعة خلال الفترة صفراً/);
});

test('lab position and distance use separate symbols and numerically consistent readings', () => {
  assert.deepEqual(GRAPH_SYMBOLS, { position: 'x', distance: 'd' });
  const uniform = graphSnapshot('uniform', 4);
  assert.equal(uniform.position, 70);
  assert.equal(uniform.distance, 40);
  assert.equal(uniform.speed, 10);
  const changing = graphSnapshot('changing', 4);
  assert.equal(changing.position, 16);
  assert.equal(changing.distance, 16);
  const rest = graphSnapshot('rest', 7);
  assert.equal(rest.position, 5);
  assert.equal(rest.distance, 0);
  assert.equal(rest.speed, 0);
  for (const snapshot of [uniform, changing, rest]) {
    assert.equal(snapshot.positionSymbol, 'x');
    assert.equal(snapshot.distanceSymbol, 'd');
  }
  assert.match(miniComparisonGraph('uniform'), />x \(m\)</);
  assert.match(miniComparisonGraph('rest'), />x \(m\)</);
  assert.match(miniComparisonGraph('changing'), />d \(m\)</);
});

test('reference results depend on the selected reference and the bus stays inside the SVG', () => {
  assert.equal(referenceSnapshot('sign', 4).moving, true);
  assert.equal(referenceSnapshot('driver', 4).moving, false);
  assert.equal(referenceSnapshot('passenger', 4).moving, false);
  for (const time of [0, 1.5, 4, 6]) {
    const snapshot = referenceSnapshot('sign', time);
    assert.ok(snapshot.busX >= 0);
    assert.ok(snapshot.busRight <= REFERENCE_GEOMETRY.svgWidth);
    assert.ok(Math.abs(snapshot.distanceLinePixels / snapshot.distance - REFERENCE_GEOMETRY.pixelsPerMetre) < 1e-9);
  }
  assert.equal(referenceSnapshot('sign', 0).busX, REFERENCE_GEOMETRY.initialBusX);
  assert.equal(referenceSnapshot('sign', 6).distance, 50);
});

test('true-false keys match the reviewed book statements and explanations', () => {
  assert.deepEqual(trueFalseQuestions.map(question => [question.id, question.answer]), [
    ['tf-1', 'خطأ'], ['tf-2', 'خطأ'], ['tf-3', 'خطأ'],
    ['tf-4', 'خطأ'], ['tf-5', 'خطأ'], ['tf-6', 'خطأ'],
  ]);
  assert.equal(trueFalseQuestions[0].prompt, 'الحركة والسكون مفهومان نسبيان يتعلقان بالجسم المتحرك.');
  assert.match(trueFalseQuestions[0].explanation, /بالجسم المرجع/);
  for (const question of trueFalseQuestions) {
    assert.ok(question.options.includes(question.answer));
    assert.ok(question.explanation.length > 35);
  }
});

test('reviewed choice, understanding and numeric answer keys remain scientifically consistent', () => {
  assert.deepEqual(bookChoiceQuestions.map(question => question.answer), ['منتظمة', 'الشجرة', '30 متراً/ثانية', '25 ثانية']);
  assert.deepEqual(understandingQuestions.map(question => question.answer), ['ساكن', 'منتظمة', 'صفر', '1800 متر', '80 كيلومتراً/ساعة', 'يقرؤها السائق من العداد عند لحظة معينة']);
  assert.deepEqual(Object.fromEntries(numericQuestions.map(question => [question.id, question.expected])), {
    'boat-kmh': 36, 'boat-ms': 10, 'boat-distance': 200,
    'bike-time': 18, 'bike-distance': 3.75, 'child-distance': 1800, 'child-speed': 2,
  });
  for (const question of [...bookChoiceQuestions, ...understandingQuestions]) assert.ok(question.options.includes(question.answer));
});

test('force lesson keeps the book wording verbatim, including its print typos, and separates enrichment', () => {
  const book = forceBookContent();
  for (const text of ['توصلنا سابقاً', 'نايض من الحديد', 'أُضعُ النايض', 'أسدُّ خطّافها', 'نايث الربيعة', 'سيارات العاب أطفال، مجموعة خيوط، سطح أملس', 'أشُدّ الخيط', 'أعلّق حلقة الربيعة', 'بكثلتها', 'أيهما أسهل تغييرُا لجهة حركته', 'من جسم لأخر', 'المسحود', 'باهمال قوة جذب الكواكب', 'تمار الأشجار', 'الطولة: تناسب طولاً مع شدة القوة', 'مقدار متجهه', 'طُبِّقت وقعة القوة', 'w_1', 'المطلوب حساب شدة ثقله', 'تسارع الجاذبية الأرضية']) assert.match(book, new RegExp(text));
  assert.match(book, /هي كل مؤثر قادر على تغيير الحالة الحركية للجسم، أو تغيير شكله\./);
  assert.match(book, /إنّ مقدار ممانعة الجسم لتغيير حالته الحركية، يتوقف على كتلته، فكلما كانت كتلة الجسم أكبر كانت الممانعة أكبر\./);
  assert.match(book, /يدلّ مؤشر الربيعة على شدة ثقل الجسم، والتي تختلف من جسم لأخر\./);
  assert.match(book, /عدد حقيقي موجب يعبر عمّا يحويه الجسم من مادة/);
  assert.match(book, /w_1\}\{/);
  assert.match(book, /إنّ النسبة .* في المكان ذاته هي مقدار ثابت يُسمّى تسارع الجاذبية الأرضية/);
  const enrichment = forceExplainContent() + forceExamplesContent() + forceSummaryContent() + forceNotebookContent() + forceDiscoverContent();
  for (const typo of ['باهمال', 'الطولة', 'المسحود']) assert.doesNotMatch(enrichment, new RegExp(typo), `typo stays inside book content only: ${typo}`);
  assert.match(enrichment, /توضيح إثرائي/);
});

test('force lesson covers all nine stages with the fixed ids and book structure', () => {
  const stagesHtml = forceDiscoverContent() + forceBookContent() + forceExplainContent() + forceExamplesContent() + forceActivityContent() + forceQuestionsContent() + forcePracticeContentStage() + forceSummaryContent() + forceNotebookContent();
  for (const text of ['أسئلة الكتاب قبل التجارب', 'البداية والأهداف', 'توضيح إثرائي', 'طريقة التفكير والحل', 'مختبر القوة التفاعلي', 'جرّب ثم افهم', 'المستوى 4 · حساب', 'الفكرة المحورية', 'الفكرة الأساسية']) assert.match(stagesHtml, new RegExp(text));
  assert.equal((forceBookContent().match(/role="tabpanel"/g) || []).length, 7);
  assert.equal((forceNotebookContent().match(/class="note-card/g) || []).length, 9);
  assert.doesNotMatch(forceNotebookContent(), /إجابة المعلم:|حل المعلم/);
  assert.match(forceActivityContent(), /id="force-lab"/);
  assert.doesNotMatch(stagesHtml, /math-fallback/);
});

test('force lab weight readings follow w = mg with the book regional values', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(FORCE_REGIONS).map(([key, data]) => [key, data.g])), { equator: 9.78, syria: 9.796, pole: 9.83 });
  assert.equal(weightSnapshot(10, 'equator').weight, 97.8);
  assert.equal(weightSnapshot(10, 'syria').weight, 97.96);
  assert.equal(weightSnapshot(10, 'pole').weight, 98.3);
  assert.equal(weightSnapshot(0.1, 'syria').weight, 0.98);
  const clamped = weightSnapshot(500, 'syria');
  assert.equal(clamped.mass, 100, 'lab input clamps to a sane positive range');
  assert.deepEqual(drawTargets['right-4'], { text: 'قوة أفقية نحو اليمين شدتها 4 N', newtons: 4, direction: 'right', cm: 4 });
});

test('force assessment banks are graduated and keyed with fm- ids', () => {
  const html = forcePracticeContentStage();
  for (const level of ['المستوى 1', 'المستوى 2', 'المستوى 3', 'المستوى 4']) assert.match(html, new RegExp(level));
  assert.deepEqual(forceBookChoiceQuestions.map(question => question.answer), ['جميع عناصر القوة', 'ثقل الجسم', '40 N', 'كتلة الجسم', 'ربيعة']);
  assert.deepEqual(Object.fromEntries(forceNumericQuestions.map(question => [question.id, question.expected])), {
    'fm-num-weight': 100, 'fm-num-mass': 300, 'fm-num-equator': 97.8, 'fm-num-pole': 98.3, 'fm-num-ball': 1,
  });
  assert.deepEqual(forceTrueFalseQuestions.map(question => question.answer), ['خطأ', 'خطأ', 'صح', 'صح']);
  for (const question of [...forceUnderstandingQuestions, ...forceTrueFalseQuestions, ...forceBookChoiceQuestions]) {
    assert.ok(question.options.includes(question.answer));
    assert.ok(question.id.startsWith('fm-'));
    assert.ok(question.explanation.length > 30);
  }
  for (const question of forceNumericQuestions) assert.ok(question.id.startsWith('fm-'));
});

test('KaTeX renders vertical fractions, subscripts and superscripts in LTR', () => {
  const html = formula('v_{avg}=\\frac{d}{t}\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}', { display: true });
  assert.match(html, /dir="ltr"/);
  assert.match(html, /class="katex"/);
  assert.match(html, /formula-display/);
  assert.match(html, /class="mfrac"/);
  assert.match(html, /class="msupsub"/);
  assert.match(html, /class="mord mathrm"/);
});

test('KaTeX renders a real square root', () => {
  const html = formula('\\sqrt{x^2+y^2}', { display: true });
  assert.match(html, /class="mord sqrt"/);
  assert.match(html, /sqrt/);
});

test('multi-step aligned calculations and units render without fallback', () => {
  const html = formula('\\begin{aligned}v_{avg}&=\\frac{36\\times1000}{3600}\\\\&=10\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}\\end{aligned}', { display: true });
  assert.match(html, /class="katex"/);
  assert.doesNotMatch(html, /math-fallback/);
});

test('invalid LaTeX is replaced safely and raw commands are not exposed', () => {
  const html = formula('\\notacommand{');
  assert.doesNotThrow(() => html);
  assert.match(html, /تعذّر عرض المعادلة/);
  assert.doesNotMatch(html, /notacommand/);
});

test('quantity writes the number and unit through KaTeX in LTR', () => {
  const html = quantity('12', mathUnits.metre);
  assert.match(html, /dir="ltr"/);
  assert.match(html, /class="katex"/);
  assert.doesNotMatch(html, /math-fallback/);
});

test('numeric answers accept decimal commas and Arabic-Indic digits', () => {
  assert.equal(parseNumeric('3,75'), 3.75);
  assert.equal(parseNumeric('٣٦'), 36);
  assert.ok(Number.isNaN(parseNumeric('')));
});

test('no prototype marketing text or split subject sections returns', () => {
  assert.doesNotMatch(sourceText, /نور|بعودتك|تواصل عبر واتساب|بشغف|ابدأ الاستكشاف/);
  assert.doesNotMatch(sourceText, /name:\s*'الفيزياء'|name:\s*'الكيمياء'/);
});

test('standalone areas and tab structures keep teacher-only material out of student lesson content', () => {
  const main = readFileSync('src/main.js', 'utf8');
  assert.match(main, /function assessmentsView/);
  assert.match(main, /role="tablist" aria-label="اختبارات الدروس"/);
  assert.match(main, /role="tabpanel"/);
  assert.match(main, /teacherView/);
  assert.match(readFileSync('src/teacher-zone.js', 'utf8'), /حلول أسئلة نهاية الدروس/);
  assert.match(readFileSync('src/teacher-zone.js', 'utf8'), /GitHub Pages لا يوفر مصادقة خادمية/);
  assert.doesNotMatch(main.match(/function lessonView[\s\S]*?function assessmentsView/)?.[0] || '', /teacher-panel|حلول أسئلة/);
  const html = bookContent();
  assert.match(html, /role="tablist"/);
  assert.equal((html.match(/role="tab"/g) || []).length, 7);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 7);
  assert.match(main, /data-book-tab/);
  assert.match(main, /ArrowLeft/);
});
