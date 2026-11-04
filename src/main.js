import 'katex/dist/katex.min.css';
import './style.css';
import { WHATSAPP_URL, ENGINEER_NAME, ENGINEER_PHONE } from './demo-data.js';
import { SUBJECT_LABELS, lessons, stages, notebookSections } from './course.js';
import { icons, heroArt } from './icons.js';
import { formula, quantity } from './math.js';

const app = document.querySelector('#app');
const CHOICES = ['◯', '△', '✳'];
let selected = { stageId: '', index: -1 };

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Hash routes: #/, #/student, #/path, #/lesson/:id/:stage. Reloading keeps the place.
function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts.length === 1 && parts[0] === 'student') return { name: 'student' };
  if (parts.length === 1 && parts[0] === 'path') return { name: 'path' };
  if (parts[0] === 'lesson' && parts[1] && parts.length <= 3) {
    const lesson = lessons.find(item => item.id === parts[1]);
    const index = stages.findIndex(stage => stage.id === (parts[2] || stages[0].id));
    if (lesson && index >= 0) return { name: 'lesson', lesson, index };
  }
  return { name: 'missing' };
}

const stageHref = (lesson, stage) => `#/lesson/${lesson.id}/${stage.id}`;

function header(route) {
  const current = route.name === 'home' ? 'home' : route.name === 'student' ? 'student' : 'path';
  const link = (key, href, label) => `<a class="nav-link" href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="site-header"><div class="wrap header-inner">
    <a class="brand" href="#/"><span class="brand-mark">${icons.atom}</span><span><strong>الفيزياء الممتعة</strong><small>الفيزياء والكيمياء · الصف السابع</small></span></a>
    <nav class="main-nav" aria-label="التنقل الرئيسي">${link('home', '#/', 'الرئيسية')}${link('student', '#/student', 'مساحة الطالب')}${link('path', '#/path', 'المسار الدراسي')}</nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-inner">
    <span class="brand-text">الفيزياء الممتعة</span>
    <p class="engineer-chip">${esc(ENGINEER_NAME)} <span aria-hidden="true">·</span> <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer"><bdi dir="ltr">${esc(ENGINEER_PHONE)}</bdi></a></p>
  </div></footer>`;
}

function homeView() {
  return `<section class="wrap hero">
    <div class="hero-copy">
      <p class="eyebrow">الفيزياء والكيمياء · الصف السابع</p>
      <h1 data-focus="page" tabindex="-1">أهلاً بك في عالم الفيزياء الممتعة!</h1>
      <p class="lead">ستجد كل الدروس في مسار واحد متسلسل، يتقدم خطوة بخطوة.</p>
      <div class="actions">
        <a class="btn btn-primary" href="#/path">ابدأ من المسار الدراسي ${icons.arrowLeft}</a>
        <a class="btn btn-secondary" href="#/lesson/demo">جرّب الدرس التجريبي</a>
      </div>
    </div>
    <div class="hero-art" aria-hidden="true">${heroArt}</div>
  </section>
  <section class="wrap">
    <a class="path-teaser" href="#/path">
      <span class="tile tile-blue">${icons.path}</span>
      <span class="teaser-text"><strong>المسار الدراسي</strong><span>درس تجريبي واحد حالياً. ستُضاف الدروس هنا بترتيبها.</span></span>
      <span class="teaser-go">${icons.arrowLeft}</span>
    </a>
  </section>`;
}

function studentView() {
  return `<section class="wrap page-section">
    <header class="page-head">
      <p class="kicker">مساحة الطالب</p>
      <h1 data-focus="page" tabindex="-1">أهلاً بك في عالم الفيزياء الممتعة!</h1>
      <p class="lead">من هنا تنتقل إلى المسار الدراسي أو تفتح الدرس التجريبي.</p>
    </header>
    <div class="card-grid">
      <a class="card card-link" href="#/path"><span class="tile tile-blue">${icons.path}</span><h2>المسار الدراسي</h2><p>كل الدروس بترتيبها المتسلسل.</p></a>
      <a class="card card-link" href="#/lesson/demo"><span class="tile tile-green">${icons.flask}</span><h2>الدرس التجريبي</h2><p>جولة في محطات الدرس العشر.</p></a>
      <a class="card card-link" href="#/lesson/demo/notebook"><span class="tile tile-violet">${icons.notebook}</span><h2>دفتر الطالب</h2><p>أقسام الدفتر المنظمة للدرس.</p></a>
    </div>
    <div class="notice" role="note"><span class="notice-icon">${icons.info}</span><p><strong>نسخة تجريبية.</strong> لا يتم حفظ تقدمك حتى الآن، ولا توجد تسجيلات دخول في هذه النسخة.</p></div>
  </section>`;
}

function lessonCard(lesson) {
  return `<li><a class="lesson-card" href="#/lesson/${lesson.id}">
    <span class="lesson-index">${lesson.number ? esc(lesson.number) : 'تجريبي'}</span>
    <span class="lesson-body"><span class="tag tag-${lesson.tag}">${esc(SUBJECT_LABELS[lesson.tag])}</span><strong>${esc(lesson.title)}</strong></span>
    <span class="lesson-go">افتح ${icons.arrowLeft}</span>
  </a></li>`;
}

function pathView() {
  return `<section class="wrap page-section">
    <header class="page-head">
      <p class="kicker">المسار الدراسي</p>
      <h1 data-focus="page" tabindex="-1">المسار الدراسي</h1>
      <p class="lead">كل الدروس في مسار واحد، بترتيبها المتسلسل.</p>
    </header>
    <ol class="path-list">${lessons.map(lessonCard).join('')}</ol>
    <div class="state-panel" data-state="empty"><span class="state-icon">${icons.book}</span>
      <div><strong>الدروس التالية قيد الإعداد</strong><p>ستُضاف الدروس هنا بالترتيب نفسه الذي في الكتاب، بعد استلام صور المنهاج.</p></div>
    </div>
  </section>`;
}

function badgeClass(kind, id) {
  if (id === 'book') return 'badge-book';
  if (kind === 'activity') return 'badge-interactive';
  if (kind === 'notebook') return 'badge-notebook';
  if (id === 'explain' || id === 'examples') return 'badge-extra';
  return 'badge-neutral';
}

function activityBody(stage) {
  const chosen = selected.stageId === stage.id && selected.index >= 0;
  return `<div class="activity">
    <p class="activity-prompt">اختر رمزاً لتجربة الواجهة فقط:</p>
    <div class="choice-row" role="group" aria-label="خيارات تجريبية">
      ${CHOICES.map((symbol, i) => `<button type="button" class="choice" data-choice="${i}" aria-pressed="${chosen && selected.index === i}">${symbol}</button>`).join('')}
    </div>
    <p class="feedback" aria-live="polite">${chosen ? 'تم اختيارك في النموذج التجريبي.' : ''}</p>
  </div>`;
}

function notebookBody() {
  const cards = notebookSections.map(section => {
    let content = '';
    if (section.id === 'checklist') {
      content = `<label><input type="checkbox"> قرأت الفكرة الأساسية</label><label><input type="checkbox"> دوّنت سؤالاً للمرة القادمة</label>`;
    } else if (section.id === 'laws') {
      content = `<p>سيُملأ عند توفر محتوى الدرس.</p>
        <div class="demo-math"><p class="demo-label">مثال تجريبي للتنسيق فقط</p>${formula('x = \\frac{a}{b}', { display: true })}<p class="demo-line">${quantity('12', 'cm')}</p></div>`;
    } else {
      content = '<p>سيُملأ عند توفر محتوى الدرس.</p>';
    }
    return `<article class="note-card${section.id === 'checklist' ? ' note-wide' : ''}"><h3>${esc(section.title)}</h3>${content}</article>`;
  }).join('');
  return `<p class="stage-text">دفترك يتضمن هذه الأقسام. لا يتضمن إجابات المعلم.</p><div class="note-grid">${cards}</div>`;
}

function stageBody(stage) {
  if (stage.kind === 'notebook') return notebookBody();
  if (stage.kind === 'activity') {
    return `${activityBody(stage)}<div class="state-panel" data-state="empty"><span class="state-icon">${icons.info}</span><div><strong>المحتوى بانتظار الاعتماد</strong><p>${esc(stage.placeholder)}</p></div></div>`;
  }
  return `<div class="state-panel" data-state="empty"><span class="state-icon">${icons.info}</span><div><strong>المحتوى بانتظار الاعتماد</strong><p>${esc(stage.placeholder)}</p></div></div>`;
}

function lessonView({ lesson, index }) {
  const stage = stages[index];
  const n = index + 1;
  const total = stages.length;
  const prev = stages[index - 1];
  const next = stages[index + 1];
  const stageLinks = stages.map((item, i) => `<li><a href="${stageHref(lesson, item)}"${i === index ? ' aria-current="step"' : ''}><span class="step-num">${i + 1}</span><span>${esc(item.label)}</span></a></li>`).join('');
  return `<section class="wrap page-section">
    <nav class="crumbs" aria-label="مسار التنقل"><a href="#/">الرئيسية</a> / <a href="#/path">المسار الدراسي</a> / <span aria-current="page">${esc(lesson.title)}</span></nav>
    <header class="page-head">
      ${lesson.demo ? '<p class="kicker"><span class="tag tag-demo">درس تجريبي</span></p>' : ''}
      <h1 data-focus="page" tabindex="-1">${esc(lesson.title)}</h1>
      <p class="lead">نموذج لتجربة الدرس، وليس درساً من المنهاج.</p>
    </header>
    <div class="lesson-layout">
      <nav class="stage-nav" aria-label="محطات الدرس">
        <div class="stage-progress"><span>المحطة ${n} من ${total}</span><progress max="${total}" value="${n}" aria-label="تقدمك في محطات الدرس"></progress></div>
        <ol>${stageLinks}</ol>
      </nav>
      <article class="stage" aria-labelledby="stage-title">
        <div class="stage-top"><span class="badge ${badgeClass(stage.kind, stage.id)}">${esc(stage.badge || stage.title)}</span><span>المحطة ${n} من ${total}</span></div>
        <h2 id="stage-title" data-focus="stage" tabindex="-1">${esc(stage.title)}</h2>
        <p class="stage-text">${esc(stage.intro)}</p>
        ${stageBody(stage)}
        <div class="stage-actions">
          ${prev ? `<a class="btn btn-secondary" href="${stageHref(lesson, prev)}">${icons.arrowRight} السابق: ${esc(prev.label)}</a>` : '<span></span>'}
          ${next ? `<a class="btn btn-primary" href="${stageHref(lesson, next)}">التالي: ${esc(next.label)} ${icons.arrowLeft}</a>` : `<a class="btn btn-primary" href="#/path">العودة إلى المسار الدراسي ${icons.arrowLeft}</a>`}
        </div>
      </article>
    </div>
  </section>`;
}

function missingView() {
  return `<section class="wrap page-section"><div class="state-panel" data-state="error"><span class="state-icon">${icons.info}</span>
    <div><h1 data-focus="page" tabindex="-1">الصفحة غير متوفرة</h1><p>الرابط غير صحيح، أو لم تعد هذه الصفحة موجودة.</p>
    <a class="btn btn-primary" href="#/">العودة إلى الرئيسية</a></div></div></section>`;
}

function view(route) {
  switch (route.name) {
    case 'home': return homeView();
    case 'student': return studentView();
    case 'path': return pathView();
    case 'lesson': return lessonView(route);
    default: return missingView();
  }
}

function titleFor(route) {
  if (route.name === 'home') return 'الرئيسية';
  if (route.name === 'student') return 'مساحة الطالب';
  if (route.name === 'path') return 'المسار الدراسي';
  if (route.name === 'lesson') return `${route.lesson.title} · ${stages[route.index].title}`;
  return 'الصفحة غير متوفرة';
}

function render(route = parseRoute()) {
  app.innerHTML = `<button type="button" class="skip-link" data-skip>تخطَّ إلى المحتوى</button>${header(route)}<main id="main" tabindex="-1">${view(route)}</main>${footer()}`;
  document.title = `${titleFor(route)} | الفيزياء الممتعة`;
  const nav = app.querySelector('.stage-nav ol');
  const current = nav?.querySelector('[aria-current="step"]');
  if (nav && current && nav.scrollWidth > nav.clientWidth) current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

// Moves focus after navigation (never on first load): to the stage heading when only the
// stage changed within the same lesson, otherwise to the page heading.
function afterNavigation(previous, current) {
  window.scrollTo(0, 0);
  const sameLesson = previous.name === 'lesson' && current.name === 'lesson' && previous.lesson.id === current.lesson.id;
  const kind = sameLesson ? 'stage' : 'page';
  app.querySelector(`[data-focus="${kind}"]`)?.focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  const skip = event.target.closest('[data-skip]');
  if (skip) {
    app.querySelector('#main')?.focus();
    return;
  }
  const choice = event.target.closest('[data-choice]');
  if (!choice) return;
  const route = parseRoute();
  if (route.name !== 'lesson') return;
  const index = Number(choice.dataset.choice);
  selected = { stageId: stages[route.index].id, index };
  render(route);
  app.querySelector(`[data-choice="${index}"]`)?.focus({ preventScroll: true });
});

let lastRoute = parseRoute();
window.addEventListener('hashchange', () => {
  const previous = lastRoute;
  selected = { stageId: '', index: -1 };
  lastRoute = parseRoute();
  render(lastRoute);
  afterNavigation(previous, lastRoute);
});

render();
