// منطقة المعلم: بوابة دخول شكلية داخل الواجهة، ثم حلول أسئلة نهاية الدروس منظمة حسب الوحدة ثم الدرس.
// البوابة ليست حماية أمنية: المستودع عام وGitHub Pages موقع ثابت، لذلك لا تُعرض المحتويات إلا بعد الدخول في الواجهة فقط.
import { icons } from './icons.js';
import { units } from './course.js';
import { teacherSolutions } from './teacher-solutions.js';

export const TEACHER_PASSWORD = 'somer173';

// حالة الدخول في الذاكرة فقط: تُقفل عند الخروج من المنطقة أو تحديث الصفحة.
export const teacherZone = { unlocked: false, error: '' };

const esc = value => String(value).replace(/[&<>\"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const errorMessages = {
  empty: 'أدخل كلمة المرور للمتابعة.',
  wrong: 'كلمة المرور غير صحيحة. تأكد من كتابتها وحاول مرة أخرى.',
};

export function submitTeacherPassword(value) {
  const typed = String(value ?? '').trim();
  if (!typed) {
    teacherZone.unlocked = false;
    teacherZone.error = 'empty';
    return false;
  }
  if (typed !== TEACHER_PASSWORD) {
    teacherZone.unlocked = false;
    teacherZone.error = 'wrong';
    return false;
  }
  teacherZone.unlocked = true;
  teacherZone.error = '';
  return true;
}

export function lockTeacherZone() {
  teacherZone.unlocked = false;
  teacherZone.error = '';
}

export function teacherGateView() {
  const error = teacherZone.error ? errorMessages[teacherZone.error] : '';
  return `<section class="wrap page-section"><div class="teacher-gate">
    <span class="gate-icon" aria-hidden="true">${icons.lock}</span>
    <h1 data-focus="page" tabindex="-1">منطقة المعلم</h1>
    <p class="lead">هذه المنطقة مخصصة لحلول أسئلة نهاية الدروس. أدخل كلمة المرور للمتابعة.</p>
    <form class="teacher-login" data-teacher-login novalidate>
      <label class="gate-label" for="teacher-password">كلمة المرور</label>
      <input class="gate-input" id="teacher-password" name="password" type="password" dir="ltr" autocomplete="current-password" autocapitalize="off" spellcheck="false" aria-describedby="teacher-login-help" aria-invalid="${error ? 'true' : 'false'}">
      <p class="gate-error" id="teacher-login-help" role="alert"${error ? '' : ' hidden'}>${esc(error)}</p>
      <button type="submit" class="btn btn-primary gate-submit">دخول</button>
    </form>
  </div></section>`;
}

const solutionId = (lesson, question) => `solution-${lesson.id}-${question.id}`;

function questionSolutionView(lesson, question) {
  const id = solutionId(lesson, question);
  return `<article class="solution-question" id="${id}" aria-labelledby="${id}-title">
    <header class="solution-head"><h4 id="${id}-title">${esc(question.title)}</h4></header>
    <p class="solution-prompt">${esc(question.instruction)}</p>
    <div class="solution-body">${question.body}</div>
    ${question.check ? `<div class="solution-check" role="note"><strong>ملاحظة للتحقق:</strong> ${esc(question.check)}</div>` : ''}
  </article>`;
}

function lessonSolutionsView(lesson) {
  const data = teacherSolutions[lesson.id];
  if (!data) return `<h3>${esc(lesson.title)}</h3><p class="notice">لم تُضف حلول هذا الدرس بعد.</p>`;
  const index = data.questions.map(question => `<li><button type="button" class="solution-chip" data-scroll-to="${solutionId(lesson, question)}">${esc(question.title)}</button></li>`).join('');
  return `<header class="lesson-solutions-head"><h3>${esc(lesson.title)}</h3>
      <p class="solution-source"><span class="source-chip">من الكتاب</span><span>صفحات الكتاب ${esc(lesson.pages)} · ${esc(data.sourceTitle)}</span></p>
      <p class="solution-source-note">${esc(data.sourceNote)}</p></header>
    <nav class="solution-index" aria-label="أسئلة ${esc(lesson.title)}"><ul>${index}</ul></nav>
    ${data.questions.map(question => questionSolutionView(lesson, question)).join('')}`;
}

export function teacherSolutionsView() {
  const unitSections = units.map(unit => {
    const tabs = unit.lessons.map((lesson, i) => `<button type="button" id="teacher-tab-${unit.id}-${lesson.id}" role="tab" aria-selected="${i === 0}" aria-controls="teacher-panel-${unit.id}-${lesson.id}" tabindex="${i === 0 ? 0 : -1}" data-zone-tab>${esc(lesson.title)}</button>`).join('');
    const panels = unit.lessons.map((lesson, i) => `<section id="teacher-panel-${unit.id}-${lesson.id}" role="tabpanel" aria-labelledby="teacher-tab-${unit.id}-${lesson.id}" tabindex="0"${i ? ' hidden' : ''}>${lessonSolutionsView(lesson)}</section>`).join('');
    return `<section class="zone-section teacher-unit"><h2>${esc(unit.fullTitle)}</h2><div class="zone-tablist" role="tablist" aria-label="دروس ${esc(unit.title)}">${tabs}</div>${panels}</section>`;
  }).join('');
  return `<section class="wrap page-section teacher-zone">
    <header class="page-head"><p class="kicker">منطقة المعلم</p><h1 data-focus="page" tabindex="-1">حلول أسئلة نهاية الدروس</h1><p class="lead">منظمة حسب الوحدة ثم الدرس. لا تُعرض هذه الحلول في صفحات الطالب أو دفتره.</p>
      <div class="actions"><button type="button" class="btn btn-secondary" data-teacher-logout>تسجيل الخروج</button></div></header>
    ${unitSections}
    <div class="notice" role="note"><span class="notice-icon">${icons.info}</span><p>GitHub Pages لا يوفر مصادقة خادمية، وبوابة كلمة المرور هنا عرض شكلي داخل الواجهة وليست حماية أمنية. أي محتوى منشور في المستودع العام يمكن الوصول إليه.</p></div>
  </section>`;
}

export function teacherView() {
  return teacherZone.unlocked ? teacherSolutionsView() : teacherGateView();
}
