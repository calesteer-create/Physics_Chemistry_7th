import type { Rich } from "@/content/types";
import { TeX, Q } from "@/components/math/TeX";

/**
 * يعرض مقطعًا نصيًا غنيًا: نص عربي RTL مع معادلات KaTeX وكميات LTR
 * معزولة داخل السطر دون قلب اتجاه الفقرة.
 */
export function RichText({ rich }: { rich: Rich }) {
  return (
    <>
      {rich.map((seg, i) => {
        if ("tex" in seg) return <TeX key={i}>{seg.tex}</TeX>;
        if ("q" in seg) return <Q key={i} v={seg.q.v} u={seg.q.u} />;
        return <span key={i}>{seg.t}</span>;
      })}
    </>
  );
}
