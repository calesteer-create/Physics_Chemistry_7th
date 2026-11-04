import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { WHATSAPP_URL, ENGINEER_NAME, ENGINEER_PHONE } from '../src/demo-data.js';
import { units, lessons, stages, notebookSections, SUBJECT_LABELS } from '../src/course.js';
import { formula, quantity, units as mathUnits } from '../src/math.js';
import { bookContent } from '../src/book-content.js';
import { explainContent, examplesContent, notebookContent, testPendingContent } from '../src/lesson-content.js';
import { parseNumeric, practiceContent } from '../src/assessments.js';

const sourceText = readdirSync('src').filter(file => /\.(js|css)$/.test(file)).map(file => readFileSync(`src/${file}`, 'utf8')).join('\n');

test('owner identity and WhatsApp destination remain unchanged', () => {
  assert.equal(WHATSAPP_URL, 'https://wa.me/963930210222');
  assert.equal(ENGINEER_NAME, 'المهندس سومر شاهين');
  assert.equal(ENGINEER_PHONE, '0930215022');
});

test('one approved unit and one approved lesson, with subject only as a tag', () => {
  assert.equal(units.length, 1);
  assert.equal(units[0].fullTitle, 'الوحدة الأولى: الحركة والتحريك');
  assert.equal(lessons.length, 1);
  assert.deepEqual(lessons.map(lesson => lesson.title), ['الحركة والسكون']);
  assert.equal(lessons[0].number, 1);
  assert.deepEqual(Object.keys(SUBJECT_LABELS).sort(), ['chemistry', 'physics']);
  assert.doesNotMatch(sourceText, /رحلة في عالم الاكتشاف|درس تجريبي/);
});

test('lesson has the ten required stages in order, notebook last', () => {
  assert.deepEqual(stages.map(stage => stage.id), ['discover', 'book', 'explain', 'examples', 'activity', 'questions', 'practice', 'test', 'summary', 'notebook']);
  assert.equal(stages.at(-1).kind, 'notebook');
  assert.equal(new Set(stages.map(stage => stage.id)).size, 10);
});

test('final lesson test is pending content approval, not secretly authored', () => {
  assert.match(testPendingContent(), /لم يُؤلَّف بعد/);
  assert.doesNotMatch(testPendingContent(), /question-card|answer-option/);
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
