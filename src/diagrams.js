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
