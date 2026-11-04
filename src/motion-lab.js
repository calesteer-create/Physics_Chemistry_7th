import { motionGraph } from './diagrams.js';
import { formula } from './math.js';

const state = {
  active: 'reference',
  reference: 'sign',
  referenceTime: 0,
  referencePlaying: false,
  referenceAnswer: '',
  pathType: 'straight',
  pathTime: 0,
  pathPlaying: false,
  pathAnswers: {},
  graphMode: 'uniform',
  graphTime: 0,
  graphPlaying: false,
  graphAnswers: {},
};

const graphConfigs = {
  rest: {
    label: 'ساكن بالنسبة إلى المرجع', max: 7, yMax: 10, yStep: 1,
    position: time => 5, points: Array.from({ length: 8 }, (_, time) => [time, 5]),
    description: 'بُعد الجسم عن المرجع ثابت عند خمسة أمتار', question: 'ماذا يحدث للمسافة المقطوعة مع تغير الزمن؟', answer: 'تبقى صفراً',
    explanation: 'الموضع ثابت عند 5 أمتار، لذلك لا يتحرك الجسم بالنسبة إلى المرجع والمسافة المقطوعة صفر.',
  },
  uniform: {
    label: 'مستقيمة منتظمة', max: 6, yMax: 100, yStep: 10,
    position: time => 30 + 10 * time, points: Array.from({ length: 7 }, (_, time) => [time, 30 + 10 * time]),
    description: 'مواضع الدراجة من بيانات الكتاب: يزداد الموضع عشرة أمتار كل ثانية', question: 'كيف تتغير المسافة المقطوعة في كل ثانية؟', answer: 'متساوية',
    explanation: 'يقطع الجسم 10 أمتار في كل ثانية. المسافات متساوية في أزمنة متساوية، والسرعة ثابتة.',
  },
  changing: {
    label: 'غير منتظمة', max: 4, yMax: 18, yStep: 2, curved: true,
    position: time => time ** 2, points: Array.from({ length: 5 }, (_, time) => [time, time ** 2]),
    description: 'بيانات الخط المنحني في الكتاب: صفر و1 و4 و9 و16 متراً', question: 'كيف تتغير المسافة المقطوعة في كل ثانية؟', answer: 'غير متساوية',
    explanation: 'المسافات في الثواني المتتالية 1 و3 و5 و7 أمتار. تتساوى الأزمنة ولا تتساوى المسافات؛ لذلك الحركة غير منتظمة.',
  },
};

const round = value => Math.round(value * 100) / 100;
const fmt = value => Number(round(value).toFixed(2));
const button = (action, label, pressed = false, className = '') => `<button type="button" class="lab-button ${className}" data-lab-action="${action}" ${pressed !== null ? `aria-pressed="${pressed}"` : ''}>${label}</button>`;

function labTabs() {
  return `<div class="lab-tabs" aria-label="تجارب المختبر">
    ${button('tab-reference', '1 · الجسم المرجع', state.active === 'reference', 'lab-tab')}
    ${button('tab-path', '2 · تتبع المسار', state.active === 'path', 'lab-tab')}
    ${button('tab-graph', '3 · الزمن والموضع', state.active === 'graph', 'lab-tab')}
  </div>`;
}

function timeControls(kind, time, max, playing, step = 0.1) {
  return `<div class="time-controls">
    ${button(`${kind}-play`, playing ? 'إيقاف مؤقت' : 'تشغيل', playing, 'lab-play')}
    ${button(`${kind}-reset`, 'إعادة إلى البداية', null, 'lab-reset')}
    <label for="${kind}-time">الزمن: <strong>${fmt(time)} ثانية</strong></label>
    <input id="${kind}-time" data-lab-input="${kind}-time" type="range" min="0" max="${max}" step="${step}" value="${time}" aria-valuetext="${fmt(time)} ثانية">
    <div class="range-ends"><span>0</span><span>${max} ثوان</span></div>
  </div>`;
}

function referenceScene() {
  const time = state.referenceTime;
  const busX = 155 + time * 62;
  const signX = 90;
  const bOffset = 112;
  const distance = 20 + 5 * time;
  const descriptions = {
    sign: 'الشاخصة المرورية', driver: 'سائق الحافلة', passenger: 'الراكب A',
  };
  const moving = state.reference === 'sign';
  return `<section class="lab-panel" aria-label="تجربة تغيير الجسم المرجعي">
    <div class="lab-goal"><strong>هدف التجربة:</strong> اكتشف لماذا يتغيّر وصف الراكب B عندما يتغيّر الجسم المرجع.</div>
    <div class="lab-instructions"><strong>جرّب:</strong> اختر مرجعاً، ثم حرّك الزمن ولاحظ بُعد الراكب B عن المرجع. اضغط «تشغيل» أو استعمل المنزلق خطوة خطوة.</div>
    <div class="reference-controls"><label for="reference-select">أقارن الراكب B بـ:</label><select id="reference-select" data-lab-input="reference">
      <option value="sign" ${state.reference === 'sign' ? 'selected' : ''}>الشاخصة المرورية</option><option value="driver" ${state.reference === 'driver' ? 'selected' : ''}>سائق الحافلة</option><option value="passenger" ${state.reference === 'passenger' ? 'selected' : ''}>الراكب A</option>
    </select></div>
    <div class="lab-scene"><svg viewBox="0 0 700 280" role="img" aria-label="حافلة تتحرك بالنسبة إلى شاخصة، والراكب B ثابت داخلها" dir="ltr">
      <rect x="0" y="190" width="700" height="60" fill="#dce5ef"/><line x1="0" y1="220" x2="700" y2="220" class="road-dashes"/>
      <g class="${state.reference === 'sign' ? 'reference-highlight' : ''}"><line x1="${signX}" y1="105" x2="${signX}" y2="190" class="sign-post"/><circle cx="${signX}" cy="82" r="35" fill="#fff" stroke="#d94b4b" stroke-width="8"/><line x1="${signX - 20}" y1="82" x2="${signX + 20}" y2="82" stroke="#d94b4b" stroke-width="8"/><text x="${signX}" y="142" class="svg-label" text-anchor="middle">شاخصة</text></g>
      <g transform="translate(${busX} 78)"><rect x="0" y="0" width="190" height="105" rx="25" fill="#ef6c52"/><rect x="20" y="16" width="132" height="43" rx="6" fill="#d8f0f6"/><rect x="153" y="17" width="25" height="60" rx="4" fill="#d8f0f6"/>
      <g class="${state.reference === 'passenger' ? 'reference-highlight' : ''}"><circle cx="43" cy="37" r="9" fill="#39445c"/><text x="43" y="75" class="svg-label" text-anchor="middle">A</text></g>
      <circle cx="112" cy="37" r="9" fill="#39445c"/><text x="112" y="75" class="svg-label bus-b" text-anchor="middle">B</text>
      <g class="${state.reference === 'driver' ? 'reference-highlight' : ''}"><circle cx="163" cy="39" r="8" fill="#39445c"/><text x="163" y="100" class="svg-label" text-anchor="middle">سائق</text></g>
      <circle cx="45" cy="105" r="22" fill="#344055"/><circle cx="45" cy="105" r="9" fill="#cbd5e1"/><circle cx="148" cy="105" r="22" fill="#344055"/><circle cx="148" cy="105" r="9" fill="#cbd5e1"/></g>
      <line x1="${signX}" y1="265" x2="${busX + bOffset}" y2="265" class="distance-line"/><text x="${(signX + busX + bOffset) / 2}" y="258" class="svg-label" text-anchor="middle">البُعد عن الشاخصة: ${fmt(distance)} m</text>
    </svg></div>
    ${timeControls('reference', time, 6, state.referencePlaying)}
    <div class="measurement-grid"><div><span>المرجع المختار</span><strong>${descriptions[state.reference]}</strong></div><div><span>وصف الراكب B</span><strong class="${moving ? 'moving' : 'resting'}">${moving ? 'متحرك' : 'ساكن'}</strong></div><div><span>بُعد B عن السائق</span><strong>ثابت داخل الحافلة</strong></div></div>
    <div class="table-scroll" tabindex="0"><table><caption>قياسات التجربة الحالية</caption><thead><tr><th>الزمن</th><th>بُعد B عن الشاخصة</th><th>بُعد B عن السائق</th><th>الوصف بالنسبة إلى ${descriptions[state.reference]}</th></tr></thead><tbody><tr><td>${formula(`${fmt(time)}\\,\\mathrm{s}`)}</td><td>${formula(`${fmt(distance)}\\,\\mathrm{m}`)}</td><td>لا يتغيّر</td><td><strong>${moving ? 'متحرك' : 'ساكن'}</strong></td></tr></tbody></table></div>
    <div class="inference"><h3>استنتج</h3><p>هل يمكن أن يكون الراكب B ساكناً بالنسبة إلى السائق ومتحركاً بالنسبة إلى الشاخصة في الزمن نفسه؟</p><div class="answer-options">${button('ref-answer-yes', 'نعم، لأن المرجع مختلف', state.referenceAnswer === 'نعم، لأن المرجع مختلف', 'answer-option')}${button('ref-answer-no', 'لا، الوصف واحد دائماً', state.referenceAnswer === 'لا، الوصف واحد دائماً', 'answer-option')}</div>
    ${state.referenceAnswer ? `<div class="answer-feedback ${state.referenceAnswer.startsWith('نعم') ? 'correct' : 'incorrect'}" role="status"><strong>${state.referenceAnswer.startsWith('نعم') ? 'استنتاج صحيح.' : 'أعد التجربة وغيّر المرجع.'}</strong><p>الحركة والسكون مفهومان نسبيان. يتغيّر الوصف لأن بُعد B ثابت بالنسبة إلى السائق ومتغيّر بالنسبة إلى الشاخصة.</p></div>` : ''}</div>
  </section>`;
}

function pathPoint(type, time) {
  const ratio = time / 6;
  if (type === 'straight') return { x: 75 + ratio * 320, y: 165 };
  if (type === 'circular') {
    const angle = -Math.PI / 2 + ratio * Math.PI * 2;
    return { x: 230 + 100 * Math.cos(angle), y: 125 + 100 * Math.sin(angle) };
  }
  return { x: 70 + ratio * 330, y: 180 - 115 * Math.sin(Math.PI * ratio) };
}

function pathScene() {
  const type = state.pathType;
  const point = pathPoint(type, state.pathTime);
  const paths = { straight: 'M75 165 H395', circular: 'M230 25 A100 100 0 1 1 229.9 25', curved: 'M70 180 Q235 -40 400 180' };
  const names = { straight: 'مستقيم', circular: 'دائري', curved: 'منحنٍ' };
  const answer = state.pathAnswers[type];
  return `<section class="lab-panel" aria-label="تجربة تتبع المسار وتصنيفه">
    <div class="lab-goal"><strong>هدف التجربة:</strong> تتبّع النقاط التي يمر بها الجسم، ثم صنّف المسار.</div>
    <div class="lab-instructions"><strong>جرّب:</strong> اختر حركة، وشغّلها أو غيّر الزمن. الخط الداكن هو الجزء الذي تم تتبعه حتى اللحظة الحالية.</div>
    <div class="lab-choice-row" aria-label="اختر الحركة">${Object.keys(paths).map(key => button(`path-mode-${key}`, key === 'straight' ? 'سيارة على طريق' : key === 'circular' ? 'عجلة دوارة' : 'كرة في مسار قوسي', type === key, 'lab-mode')).join('')}</div>
    <div class="lab-scene path-lab-scene"><svg viewBox="0 0 460 250" role="img" aria-label="تتبع ${names[type]} حتى الزمن ${fmt(state.pathTime)}" dir="ltr">
      <path d="${paths[type]}" class="path-guide"/><path d="${paths[type]}" pathLength="100" class="path-trace" stroke-dasharray="${(state.pathTime / 6) * 100} 100"/>
      <circle cx="${point.x}" cy="${point.y}" r="15" class="moving-object"/><circle cx="${point.x}" cy="${point.y}" r="5" fill="#fff"/>
    </svg></div>
    ${timeControls('path', state.pathTime, 6, state.pathPlaying)}
    <div class="table-scroll" tabindex="0"><table><caption>موضع النقطة على شاشة المخطط — وحدات الرسم وليست قياسات فيزيائية</caption><thead><tr><th>الزمن</th><th>الإحداثي الأفقي</th><th>الإحداثي الرأسي</th><th>عدد المسارات المتتبعة</th></tr></thead><tbody><tr><td>${formula(`${fmt(state.pathTime)}\\,\\mathrm{s}`)}</td><td>${fmt(point.x)}</td><td>${fmt(point.y)}</td><td>مسار واحد متصل</td></tr></tbody></table></div>
    <div class="inference"><h3>صنّف ثم استنتج</h3><p>ما شكل مجموعة النقاط التي مر بها الجسم؟</p><div class="answer-options">${Object.entries(names).map(([key, name]) => button(`path-answer-${key}`, name, answer === name, 'answer-option')).join('')}</div>
    ${answer ? `<div class="answer-feedback ${answer === names[type] ? 'correct' : 'incorrect'}" role="status"><strong>${answer === names[type] ? 'تصنيف صحيح.' : `انظر إلى أثر النقطة مرة أخرى؛ المسار ${names[type]}.`}</strong><p>المسار هو مجموعة النقاط التي يمر بها الجسم خلال حركته. هنا الأثر المتصل ${names[type]}.</p></div>` : ''}</div>
  </section>`;
}

function graphScene() {
  const config = graphConfigs[state.graphMode];
  const time = Math.min(state.graphTime, config.max);
  const position = config.position(time);
  const initial = config.position(0);
  const distance = Math.abs(position - initial);
  const speed = time > 0 ? distance / time : null;
  const answer = state.graphAnswers[state.graphMode];
  const currentRow = Math.round(time);
  return `<section class="lab-panel" aria-label="تجربة الزمن والموضع والرسم البياني">
    <div class="lab-goal"><strong>هدف التجربة:</strong> اقرأ الموضع والمسافة والزمن معاً، ولاحظ كيف يتزامن الجدول مع الرسم والسرعة الوسطية.</div>
    <div class="lab-instructions"><strong>جرّب:</strong> اختر حالة، ثم غيّر الزمن. النقطة البرتقالية هي القراءة الحالية. في هذه الحالات الحركة إما ساكنة أو على خط مستقيم باتجاه واحد، لذلك ${formula('d=|x-x_0|')}.</div>
    <div class="lab-choice-row" aria-label="اختر حالة الحركة">${Object.entries(graphConfigs).map(([key, item]) => button(`graph-mode-${key}`, item.label, state.graphMode === key, 'lab-mode')).join('')}</div>
    <div class="simulation-source">${state.graphMode === 'rest' ? 'قيمة البُعد من رسم السكون في الكتاب.' : 'النقاط مأخوذة من رسوم الكتاب؛ الحركة بين النقاط استيفاء للمحاكاة.'}</div>
    <div class="lab-graph-layout">${motionGraph({ id: `lab-${state.graphMode}`, title: config.label, description: config.description, points: config.points, xMax: config.max, yMax: config.yMax, xStep: 1, yStep: config.yStep, currentTime: time, curved: config.curved || false, ySymbol: 'x' })}
    <div class="live-measurements"><h3>القراءة الحالية</h3><dl><div><dt>الزمن ${formula('t')}</dt><dd>${formula(`${fmt(time)}\\,\\mathrm{s}`)}</dd></div><div><dt>الموضع ${formula('x')}</dt><dd>${formula(`${fmt(position)}\\,\\mathrm{m}`)}</dd></div><div><dt>المسافة من نقطة البدء ${formula('d')}</dt><dd>${formula(`${fmt(distance)}\\,\\mathrm{m}`)}</dd></div></dl><h4>السرعة الوسطية من البداية</h4>${speed === null ? '<p>اختر زمناً أكبر من صفر لحساب السرعة الوسطية.</p>' : formula(`v_{avg}=\\frac{${fmt(distance)}}{${fmt(time)}}=${fmt(speed)}\\,\\mathrm{m}\\cdot\\mathrm{s}^{-1}`, { display: true })}</div></div>
    ${timeControls('graph', time, config.max, state.graphPlaying, 0.1)}
    <div class="table-scroll" tabindex="0" role="region" aria-label="جدول بيانات المحاكاة"><table><caption>الجدول يتغير مع الحالة، والسطر الملوّن يقابل أقرب ثانية إلى القراءة الحالية</caption><thead><tr><th>${formula('t\\,(s)')}</th><th>الموضع ${formula('x\\,(m)')}</th><th>المسافة من البدء ${formula('d\\,(m)')}</th><th>المسافة في الثانية الأخيرة</th></tr></thead><tbody>${config.points.map(([sampleTime, samplePosition], index, array) => {
      const previous = index ? array[index - 1][1] : samplePosition;
      const intervalDistance = index ? Math.abs(samplePosition - previous) : 0;
      return `<tr class="${index === currentRow ? 'current-data-row' : ''}"><td>${formula(String(sampleTime))}</td><td>${formula(String(samplePosition))}</td><td>${formula(String(Math.abs(samplePosition - initial)))}</td><td>${index ? formula(String(intervalDistance)) : '—'}</td></tr>`;
    }).join('')}</tbody></table></div>
    <div class="inference"><h3>لاحظ واستنتج</h3><p>${config.question}</p><div class="answer-options">${['متساوية', 'غير متساوية', 'تبقى صفراً'].map(option => button(`graph-answer-${option}`, option, answer === option, 'answer-option')).join('')}</div>
    ${answer ? `<div class="answer-feedback ${answer === config.answer ? 'correct' : 'incorrect'}" role="status"><strong>${answer === config.answer ? 'استنتاج صحيح.' : `الإجابة الأدق: ${config.answer}.`}</strong><p>${config.explanation}</p></div>` : ''}</div>
  </section>`;
}

function labMarkup() {
  return `<div class="lab-header"><span class="lab-badge">نشاط إثرائي تفاعلي</span><h2>مختبر الحركة والسكون</h2><p>ثلاث تجارب، ولكل تجربة هدف وملاحظة واستنتاج. لا تبدأ الحركة تلقائياً، ويمكن استعمال المنزلق مع تقليل الحركة.</p></div>${labTabs()}${state.active === 'reference' ? referenceScene() : state.active === 'path' ? pathScene() : graphScene()}`;
}

export function motionLabShell() {
  return '<div id="motion-lab" class="motion-lab"></div>';
}

export function mountMotionLab(root) {
  let timer = null;
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
    state.referencePlaying = false;
    state.pathPlaying = false;
    state.graphPlaying = false;
  };
  const draw = (focusSelector = '') => {
    root.innerHTML = labMarkup();
    if (focusSelector) root.querySelector(focusSelector)?.focus({ preventScroll: true });
  };
  const tick = () => {
    const key = state.active === 'reference' ? 'referenceTime' : state.active === 'path' ? 'pathTime' : 'graphTime';
    const playingKey = state.active === 'reference' ? 'referencePlaying' : state.active === 'path' ? 'pathPlaying' : 'graphPlaying';
    const max = state.active === 'graph' ? graphConfigs[state.graphMode].max : 6;
    state[key] = round(Math.min(max, state[key] + 0.1));
    if (state[key] >= max) stop();
    draw(`[data-lab-action="${state.active}-play"]`);
  };
  const setPlaying = playing => {
    stop();
    const playingKey = state.active === 'reference' ? 'referencePlaying' : state.active === 'path' ? 'pathPlaying' : 'graphPlaying';
    state[playingKey] = playing;
    if (playing) timer = setInterval(tick, 100);
  };

  const clickHandler = event => {
    const control = event.target.closest('[data-lab-action]');
    if (!control || !root.contains(control)) return;
    const action = control.dataset.labAction;
    if (action.startsWith('tab-')) {
      stop();
      state.active = action.slice(4);
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.endsWith('-play')) {
      const playingKey = `${state.active}Playing`;
      const timeKey = `${state.active}Time`;
      const max = state.active === 'graph' ? graphConfigs[state.graphMode].max : 6;
      if (state[timeKey] >= max) state[timeKey] = 0;
      setPlaying(!state[playingKey]);
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.endsWith('-reset')) {
      stop();
      state[`${state.active}Time`] = 0;
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('path-mode-')) {
      stop();
      state.pathType = action.replace('path-mode-', '');
      state.pathTime = 0;
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('graph-mode-')) {
      stop();
      state.graphMode = action.replace('graph-mode-', '');
      state.graphTime = 0;
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('ref-answer-')) {
      state.referenceAnswer = action === 'ref-answer-yes' ? 'نعم، لأن المرجع مختلف' : 'لا، الوصف واحد دائماً';
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('path-answer-')) {
      const key = action.replace('path-answer-', '');
      const names = { straight: 'مستقيم', circular: 'دائري', curved: 'منحنٍ' };
      state.pathAnswers[state.pathType] = names[key];
      draw(`[data-lab-action="${action}"]`);
      return;
    }
    if (action.startsWith('graph-answer-')) {
      state.graphAnswers[state.graphMode] = action.replace('graph-answer-', '');
      draw(`[data-lab-action="${action}"]`);
    }
  };

  const inputHandler = event => {
    const control = event.target.closest('[data-lab-input]');
    if (!control) return;
    const action = control.dataset.labInput;
    if (action === 'reference') {
      state.reference = control.value;
    } else if (action.endsWith('-time')) {
      stop();
      const kind = action.replace('-time', '');
      state[`${kind}Time`] = Number(control.value);
    }
    draw(`[data-lab-input="${action}"]`);
  };

  root.addEventListener('click', clickHandler);
  root.addEventListener('input', inputHandler);
  root.addEventListener('change', inputHandler);
  draw();
  return () => { stop(); root.removeEventListener('click', clickHandler); root.removeEventListener('input', inputHandler); root.removeEventListener('change', inputHandler); };
}
