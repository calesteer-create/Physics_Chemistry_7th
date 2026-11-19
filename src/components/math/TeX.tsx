"use client";

/**
 * الطبقة الموحدة لعرض الصيغ العلمية عبر KaTeX في كل المنصّة:
 * - `TeX`   صيغة علمية (كتلية أو مضمّنة) — كل مسار عرض يمرّ بـ `normalizeTex`.
 * - `Q`     قيمة + وحدة كتعبير واحد `\(0.5\,\text{N}\)` بترتيب ثابت LTR
 *            لا ينقلب داخل السياق العربي.
 * - `SvgTeX` صيغ داخل SVG (تسميات الرسوم) بنفس الطبقة المركزية.
 * - `AutoTex` نصّ عربي مختلط: يعزل القيم/الوحدات/الرموز المعادلات تلقائيًا
 *            إلى `TeX` دون أن يمسّ النصّ الأصلي في ملفات المحتوى.
 */
import katex from "katex";
import { normalizeTex, unitTex } from "@/lib/tex-format";
import { splitAutoTex } from "@/lib/auto-tex";

export { normalizeTex, unitTex };

export function renderTeXToHtml(children: string, block: boolean): string {
  return katex.renderToString(normalizeTex(children), {
    throwOnError: false,
    displayMode: block,
    strict: false,
    output: "html",
  });
}

export function TeX({ children, block = false }: { children: string; block?: boolean }) {
  if (!children) return null;
  return (
    <span
      className={block ? "tex-box" : "tex-inline"}
      dir="ltr"
      dangerouslySetInnerHTML={{ __html: renderTeXToHtml(children, block) }}
    />
  );
}

/** قيمة + وحدة: `0.5 N` تُعرض صيغة واحدة بترتيب الرقم ثم الوحدة (LTR). */
export function Q({ v, u, className = "" }: { v: string; u?: string; className?: string }) {
  const tex = u ? `${v}\\,${unitTex(u)}` : v;
  return (
    <span dir="ltr" className={`whitespace-nowrap ${className}`.trim()}>
      <TeX>{tex}</TeX>
    </span>
  );
}

export function SvgTeX({ x, y, width, height, tex, align = "start", block = false, color, fontSize, title }: {
  x: number; y: number; width: number; height: number; tex: string;
  align?: "start" | "middle" | "end" | "center"; block?: boolean; color?: string; fontSize?: string; title?: string;
}) {
  if (!tex) return null;
  const justify = align === "middle" || align === "center" ? "center" : align === "end" ? "flex-end" : "flex-start";
  return (
    <foreignObject x={x} y={y} width={width} height={height} style={{ overflow: "visible" }}>
      <div
        style={{
          display: "flex", alignItems: "center",
          justifyContent: justify,
          width: "100%", height: "100%", color, fontSize,
        }}
        title={title}
        dangerouslySetInnerHTML={{ __html: renderTeXToHtml(tex, block) }}
      />
    </foreignObject>
  );
}

/**
 * مكوّن النصّ المختلط — يُستدعى على كل قطعة `t` في المنصّة (بما فيها
 * دفتر الطالب: النصّ يبقى كما هو والعرض فقط يمرّ عبر KaTeX).
 * بلا خطّافات حتى يعمل داخل مكوّنات الخادم والعميل معًا.
 */
export function AutoTex({ text }: { text: string }) {
  if (!text) return null;
  const segs = splitAutoTex(text);
  if (segs.length === 1 && segs[0].type === "text") return <>{segs[0].value}</>;
  return (
    <>
      {segs.map((seg, i) =>
        seg.type === "text" ? <span key={i}>{seg.value}</span> : <TeX key={i}>{seg.value}</TeX>,
      )}
    </>
  );
}
