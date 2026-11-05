import 'katex/dist/katex.min.css';
import './style.css';
import { WHATSAPP_URL, ENGINEER_NAME, ENGINEER_PHONE } from './demo-data.js';
import { SUBJECT_LABELS, units, lessons, stages, getUnit, getLesson } from './course.js';
import { icons, heroArt } from './icons.js';
import { bookContent } from './book-content.js';
import { discoverContent, explainContent, examplesContent, summaryContent, notebookContent } from './lesson-content.js';
import { understandingContent, practiceContent, chooseAnswer, checkNumeric, checkMatching } from './assessments.js';
import { motionLabShell, mountMotionLab } from './motion-lab.js';

const app = document.querySelector('#app');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
let disposeLab = null;

// المسارات: الرئيسية ← الوحدة ← الدرس ← المرحلة.
function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts.length === 0) return { name: 'home' };
  if (parts.length === 1 && parts[0] === 'student') return { name: 'student' };
  if (parts.length === 1 && parts[0] === 'assessments') return { name: 'assessments' };
  if (parts.length === 1 && parts[0] === 'teacher') return { name: 'teacher' };
  if ((parts.length === 1 && parts[0] === 'path') || (parts[0] === 'unit' && parts.length === 2)) {
    const id = parts[0] === 'path' ? 'motion' : parts[1];
    const unit = getUnit(id);
    if (unit) return { name: 'unit', unit };
  }
  if (parts[0] === 'lesson' && parts[1] && parts.length <= 3) {
    const lesson = getLesson(parts[1]);
    const index = stages.findIndex(stage => stage.id === (parts[2] || stages[0].id));
    if (lesson && index >= 0) return { name: 'lesson', lesson, index, unit: getUnit(lesson.unitId) };
  }
  return { name: 'missing' };
}

const stageHref = (lesson, stage) => `#/lesson/${lesson.id}/${stage.id}`;
const unitHref = unit => `#/unit/${unit.id}`;

function header(route) {
  const current = route.name === 'home' ? 'home' : route.name === 'student' ? 'student' : 'unit';
  const link = (key, href, label) => `<a class="nav-link" href="${href}"${current === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<header class="site-header"><div class="wrap header-inner">
    <a class="brand" href="#/"><span class="brand-mark">${icons.atom}</span><span><strong>الفيزياء الممتعة</strong><small>الفيزياء والكيمياء · الصف السابع</small><small class="header-engineer">${esc(ENGINEER_NAME)} · <bdi dir="ltr">${esc(ENGINEER_PHONE)}</bdi></small></span></a>
    <nav class="main-nav" aria-label="التنقل الرئيسي">${link('home', '#/', 'الرئيسية')}${link('student', '#/student', 'مساحة الطالب')}${link('unit', '#/unit/motion', 'الوحدة الأولى: الحركة والتحريك')}${link('assessments', '#/assessments', 'منطقة الاختبارات')}${link('teacher', '#/teacher', 'منطقة المعلم')}</nav>
  </div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="wrap footer-inner"><span class="brand-text">الفيزياء الممتعة</span><p class="engineer-chip">${esc(ENGINEER_NAME)} <span aria-hidden="true">·</span> <a href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer"><bdi dir="ltr">${esc(ENGINEER_PHONE)}</bdi></a></p></div></footer>`;
}

function homeView() {
  const unit = units[0];
  return `<section class="wrap hero"><div class="hero-copy"><p class="eyebrow">الفيزياء والكيمياء · الصف السابع</p><h1 data-focus="page" tabindex="-1">أهلاً بك في عالم الفيزياء الممتعة!</h1><p class="lead">نتعلم خطوة بخطوة وفق ترتيب الكتاب، في مسار واحد واضح.</p><div class="actions"><a class="btn btn-primary" href="${unitHref(unit)}">ادخل إلى الوحدة الأولى ${icons.arrowLeft}</a></div></div><div class="hero-art" aria-hidden="true">${heroArt}</div></section>
  <section class="wrap"><a class="path-teaser" href="${unitHref(unit)}"><span class="tile tile-blue">${icons.book}</span><span class="teaser-text"><strong>${esc(unit.fullTitle)}</strong><span>صفحة مستقلة للوحدة، تجد داخلها الدرس المتاح بترتيب الكتاب.</span></span><span class="teaser-go">${icons.arrowLeft}</span></a></section>`;
}

function studentView() {
  return `<section class="wrap page-section"><header class="page-head"><p class="kicker">مساحة الطالب</p><h1 data-focus="page" tabindex="-1">اختر وحدتك وابدأ التعلم</h1><p class="lead">ادخل إلى الوحدة أولاً، ثم اختر الدرس، وتنقّل بين مراحله التعليمية.</p></header>
  <div class="card-grid student-grid"><a class="card card-link" href="#/unit/motion"><span class="tile tile-blue">${icons.path}</span><h2>الوحدة الأولى: الحركة والتحريك</h2><p>افتح صفحة الوحدة والدرس المتاح فيها.</p></a></div>
  <div class="notice" role="note"><span class="notice-icon">${icons.info}</span><p>لا يتم حفظ تقدمك في هذه النسخة. يمكنك العودة إلى الوحدة في أي وقت من روابط التنقل.</p></div></section>`;
}

function lessonCard(lesson) {
  return `<li><a class="lesson-card" href="#/lesson/${lesson.id}"><span class="lesson-index">الدرس ${esc(lesson.number)}</span><span class="lesson-body"><span class="tag tag-${lesson.tag}">${esc(SUBJECT_LABELS[lesson.tag])}</span><strong>${esc(lesson.title)}</strong><small>صفحات الكتاب ${esc(lesson.pages)} · مراحل تعليمية</small></span><span class="lesson-go">افتح الدرس ${icons.arrowLeft}</span></a></li>`;
}

function unitView({ unit }) {
  return `<section class="wrap page-section"><nav class="crumbs" aria-label="مسار التنقل"><a href="#/">الرئيسية</a> / <span aria-current="page">${esc(unit.fullTitle)}</span></nav>
  <header class="page-head unit-head"><p class="kicker">الوحدة ${unit.number}</p><h1 data-focus="page" tabindex="-1">${esc(unit.fullTitle)}</h1><p class="lead">${esc(unit.description)}</p></header>
  <h2 class="section-title">دروس الوحدة</h2><ol class="path-list">${unit.lessons.map(lessonCard).join('')}</ol>
  <div class="notice" role="note"><span class="notice-icon">${icons.info}</span><p>يُعرض هنا الدرس المعتمد فقط. لا توجد بطاقات لدروس لم تُرسل صفحاتها.</p></div></section>`;
}

function badgeClass(kind) {
  if (kind === 'book') return 'badge-book';
  if (kind === 'activity') return 'badge-interactive';
  if (kind === 'notebook') return 'badge-notebook';
  if (kind === 'explain' || kind === 'examples') return 'badge-extra';
  return 'badge-neutral';
}

function stageBody(stage) {
  switch (stage.kind) {
    case 'discover': return discoverContent();
    case 'book': return bookContent();
    case 'explain': return explainContent();
    case 'examples': return examplesContent();
    case 'activity': return motionLabShell();
    case 'questions': return understandingContent();
    case 'practice': return practiceContent();
    case 'summary': return summaryContent();
    case 'notebook': return notebookContent();
    default: return '';
  }
}

function lessonView({ lesson, unit, index }) {
  const stage = stages[index];
  const n = index + 1;
  const total = stages.length;
  const prev = stages[index - 1];
  const next = stages[index + 1];
  const stageLinks = stages.map((item, i) => `<li><a href="${stageHref(lesson, item)}"${i === index ? ' aria-current="step"' : ''}><span class="step-num">${i + 1}</span><span>${esc(item.label)}</span></a></li>`).join('');
  return `<section class="wrap page-section"><nav class="crumbs" aria-label="مسار التنقل"><a href="#/">الرئيسية</a> / <a href="${unitHref(unit)}">${esc(unit.fullTitle)}</a> / <span aria-current="page">${esc(lesson.title)}</span></nav>
  <header class="page-head lesson-head"><p class="kicker"><span class="tag tag-physics">فيزياء</span> · الدرس ${lesson.number}</p><h1 data-focus="page" tabindex="-1">${esc(lesson.title)}</h1><p class="lead">الوحدة الأولى: الحركة والتحريك · صفحات الكتاب ${lesson.pages}</p><a class="back-to-unit" href="${unitHref(unit)}">${icons.arrowRight} العودة إلى صفحة الوحدة</a></header>
  <div class="lesson-layout"><nav class="stage-nav" aria-label="مراحل الدرس"><div class="stage-progress"><span>المرحلة ${n} من ${total}</span><progress max="${total}" value="${n}" aria-label="تقدمك في مراحل الدرس"></progress></div><ol>${stageLinks}</ol></nav>
  <article class="stage stage-${stage.kind}" aria-labelledby="stage-title"><div class="stage-top"><span class="badge ${badgeClass(stage.kind)}">${esc(stage.badge)}</span><span>المرحلة ${n} من ${total}</span></div><h2 id="stage-title" data-focus="stage" tabindex="-1">${esc(stage.title)}</h2><p class="stage-text">${esc(stage.intro)}</p>${stageBody(stage)}
  <div class="stage-actions">${prev ? `<a class="btn btn-secondary" href="${stageHref(lesson, prev)}">${icons.arrowRight} السابق: ${esc(prev.label)}</a>` : '<span></span>'}${next ? `<a class="btn btn-primary" href="${stageHref(lesson, next)}">التالي: ${esc(next.label)} ${icons.arrowLeft}</a>` : `<a class="btn btn-primary" href="${unitHref(unit)}">العودة إلى الوحدة ${icons.arrowLeft}</a>`}</div></article></div></section>`;
}

function assessmentsView() {
  const lessonTabs = lessons.map((lesson, i) => `<button id="assessment-tab-${lesson.id}" role="tab" aria-selected="${i === 0}" aria-controls="assessment-panel-${lesson.id}" tabindex="${i === 0 ? 0 : -1}" data-zone-tab>${esc(lesson.title)}</button>`).join('');
  const lessonPanels = lessons.map((lesson, i) => `<section id="assessment-panel-${lesson.id}" role="tabpanel" aria-labelledby="assessment-tab-${lesson.id}" tabindex="0"${i ? ' hidden' : ''}><h2>اختبار ${esc(lesson.title)}</h2><p>لم يُنشأ الاختبار بعد؛ ينتظر اعتماد محتوى الدرس. لا توجد أسئلة أو إجابات نهائية منشورة.</p></section>`).join('');
  return `<section class="wrap page-section"><header class="page-head"><p class="kicker">منطقة الاختبارات</p><h1 data-focus="page" tabindex="-1">اختبارات الدروس</h1><p class="lead">اختبار مستقل لكل درس معتمد؛ لا يُنشأ الاختبار قبل اعتماد محتواه.</p></header><div class="zone-tablist" role="tablist" aria-label="اختبارات الدروس">${lessonTabs}</div>${lessonPanels}<section class="zone-section"><h2>اختبارات الوحدات</h2><p>لا توجد اختبارات وحدات منشأة؛ يُضاف اختبار الوحدة فقط بعد تأكيد اكتمال دروسها واعتمادها.</p></section><section class="zone-section"><h2>حلول الاختبارات</h2><div class="zone-tablist" role="tablist" aria-label="حلول اختبارات الدروس">${lessons.map((lesson, i) => `<button id="solution-tab-${lesson.id}" role="tab" aria-selected="${i === 0}" aria-controls="solution-panel-${lesson.id}" tabindex="${i === 0 ? 0 : -1}" data-zone-tab>${esc(lesson.title)}</button>`).join('')}</div>${lessons.map((lesson, i) => `<section id="solution-panel-${lesson.id}" role="tabpanel" aria-labelledby="solution-tab-${lesson.id}" tabindex="0"${i ? ' hidden' : ''}><h3>${esc(lesson.title)}</h3><p>لا توجد حلول اختبار منشورة؛ لم يُنشأ الاختبار قبل اعتماد المحتوى.</p></section>`).join('')}<p>هذا المستودع عام وGitHub Pages لا يوفر مصادقة خادمية؛ لا يمكن اعتبار إخفاء المحتوى أو واجهة الدخول حماية أمنية.</p></section></section>`;
}
function teacherView() {
 const unitSections = units.map(unit => {
   const unitLessons = unit.lessons.map(lesson => ({ ...lesson, unitId: unit.id }));
   const tabs = unitLessons.map((lesson, i) => `<button id="teacher-tab-${unit.id}-${lesson.id}" role="tab" aria-selected="${i === 0}" aria-controls="teacher-panel-${unit.id}-${lesson.id}" tabindex="${i === 0 ? 0 : -1}" data-zone-tab>${esc(lesson.title)}</button>`).join('');
   const panels = unitLessons.map((lesson, i) => `<section id="teacher-panel-${unit.id}-${lesson.id}" role="tabpanel" aria-labelledby="teacher-tab-${unit.id}-${lesson.id}" tabindex="0"${i ? ' hidden' : ''}><h3>${esc(lesson.title)}</h3><p>لا توجد حلول معروضة: لم تتوفر نسخة موثقة من أسئلة نهاية الدرس للتحقق منها.</p></section>`).join('');
   return `<section class="zone-section"><h2>${esc(unit.fullTitle)}</h2><div class="zone-tablist" role="tablist" aria-label="دروس ${esc(unit.title)}">${tabs}</div>${panels}</section>`;
 }).join('');
 return `<section class="wrap page-section"><header class="page-head"><p class="kicker">منطقة المعلم</p><h1 data-focus="page" tabindex="-1">حلول أسئلة نهاية الدروس</h1><p class="lead">منظمة بحسب الوحدة ثم الدرس. لا تُعرض الحلول في صفحات الطالب أو دفتره.</p></header>${unitSections}<p class="notice">GitHub Pages لا يوفر مصادقة خادمية. أي محتوى مضاف إلى المستودع العام سيكون قابلاً للوصول؛ لا توجد حماية أمنية هنا.</p></section>`;
}

function missingView() {
  return `<section class="wrap page-section"><div class="state-panel" data-state="error"><span class="state-icon">${icons.info}</span><div><h1 data-focus="page" tabindex="-1">الصفحة غير متوفرة</h1><p>الرابط غير صحيح، أو لم تعد هذه الصفحة موجودة.</p><a class="btn btn-primary" href="#/">العودة إلى الرئيسية</a></div></div></section>`;
}

function view(route) {
  switch (route.name) {
    case 'home': return homeView();
    case 'student': return studentView();
    case 'assessments': return assessmentsView();
    case 'teacher': return teacherView();
    case 'unit': return unitView(route);
    case 'lesson': return lessonView(route);
    default: return missingView();
  }
}

function titleFor(route) {
  if (route.name === 'home') return 'الرئيسية';
  if (route.name === 'student') return 'مساحة الطالب';
  if (route.name === 'assessments') return 'منطقة الاختبارات';
  if (route.name === 'teacher') return 'منطقة المعلم';
  if (route.name === 'unit') return route.unit.fullTitle;
  if (route.name === 'lesson') return `${route.lesson.title} · ${stages[route.index].title}`;
  return 'الصفحة غير متوفرة';
}

function render(route = parseRoute()) {
  disposeLab?.();
  disposeLab = null;
  app.innerHTML = `<button type="button" class="skip-link" data-skip>تخطَّ إلى المحتوى</button>${header(route)}<main id="main" tabindex="-1">${view(route)}</main>${footer()}`;
  document.title = `${titleFor(route)} | الفيزياء الممتعة`;
  app.querySelectorAll('.zone-tablist').forEach(tablist => {
    const tabs = [...tablist.querySelectorAll('[data-zone-tab]')];
    const selectTab = tab => {
      tabs.forEach(item => {
        const active = item === tab;
        item.setAttribute('aria-selected', String(active)); item.tabIndex = active ? 0 : -1;
        const panel = app.querySelector(`#${item.getAttribute('aria-controls')}`);
        if (panel) panel.hidden = !active;
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectTab(tab));
      tab.addEventListener('keydown', event => {
        const offset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
        if (event.key === 'Home') { event.preventDefault(); tabs[0].focus(); selectTab(tabs[0]); return; }
        if (event.key === 'End') { event.preventDefault(); tabs.at(-1).focus(); selectTab(tabs.at(-1)); return; }
        if (!offset) return;
        event.preventDefault(); const next = tabs[(index + offset + tabs.length) % tabs.length]; next.focus(); selectTab(next);
      });
    });
  });
  const bookTabs = [...app.querySelectorAll('[data-book-tab]')];
  if (bookTabs.length) {
    const activateBookTab = id => {
      bookTabs.forEach(button => {
        const active = button.dataset.bookTab === id;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        const panel = app.querySelector(`#${button.dataset.bookTab}`);
        if (panel) panel.hidden = !active;
      });
    };
    activateBookTab(bookTabs[0].dataset.bookTab);
    bookTabs.forEach((button, index) => {
      button.addEventListener('click', () => activateBookTab(button.dataset.bookTab));
      button.addEventListener('keydown', event => {
        if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); const next = event.key === 'Home' ? 0 : bookTabs.length - 1; bookTabs[next].focus(); bookTabs[next].click(); return; }
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + bookTabs.length) % bookTabs.length;
        bookTabs[next].focus(); bookTabs[next].click();
      });
    });
  }
  const labRoot = app.querySelector('#motion-lab');
  if (labRoot) disposeLab = mountMotionLab(labRoot);
  const nav = app.querySelector('.stage-nav ol');
  const current = nav?.querySelector('[aria-current="step"]');
  if (nav && current && nav.scrollWidth > nav.clientWidth) current.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function afterNavigation(previous, current) {
  window.scrollTo(0, 0);
  const sameLesson = previous.name === 'lesson' && current.name === 'lesson' && previous.lesson.id === current.lesson.id;
  const kind = sameLesson ? 'stage' : 'page';
  app.querySelector(`[data-focus="${kind}"]`)?.focus({ preventScroll: true });
}

app.addEventListener('click', event => {
  const skip = event.target.closest('[data-skip]');
  if (skip) { app.querySelector('#main')?.focus(); return; }

  const scrollButton = event.target.closest('[data-scroll-to]');
  if (scrollButton) {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById(scrollButton.dataset.scrollTo)?.scrollIntoView({ behavior, block: 'start' });
    return;
  }

  const discovery = event.target.closest('[data-discovery-answer]');
  if (discovery) {
    app.querySelectorAll('[data-discovery-answer]').forEach(button => button.setAttribute('aria-pressed', String(button === discovery)));
    const feedback = app.querySelector('[data-discovery-feedback]');
    feedback.textContent = discovery.dataset.discoveryAnswer === 'both' ? 'توقع جيد! يعتمد الوصف على الجسم المرجع. سجل ملاحظتك ثم انتقل إلى محتوى الكتاب.' : 'هذا وصف صحيح بالنسبة إلى المرجع المذكور. هل يمكن أن يكون الوصفان صحيحين معاً؟ اختبر ذلك في المختبر.';
    feedback.classList.add('feedback-visible');
    return;
  }

  const choice = event.target.closest('[data-assessment-choice]');
  if (choice) {
    chooseAnswer(choice.dataset.qid, choice.dataset.value);
    const qid = choice.dataset.qid;
    const value = choice.dataset.value;
    render();
    app.querySelector(`[data-qid="${qid}"][data-value="${value}"]`)?.focus({ preventScroll: true });
    return;
  }

  const numericButton = event.target.closest('[data-check-numeric]');
  if (numericButton) {
    const qid = numericButton.dataset.checkNumeric;
    const raw = app.querySelector(`[data-numeric-input="${qid}"]`)?.value || '';
    checkNumeric(qid, raw);
    render();
    app.querySelector(`[data-check-numeric="${qid}"]`)?.focus({ preventScroll: true });
    return;
  }

  if (event.target.closest('[data-check-matching]')) {
    const values = {};
    app.querySelectorAll('[data-match-select]').forEach(select => { values[select.dataset.matchSelect] = select.value; });
    checkMatching(values);
    render();
    app.querySelector('[data-check-matching]')?.focus({ preventScroll: true });
  }
});

let lastRoute = parseRoute();
window.addEventListener('hashchange', () => {
  const previous = lastRoute;
  lastRoute = parseRoute();
  render(lastRoute);
  afterNavigation(previous, lastRoute);
});

render();
