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
    <svg class="motion-graph" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-desc" dir="ltr">
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
