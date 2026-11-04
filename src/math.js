// Reusable math helpers. Output is LTR and isolated from the RTL page.
import katex from 'katex';

const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Renders a LaTeX expression with KaTeX. Set display: true for a separate block
// (vertical fractions). Invalid input is shown as plain text instead of breaking the page.
export function formula(tex, { display = false } = {}) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore' });
  return `<div class="formula ${display ? 'formula-display' : 'formula-inline'}" dir="ltr">${html}</div>`;
}

// A number followed by its unit, always in LTR order: "12 cm".
export function quantity(value, unit) {
  return `<span class="quantity" dir="ltr"><bdi>${escapeHtml(value)}</bdi> <bdi class="unit">${escapeHtml(unit)}</bdi></span>`;
}
