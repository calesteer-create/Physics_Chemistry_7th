// مختبر المحصّلة التفاعلي لدرس «القوى على حامل واحد» — الوحدة الأولى، ص29–40.
// ثلاث محطات: قوتان بجهة واحدة، وقوتان متعاكستان، ومحصّلة قوى فريقين في لعبة شدّ الحبل (ص36).
// النمط نفسه المستعمل في motion-lab.js وforce-lab.js: قصد داخلي، واجهة data-lab-*، ودالة mount تعيد أداة التفكيك.
// كل الحسابات في دوال خالصة حتى تُختبر من دون متصفح.
import { formula } from './math.js';

const round = value => Math.round(value * 100) / 100;
export const fmt = value => String(Number(round(value).toFixed(2)));

// اتجاه المحصّلة: 'right' أو 'left' أو 'none' عند التعادل.
export function sameDirectionResult(first, second) {
  const f1 = round(Number(first) || 0);
  const f2 = round(Number(second) || 0);
  return { f1, f2, sum: round(f1 + f2), direction: 'right' };
}

export function oppositeDirectionResult(first, second) {
  const f1 = round(Number(first) || 0);
  const f2 = round(Number(second) || 0);
  const bigger = f1 === f2 ? null : Math.max(f1, f2);
  const smaller = f1 === f2 ? null : Math.min(f1, f2);
  return {
    f1,
    f2,
    difference: round(Math.abs(f1 - f2)),
    direction: f1 === f2 ? 'none' : f1 > f2 ? 'left' : 'right',
    bigger,
    smaller,
  };
}

// قوى الفريقين كما وردت في التطبيق المحلول ص36.
export const teamTotals = Object.freeze({
  team1: Object.freeze([230, 350, 220]),
  team2: Object.freeze([360, 340]),
});

export const total = values => round(values.reduce((sum, value) => sum + value, 0));

// محصّلة الفريقين: قوتان متعاكستان على حامل الحبل، والفائز صاحب المحصّلة الأكبر.
export function tugOfWarResult() {
  const first = total(teamTotals.team1);
  const second = total(teamTotals.team2);
  return {
    first,
    second,
    net: round(Math.abs(first - second)),
    winner: first === second ? 'none' : first > second ? 'team1' : 'team2',
    direction: first === second ? 'none' : first > second ? 'left' : 'right',
  };
}

const state = {
  active: 'same',
  sameFirst: 20,
  sameSecond: 30,
  sameAnswer: '',
  oppositeFirst: 30,
  oppositeSecond: 20,
  oppositeAnswer: '',
  equalAnswer: '',
  teamAnswer: '',
};

const button = (action, label, pressed = null, className = '') => `<button type="button" class="lab-button ${className}" data-lab-action="${action}"${pressed === null ? '' : ` aria-pressed="${pressed}"`}>${label}</button>`;

// سهم أفقي داخل مساحة ثابتة: يبدأ من النقطة 70 وطوله يتناسب مع الشدة.
const arrowRow = ({ label, value, color, direction = 'right', max = 60, y }) => {
  const px = Math.max(16, (value / max) * 300);
  const start = direction === 'right' ? 70 : 70 + px;
  const end = direction === 'right' ? 70 + px : 70;
  const headX = direction === 'right' ? end - 15 : end + 15;
  return `<g>
    <text x="8" y="${y + 5}" class="vector-tick" text-anchor="start">${label}</text>
    <line x1="70" y1="${y}" x2="370" y2="${y}" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5 6"/>
    <line x1="${start}" y1="${y}" x2="${end}" y2="${y}" stroke="${color}" stroke-width="8" stroke-linecap="round"/>
    <polygon points="${end},${y} ${headX},${y - 9} ${headX},${y + 9}" fill="${color}"/>
    <text x="${direction === 'right' ? end + 10 : end - 10}" y="${y - 14}" class="vector-tick" text-anchor="${direction === 'right' ? 'start' : 'end'}">${value} N</text>
  </g>`;
};

const samePanel = () => {
  const result = sameDirectionResult(state.sameFirst, state.sameSecond);
  return `<div class="lab-panel">
    <h3>المحطة 1 · قوتان على حامل واحد، وبجهة واحدة</h3>
    <p>غيّر شدّة كل قوة ولاحظ السهمين ثم المحصّلة. تذكّر عناصر القوة الأربعة: نقطة التأثير، والحامل، والجهة، والشدة.</p>
    <div class="lab-scene"><svg class="force-scene-svg" viewBox="0 0 470 210" role="img" aria-labelledby="lab-same-title" dir="ltr">
      <title id="lab-same-title">قوتان على حامل واحد بجهة واحدة، ومحصلتهما ${result.sum} نيوتن</title>
      ${arrowRow({ label: 'F₁', value: result.f1, color: '#f59e0b', y: 42 })}
      ${arrowRow({ label: 'F₂', value: result.f2, color: '#2563eb', y: 96 })}
      ${arrowRow({ label: 'F', value: result.sum, color: '#dc2626', y: 168 })}
    </svg></div>
    <div class="measurement-grid">
      <label>الشدة الأولى ${formula('F_1')} (N)<input data-lab-input="same-first" type="range" min="0" max="60" step="5" value="${state.sameFirst}" aria-valuetext="${state.sameFirst} نيوتن"><strong>${state.sameFirst} N</strong></label>
      <label>الشدة الثانية ${formula('F_2')} (N)<input data-lab-input="same-second" type="range" min="0" max="60" step="5" value="${state.sameSecond}" aria-valuetext="${state.sameSecond} نيوتن"><strong>${state.sameSecond} N</strong></label>
    </div>
    <div class="force-readout">
      <span><strong>نقطة التأثير:</strong> النقطة المشتركة للقوتين</span>
      <span><strong>الحامل:</strong> حامل القوتين نفسه</span>
      <span><strong>الجهة:</strong> جهة القوتين نفسها (نحو اليمين)</span>
      <span><strong>الشدة:</strong> ${formula(`${fmt(result.f1)}+${fmt(result.f2)}=${fmt(result.sum)}`)} نيوتن</span>
    </div>
    ${formula(`F=F_1+F_2=${fmt(result.f1)}+${fmt(result.f2)}=${fmt(result.sum)}\\,\\mathrm{N}`, { display: true })}
    <div class="inference"><h4>أستنتج</h4><p>القوتان على الحامل نفسه وبالجهة نفسها. ما شدة المحصّلة إذا كبّرنا إحدى القوتين وبقيت الأخرى كما هي؟</p>
      <div class="choice-row" role="group" aria-label="توقع أثر تكبير إحدى القوتين">
        ${button('same-answer-add', 'تزيد المحصّلة لأن القوتين تُجمعان', state.sameAnswer === 'add')}
        ${button('same-answer-same', 'تبقى المحصّلة كما هي', state.sameAnswer === 'same')}
        ${button('same-answer-sub', 'تنقص المحصّلة لأن القوتين تُطرحان', state.sameAnswer === 'sub')}
      </div>
      ${state.sameAnswer ? `<div class="answer-feedback ${state.sameAnswer === 'add' ? 'correct' : 'incorrect'}" role="status"><strong>${state.sameAnswer === 'add' ? 'صحيح!' : 'ليست الإجابة الصحيحة.'}</strong><p>لأن القوتين بجهة واحدة على الحامل نفسه تُجمع شدّتاهما: ${formula('F=F_1+F_2')}، وهذا نص «تعلَّمُّ» ص37.</p></div>` : '<p class="answer-hint">اختر توقعك ليظهر التفسير.</p>'}
    </div>
  </div>`;
};

const oppositePanel = () => {
  const result = oppositeDirectionResult(state.oppositeFirst, state.oppositeSecond);
  const directionText = result.direction === 'none'
    ? 'تتعادل القوتان فلا تتحرّك الحلقة'
    : `المحصّلة ${result.direction === 'left' ? 'نحو اليسار' : 'نحو اليمين'}، بجهة القوة الأكبر`;
  return `<div class="lab-panel">
    <h3>المحطة 2 · قوتان على حامل واحد، وبجهتين متعاكستين</h3>
    <p>هذه تجربة الكتاب ص33: ربيعان يشدّان حلقة واحدة بجهتين متعاكستين. غيّر الشدّتين ولاحظ جهة حركة الحلقة، ثم قارن بحالة التعادل في ص34.</p>
    <div class="lab-scene"><svg class="force-scene-svg" viewBox="0 0 470 200" role="img" aria-labelledby="lab-opposite-title" dir="ltr">
      <title id="lab-opposite-title">قوتان متعاكستان على الحامل نفسه: ${result.f1} نيوتن نحو اليسار و${result.f2} نيوتن نحو اليمين</title>
      <circle cx="235" cy="100" r="24" fill="none" stroke="#334155" stroke-width="7"/>
      <text x="235" y="70" class="svg-label" text-anchor="middle">o</text>
      ${arrowRow({ label: 'F₁', value: result.f1, color: '#f59e0b', direction: 'left', y: 34 })}
      ${arrowRow({ label: 'F₂', value: result.f2, color: '#dc2626', y: 160 })}
    </svg></div>
    <div class="measurement-grid">
      <label>الشدة الأولى ${formula('F_1')} (N)<input data-lab-input="opposite-first" type="range" min="0" max="60" step="5" value="${state.oppositeFirst}" aria-valuetext="${state.oppositeFirst} نيوتن"><strong>${state.oppositeFirst} N</strong></label>
      <label>الشدة الثانية ${formula('F_2')} (N)<input data-lab-input="opposite-second" type="range" min="0" max="60" step="5" value="${state.oppositeSecond}" aria-valuetext="${state.oppositeSecond} نيوتن"><strong>${state.oppositeSecond} N</strong></label>
    </div>
    <div class="force-readout">
      <span><strong>الحامل:</strong> حامل القوتين نفسه</span>
      <span><strong>الجهة:</strong> ${directionText}</span>
      <span><strong>الشدة:</strong> ${result.direction === 'none' ? 'صفر' : `${formula(`${fmt(result.bigger)}-${fmt(result.smaller)}=${fmt(result.difference)}`)} نيوتن`}</span>
      <span><strong>حركة الحلقة:</strong> ${result.direction === 'none' ? 'ساكنة' : result.direction === 'left' ? 'نحو اليسار' : 'نحو اليمين'}</span>
    </div>
    ${formula(result.direction === 'none' ? 'F=F_1-F_2=0\\,\\mathrm{N}' : `F=${fmt(result.bigger)}-${fmt(result.smaller)}=${fmt(result.difference)}\\,\\mathrm{N}`, { display: true })}
    <div class="inference"><h4>أستنتج</h4><p>اضبط الشدّتين حتى تتساويا (${formula('F_1=F_2')}). ماذا يحدث للحلقة؟</p>
      <div class="choice-row" role="group" aria-label="توقع حالة التعادل">
        ${button('equal-answer-still', 'تبقى ساكنة لأن المحصّلة صفر', state.equalAnswer === 'still')}
        ${button('equal-answer-left', 'تتحرّك نحو اليسار دائماً', state.equalAnswer === 'left')}
        ${button('equal-answer-right', 'تتحرّك نحو اليمين دائماً', state.equalAnswer === 'right')}
      </div>
      ${state.equalAnswer ? `<div class="answer-feedback ${state.equalAnswer === 'still' ? 'correct' : 'incorrect'}" role="status"><strong>${state.equalAnswer === 'still' ? 'صحيح!' : 'ليست الإجابة الصحيحة.'}</strong><p>هذا نص الكتاب ص34: القوتان المتعاكستان مباشرة منطبقتان حاملاً، متعاكستان جهةً، متساويتان شدّةً؛ فتلغي إحداهما الأخرى وتبقى الحلقة ساكنة.</p></div>` : '<p class="answer-hint">جرّب الشدّتين ثم اختر إجابتك.</p>'}
    </div>
  </div>`;
};

const teamPanel = () => {
  const result = tugOfWarResult();
  return `<div class="lab-panel">
    <h3>المحطة 3 · محصّلة قوى فريقين في لعبة شدّ الحبل</h3>
    <p>هذه أرقام التطبيق المحلول ص36 كما وردت في الكتاب. اجمع قوى كل فريق، ثم احسب محصّلة القوتين.</p>
    <div class="table-scroll" tabindex="0" role="region" aria-label="جدول قوى الفريقين في لعبة شدّ الحبل"><table><caption>قوى الفريقين في لعبة شدّ الحبل — من الكتاب ص36</caption>
      <thead><tr><th scope="col">الفريق الأول</th><th scope="col">الفريق الثاني</th></tr></thead>
      <tbody><tr><td>يوسف 230 N</td><td>حسام 360 N</td></tr><tr><td>خالد 350 N</td><td>هلالي 340 N</td></tr><tr><td>عزّام 220 N</td><td>—</td></tr></tbody></table></div>
    <div class="force-readout">
      <span><strong>مجموع الفريق الأول:</strong> ${formula('230+350+220=800\\,\\mathrm{N}')}</span>
      <span><strong>مجموع الفريق الثاني:</strong> ${formula('360+340=700\\,\\mathrm{N}')}</span>
      <span><strong>المحصّلة:</strong> ${formula('800-700=100\\,\\mathrm{N}')} بجهة الفريق الأول</span>
      <span><strong>البطل:</strong> الفريق الأول</span>
    </div>
    <div class="inference"><h4>أستنتج</h4><p>مثّلت قوى كل فريق بقوة واحدة على حامل الحبل، وهما بجهتين متعاكستين. ما شدة محصّلتهما؟</p>
      <div class="choice-row" role="group" aria-label="احسب محصلة مجموع الفريقين">
        ${button('team-answer-sum', '1500 N لأنهما تُجمعان', state.teamAnswer === 'sum')}
        ${button('team-answer-diff', '100 N بجهة الفريق الأول', state.teamAnswer === 'diff')}
        ${button('team-answer-zero', 'صفر N لأنهما متعاكستان', state.teamAnswer === 'zero')}
      </div>
      ${state.teamAnswer ? `<div class="answer-feedback ${state.teamAnswer === 'diff' ? 'correct' : 'incorrect'}" role="status"><strong>${state.teamAnswer === 'diff' ? 'صحيح!' : 'ليست الإجابة الصحيحة.'}</strong><p>${formula("F=F'-F''=800-700=100\\,\\mathrm{N}")}، ويتحرّك الحبل بجهة الفريق الأول، لذلك هو الفائز، كما في حلّ الكتاب ص36.</p></div>` : '<p class="answer-hint">اختر إجابتك لترى التفسير.</p>'}
    </div>
    <p class="simulation-source">هذه المحطة تعرض أرقام الكتاب نفسها؛ لا تضاف إليها قيم من إعداد المنصة.</p>
  </div>`;
};

const labMarkup = () => `<div class="lab-tabs" role="tablist" aria-label="محطات مختبر المحصّلة">
    ${button('tab-same', '1 · الجهة نفسها', state.active === 'same', 'lab-tab')}
    ${button('tab-opposite', '2 · جهتان متعاكستان', state.active === 'opposite', 'lab-tab')}
    ${button('tab-team', '3 · لعبة شدّ الحبل', state.active === 'team', 'lab-tab')}
  </div>${state.active === 'same' ? samePanel() : state.active === 'opposite' ? oppositePanel() : teamPanel()}`;

// الغلاف الفارغ يُركَّب في main.js، والوسم الأولي نفسه يُستخدم في اختبارات البناء.
export function resultantLabShell() {
  return '<div id="resultant-lab" class="motion-lab resultant-lab"></div>';
}

// ترميز لوحة المحطة النشطة كما تُرى بعد التركيب، حتى تُختبر الواجهة دون متصفح.
export function resultantLabContent() {
  return labMarkup();
}

export function mountResultantLab(root) {
  const draw = (focusSelector = '') => {
    root.innerHTML = labMarkup();
    if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
  };
  const clickHandler = event => {
    const control = event.target.closest('[data-lab-action]');
    if (!control || !root.contains(control)) return;
    const action = control.dataset.labAction;
    if (action === 'tab-same' || action === 'tab-opposite' || action === 'tab-team') {
      state.active = action.slice(4);
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('same-answer-')) { state.sameAnswer = action.replace('same-answer-', ''); draw(`[data-lab-action="${action}"]`); return; }
    if (action.startsWith('equal-answer-')) { state.equalAnswer = action.replace('equal-answer-', ''); draw(`[data-lab-action="${action}"]`); return; }
    if (action.startsWith('team-answer-')) { state.teamAnswer = action.replace('team-answer-', ''); draw(`[data-lab-action="${action}"]`); }
  };
  const inputHandler = event => {
    const control = event.target.closest('[data-lab-input]');
    if (!control) return;
    const key = control.dataset.labInput;
    const value = Number(control.value);
    if (key === 'same-first') state.sameFirst = value;
    else if (key === 'same-second') state.sameSecond = value;
    else if (key === 'opposite-first') state.oppositeFirst = value;
    else if (key === 'opposite-second') state.oppositeSecond = value;
    draw(`[data-lab-input="${key}"]`);
  };
  root.addEventListener('click', clickHandler);
  root.addEventListener('input', inputHandler);
  root.addEventListener('change', inputHandler);
  draw();
  return () => {
    root.removeEventListener('click', clickHandler);
    root.removeEventListener('input', inputHandler);
    root.removeEventListener('change', inputHandler);
  };
}

export const labState = state;
