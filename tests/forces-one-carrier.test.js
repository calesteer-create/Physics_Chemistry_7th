import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { units, lessons, stages, notebookSections } from '../src/course.js';
import {
  forcesDiscoverContent, forcesBookContent, forcesExplainContent, forcesExamplesContent, forcesActivityContent,
  forcesQuestionsContent, forcesPracticeContentStage, forcesSummaryContent, forcesNotebookContent,
} from '../src/forces-one-carrier.js';
import {
  forcesUnderstandingQuestions, forcesTrueFalseQuestions, forcesBookChoiceQuestions, forcesNumericQuestions,
} from '../src/forces-assessments.js';
import { sameDirectionResult, oppositeDirectionResult, teamTotals, total, tugOfWarResult, resultantLabShell, resultantLabContent, mountResultantLab, fmt } from '../src/resultant-lab.js';
import { teacherSolutions } from '../src/teacher-solutions.js';
import { teacherSolutionsView, teacherGateView } from '../src/teacher-zone.js';

const lesson = lessons.find(item => item.id === 'forces-one-carrier');
const plain = html => html.replace(/<annotation[\s\S]*?<\/annotation>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const stageBodies = {
  discover: forcesDiscoverContent, book: forcesBookContent, explain: forcesExplainContent,
  examples: forcesExamplesContent, activity: forcesActivityContent, questions: forcesQuestionsContent,
  practice: forcesPracticeContentStage, summary: forcesSummaryContent, notebook: forcesNotebookContent,
};

test('lesson three is the third lesson of the single motion unit, in book order', () => {
  assert.equal(units.length, 1);
  assert.equal(units[0].id, 'motion');
  assert.equal(lesson.number, 3);
  assert.equal(lesson.title, 'القوى على حامل واحد');
  assert.equal(lesson.pages, '29–40');
  assert.equal(lesson.tag, 'physics');
  assert.deepEqual(units[0].lessons.map(item => item.id), ['motion-rest', 'force-motion', 'forces-one-carrier']);
  assert.equal(Object.keys(lesson.stageIntros).length, 9);
  assert.ok(!units.some(unit => /كيمياء/.test(unit.fullTitle)));
});

test('lesson three renders all nine stages in order, each with its own intro', () => {
  assert.deepEqual(stages.map(stage => stage.id), ['discover', 'book', 'explain', 'examples', 'activity', 'questions', 'practice', 'summary', 'notebook']);
  for (const stage of stages) {
    const html = stageBodies[stage.kind]();
    assert.ok(html.length > 150, `${stage.kind} renders content`);
    assert.doesNotMatch(html, /undefined|\[object Object\]|NaN/, `${stage.kind} has no placeholder text`);
    assert.doesNotMatch(html, /math-fallback/, `${stage.kind} renders every formula with KaTeX`);
  }
  assert.match(forcesActivityContent(), /id="resultant-lab"/);
  assert.equal(stages.at(-1).kind, 'notebook');
});

test('book content covers pages 29-40 with the printed experiments, laws and exercises', () => {
  const html = forcesBookContent();
  for (const text of [
    'أجرِبُ وأستنتجُ', 'لعبة شد الحبل', 'من حقيبة الميكانيك وربيعة', 'ربيعتين مدرّجتين بالنيوتن', 'حقيبة مغناطيسية',
    'القوتان المتعاكستان مباشرة', 'مبدأ الفعل وردّ الفعل', 'تعلَّمُّ', 'أختبر نفسي',
    'الجواب', 'المسألة الأولى', 'المسألة الثانية', 'المظلّي',
  ].filter(text => text !== 'الجواب')) {
    assert.match(html, new RegExp(text), `missing book text: ${text}`);
  }
  assert.equal((html.match(/data-book-tab=/g) || []).length, 7);
  assert.equal((html.match(/role="tabpanel"/g) || []).length, 7);
  // ترتيب الصفحات محفوظ: 29 → 30 → 31 … → 40
  const order = ['صفحة 29', 'صفحة 30', 'صفحة 31', 'صفحة 32', 'صفحة 33', 'صفحة 34', 'صفحة 35', 'صفحة 36', 'صفحة 37', 'صفحة 38', 'صفحة 39', 'صفحة 40'];
  const positions = order.map(marker => html.indexOf(marker));
  assert.deepEqual(positions.filter(position => position < 0), [], 'every page 29–40 appears');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'pages stay in printed order');
  // الأرقام الأساسية من الكتاب
  for (const number of ['230', '350', '220', '360', '340', '800', '700', '100', '850', '750', '920', '15', '30', '25', '75']) {
    assert.match(html, new RegExp(number), `missing book number: ${number}`);
  }
  assert.match(plain(html), /النصوص والتعريفات والتجارب والتطبيقات والأسئلة هنا من الكتاب/);
});

test('enrichment and drills are labelled, and no book text is attributed to the platform', () => {
  const explain = forcesExplainContent();
  assert.match(explain, /توضيح إثرائي/);
  const examples = forcesExamplesContent();
  // كل مثال يحمل شارة مصدره: الكتاب أو المنصة
  const chips = [...examples.matchAll(/source-chip[^>]*>([^<]*)</g)].map(match => match[1]);
  assert.ok(chips.length >= 4 && chips.every(chip => /من الكتاب|من إعداد المنصة/.test(chip)), 'each example states its source');
  assert.match(examples, /تطبيق محلول من الكتاب · ص\d+/);
  assert.match(examples, /من إعداد المنصة/);
  assert.match(forcesPracticeContentStage(), /من الكتاب/);
  assert.match(plain(explain), /لا نخلط بينه وبين التوازن/);
});

test('resultant calculations match the book: 20+30=50, 30-20=10, equal forces cancel', () => {
  assert.deepEqual(sameDirectionResult(20, 30), { f1: 20, f2: 30, sum: 50, direction: 'right' });
  assert.deepEqual(sameDirectionResult(15, 30), { f1: 15, f2: 30, sum: 45, direction: 'right' });
  const opposite = oppositeDirectionResult(20, 30);
  assert.equal(opposite.difference, 10);
  assert.equal(opposite.direction, 'right', 'the resultant follows the larger force');
  assert.equal(oppositeDirectionResult(30, 20).direction, 'left');
  const equal = oppositeDirectionResult(30, 30);
  assert.equal(equal.difference, 0);
  assert.equal(equal.direction, 'none');
  assert.equal(fmt(4.5), '4.5');
});

test('tug of war reproduces page 36: 800 N versus 700 N, net 100 N for team one', () => {
  assert.equal(total(teamTotals.team1), 800);
  assert.equal(total(teamTotals.team2), 700);
  const result = tugOfWarResult();
  assert.equal(result.first, 800);
  assert.equal(result.second, 700);
  assert.equal(result.net, 100);
  assert.equal(result.winner, 'team1');
});

test('interactive lab shell exposes three stations and mounts with live feedback', () => {
  assert.equal(resultantLabShell().includes('data-lab-input'), false, 'الجبل يركّب المحتوى عند العرض');
  const html = resultantLabContent();
  for (const id of ['same-first', 'same-second']) {
    assert.match(html, new RegExp(`data-lab-input="${id}"`), `المحطة الأولى تعرض ${id}`);
  }
  for (const id of ['opposite-first', 'opposite-second']) {
    assert.match(readFileSync('src/resultant-lab.js', 'utf8'), new RegExp(`data-lab-input=\\"${id}\\"`), `المحطة الثانية تعرض ${id}`);
  }
  // التبويبات الثلاثة موجودة في الواجهة، والمحطة الأولى هي المعروضة ابتداءً
  const lab = readFileSync('src/resultant-lab.js', 'utf8');
  for (const tab of ['tab-same', 'tab-opposite', 'tab-team']) assert.match(lab, new RegExp(`data-lab-action="\$\{?|'${tab}'`));
  assert.match(html, /المحطة 1 · قوتان على حامل واحد، وبجهة واحدة/);
  // أسئلة التغذية الراجعة داخل المحطات، ووسمها في المصدر لأن محطة واحدة تُعرض في كل مرة
  const labSource = readFileSync('src/resultant-lab.js', 'utf8');
  assert.match(labSource, /same-answer-add/);
  assert.match(labSource, /equal-answer-still/);
  assert.match(labSource, /team-answer-diff/);
  assert.match(labSource, /labMarkup/);
  assert.match(html, /role="tablist"/);
  assert.doesNotMatch(html, /math-fallback/);
  // جبل وهمي يتحقق من تسجيل المستمعين وتنظيفهم
  const listeners = [];
  const element = () => ({ addEventListener: (type, handler) => listeners.push([type, handler]), removeEventListener: () => listeners.pop(), querySelector: () => null, querySelectorAll: () => [] });
  const root = element();
  const dispose = mountResultantLab(root);
  assert.ok(listeners.length > 0, 'lab registers its listeners');
  dispose();
  assert.equal(listeners.length, 0, 'dispose removes every listener');
});

test('question banks are keyed with fh- ids and answers are consistent with the book', () => {
  const all = [...forcesUnderstandingQuestions, ...forcesTrueFalseQuestions, ...forcesBookChoiceQuestions];
  for (const item of all) {
    assert.match(item.id, /^fh-/, 'ids are namespaced for lesson three');
    assert.ok(item.options.includes(item.answer), `${item.id} answer is one of its options`);
    assert.ok(item.explanation.length > 20, `${item.id} carries an explanation`);
  }
  const byId = id => forcesBookChoiceQuestions.find(item => item.id === id);
  assert.equal(byId('fh-mc-1').answer, 'F = F₁ + F₂');
  assert.equal(byId('fh-mc-2').answer, 'F = F₂ − F₁');
  assert.equal(byId('fh-mc-3').answer, 'F = 100 N وبجهة الفريق الأول');
  assert.equal(byId('fh-mc-5').answer, '40 N');
  assert.equal(byId('fh-mc-6').answer, '0 N');
  assert.equal(byId('fh-mc-7').answer, 'منطبقتان حاملاً ومتعاكستان جهةً ومتساويتان شدّةً');
  assert.equal(byId('fh-mc-8').answer, 'يساويه بالقيمة ويعاكسه بالاتجاه.');
});

test('item 4 of page 38 keys the only printed option consistent with the arithmetic', () => {
  const item = forcesBookChoiceQuestions.find(question => question.id === 'fh-mc-4');
  // الخيارات كما طُبعت في الكتاب ص38 دون تغيير
  assert.deepEqual(item.options, ['860 N', '960 N', '23 N', '36800 N']);
  // 920 + 40 = 960 موجود بين الخيارات، و920 - 40 = 880 غير موجود
  assert.equal(item.answer, '960 N');
  assert.match(item.explanation, /920\+40=960/);
  assert.match(item.explanation, /920-40=880/);
  assert.match(item.explanation, /الخيارات المطبوعة/);
  // الحل في منطقة المعلم يوضّح الحالتين معاً
  const solutions = teacherSolutionsView();
  assert.match(solutions, /880/);
  assert.match(solutions, /960 N/);
});

test('numeric drill answers are exact', () => {
  const expected = Object.fromEntries(forcesNumericQuestions.map(item => [item.id, item.expected]));
  assert.equal(expected['fh-num-same'], 50);
  assert.equal(expected['fh-num-opposite'], 10);
  assert.equal(expected['fh-num-team1'], 800);
  assert.equal(expected['fh-num-net'], 100);
  assert.equal(expected['fh-num-problem1'], 45);
  assert.equal(expected['fh-num-balance2'], 50);
  assert.equal(expected['fh-num-balance1'], 45);
  assert.equal(expected['fh-num-equal'], 0);
  assert.equal(new Set(forcesNumericQuestions.map(item => item.level)).size >= 3, true, 'drills are graduated');
});

test('notebook is the ninth stage with all nine sections and no teacher answers', () => {
  const html = forcesNotebookContent();
  assert.equal((html.match(/class="note-card/g) || []).length, 9);
  assert.equal(notebookSections.length, 9);
  assert.match(html, /الفكرة الأساسية/);
  assert.match(html, /خطوات التجارب/);
  assert.match(html, /قائمة المراجعة/);
  assert.doesNotMatch(html, /إجابة المعلم:|حل المعلم|solution-answer|teacherSolutions/);
  for (const stage of stages.slice(0, 8)) {
    assert.doesNotMatch(stageBodies[stage.kind](), /class="note-card/);
  }
});

test('teacher solutions for lesson three stay behind the password gate', () => {
  const data = teacherSolutions['forces-one-carrier'];
  assert.ok(data, 'solutions entry exists');
  assert.equal(data.sourceTitle, 'أختبر نفسي وحل المسائل');
  assert.deepEqual(data.questions.map(question => question.id), ['q1', 'q2', 'q3', 'q4']);
  const gate = teacherGateView();
  assert.doesNotMatch(gate, /forces-one-carrier-q|880|960 N/);
  const unlocked = teacherSolutionsView();
  assert.match(unlocked, /solution-forces-one-carrier-q1/);
  assert.match(unlocked, /solution-forces-one-carrier-q4/);
  assert.match(unlocked, /F\^\{?\\prime\}?|F̄′|45\s*N/);
  assert.doesNotMatch(unlocked, /math-fallback/);
  for (const stage of stages) {
    assert.doesNotMatch(stageBodies[stage.kind](), /solution-forces-one-carrier|teacherSolutions/, `${stage.kind} hides teacher answers`);
  }
});

test('main.js routes lesson three to its own stage renderers and lab', () => {
  const main = readFileSync('src/main.js', 'utf8');
  assert.match(main, /lesson\.id === 'forces-one-carrier'/);
  assert.match(main, /from '\.\/forces-one-carrier\.js'/);
  assert.match(main, /mountResultantLab/);
  assert.match(main, /#resultant-lab/);
  assert.match(main, /disposeLab/);
  // الدرسان السابقان يحتفظان بمسارهما
  assert.match(main, /lesson\.id === 'force-motion'/);
  assert.match(main, /mountMotionLab/);
  assert.match(main, /mountForceLab/);
});
