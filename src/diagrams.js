// رسوم SVG تعليمية قابلة لإعادة الاستخدام بدلاً من صور ثابتة للمعادلات أو الجداول.
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export function motionGraph({
  id, title, description, points, xMax, yMax, xStep = 1, yStep = 10,
  currentTime = null, curved = false, compact = false, ySymbol = 'd',
}) {
  const width = 580;
  const height = compact ? 290 : 340;
  const left = 66;
  const right = 540;
  const top = 26;
  const bottom = height - 58;
  const plotHeight = bottom - top;
  const plotWidth = right - left;
  const sx = value => left + (value / xMax) * plotWidth;
  const sy = value => bottom - (value / yMax) * plotHeight;
  const xTicks = [];
  const yTicks = [];
  for (let value = 0; value <= xMax + 0.0001; value += xStep) xTicks.push(value);
  for (let value = 0; value <= yMax + 0.0001; value += yStep) yTicks.push(value);
  const sampled = curved
    ? Array.from({ length: 61 }, (_, index) => {
      const time = (index / 60) * xMax;
      // البيانات الكتابية المنحنية هنا d=t²؛ الاستيفاء بين النقاط لبقية الاستخدامات.
      if (points.length === 5 && points.every((point, index2) => point[0] === index2 && point[1] === index2 ** 2)) return [time, time ** 2];
      const nextIndex = points.findIndex(point => point[0] >= time);
      if (nextIndex <= 0) return points[0];
      if (nextIndex === -1) return points.at(-1);
      const a = points[nextIndex - 1];
      const b = points[nextIndex];
      const ratio = (time - a[0]) / (b[0] - a[0]);
      return [time, a[1] + ratio * (b[1] - a[1])];
    })
    : points;
  const interpolate = time => {
    if (curved && points.length === 5 && points.every((point, index) => point[0] === index && point[1] === index ** 2)) return [time, time ** 2];
    const nextIndex = sampled.findIndex(point => point[0] >= time);
    if (nextIndex <= 0) return sampled[0];
    if (nextIndex === -1) return sampled.at(-1);
    const a = sampled[nextIndex - 1];
    const b = sampled[nextIndex];
    const ratio = (time - a[0]) / (b[0] - a[0]);
    return [time, a[1] + ratio * (b[1] - a[1])];
  };
  const current = currentTime === null ? null : interpolate(currentTime);
  const visible = currentTime === null ? sampled : [...sampled.filter(point => point[0] < currentTime), current];
  const path = visible.map((point, index) => `${index ? 'L' : 'M'}${sx(point[0]).toFixed(2)},${sy(point[1]).toFixed(2)}`).join(' ');

  return `<figure class="graph-figure${compact ? ' graph-compact' : ''}">
    <svg class="motion-graph" data-graph-id="${id}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" dir="ltr">
      <title id="${id}-title">${esc(title)}</title><desc id="${id}-desc">${esc(description)}</desc>
      <rect x="${left}" y="${top}" width="${plotWidth}" height="${plotHeight}" rx="8" fill="#f8fbff"/>
      ${xTicks.map(value => `<g><line x1="${sx(value)}" y1="${top}" x2="${sx(value)}" y2="${bottom}" class="graph-grid"/><text x="${sx(value)}" y="${bottom + 25}" class="graph-tick" text-anchor="middle">${Number(value.toFixed(2))}</text></g>`).join('')}
      ${yTicks.map(value => `<g><line x1="${left}" y1="${sy(value)}" x2="${right}" y2="${sy(value)}" class="graph-grid"/><text x="${left - 12}" y="${sy(value) + 5}" class="graph-tick" text-anchor="end">${Number(value.toFixed(2))}</text></g>`).join('')}
      <line x1="${left}" y1="${bottom}" x2="${right + 8}" y2="${bottom}" class="graph-axis"/>
      <line x1="${left}" y1="${bottom}" x2="${left}" y2="${top - 8}" class="graph-axis"/>
      <text x="${right}" y="${height - 8}" class="graph-label" text-anchor="end">t (s)</text>
      <text x="${left - 42}" y="${top - 8}" class="graph-label" text-anchor="start">${esc(ySymbol)} (m)</text>
      <path d="${path}" class="graph-line"/>
      ${points.filter(point => currentTime === null || point[0] <= currentTime + 0.0001).map(point => `<circle cx="${sx(point[0])}" cy="${sy(point[1])}" r="5" class="graph-point"><title>t=${point[0]}, value=${point[1]}</title></circle>`).join('')}
      ${current ? `<circle cx="${sx(current[0])}" cy="${sy(current[1])}" r="9" class="graph-current"><title>القيمة الحالية</title></circle>` : ''}
    </svg>
  </figure>`;
}

export function pathSketch(type, { id = `path-${type}`, showObject = true } = {}) {
  const paths = {
    straight: 'M70 160 H390',
    circular: 'M230 45 A115 115 0 1 1 229.9 45',
    curved: 'M65 190 Q125 35 230 125 T405 70',
  };
  const labels = { straight: 'مسار مستقيم', circular: 'مسار دائري', curved: 'مسار منحنٍ' };
  return `<svg class="path-sketch" viewBox="0 0 460 250" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${labels[type]}</title>
    <path d="${paths[type]}" class="path-guide"/>
    ${showObject ? `<circle cx="${type === 'straight' ? 390 : type === 'circular' ? 230 : 405}" cy="${type === 'straight' ? 160 : type === 'circular' ? 45 : 70}" r="14" class="path-object"/>` : ''}
  </svg>`;
}

export function miniComparisonGraph(kind) {
  const configs = {
    rest: { points: [[0, 5], [7, 5]], xMax: 7, yMax: 10, title: 'خط أفقي: الجسم ساكن بالنسبة إلى المرجع', ySymbol: 'x' },
    uniform: { points: [[0, 30], [6, 90]], xMax: 6, yMax: 100, title: 'خط مستقيم: حركة منتظمة', ySymbol: 'x' },
    changing: { points: [[0, 0], [1, 1], [2, 4], [3, 9], [4, 16]], xMax: 4, yMax: 18, title: 'خط منحنٍ: حركة غير منتظمة', curved: true },
  };
  const config = configs[kind];
  return motionGraph({ id: `mini-${kind}`, description: config.title, xStep: 1, yStep: kind === 'uniform' ? 20 : kind === 'changing' ? 3 : 2, compact: true, ...config });
}

// رسوم درس القوة والحركة: تمثيل القوة على محاور، وسيارة مع أسهم القوى، وربيعة، وكرة معلقة.
const arrowHead = (x1, y1, x2, y2, size = 13) => {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const wing = 0.42;
  const pointA = [x2 - size * Math.cos(angle - wing), y2 - size * Math.sin(angle - wing)];
  const pointB = [x2 - size * Math.cos(angle + wing), y2 - size * Math.sin(angle + wing)];
  return `${pointA[0].toFixed(1)},${pointA[1].toFixed(1)} ${x2},${y2} ${pointB[0].toFixed(1)},${pointB[1].toFixed(1)}`;
};

const forceArrow = ({ x1, y1, x2, y2, color = '#dc2626', label, labelDx = 0, labelDy = -12 }) => `
  <g class="force-arrow"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="7" stroke-linecap="round"/>
  <polygon points="${arrowHead(x1, y1, x2, y2)}" fill="${color}"/>
  ${label ? `<text x="${(x1 + x2) / 2 + labelDx}" y="${(y1 + y2) / 2 + labelDy}" class="svg-label" text-anchor="middle" font-style="italic">${label}</text>` : ''}</g>`;

// رسم «تمثيل القوة» ص21: محاور xx'، نقطة التأثير O، جهة القوة B، والشدة تحت السهم.
export function forceVectorDiagram({ id = 'force-vector' } = {}) {
  return `<svg class="force-vector-figure" viewBox="0 0 640 200" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">تمثيل القوة بشعاع OB على المحاور: نقطة التأثير O على المحور، والجهة B، والشدة تحت السهم</title>
    <line x1="14" y1="110" x2="626" y2="110" class="vector-axis"/>
    <text x="30" y="80" class="vector-tick" font-style="italic">x'</text>
    <text x="606" y="80" class="vector-tick" font-style="italic">x</text>
    ${forceArrow({ x1: 250, y1: 110, x2: 450, y2: 110 })}
    <circle cx="250" cy="110" r="6" fill="#dc2626"/>
    <text x="250" y="62" class="svg-label" text-anchor="middle">نقطة التأثير O</text>
    <text x="470" y="62" class="svg-label" text-anchor="middle">جهة القوة B</text>
    <line x1="250" y1="158" x2="450" y2="158" stroke="#1e40af" stroke-width="3"/>
    <line x1="250" y1="151" x2="250" y2="165" stroke="#1e40af" stroke-width="3"/>
    <line x1="450" y1="151" x2="450" y2="165" stroke="#1e40af" stroke-width="3"/>
    <text x="350" y="188" class="svg-label" text-anchor="middle">الشدة</text>
  </svg>`;
}

// سيارة تُسلَّم عليها أسهم قوى (تجارب ص19–20). الاتجاه الأساسي للسيارة نحو اليسار كما في الكتاب.
export function carForceScene({ id, offset = 0, arrows = [], alt = 'سيارة مع أسهم تمثل القوى' } = {}) {
  const car = `
    <g transform="translate(${offset} 0)">
      <rect x="10" y="184" width="440" height="12" rx="6" fill="#d7e0ea"/>
      <path d="M60 184 L60 150 Q60 140 74 137 L150 122 Q162 119 178 119 L240 119 Q260 119 274 130 L316 141 Q338 145 341 158 L341 181 Q341 184 335 184 Z" fill="#3aa7dd"/>
      <path d="M158 125 L158 144 L240 144 L240 124 L182 124 Q168 124 158 125 Z" fill="#d8f0f6"/>
      <path d="M250 125 L250 144 L298 144 L272 126 L258 125 Z" fill="#d8f0f6"/>
      <circle cx="128" cy="184" r="21" fill="#344055"/><circle cx="128" cy="184" r="8" fill="#cbd5e1"/>
      <circle cx="288" cy="184" r="21" fill="#344055"/><circle cx="288" cy="184" r="8" fill="#cbd5e1"/>
    </g>`;
  return `<svg class="car-force-scene" viewBox="0 0 460 210" role="img" aria-label="${alt}" dir="ltr">
    <title>${alt}</title>
    ${car}
    ${arrows.map(arrow => forceArrow(arrow)).join('')}
  </svg>`;
}

// رباع (ميزان نابض) كما في صور الكتاب ص22 وص28. needle تقرأ من 0 إلى 4.
export function springScaleFigure({ id, needle = 1, caption = 'ربيعة قياس القوة' } = {}) {
  const ticks = [0, 1, 2, 3, 4];
  const top = 96;
  const step = 34;
  const needleY = top + needle * step;
  return `<svg class="spring-figure" viewBox="0 0 150 330" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}، مؤشر القراءة عند ${needle}</title>
    <rect x="45" y="10" width="60" height="34" rx="6" fill="#c98a4b"/>
    <line x1="75" y1="44" x2="75" y2="64" stroke="#64748b" stroke-width="5"/>
    <rect x="40" y="64" width="70" height="196" rx="16" fill="#cfd8e3" stroke="#94a3b8" stroke-width="2"/>
    <rect x="60" y="78" width="26" height="168" rx="8" fill="#fff" stroke="#94a3b8"/>
    ${ticks.map(value => `<g><line x1="60" y1="${top + value * step}" x2="86" y2="${top + value * step}" stroke="#334155" stroke-width="2"/><text x="97" y="${top + value * step + 5}" class="vector-tick">${value}</text></g>`).join('')}
    <polygon points="60,${needleY - 7} 60,${needleY + 7} 78,${needleY}" fill="#dc2626"/>
    <line x1="75" y1="260" x2="75" y2="286" stroke="#64748b" stroke-width="5"/>
    <path d="M75 286 q0 16 14 16 q12 0 12 -12" fill="none" stroke="#64748b" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

// الكرة المعلقة بالسؤال الرابع ص28: قوة الشد t نحو الأعلى وقوة الثقل w نحو الأسفل.
export function hangingBallFigure({ id = 'hanging-ball' } = {}) {
  return `<svg class="hanging-ball-figure" viewBox="0 0 170 350" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">كرة معلقة بحبل، قوة الشد t تتجه نحو الأعلى وقوة الثقل w تتجه نحو الأسفل</title>
    <rect x="10" y="16" width="150" height="10" rx="4" fill="#2563eb"/>
    <line x1="85" y1="26" x2="85" y2="90" stroke="#2563eb" stroke-width="5"/>
    ${forceArrow({ x1: 85, y1: 170, x2: 85, y2: 56, color: '#14b8a6', label: 't', labelDx: 22, labelDy: 4 })}
    ${forceArrow({ x1: 85, y1: 170, x2: 85, y2: 300, color: '#dc2626', label: 'w', labelDx: 24, labelDy: 6 })}
    <circle cx="85" cy="170" r="42" fill="#2563eb"/>
    <circle cx="70" cy="156" r="12" fill="#60a5fa" opacity="0.7"/>
  </svg>`;
}

// ————— رسوم درس «القوى على حامل واحد» (ص29–40) —————
// سهم قوة مرن يُستعمل في كل رسوم هذا الدرس، مع رأس سهم مرسوم بزاوية صحيحة.
const lessonArrow = ({ x1, y1, x2, y2, color = '#dc2626', width = 7, label = '', labelX, labelY, dash = '', opacity = 1 }) => {
  const head = 15;
  const headWing = 8.5;
  const length = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / length, uy = (y2 - y1) / length;
  const headPoints = `${x2},${y2} ${x2 - head * ux - headWing * uy},${y2 - head * uy + headWing * ux} ${x2 - head * ux + headWing * uy},${y2 - head * uy - headWing * ux}`;
  return `<g>
    <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="${opacity}"/>
    <polygon points="${headPoints}" fill="${color}" opacity="${opacity}"/>
    ${label ? `<text x="${labelX ?? (x1 + x2) / 2}" y="${labelY ?? Math.min(y1, y2) - 12}" class="svg-label" text-anchor="middle" font-style="italic">${label}</text>` : ''}
  </g>`;
};

// كتاب على طاولة تؤثر فيه قوتان أفقيّتان متعاكستان (ص29).
export function bookForcePairFigure({ id = 'book-force-pair', labelLeft = 'F₁', labelRight = 'F₂', caption = 'كتاب ساكن على طاولة، تؤثر فيه قوتان أفقيّتان متعاكستان' } = {}) {
  return `<svg class="force-pair-figure" viewBox="0 0 520 225" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    <rect x="40" y="150" width="440" height="16" rx="6" fill="#a97142"/>
    <rect x="70" y="166" width="16" height="42" rx="4" fill="#8d5b31"/>
    <rect x="430" y="166" width="16" height="42" rx="4" fill="#8d5b31"/>
    <rect x="196" y="118" width="126" height="32" rx="5" fill="#9f1239"/>
    <rect x="204" y="126" width="110" height="18" rx="3" fill="#fff7f8"/>
    ${lessonArrow({ x1: 196, y1: 134, x2: 92, y2: 134, color: '#2563eb', label: labelLeft, labelY: 112 })}
    ${lessonArrow({ x1: 322, y1: 134, x2: 426, y2: 134, color: '#dc2626', label: labelRight, labelY: 112 })}
  </svg>`;
}

// مصراعان أو شخصان يشدّان حبلاً واحداً بقوتين متعاكستين (تجربة ص30).
export function tugOfWarFigure({ id = 'tug-of-war', leftLabel = 'F₁', rightLabel = 'F₂', caption = 'شخصان يشدّان الحبل نفسه بقوتين متعاكستين على الاستقامة ذاتها' } = {}) {
  return `<svg class="tug-figure" viewBox="0 0 560 190" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    <path d="M64 132 h432" stroke="#8d5b31" stroke-width="9" stroke-linecap="round" opacity="0.55"/>
    <g fill="#22c55e"><circle cx="104" cy="72" r="17"/><rect x="88" y="92" width="32" height="42" rx="12"/><rect x="76" y="100" width="18" height="11" rx="5"/></g>
    <g fill="#3b82f6"><circle cx="456" cy="72" r="17"/><rect x="440" y="92" width="32" height="42" rx="12"/><rect x="466" y="100" width="18" height="11" rx="5"/></g>
    <path d="M124 100 q40 -14 80 0 t80 0 t80 0 t80 0 t80 0" fill="none" stroke="#7c5a3a" stroke-width="4" stroke-linecap="round"/>
    ${lessonArrow({ x1: 150, y1: 150, x2: 78, y2: 150, color: '#b45309', label: leftLabel, labelY: 178 })}
    ${lessonArrow({ x1: 410, y1: 150, x2: 482, y2: 150, color: '#dc2626', label: rightLabel, labelY: 178 })}
  </svg>`;
}

// تمثيل شعاعي لقوة واحدة على مستقيم، مع نقطة التأثير O (تطبيق ص32).
export function singleForceRayFigure({ id = 'single-force-ray', forceLabel = 'F', newton = 50, cm = 5 } = {}) {
  return `<svg class="force-ray-figure" viewBox="0 0 520 150" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">قوة واحدة على مستقيم: المبدأ النقطة O والجهة نحو اليمين وطول السهم ${cm} سنتيمتراً</title>
    <line x1="40" y1="86" x2="480" y2="86" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="96" cy="86" r="6" fill="#1e40af"/>
    <text x="96" y="66" class="svg-label" text-anchor="middle">O</text>
    ${lessonArrow({ x1: 96, y1: 86, x2: 456, y2: 86, color: '#dc2626', label: forceLabel, labelX: 276, labelY: 62 })}
    <text x="276" y="118" class="vector-tick" text-anchor="middle" dir="ltr">${cm} cm  ↔  ${newton} N</text>
  </svg>`;
}

// قوتان على حامل واحد، جهة واحدة: سهمان متراكبان من النقطة O (ص31–32).
export function sameDirectionPairFigure({ id = 'same-direction-pair', first = 20, second = 30, unit = 'N' } = {}) {
  const base = 78;
  const perUnit = 5.4;
  const x1 = base + first * perUnit;
  const x2 = base + second * perUnit;
  const y = 96;
  return `<svg class="pair-aligned-figure" viewBox="0 0 480 168" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">قوتان على حامل واحد وبجهة واحدة: ${first} و${second} نيوتن من النقطة O</title>
    <line x1="40" y1="${y}" x2="462" y2="${y}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="${base}" cy="${y}" r="6" fill="#1e40af"/>
    <text x="${base}" y="${y - 40}" class="svg-label" text-anchor="middle">O</text>
    ${lessonArrow({ x1: base, y1: y - 16, x2: x1, y2: y - 16, color: '#b45309', width: 6, label: 'F₁', labelX: (base + x1) / 2, labelY: y - 28 })}
    ${lessonArrow({ x1: base, y1: y + 22, x2: x2, y2: y + 22, color: '#2563eb', width: 6, label: 'F₂', labelX: (base + x2) / 2, labelY: y + 48 })}
  </svg>`;
}

// قوتان متعاكستان على الحامل نفسه: F₁ قوية نحو اليسار وF₂ أضعف نحو اليمين (ص33–34).
export function oppositePairFigure({ id = 'opposite-pair', left = 30, right = 20, equal = false, unit = 'N' } = {}) {
  const center = 240;
  const perUnit = 5.8;
  const leftEnd = center - (equal ? left : left) * perUnit;
  const rightEnd = center + (equal ? left : right) * perUnit;
  const y = 92;
  return `<svg class="pair-opposite-figure" viewBox="0 0 480 170" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">قوتان على الحامل نفسه بجهتين متعاكستين: ${left} نيوتن نحو اليسار و${equal ? left : right} نيوتن نحو اليمين</title>
    <line x1="30" y1="${y}" x2="450" y2="${y}" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="6 6"/>
    <circle cx="${center}" cy="${y}" r="6" fill="#1e40af"/>
    <text x="${center}" y="${y - 30}" class="svg-label" text-anchor="middle">O</text>
    ${lessonArrow({ x1: center, y1: y - 14, x2: leftEnd, y2: y - 14, color: '#b45309', width: 6, label: 'F₁', labelX: leftEnd - 6, labelY: y - 40 })}
    ${lessonArrow({ x1: center, y1: y + 20, x2: rightEnd, y2: y + 20, color: '#dc2626', width: 6, label: 'F₂', labelX: rightEnd + 8, labelY: y + 50 })}
  </svg>`;
}

// رسم محلول لمنتج قوتين على الحامل نفسه: F₁ وF₂ والمحصلة F (ص32 وص36).
export function resultantScaleFigure({ id = 'resultant-figure', rows = [], caption = 'تمثيل القوى والمحصلة بمقياس رسم', newtonPerCm = 10 } = {}) {
  const y0 = 40;
  const gap = 34;
  const base = 62;
  // كل سنتيمتر واحد في الرسم يساوي 60 بكسل، وكل سنتيمتر يمثل newtonPerCm نيوتن.
  const pxPerCm = 48;
  const rowMarkup = rows.map((row, index) => {
    const y = y0 + index * gap;
    const px = (row.newton / newtonPerCm) * pxPerCm;
    const color = row.color || '#dc2626';
    return `<g>
      <text x="16" y="${y + 5}" class="vector-tick" text-anchor="start">${row.label}</text>
      <circle cx="${base}" cy="${y}" r="4" fill="${row.marker ? '#1e40af' : 'transparent'}"/>
      ${lessonArrow({ x1: base, y1: y, x2: base + px, y2: y, color, width: 6, label: `${row.newton} N`, labelX: 415, labelY: y + 5 })}
    </g>`;
  }).join('');
  const height = 40 + Math.max(1, rows.length) * gap;
  return `<svg class="resultant-figure" viewBox="0 0 480 ${height}" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    <line x1="50" y1="14" x2="50" y2="${height - 12}" stroke="#cbd5e1" stroke-width="2"/>
    ${rowMarkup}
  </svg>`;
}

// تجربة الربيعة: تقل مؤشر الربيعة عند زيادة الثقل المعلّق بها (ص31).
export function springScaleReadingFigure({ id = 'spring-reading', first = 1, second = 2, caption = 'ربيعة تُعلَّق بها أثقال مختلفة فيتغيّر مؤشرها' } = {}) {
  const scale = (needle, x, label) => {
    const top = 84;
    const step = 30;
    return `<g transform="translate(${x} 0)">
      <rect x="0" y="0" width="58" height="22" rx="5" fill="#c98a4b"/>
      <line x1="29" y1="22" x2="29" y2="34" stroke="#64748b" stroke-width="4"/>
      <rect x="4" y="34" width="50" height="150" rx="13" fill="#cfd8e3" stroke="#94a3b8" stroke-width="2"/>
      <rect x="20" y="46" width="20" height="124" rx="6" fill="#fff" stroke="#94a3b8"/>
      ${[0, 1, 2, 3].map(value => `<line x1="20" y1="${top - 18 + value * step}" x2="40" y2="${top - 18 + value * step}" stroke="#334155" stroke-width="1.6"/>`).join('')}
      <polygon points="20,${top - 18 + needle * step - 6} 20,${top - 18 + needle * step + 6} 35,${top - 18 + needle * step}" fill="#dc2626"/>
      <line x1="29" y1="184" x2="29" y2="200" stroke="#64748b" stroke-width="4"/>
      <rect x="14" y="200" width="30" height="24" rx="4" fill="#94a3b8"/>
      <text x="29" y="240" class="vector-tick" text-anchor="middle">${label}</text>
    </g>`;
  };
  return `<svg class="spring-reading-figure" viewBox="0 0 300 250" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    ${scale(first, 96, 'w₁')}
    ${scale(second, 196, 'w₂')}
  </svg>`;
}

// مبدأ الفعل وردّ الفعل: مغناطيسان متقابلان، وبالون ينفخ الهواء (ص35).
export function actionReactionFigure({ id = 'action-reaction', mode = 'magnets' } = {}) {
  if (mode === 'balloon') {
    return `<svg class="action-reaction-figure" viewBox="0 0 300 230" role="img" aria-labelledby="${id}-title" dir="ltr">
      <title id="${id}-title">بالون ينفخ الهواء نحو الأسفل فيندفع الهواء، ويردّ الهواء على البالون بقوة نحو الأعلى</title>
      <ellipse cx="150" cy="96" rx="52" ry="62" fill="#ef4444"/>
      <path d="M138 154 l24 0 l-6 18 l-12 0 z" fill="#b91c1c"/>
      <circle cx="132" cy="196" r="8" fill="#bfdbfe"/><circle cx="150" cy="208" r="6" fill="#bfdbfe"/><circle cx="168" cy="196" r="7" fill="#bfdbfe"/>
      <g transform="translate(58 74)">${lessonArrow({ x1: 0, y1: 40, x2: 0, y2: 0, color: '#0f766e', width: 5 })}</g>
      <text x="58" y="60" class="svg-label" text-anchor="middle">ردّ الفعل</text>
      <g transform="translate(232 96)">${lessonArrow({ x1: 0, y1: 0, x2: 0, y2: 46, color: '#dc2626', width: 5 })}</g>
      <text x="232" y="176" class="svg-label" text-anchor="middle">الفعل</text>
    </svg>`;
  }
  return `<svg class="action-reaction-figure" viewBox="0 0 340 250" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">مغناطيسان متقابلان: قطب شمالي وقطب جنوبي يتجاذبان بقوتين متساويتين ومتعاكستين</title>
    <rect x="26" y="40" width="52" height="80" rx="6" fill="#dc2626"/><rect x="26" y="120" width="52" height="80" rx="6" fill="#0ea5e9"/>
    <text x="52" y="88" class="svg-label" text-anchor="middle" style="fill:#fff">S</text><text x="52" y="170" class="svg-label" text-anchor="middle" style="fill:#fff">N</text>
    <rect x="262" y="40" width="52" height="80" rx="6" fill="#dc2626"/><rect x="262" y="120" width="52" height="80" rx="6" fill="#0ea5e9"/>
    <text x="288" y="88" class="svg-label" text-anchor="middle" style="fill:#fff">S</text><text x="288" y="170" class="svg-label" text-anchor="middle" style="fill:#fff">N</text>
    ${lessonArrow({ x1: 92, y1: 96, x2: 168, y2: 96, color: '#2563eb', width: 6, label: 'F₁', labelX: 130, labelY: 74 })}
    ${lessonArrow({ x1: 248, y1: 148, x2: 172, y2: 148, color: '#dc2626', width: 6, label: 'F₂', labelX: 210, labelY: 182 })}
  </svg>`;
}

// خط أفقي لعرض مخطط القوى المتتالية على الحامل نفسه (يجمع الفريقين في ص36).
export function teamForcesFigure({ id = 'team-forces', team = 'team1', values = [], sum = 0 } = {}) {
  const dirColor = team === 'team1' ? '#b45309' : '#dc2626';
  const perUnit = 0.16;
  const base = 95;
  const y0 = 52;
  const rows = values.map((value, index) => {
    const y = y0 + index * 40;
    const px = Math.max(24, value * perUnit);
    return `<g>
      <text x="16" y="${y + 5}" class="vector-tick" text-anchor="start">${value} N</text>
      ${lessonArrow({ x1: base, y1: y, x2: base + px, y2: y, color: dirColor, width: 6 })}
    </g>`;
  }).join('');
  const sumY = y0 + values.length * 40 + 14;
  const sumPx = Math.max(24, sum * perUnit);
  return `<svg class="team-forces-figure" viewBox="0 0 470 ${sumY + 40}" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">قوى ${team === 'team1' ? 'الفريق الأول' : 'الفريق الثاني'} ومحصلتها ${sum} نيوتن</title>
    ${rows}
    <line x1="60" y1="${sumY - 16}" x2="452" y2="${sumY - 16}" stroke="#cbd5e1" stroke-width="1.5"/>
    ${lessonArrow({ x1: base, y1: sumY + 4, x2: base + sumPx, y2: sumY + 4, color: '#2563eb', width: 8 })}
    <text x="${base + sumPx + 18}" y="${sumY + 10}" class="svg-label" text-anchor="start">F = ${sum} N</text>
  </svg>`;
}

// رسم السؤال الثالث ص39: بندقية تُطلق رصاصة، والقوة المفقودة هي ردّ فعل البندقية نحو الخلف.
export function riflePerpFigure({ id = 'rifle-recoil', caption = 'بندقية تُطلق رصاصة: توجد في الرسم قوة مفقودة هي ردّ فعل البندقية نحو الخلف' } = {}) {
  return `<svg class="recoil-figure" viewBox="0 0 420 220" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    <rect x="0" y="0" width="420" height="220" rx="16" fill="#eaf6fb"/>
    <circle cx="150" cy="78" r="24" fill="#f8d3b8"/>
    <path d="M126 108 q24 -16 48 0 l10 66 h-68 z" fill="#4d7c3f"/>
    <path d="M168 112 l86 -20 l8 14 l-84 22 z" fill="#c7a06a"/>
    <rect x="248" y="88" width="72" height="12" rx="6" fill="#94a3b8"/>
    ${lessonArrow({ x1: 320, y1: 94, x2: 400, y2: 94, color: '#b45309', width: 6, label: 'الرصاصة', labelX: 360, labelY: 74 })}
    <text x="196" y="196" class="vector-tick" text-anchor="middle">أين القوة المفقودة في الرسم؟</text>
  </svg>`;
}

// كتلة معلّقة: ميزان نابض يقرأ الثقل، للاستعمال في عرض سؤال الحركة (دفع السيارة).
export function carPushFigure({ id = 'car-push', caption = 'ثلاثة أشخاص يدفعون سيارة متوقفة على طريق أفقي مستقيم' } = {}) {
  return `<svg class="car-push-figure" viewBox="0 0 520 200" role="img" aria-labelledby="${id}-title" dir="ltr">
    <title id="${id}-title">${caption}</title>
    <rect x="0" y="150" width="520" height="12" rx="6" fill="#d7e0ea"/>
    <path d="M60 150 L60 122 Q60 112 74 110 L140 98 Q152 96 166 96 L228 96 Q248 96 262 106 L300 118 Q322 122 325 134 L325 148 Q325 150 319 150 Z" fill="#3aa7dd"/>
    <path d="M150 102 L150 120 L228 120 L228 100 L172 100 Q160 100 150 102 Z" fill="#d8f0f6"/>
    <path d="M238 100 L238 120 L286 120 L262 102 L246 100 Z" fill="#d8f0f6"/>
    <circle cx="128" cy="150" r="18" fill="#344055"/><circle cx="128" cy="150" r="6" fill="#cbd5e1"/>
    <circle cx="280" cy="150" r="18" fill="#344055"/><circle cx="280" cy="150" r="6" fill="#cbd5e1"/>
    <g fill="#f8d3b8"><circle cx="356" cy="92" r="13"/><circle cx="404" cy="88" r="13"/><circle cx="452" cy="92" r="13"/></g>
    <g fill="#4d7c3f"><rect x="343" y="106" width="26" height="42" rx="10"/><rect x="391" y="102" width="26" height="46" rx="10"/><rect x="439" y="106" width="26" height="42" rx="10"/></g>
    <path d="M336 128 l-14 -10" stroke="#4d7c3f" stroke-width="7" stroke-linecap="round"/>
    ${lessonArrow({ x1: 476, y1: 168, x2: 396, y2: 168, color: '#dc2626', width: 6 })}
    <text x="436" y="190" class="vector-tick" text-anchor="middle">مجموع قوى الدفع</text>
  </svg>`;
}
