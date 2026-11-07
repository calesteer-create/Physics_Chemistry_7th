// مختبر القوة التفاعلي لدرس القوة والحركة — ثلاث محطات: عناصر القوة، الكتلة والثقل، الرسم بالمقياس.
// النمط نفسه المستعمل في motion-lab.js: قصد داخلي، واجهة data-lab-*، ودالة mount تعيد أداة التفكيك.
import { formula } from './math.js';
import { springScaleFigure } from './diagrams.js';

// قيم تسارع الجاذبية من تطبيق الكتاب ص25 بوحدة N·kg⁻¹.
export const FORCE_REGIONS = Object.freeze({
  equator: { label: 'خط الاستواء', g: 9.78 },
  syria: { label: 'سوريا', g: 9.796 },
  pole: { label: 'القطب الشمالي', g: 9.83 },
});

export const FORCE_LAB_SCALE = Object.freeze({ pxPerCm: 26, newtonPerCm: 1 });

export function weightSnapshot(mass, region) {
  const safeMass = Math.min(100, Math.max(0.01, Number(mass) || 0));
  const data = FORCE_REGIONS[region] || FORCE_REGIONS.syria;
  const weight = Math.round(safeMass * data.g * 100) / 100;
  return { mass: safeMass, region, label: data.label, g: data.g, weight };
}

const state = {
  active: 'elements',
  force: 4,
  direction: 'right',
  point: 'front',
  elementsAnswer: '',
  mass: 0.5,
  region: 'syria',
  weightAnswer: '',
  drawTarget: 'right-4',
  drawLength: 3,
  drawDirection: 'right',
  drawChecked: false,
};

export const drawTargets = {
  'right-4': { text: 'قوة أفقية نحو اليمين شدتها 4 N', newtons: 4, direction: 'right', cm: 4 },
  'up-3': { text: 'قوة شاقولية نحو الأعلى شدتها 3 N', newtons: 3, direction: 'up', cm: 3 },
  'left-6': { text: 'قوة أفقية نحو اليسار شدتها 6 N', newtons: 6, direction: 'left', cm: 6 },
};

const round = value => Math.round(value * 100) / 100;
const fmt = value => Number(round(value).toFixed(2));
const button = (action, label, pressed = false, className = '') => `<button type="button" class="lab-button ${className}" data-lab-action="${action}" ${pressed !== null ? `aria-pressed="${pressed}"` : ''}>${label}</button>`;

const directionArrow = ({ force, direction, point }) => {
  const px = force * FORCE_LAB_SCALE.pxPerCm;
  const groundY = 168;
  const anchorX = point === 'front' ? 96 : point === 'back' ? 356 : 226;
  const half = px / 2;
  let x1; let y1; let x2; let y2;
  if (direction === 'right') { x1 = anchorX - half; y1 = groundY - 26; x2 = anchorX + half; y2 = groundY - 26; }
  else if (direction === 'left') { x1 = anchorX + half; y1 = groundY - 26; x2 = anchorX - half; y2 = groundY - 26; }
  else if (direction === 'up30') { x1 = anchorX - half * Math.cos(Math.PI / 6); y1 = groundY - 26 + half * Math.sin(Math.PI / 6); x2 = anchorX + half * Math.cos(Math.PI / 6); y2 = groundY - 26 - half * Math.sin(Math.PI / 6); }
  else { x1 = anchorX; y1 = groundY - 6; x2 = anchorX; y2 = groundY - 6 - px; }
  return { x1, y1, x2, y2 };
};

const carScene = () => {
  const { force, direction, point } = state;
  const arrow = directionArrow({ force, direction, point });
  const px = force * FORCE_LAB_SCALE.pxPerCm;
  const cm = fmt(force / FORCE_LAB_SCALE.newtonPerCm);
  const anchorX = point === 'front' ? 96 : point === 'back' ? 356 : 226;
  const labels = {
    front: { x: anchorX, y: 205, text: 'نقطة التأثير: مقدمة السيارة' },
    back: { x: anchorX, y: 205, text: 'نقطة التأثير: مؤخرة السيارة' },
    middle: { x: anchorX, y: 205, text: 'نقطة التأثير: وسط السيارة' },
  };
  return `<svg class="force-scene-svg" viewBox="0 0 470 260" role="img" aria-labelledby="force-scene-title" dir="ltr">
    <title id="force-scene-title">سيارة يشدّها خيط بقوة شدتها ${force} نيوتن من ${labels[point].text}</title>
    <rect x="14" y="${groundY + 18}" width="442" height="10" rx="5" fill="#d7e0ea"/>
    <rect x="60" y="148" width="330" height="34" rx="12" fill="#3aa7dd"/>
    <path d="M108 148 L124 122 L200 122 L214 148 Z" fill="#d8f0f6"/>
    <path d="M226 148 L240 122 L292 122 L306 148 Z" fill="#d8f0f6"/>
    <circle cx="118" cy="${groundY + 8}" r="19" fill="#344055"/><circle cx="118" cy="${groundY + 8}" r="7" fill="#cbd5e1"/>
    <circle cx="330" cy="${groundY + 8}" r="19" fill="#344055"/><circle cx="330" cy="${groundY + 8}" r="7" fill="#cbd5e1"/>
    <circle cx="${anchorX}" cy="${groundY - 26}" r="6" fill="#dc2626"/>
    <line x1="${direction === 'up' ? anchorX : Math.min(arrow.x1, arrow.x2)}" y1="${direction === 'up' ? groundY - 26 : arrow.y1}" x2="${direction === 'up' ? anchorX : Math.max(arrow.x1, arrow.x2)}" y2="${direction === 'up' ? Math.min(arrow.y1, arrow.y2) : arrow.y2}" stroke="#94a3b8" stroke-width="2" stroke-dasharray="7 6"/>
    <line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>
    <polygon points="${arrow.x2},${arrow.y2} ${arrow.x2 - 14 * Math.sign(arrow.x2 - arrow.x1 || 0.6)},${arrow.y2 - 9} ${arrow.x2 - 14 * Math.sign(arrow.x2 - arrow.x1 || 0.6)},${arrow.y2 + 9}" fill="${direction === 'up' || direction === 'up30' ? '#dc2626' : '#dc2626'}" transform="${direction === 'up' ? `rotate(${direction === 'up' ? 0 : -30} ${arrow.x2} ${arrow.y2})` : ''}"/>
    <text x="${(arrow.x1 + arrow.x2) / 2}" y="${Math.min(arrow.y1, arrow.y2) - 12}" class="svg-label" text-anchor="middle" font-style="italic">F = ${force} N</text>
    <text x="${labels[point].x}" y="${labels[point].y}" class="vector-tick" text-anchor="middle">${labels[point].text}</text>
    <text x="452" y="${groundY - 52}" class="vector-tick" text-anchor="end">طول السهم: ${cm} cm</text>
  </svg>`;
};

const elementsPanel = () => {
  const pointLabel = { front: 'مقدمة السيارة', back: 'مؤخرتها', middle: 'وسطها' }[state.point];
  const directionLabel = { right: 'نحو اليمين', left: 'نحو اليسار', up: 'نحو الأعلى', up30: 'مائلة نحو الأعلى بزاوية 30° عن الأفق' }[state.direction];
  return `<div class="lab-panel">
    <h3>المحطة 1 · عناصر القوة</h3>
    <p>شدّ السيارة بخيط: غيّر الشدة والجهة ونقطة التأثير ولاحظ السهم الذي يمثل القوة. المقياس: كل 1 cm يقابل 1 N.</p>
    ${carScene()}
    <div class="measurement-grid">
      <label>الشدة ${formula('F')} (N)<input data-lab-input="force" type="range" min="1" max="10" step="1" value="${state.force}" aria-valuetext="${state.force} نيوتن"><strong>${state.force} N</strong></label>
      <label>الجهة<select data-lab-input="direction">
        <option value="right" ${state.direction === 'right' ? 'selected' : ''}>نحو اليمين</option>
        <option value="left" ${state.direction === 'left' ? 'selected' : ''}>نحو اليسار</option>
        <option value="up" ${state.direction === 'up' ? 'selected' : ''}>نحو الأعلى</option>
        <option value="up30" ${state.direction === 'up30' ? 'selected' : ''}>مائلة 30° عن الأفق</option>
      </select></label>
      <label>نقطة التأثير<select data-lab-input="point">
        <option value="front" ${state.point === 'front' ? 'selected' : ''}>مقدمة السيارة</option>
        <option value="middle" ${state.point === 'middle' ? 'selected' : ''}>وسط السيارة</option>
        <option value="back" ${state.point === 'back' ? 'selected' : ''}>مؤخرة السيارة</option>
      </select></label>
    </div>
    <div class="force-readout">
      <span><strong>نقطة التأثير:</strong> ${pointLabel}</span>
      <span><strong>الحامل:</strong> المستقيم المار بنقطة التأثير باتجاه السهم (الخط المنقّط)</span>
      <span><strong>الجهة:</strong> ${directionLabel}</span>
      <span><strong>الشدة:</strong> ${state.force} N</span>
    </div>
    <div class="inference"><h4>أستنتج</h4><p>بقيت الحامل والجهة ونقطة التأثير كما هي وضاعفنا الشدة من ${Math.max(1, Math.floor(state.force / 2))} N إلى ضعفها. ماذا يحدث لتأثير القوة في حركة السيارة؟</p>
      <div class="choice-row" role="group" aria-label="توقع أثر مضاعفة الشدة">
        ${button('elements-answer-more', 'يزداد تأثيرها فيتسارع سحب السيارة أكثر', state.elementsAnswer === 'more')}
        ${button('elements-answer-same', 'لا يتغير التأثير لأن الجهة نفسها', state.elementsAnswer === 'same')}
        ${button('elements-answer-stop', 'تتوقف السيارة', state.elementsAnswer === 'stop')}
      </div>
      ${state.elementsAnswer ? `<div class="answer-feedback ${state.elementsAnswer === 'more' ? 'correct' : 'incorrect'}" role="status"><strong>${state.elementsAnswer === 'more' ? 'صحيح!' : 'ليست الإجابة الصحيحة.'}</strong><p>يوافق ذلك استنتاج الكتاب ص20: «إنّ تأثير القوة يتعلق بشدّتها»؛ فمضاعفة الشدة بسائر العناصر تعني سحباً أقوى وتسارعاً أكبر.</p></div>` : '<p class="answer-hint">اختر توقعك لتظهر المناقشة.</p>'}
    </div>
  </div>`;
};

const weightPanel = () => {
  const snapshot = weightSnapshot(state.mass, state.region);
  const needle = Math.min(4, snapshot.weight / 5);
  return `<div class="lab-panel">
    <h3>المحطة 2 · الكتلة والثقل: ${formula('w=mg')}</h3>
    <p>علّق جسماً في الربيعة واختر المنطقة، ولاحظ أن المؤشر يقرأ الثقل بينما تبقى الكتلة كما هي عند الانتقال.</p>
    <div class="force-lab-grid">
      <div>${springScaleFigure({ id: 'force-lab-scale', needle: round(needle), caption: `ربيعة تقرأ ثقل جسم كتلته ${snapshot.mass} kg في ${snapshot.label}` })}</div>
      <div>
        <div class="measurement-grid">
          <label>الكتلة ${formula('m')} (kg)<input data-lab-input="mass" type="range" min="0.05" max="2" step="0.05" value="${snapshot.mass}" aria-valuetext="${snapshot.mass} كيلوغرام"><strong>${snapshot.mass} kg</strong></label>
          <label>المنطقة<select data-lab-input="region">
            <option value="syria" ${state.region === 'syria' ? 'selected' : ''}>سوريا (${FORCE_REGIONS.syria.g})</option>
            <option value="equator" ${state.region === 'equator' ? 'selected' : ''}>خط الاستواء (${FORCE_REGIONS.equator.g})</option>
            <option value="pole" ${state.region === 'pole' ? 'selected' : ''}>القطب الشمالي (${FORCE_REGIONS.pole.g})</option>
          </select></label>
        </div>
        ${formula(`w=mg=${snapshot.mass}\\times${snapshot.g}=${snapshot.weight}\\,\\mathrm{N}`, { display: true })}
        <div class="force-readout"><span><strong>المنطقة:</strong> ${snapshot.label}</span><span><strong>${formula('g')} هنا:</strong> ${snapshot.g} N·kg⁻¹</span><span><strong>الكتلة:</strong> ${snapshot.mass} kg (ثابتة)</span><span><strong>الثقل:</strong> ${snapshot.weight} N (يتبع المنطقة)</span></div>
        <div class="inference"><h4>أستنتج</h4><p>نقلنا الجسم نفسه من سوريا إلى القطب الشمالي. أي العبارات صحيحة؟</p>
          <div class="choice-row" role="group" aria-label="توقع نتيجة انتقال الجسم">
            ${button('weight-answer-mass', 'الكتلة ثابتة والثقل يتغير', state.weightAnswer === 'mass')}
            ${button('weight-answer-weight', 'الكتلة والثقل يتغيران معاً', state.weightAnswer === 'weight')}
            ${button('weight-answer-none', 'لا يتغير أي منهما', state.weightAnswer === 'none')}
          </div>
          ${state.weightAnswer ? `<div class="answer-feedback ${state.weightAnswer === 'mass' ? 'correct' : 'incorrect'}" role="status"><strong>${state.weightAnswer === 'mass' ? 'صحيح!' : 'ليست الإجابة الصحيحة.'}</strong><p>ملاحظة الكتاب ص25: قيمة ${formula('g')} تختلف من مكان لآخر فتختلف شدة الثقل، مع بقاء الكتلة مقداراً ثابتاً.</p></div>` : '<p class="answer-hint">اختر إجابتك لترى التفسير.</p>'}
        </div>
      </div>
    </div>
  </div>`;
};

const drawPanel = () => {
  const target = drawTargets[state.drawTarget];
  const correctLength = Math.abs(Number(state.drawLength) - target.cm) < 0.01;
  const correctDirection = state.drawDirection === target.direction;
  const px = Number(state.drawLength) * FORCE_LAB_SCALE.pxPerCm;
  const cx = 235; const cy = 120;
  const geometry = {
    right: [cx - px / 2, cy, cx + px / 2, cy],
    left: [cx + px / 2, cy, cx - px / 2, cy],
    up: [cx, cy + px / 2, cx, cy - px / 2],
  }[state.drawDirection] || [cx - px / 2, cy, cx + px / 2, cy];
  return `<div class="lab-panel">
    <h3>المحطة 3 · ارسم القوة بالمقياس</h3>
    <p><strong>المطلوب تمثيله:</strong> ${target.text}. المقياس: كل 1 cm يقابل 1 N.</p>
    <div class="force-lab-grid">
      <svg class="force-scene-svg" viewBox="0 0 470 240" role="img" aria-label="مساحة رسم القوة مع شبكة سنتيمترات" dir="ltr">
        <title>مساحة رسم شبكية لتمثيل القوة المطلوبة</title>
        ${Array.from({ length: 17 }, (_, i) => `<line x1="${i * 26 + 9}" y1="10" x2="${i * 26 + 9}" y2="230" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
        ${Array.from({ length: 9 }, (_, i) => `<line x1="9" y1="${i * 26 + 10}" x2="461" y2="${i * 26 + 10}" stroke="#e2e8f0" stroke-width="1"/>`).join('')}
        <circle cx="${cx}" cy="${cy}" r="5" fill="#1e40af"/>
        <line x1="${geometry[0]}" y1="${geometry[1]}" x2="${geometry[2]}" y2="${geometry[3]}" stroke="#dc2626" stroke-width="7" stroke-linecap="round"/>
        <text x="${cx}" y="${Math.min(geometry[1], geometry[3]) - 12}" class="svg-label" text-anchor="middle">${state.drawLength} cm</text>
      </svg>
      <div>
        <div class="measurement-grid">
          <label>طول السهم (cm)<input data-lab-input="draw-length" type="range" min="1" max="8" step="0.5" value="${state.drawLength}" aria-valuetext="${state.drawLength} سنتيمتر"><strong>${state.drawLength} cm</strong></label>
          <label>الجهة<select data-lab-input="draw-direction">
            <option value="right" ${state.drawDirection === 'right' ? 'selected' : ''}>نحو اليمين</option>
            <option value="left" ${state.drawDirection === 'left' ? 'selected' : ''}>نحو اليسار</option>
            <option value="up" ${state.drawDirection === 'up' ? 'selected' : ''}>نحو الأعلى</option>
          </select></label>
        </div>
        <div class="choice-row">${button('draw-check', 'تحقق من الرسم', state.drawChecked, 'lab-check')}</div>
        ${state.drawChecked ? `<div class="answer-feedback ${correctLength && correctDirection ? 'correct' : 'incorrect'}" role="status"><strong>${correctLength && correctDirection ? 'رسم صحيح!' : 'أعد المحاولة.'}</strong><p>${correctLength ? `الطول صحيح: ${target.cm} cm` : `الطول غير صحيح: القوة ${target.newtons} N تحتاج ${target.cm} cm بالمقياس (كل 1 cm ≡ 1 N) وسهمك ${state.drawLength} cm.`} ${correctDirection ? 'والجهة صحيحة.' : `والجهة المطلوبة ${target.direction === 'right' ? 'نحو اليمين' : target.direction === 'left' ? 'نحو اليسار' : 'نحو الأعلى'}.`}</p></div>` : '<p class="answer-hint">اضبط الطول والجهة ثم تحقق.</p>'}
        <div class="choice-row">${Object.keys(drawTargets).map(key => button(`draw-target-${key}`, drawTargets[key].text.replace('قوة ', ''), state.drawTarget === key)).join('')}</div>
      </div>
    </div>
  </div>`;
};

const labMarkup = () => `<div class="lab-tabs" aria-label="محطات مختبر القوة">
    ${button('tab-elements', '1 · عناصر القوة', state.active === 'elements', 'lab-tab')}
    ${button('tab-weight', '2 · الكتلة والثقل', state.active === 'weight', 'lab-tab')}
    ${button('tab-draw', '3 · الرسم بالمقياس', state.active === 'draw', 'lab-tab')}
  </div>${state.active === 'elements' ? elementsPanel() : state.active === 'weight' ? weightPanel() : drawPanel()}`;

export function forceLabShell() {
  return '<div id="force-lab" class="motion-lab force-lab"></div>';
}

export function mountForceLab(root) {
  const draw = (focusSelector = '') => {
    root.innerHTML = labMarkup();
    if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
  };
  const clickHandler = event => {
    const control = event.target.closest('[data-lab-action]');
    if (!control || !root.contains(control)) return;
    const action = control.dataset.labAction;
    if (action === 'tab-elements' || action === 'tab-weight' || action === 'tab-draw') {
      state.active = action.slice(4);
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('elements-answer-')) { state.elementsAnswer = action.replace('elements-answer-', ''); draw(`[data-lab-action="${action}"]`); return; }
    if (action.startsWith('weight-answer-')) { state.weightAnswer = action.replace('weight-answer-', ''); draw(`[data-lab-action="${action}"]`); return; }
    if (action === 'draw-check') { state.drawChecked = true; draw(`[data-lab-action="${action}"]`); return; }
    if (action.startsWith('draw-target-')) {
      state.drawTarget = action.replace('draw-target-', '');
      const target = drawTargets[state.drawTarget];
      state.drawLength = target.cm; state.drawDirection = target.direction; state.drawChecked = false;
      draw(`[data-lab-action="${action}"]`);
    }
  };
  const inputHandler = event => {
    const control = event.target.closest('[data-lab-input]');
    if (!control) return;
    const key = control.dataset.labInput;
    if (key === 'force') state.force = Number(control.value);
    else if (key === 'direction') state.direction = control.value;
    else if (key === 'point') state.point = control.value;
    else if (key === 'mass') { state.mass = Number(control.value); state.weightAnswer = ''; }
    else if (key === 'region') state.region = control.value;
    else if (key === 'draw-length') state.drawLength = Number(control.value);
    else if (key === 'draw-direction') state.drawDirection = control.value;
    draw(`[data-lab-input="${key}"]`);
  };
  root.addEventListener('click', clickHandler);
  root.addEventListener('input', inputHandler);
  root.addEventListener('change', inputHandler);
  draw();
  return () => { root.removeEventListener('click', clickHandler); root.removeEventListener('input', inputHandler); root.removeEventListener('change', inputHandler); };
}
