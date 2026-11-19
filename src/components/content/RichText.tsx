import type { Rich } from "@/content/types";
import { AutoTex, Q, TeX } from "@/components/math/TeX";

/**
 * يعرض مقطعًا نصيًا غنيًا: نص عربي RTL (يمرّ عبر AutoTex فيُعزل كل قيمة
 * أو وحدة أو رمز علمي إلى KaTeX دون قلب اتجاه الفقرة) مع معادلات KaTeX
 * وكميات LTR معزولة داخل السطر.
 */
export function RichText({ rich }: { rich: Rich }) {
  return (
    <>
      {rich.map((seg, i) => {
        if ("tex" in seg) return <TeX key={i}>{seg.tex}</TeX>;
        if ("q" in seg) return <Q key={i} v={seg.q.v} u={seg.q.u} />;
        return <AutoTex key={i} text={seg.t} />;
      })}
    </>
  );
}
