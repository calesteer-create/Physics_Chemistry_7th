// مكوّنات KaTeX موحدة: اتجاه LTR، عزل ثنائي الاتجاه، ومعالجة آمنة للأخطاء.
import katex from 'katex';

// لا تظهر أوامر LaTeX الخام للطالب عند وجود خطأ.
export function formula(tex, { display = false, label = '' } = {}) {
  const tag = display ? 'div' : 'span';
  try {
    // الوضع الافتراضي htmlAndMathml يحفظ قراءة المعادلة لقارئات الشاشة.
    const html = katex.renderToString(String(tex), {
      displayMode: display,
      throwOnError: true,
      strict: 'ignore',
    });
    return `<${tag} class="formula ${display ? 'formula-display' : 'formula-inline'}" dir="ltr" ${label ? `aria-label="${label}"` : ''}>${html}</${tag}>`;
  } catch {
    return `<${tag} class="formula math-fallback ${display ? 'formula-display' : 'formula-inline'}" dir="rtl" role="alert">تعذّر عرض المعادلة.</${tag}>`;
  }
}

// عدد ثم وحدة، وكلاهما داخل KaTeX. unitTex صيغة LaTeX آمنة مكتوبة في المحتوى.
export function quantity(valueTex, unitTex) {
  return formula(`${valueTex}\\,${unitTex}`);
}

export const units = {
  metre: '\\mathrm{m}',
  kilometre: '\\mathrm{km}',
  second: '\\mathrm{s}',
  minute: '\\mathrm{min}',
  hour: '\\mathrm{h}',
  metrePerSecond: '\\mathrm{m}\\cdot\\mathrm{s}^{-1}',
  kilometrePerHour: '\\mathrm{km}\\cdot\\mathrm{h}^{-1}',
  celsius: '^\\circ\\mathrm{C}',
  // وحدات درس القوة والحركة (إضافة لا تغيّر وحدات الدرس الأول).
  newton: '\\mathrm{N}',
  kilogram: '\\mathrm{kg}',
  gram: '\\mathrm{g}',
  centimetre: '\\mathrm{cm}',
  newtonPerKilogram: '\\mathrm{N}\\cdot\\mathrm{kg}^{-1}',
  metrePerSquareSecond: '\\mathrm{m}\\cdot\\mathrm{s}^{-2}',
};
