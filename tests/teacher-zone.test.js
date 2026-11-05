import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { TEACHER_PASSWORD, teacherZone, submitTeacherPassword, lockTeacherZone, teacherGateView, teacherSolutionsView, teacherView } from '../src/teacher-zone.js';
import { teacherSolutions } from '../src/teacher-solutions.js';
import { lessons, units } from '../src/course.js';

const reset = () => lockTeacherZone();
// يحذف وسوم KaTeX الخفية (annotation) حتى لا يُحسب الكود الخام نصاً ظاهراً.
const plain = html => html.replace(/<annotation[\s\S]*?<\/annotation>/g, ' ').replace(/<span dir="ltr">|<\/span>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

test('teacher password is exactly somer173 and checks are case-sensitive', () => {
  assert.equal(TEACHER_PASSWORD, 'somer173');
  reset();
  assert.equal(submitTeacherPassword('SOMER173'), false);
  assert.equal(teacherZone.error, 'wrong');
  assert.equal(submitTeacherPassword('somer174'), false);
  assert.equal(teacherZone.unlocked, false);
  assert.equal(submitTeacherPassword('somer173'), true);
  assert.equal(teacherZone.unlocked, true);
  assert.equal(teacherZone.error, '');
  reset();
});

test('empty password is rejected with its own error and never unlocks', () => {
  reset();
  assert.equal(submitTeacherPassword(''), false);
  assert.equal(teacherZone.error, 'empty');
  assert.equal(submitTeacherPassword('   '), false);
  assert.equal(teacherZone.unlocked, false);
  reset();
});

test('surrounding spaces from mobile keyboards are tolerated, inner spaces are not', () => {
  reset();
  assert.equal(submitTeacherPassword('  somer173 '), true);
  reset();
  assert.equal(submitTeacherPassword('somer 173'), false);
  reset();
});

test('lockTeacherZone returns to the gate and clears the error', () => {
  submitTeacherPassword('wrong');
  lockTeacherZone();
  assert.equal(teacherZone.unlocked, false);
  assert.equal(teacherZone.error, '');
  submitTeacherPassword(TEACHER_PASSWORD);
  lockTeacherZone();
  assert.equal(teacherView(), teacherGateView());
});

test('gate shows title, password field and entry button, and no solution content', () => {
  reset();
  const html = teacherView();
  assert.match(html, /<h1[^>]*>منطقة المعلم<\/h1>/);
  assert.match(html, /<input[^>]+type="password"/);
  assert.match(html, /<button type="submit"[^>]*>دخول<\/button>/);
  assert.match(html, /data-teacher-login/);
  assert.doesNotMatch(html, /data-teacher-logout|solution-question|solution-body|السؤال الأول|المسألة الأولى|صل بخط|الربط الصحيح/);
  assert.doesNotMatch(html, /role="tablist"/);
});

test('wrong password shows a clear error message on the gate', () => {
  submitTeacherPassword('nope');
  const html = teacherGateView();
  assert.match(html, /كلمة المرور غير صحيحة/);
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-invalid="true"/);
  assert.doesNotMatch(html, /السؤال الأول|solution-question/);
  reset();
});

test('after correct password the solutions view is shown with a logout button', () => {
  submitTeacherPassword(TEACHER_PASSWORD);
  const html = teacherView();
  assert.match(html, /data-teacher-logout/);
  assert.match(html, /تسجيل الخروج/);
  assert.doesNotMatch(html, /data-teacher-login/);
  assert.match(html, /الوحدة الأولى: الحركة والتحريك/);
  assert.match(html, /role="tab"/);
  reset();
});

test('solutions are organised by unit, then lesson tab, then question', () => {
  const html = teacherSolutionsView();
  for (const unit of units) {
    assert.ok(html.includes(unit.fullTitle), `unit ${unit.id} heading`);
    for (const lesson of unit.lessons) {
      assert.ok(html.includes(`id="teacher-tab-${unit.id}-${lesson.id}"`), `tab for ${lesson.id}`);
      assert.ok(html.includes(`id="teacher-panel-${unit.id}-${lesson.id}"`), `panel for ${lesson.id}`);
      assert.ok(html.includes(`aria-controls="teacher-panel-${unit.id}-${lesson.id}"`), `tab controls panel for ${lesson.id}`);
    }
  }
  assert.ok(html.indexOf('الوحدة الأولى: الحركة والتحريك') < html.indexOf('السؤال الأول'));
});

test('every approved lesson has a solutions entry, so no lesson falls back to a notice', () => {
  for (const lesson of lessons) assert.ok(teacherSolutions[lesson.id], `${lesson.id} has solutions`);
  assert.equal(Object.keys(teacherSolutions).length, lessons.length);
  assert.doesNotMatch(teacherSolutionsView(), /لم تُضف حلول هذا الدرس بعد/);
});

test('motion-rest solutions cover all four end-of-lesson questions in book order', () => {
  const lesson = teacherSolutions['motion-rest'];
  assert.deepEqual(lesson.questions.map(question => question.title), ['السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع']);
  assert.deepEqual(lesson.questions.map(question => question.id), ['q1', 'q2', 'q3', 'q4']);
  const html = teacherSolutionsView();
  assert.equal((html.match(/class="solution-question"/g) || []).length, 4);
  for (const title of ['السؤال الأول', 'السؤال الثاني', 'السؤال الثالث', 'السؤال الرابع']) assert.match(html, new RegExp(title));
  assert.ok(html.indexOf('السؤال الأول') < html.indexOf('السؤال الثاني'));
  assert.ok(html.indexOf('السؤال الثالث') < html.indexOf('السؤال الرابع'));
});

test('question one matches terms to statements and leaves the distractor unmatched', () => {
  const html = teacherSolutionsView();
  assert.match(html, /مجموعة النقاط التي يمر بها الجسم المتحرك في أثناء حركته\.<\/td><td><strong>المسار<\/strong>/);
  assert.match(html, /قسمة المسافة المقطوعة على الزمن[^<]*<\/td><td><strong>السرعة الوسطية<\/strong>/);
  assert.match(html, /طول المسار الذي يسلكه جسم معين[^<]*<\/td><td><strong>المسافة<\/strong>/);
  assert.match(html, /يبقى مصطلح «الزمن» دون ربط/);
});

test('question two marks all six statements as false and gives a correction for each', () => {
  const html = teacherSolutionsView();
  const judgements = html.match(/judgement-list[\s\S]*?<\/ol>/)[0];
  assert.equal((judgements.match(/<li>/g) || []).length, 6);
  assert.equal((judgements.match(/mark-false/g) || []).length, 6);
  assert.equal((judgements.match(/التصحيح:/g) || []).length, 6);
  assert.match(judgements, /يتعلقان بالجسم <strong>المرجع<\/strong>/);
  assert.match(judgements, /تكون حركة جسم <strong>منتظمة<\/strong>/);
  assert.match(judgements, /إذا <strong>لم يتغيّر<\/strong> موضعه/);
  assert.match(judgements, /<strong>خطٌّ مستقيم<\/strong>/);
  assert.match(judgements, /إذا كانت سرعته <strong>ثابتة<\/strong>/);
  assert.match(judgements, /في <strong>الحركات المنتظمة<\/strong>/);
});

test('question three answers are (c) uniform, (b) tree, (c) 30 m/s and (b) 25 s with working', () => {
  const html = teacherSolutionsView();
  assert.match(html, /\(c\) منتظمة\./);
  assert.match(html, /\(b\) الشجرة\./);
  assert.match(html, /\(c\) <span dir="ltr">30 m·s⁻¹<\/span>\./);
  assert.match(html, /\(b\) <span dir="ltr">25 s<\/span>\./);
  assert.match(html, /class="katex"/);
});

test('question four gives the correct numeric results for all three problems', () => {
  const text = plain(teacherSolutionsView());
  for (const expected of ['36 km·h⁻¹ = 10 m·s⁻¹', '200 m', '18 min', '3750 m، أي 3.75 km', '1800 m، أي 1.8 km', '2 m·s⁻¹، أي 7.2 km·h⁻¹']) {
    assert.ok(text.includes(expected), `missing answer: ${expected}`);
  }
  assert.equal((teacherSolutionsView().match(/class="solution-problem"/g) || []).length, 3);
});

test('the distance in the round-trip problem is path length and speed uses the book definition', () => {
  const text = plain(teacherSolutionsView());
  assert.match(text, /المسافة هي طول المسار كله ذهاباً وعودة/);
  assert.match(text, /توضيح إثرائي: نقطة النهاية هي نقطة الانطلاق نفسها/);
  assert.match(text, /تُحسب هنا بالمسافة الكلية/);
});

test('every formula in the solutions is rendered by KaTeX without fallback', () => {
  const html = teacherSolutionsView();
  assert.doesNotMatch(html, /math-fallback|تعذّر عرض المعادلة/);
  assert.match(html, /class="formula formula-display"/);
  assert.ok((html.match(/class="katex"/g) || []).length >= 12, "all twelve displayed formulas are KaTeX");
  assert.doesNotMatch(plain(html), /\\frac|\\mathrm|\\times/);
});

test('verification notes disclose the unresolved points instead of hiding them', () => {
  const html = teacherSolutionsView();
  assert.match(html, /ملاحظة للتحقق:/);
  assert.match(html, /مفتاح إجابات متداول على الإنترنت يعدّ العبارة الأولى صحيحة/);
  assert.match(html, /الصورتان .* غير متاحتين للتحقق/);
  assert.match(html, /عند تغيّر المرجع يمكن أن تتغيّر حالة حركة الجسم أو سكونه/);
});

test('no placeholder or apology text remains in the teacher zone source', () => {
  const source = readFileSync('src/teacher-zone.js', 'utf8') + readFileSync('src/teacher-solutions.js', 'utf8');
  for (const phrase of ['لا توجد حلول معروضة', 'لم تتوفر نسخة موثقة', 'لا توجد حلول منشورة', 'لم يُنشأ الاختبار', 'سيتم إضافة', 'قريباً']) {
    assert.doesNotMatch(source, new RegExp(phrase));
  }
});

test('solution anchors are unique so index buttons scroll to the right question', () => {
  const ids = [...teacherSolutionsView().matchAll(/id="(solution-[^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('solution-motion-rest-q4'));
});

test('teacher solution data stays out of the student lesson and notebook content', () => {
  const studentSource = readFileSync('src/lesson-content.js', 'utf8') + readFileSync('src/book-content.js', 'utf8');
  assert.doesNotMatch(studentSource, /teacher-solutions|teacherSolutions/);
});
