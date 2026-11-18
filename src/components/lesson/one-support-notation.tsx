import type { ReactNode } from "react";
import type { LessonBlock, Rich } from "@/content/types";
import { TeX } from "@/components/math/TeX";

/** Display only. In the original TS literals \v and \t became control characters,
 * and \, and \; lost their slashes. Never write these repairs back to a notebook. */
export function oneSupportTeX(source: string): string {
  return source
    .replace("\u000bec{", "\\vec{")
    .replace(";; \u0009ext{", String.raw`\;\; \text{`)
    .replace("} ; ", String.raw`} \; `)
    .replace(/(\d),N\b/g, "$1\\,\\mathrm{N}");
}

function rich(segments: Rich): Rich {
  return segments.map(s => "tex" in s ? { tex: oneSupportTeX(s.tex) } : s);
}

/** Only the existing standalone units, quantities and two plain checklist formulas. */
function inline(text: string): ReactNode {
  if (text === "N") return <TeX>{String.raw`\mathrm{N}`}</TeX>;
  const quantity = /^(\d+) N$/.exec(text);
  if (quantity) return <TeX>{`${quantity[1]}\\,\\mathrm{N}`}</TeX>;
  const law = /\bF = F[12] [+-] F[12]\b/.exec(text);
  if (!law) return text;
  return <span>{text.slice(0, law.index)}<TeX>{law[0].replace(/F([12])/g, "F_$1")}</TeX>{text.slice(law.index + law[0].length)}</span>;
}

// Keep the condition attached to its inequality, but allow it to wrap as a unit
// in the narrow notebook. Its Arabic words come from the source, not a translation.
function law(source: string) {
  const tex = oneSupportTeX(source);
  const parts = /^(.*?)\s*\\;\\;\s*\\text\{([^}]+)\}\s*\\;\s*(.+)$/.exec(tex);
  if (!parts) return <TeX block>{tex}</TeX>;
  return <div className="tex-box text-center">
    <div dir="rtl" className="flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
      <TeX>{parts[1]}</TeX>
      <span className="inline-flex flex-wrap items-baseline justify-center gap-x-1">
        <span>{parts[2]}</span><TeX>{parts[3]}</TeX>
      </span>
    </div>
  </div>;
}

export const oneSupportNotation = { law, rich, inline };

/** Prepare the math slots for display, keeping the original lesson object intact. */
export function presentOneSupportBlock(block: LessonBlock) {
  switch (block.type) {
    case "law": return { ...block, formula: law(block.formula), symbols: block.symbols?.map(s =>
      s.unit === "N" ? { ...s, unit: String.raw`\mathrm{N}` } : s) };
    case "example": return { ...block, steps: block.steps.map(rich), result: block.result && rich(block.result) };
    case "check": return { ...block, question: rich(block.question), explain: rich(block.explain), options: block.options.map(inline) };
    default: return block;
  }
}
