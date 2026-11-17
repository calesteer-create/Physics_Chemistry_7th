import katex from "katex";

/**
 * منظومة الرياضيات المشتركة:
 * - كل معادلة/كسر يُعرض عبر KaTeX باتجاه LTR ومعزول عن RTL.
 * - الكسور الرياضية عمودية دائمًا عبر \frac{a}{b}.
 * - الوحدات المركبة مثل m/s تبقى خطية.
 * - الكمية الفيزيائية: الرقم أولًا ثم الوحدة إلى يمينه.
 * - يدعم أيضًا إدراج KaTeX داخل SVG عبر foreignObject لاستخدامه في الرسومات.
 */

export function renderTeXToHtml(children: string, block = false) {
  return katex.renderToString(children, {
    throwOnError: false,
    displayMode: block,
    strict: false,
    output: "html",
  });
}

export function TeX({ children, block = false }: { children: string; block?: boolean }) {
  const html = renderTeXToHtml(children, block);
  if (block) {
    return <div dir="ltr" className="tex-box text-center text-[#d9ecff]" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span dir="ltr" className="tex-inline" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** كمية فيزيائية: قيمة + وحدة باتجاه LTR — الرقم أولًا ثم الوحدة يمينه. */
export function Q({ v, u }: { v: string; u?: string }) {
  return (
    <span dir="ltr" className="tex-inline whitespace-nowrap font-bold text-[#bfe9ff]">
      <span>{v}</span>
      {u ? <span className="ml-1 text-[#8fd4ec]">{u}</span> : null}
    </span>
  );
}

/**
 * KaTeX داخل SVG:
 * يُستخدم لتسميات المحاور والرموز داخل الرسومات العلمية.
 */
export function SvgTeX({
  tex,
  x,
  y,
  width,
  height,
  align = "center",
  color = "currentColor",
  block = false,
  fontSize = "13px"
}: {
  tex: string;
  x: number;
  y: number;
  width: number;
  height: number;
  align?: "start" | "center" | "end";
  color?: string;
  block?: boolean;
  fontSize?: string;
}) {
  // استخدام التنسيق المباشر لتفادي أخطاء الهروب في السلاسل النصية
  const html = katex.renderToString(tex, {
    throwOnError: false,
    displayMode: block,
    output: "html",
  });
  
  const justifyContent = align === "start" ? "flex-start" : align === "end" ? "flex-end" : "center";

  return (
    <foreignObject x={x} y={y} width={width} height={height}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent,
          color,
          fontSize,
          lineHeight: 1,
          overflow: "visible",
          whiteSpace: "nowrap"
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </foreignObject>
  );
}
