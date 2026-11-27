import type { FigureRef, Rich } from "@/content/types";

/**
 * محوّل نصّ عربي فيه صيغ `$…$` إلى `Rich` المعتمد في المنصّة.
 * النصّ العربي يبقى كما هو؛ الصيغ تُرسل إلى KaTeX عبر الطبقة المركزية
 * (`RichText` → `TeX`) داخل عزل LTR، فلا ينقلب ترتيب الرموز والوحدات.
 */
export function rich(text: string): Rich {
  return text
    .split(/(\$[^$]+\$)/g)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("$") && part.endsWith("$") && part.length > 2
        ? { tex: part.slice(1, -1) }
        : { t: part },
    );
}

/** مرجع رسم معاد إنتاجه رقميًا، مع توثيق صفحة الكتاب الأصلية. */
export function liquidFigure(
  id: string,
  src: string,
  alt: string,
  bookPage: number,
): FigureRef {
  return {
    id,
    kind: "svg",
    src,
    alt,
    bookPage,
    reproduction: "redrawn",
    notebook: false,
  };
}
