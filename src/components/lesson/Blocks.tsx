"use client";

import type { ReactNode } from "react";
import { AlertTriangle, BookOpen, Info, Sigma } from "lucide-react";
import type { LessonBlock } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { AutoTex, TeX, unitTex } from "@/components/math/TeX";
import { FigureBlock } from "@/components/figures";
import { InlineCheck } from "./InlineCheck";

type Check = Extract<LessonBlock, { type: "check" }>;
type Law = Extract<LessonBlock, { type: "law" }>;
type DisplayBlock = Exclude<LessonBlock, Check | Law>
  | (Omit<Check, "options"> & { options: ReactNode[] })
  | (Omit<Law, "formula"> & { formula: ReactNode });

export function BookBadge() {
  return <span className="badge-book"><BookOpen className="h-3.5 w-3.5" />من الكتاب</span>;
}

export function BlockRenderer({ block }: { block: DisplayBlock }) {
  switch (block.type) {
    case "heading":
      return (<div className="mt-2">{block.book && <BookBadge />}<h3 className="mt-2 flex items-center gap-3 text-[20px] font-black text-white"><span className="h-6 w-1.5 rounded-full bg-gradient-to-b from-[var(--color-phys)] to-[var(--color-vio)]" /><AutoTex text={block.text} /></h3></div>);

    case "paragraph":
      return (<div>{block.book && <div className="mb-2"><BookBadge /></div>}<p className="text-[15.5px] leading-9 text-[#c5d8f0]"><RichText rich={block.rich} /></p></div>);

    case "definition":
      return (
        <div className="card relative overflow-hidden border-r-4 border-r-[var(--color-phys)] p-6 bg-gradient-to-br from-[rgba(60,224,244,0.06)] to-transparent">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[rgba(60,224,244,0.12)]"><BookOpen className="h-5 w-5 text-[var(--color-phys)]" /></span>
            <h4 className="text-[18px] font-black text-[#8ceeff]"><AutoTex text={block.title} /></h4>
            {block.book && <BookBadge />}
          </div>
          <p className="mt-3 text-[16px] font-bold leading-9 text-[#dce8f8]"><RichText rich={block.rich} /></p>
        </div>);

    case "law":
      return (
        <div className="card border-r-4 border-r-[var(--color-chem)] p-7 bg-gradient-to-l from-[rgba(255,176,58,0.06)] to-transparent">
          <div className="flex flex-wrap items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(255,176,58,0.15)]"><Sigma className="h-6 w-6 text-[var(--color-chem)]" /></div>
            <h4 className="text-[19px] font-black text-[#ffd08a]"><AutoTex text={block.name} /></h4>
            {block.book && <BookBadge />}
          </div>
          <div className="mt-5 rounded-2xl bg-[rgba(0,0,0,0.25)] p-6 border border-[rgba(255,176,58,0.1)]">{typeof block.formula === "string" ? <TeX block>{block.formula}</TeX> : block.formula}</div>
          {block.symbols && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {block.symbols.map(s => (
                <div key={s.sym} className="flex flex-col items-center rounded-xl bg-[rgba(255,255,255,0.03)] border border-[var(--color-line)] p-3">
                  <span className="text-[17px] font-black text-[var(--color-chem)]"><TeX>{s.sym}</TeX></span>
                  <span className="text-[12px] font-bold text-white">{s.meaning}</span>
                  <span className="text-[11px] text-[var(--color-dim)]" dir="ltr"><TeX>{unitTex(s.unit ?? "")}</TeX></span>
                </div>
              ))}
            </div>
          )}
          {block.rich && <p className="mt-4 text-[14px] font-bold leading-8 text-[#c5d8f0]"><RichText rich={block.rich} /></p>}
        </div>);

    case "example":
      return (
        <div className="card border-[rgba(167,139,250,0.2)] p-6 bg-gradient-to-br from-[rgba(167,139,250,0.04)] to-transparent">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-[var(--color-vio-lt)] px-3 py-1 text-[12px] font-black text-[var(--color-vio)]">مثال محلول</span>
            <h4 className="text-[16px] font-black text-white"><AutoTex text={block.title} /></h4>
            {block.book && <BookBadge />}
          </div>
          <ol className="mt-4 space-y-3">
            {block.steps.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[14.5px] leading-8 text-[#c5d8f0]">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--color-vio-lt)] text-[12px] font-black text-[var(--color-vio)]">{i + 1}</span>
                <span className="flex-1"><RichText rich={s} /></span>
              </li>
            ))}
          </ol>
          {block.result && <div className="mt-4 rounded-xl border border-[rgba(52,211,153,0.3)] bg-[var(--color-success-lt)] px-4 py-3 text-[14.5px] font-black text-[#6ee7b7]"><RichText rich={block.result} /></div>}
        </div>);

    case "steps":
      return (
        <div className="card p-6">
          {block.title && <h4 className="mb-4 text-[15px] font-black text-[#8ceeff]"><AutoTex text={block.title} /></h4>}
          <ol className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-[15px] leading-8 text-[#c5d8f0]">
                <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[rgba(60,224,244,0.25)] bg-[var(--color-phys-lt)] text-[12px] font-black text-[var(--color-phys)]">{i + 1}</span>
                <span className="flex-1"><RichText rich={item} /></span>
              </li>
            ))}
          </ol>
        </div>);

    case "list":
      return (<ul className="space-y-3">{block.items.map((item, i) => (<li key={i} className="flex items-start gap-3 text-[15px] leading-8 text-[#c5d8f0]"><span className="mt-3.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-phys)]" /><span className="flex-1"><RichText rich={item} /></span></li>))}</ul>);

    case "note": {
      const warn = block.tone === "warn";
      return (
        <div className={`flex items-start gap-3 rounded-2xl border px-5 py-4 ${warn ? "border-[rgba(255,176,58,0.3)] bg-[var(--color-chem-lt)]" : "border-[rgba(60,224,244,0.2)] bg-[var(--color-phys-lt)]"}`}>
          {warn ? <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[var(--color-chem)]" /> : <Info className="mt-1 h-5 w-5 shrink-0 text-[var(--color-phys)]" />}
          <p className={`text-[14px] font-bold leading-8 ${warn ? "text-[#fde68a]" : "text-[#bae6fd]"}`}><RichText rich={block.rich} /></p>
        </div>);
    }

    case "table":
      return (<div className="overflow-x-auto rounded-xl border border-[var(--color-line)]">{block.book && <div className="p-3 pb-0"><BookBadge /></div>}<table className="tbl"><thead><tr>{block.head.map(h => <th key={h}><AutoTex text={h} /></th>)}</tr></thead><tbody>{block.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}><AutoTex text={cell} /></td>)}</tr>)}</tbody></table></div>);

    case "figure": return <FigureBlock figure={block.figure} caption={block.caption} />;
    case "check": return <InlineCheck question={block.question} options={block.options} correct={block.correct} explain={block.explain} />;
    case "tex": return <TeX block>{block.formula}</TeX>;
    default: return null;
  }
}

export function Blocks({ blocks }: { blocks: DisplayBlock[] }) {
  return <div className="space-y-6">{blocks.map((b, i) => <BlockRenderer key={i} block={b} />)}</div>;
}
