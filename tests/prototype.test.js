import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync } from 'node:fs';
import { WHATSAPP_URL, ENGINEER_NAME, ENGINEER_PHONE } from '../src/demo-data.js';
import { lessons, stages, notebookSections, SUBJECT_LABELS } from '../src/course.js';
import { formula, quantity } from '../src/math.js';

const sourceText = readdirSync('src')
  .filter(file => /\.(js|css)$/.test(file))
  .map(file => readFileSync(`src/${file}`, 'utf8'))
  .join('\n');

test('WhatsApp destination is the one provided by the owner', () => {
  assert.equal(WHATSAPP_URL, 'https://wa.me/963930210222');
});

test('engineer identity is shown as one exact text', () => {
  assert.equal(ENGINEER_NAME, 'المهندس سومر شاهين');
  assert.equal(ENGINEER_PHONE, '0930215022');
  assert.equal(`${ENGINEER_NAME} · ${ENGINEER_PHONE}`, 'المهندس سومر شاهين · 0930215022');
});

test('no personal name, no WhatsApp call-to-action, no invented marketing phrases', () => {
  assert.doesNotMatch(sourceText, /نور/);
  assert.doesNotMatch(sourceText, /بعودتك/);
  assert.doesNotMatch(sourceText, /تواصل عبر واتساب/);
  assert.doesNotMatch(sourceText, /بشغف/);
  assert.doesNotMatch(sourceText, /ابدأ الاستكشاف/);
});

test('one ordered path: subject is only a tag, never a section', () => {
  assert.ok(Array.isArray(lessons));
  assert.deepEqual(Object.keys(SUBJECT_LABELS).sort(), ['chemistry', 'demo', 'physics']);
  assert.doesNotMatch(sourceText, /name:\s*'الفيزياء'|name:\s*'الكيمياء'/);
});

test('no real lesson numbers or titles before the book is provided', () => {
  for (const lesson of lessons) assert.equal(lesson.number, null);
});

test('lesson has the ten required stages in order, notebook last', () => {
  assert.deepEqual(stages.map(stage => stage.id), [
    'discover', 'book', 'explain', 'examples', 'activity',
    'questions', 'practice', 'test', 'summary', 'notebook',
  ]);
  assert.equal(stages.at(-1).kind, 'notebook');
  assert.equal(new Set(stages.map(stage => stage.id)).size, 10);
});

test('notebook sections match the required list', () => {
  assert.deepEqual(notebookSections.map(section => section.title), [
    'الفكرة الأساسية', 'التعريفات', 'القوانين والوحدات', 'الرسوم والمخططات',
    'خطوات التجارب والإجراءات', 'المقارنات', 'الأخطاء الشائعة', 'النقاط المهمة للامتحان', 'قائمة المراجعة',
  ]);
});

test('formulas render with KaTeX inside an LTR isolated wrapper', () => {
  const html = formula('x = \\frac{a}{b}', { display: true });
  assert.match(html, /dir="ltr"/);
  assert.match(html, /class="katex"/);
  assert.match(html, /formula-display/);
});

test('invalid LaTeX does not throw', () => {
  assert.doesNotThrow(() => formula('\\notacommand{'));
});

test('quantity writes the number before its unit, in LTR', () => {
  assert.equal(quantity('12', 'cm'), '<span class="quantity" dir="ltr"><bdi>12</bdi> <bdi class="unit">cm</bdi></span>');
});
