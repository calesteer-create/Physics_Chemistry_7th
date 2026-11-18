import type { ReactNode } from "react";
import { CheckSquare, NotebookPen, Paintbrush, PenLine, Star, AlertOctagon } from "lucide-react";
import type { NotebookItem, Rich } from "@/content/types";
import { RichText } from "@/components/content/RichText";
import { TeX } from "@/components/math/TeX";
import { NotebookFigure } from "@/components/figures";

type NotebookNotation = {
  law: (source: string) => ReactNode;
  rich: (segments: Rich) => Rich;
  inline: (text: string) => ReactNode;
};

/**
 * «دفتر الطالب» — آخر مرحلة في كل درس.
 *
 * ليس ملخصًا إلكترونيًا؛ بل المحتوى الدراسي المنظم الجاهز ليكتبه الطالب
 * بيده في دفتره الورقي: عناوين، تعريفات كاملة، قوانين مع رموزها، رسوم
 * مطلوبة، جداول، ملاحظات، وقائمة تحقق ختامية.
 */
function NotebookItemRenderer({ item, index, notation }: { item: NotebookItem; index: number; notation?: NotebookNotation }) {
  switch (item.kind) {
    case "h1":
      return (
        <div className="border-b-2 border-[#22304a] pb-3">
          <h3 className="text-[22px] font-black text-[#152238]">
            <span className="ml-2 text-[#1d4ed8]">١.</span>
            {item.text}
          </h3>
        </div>
      );

    case "h2":
      return (
        <h4 className="flex items-center gap-2 text-[17px] font-black text-[#1d4ed8]">
          <span className="h-5 w-1 rounded-full bg-[#1d4ed8]" />
          {item.text}
        </h4>
      );

    case "write":
      return (
        <div>
          <span className="paper-tag paper-tag-write">
            <PenLine className="h-3.5 w-3.5" />
            {item.label ?? "اكتب في دفترك"}
          </span>
          <p className="mt-2.5 text-[14.5px] font-bold leading-9 text-[#22304a]">
            <RichText rich={item.rich} />
          </p>
        </div>
      );

    case "definition":
      return (
        <div className="paper-def">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[15px] font-black text-[#1d4ed8]">{item.title}</h4>
            <span className="paper-tag paper-tag-write">
              <PenLine className="h-3.5 w-3.5" />
              اكتب التعريف
            </span>
          </div>
          <p className="mt-2 text-[14.5px] font-bold leading-9 text-[#22304a]">
            <RichText rich={item.rich} />
          </p>
        </div>
      );

    case "law":
      return (
        <div className="paper-law">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-[15px] font-black text-[#0f766e]">{item.name}</h4>
            <span className="paper-tag paper-tag-draw">
              <PenLine className="h-3.5 w-3.5" />
              انسخ القانون ثم معنى كل رمز
            </span>
          </div>
          <div className="mt-3 rounded-lg bg-white/70 py-3 text-[18px]">
            {notation?.law(item.formula) ?? <TeX block>{item.formula}</TeX>}
          </div>
          {item.symbols && (
            <ul className="mt-3 space-y-1.5">
              {item.symbols.map((s) => (
                <li key={s.sym} className="flex items-center gap-2 text-[13.5px] font-bold text-[#22304a]">
                  <span className="rounded bg-white/80 px-1.5 py-0.5" dir="ltr">
                    <TeX>{s.sym}</TeX>
                  </span>
                  <span>:</span>
                  <span>{s.meaning}</span>
                  {s.unit && (
                    <span dir="ltr" className="font-black text-[#0f766e]">
                      ({notation?.inline(s.unit) ?? s.unit})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case "draw":
      return (
        <div>
          <span className="paper-tag paper-tag-draw">
            <Paintbrush className="h-3.5 w-3.5" />
            ارسم في دفترك
          </span>
          <p className="mt-2.5 text-[14.5px] font-bold leading-9 text-[#22304a]">
            <RichText rich={notation?.rich(item.instruction) ?? item.instruction} />
          </p>
          {item.figure && <NotebookFigure figure={item.figure} />}
        </div>
      );

    case "copy-table":
      return (
        <div>
          <span className="paper-tag paper-tag-write">
            <PenLine className="h-3.5 w-3.5" />
            {item.title ?? "انسخ الجدول التالي"}
          </span>
          <div className="mt-3 overflow-x-auto rounded-xl border-2 border-[#22304a]">
            <table className="w-full border-collapse text-[13.5px] font-bold text-[#22304a]">
              <thead>
                <tr>
                  {item.head.map((h) => (
                    <th key={h} className="border border-[#22304a] bg-[#22304a] px-4 py-2.5 text-white">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {item.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border border-[#22304a] px-4 py-2.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case "steps":
      return (
        <div>
          {item.title && <h4 className="mb-3 text-[15px] font-black text-[#152238]">{item.title}</h4>}
          <ol className="space-y-2.5">
            {item.items.map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-[14px] font-bold leading-8 text-[#22304a]">
                <span className="mt-1 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-lg border-2 border-[#1d4ed8] bg-white/70 px-1 text-[11px] font-black text-[#1d4ed8]">
                  {i + 1}
                </span>
                <span className="flex-1">
                  <RichText rich={s} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "important":
      return (
        <div className="paper-important">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-4.5 w-4.5 text-[#b45309]" />
            <span className="text-[13px] font-black text-[#b45309]">ملاحظة مهمة — لا تنسَ تدوينها</span>
          </div>
          <p className="mt-2 text-[14px] font-bold leading-8 text-[#22304a]">
            <RichText rich={item.rich} />
          </p>
        </div>
      );

    case "points":
      return (
        <div>
          {item.title && (
            <h4 className="mb-3 flex items-center gap-2 text-[15px] font-black text-[#152238]">
              <Star className="h-4.5 w-4.5 text-[#b98a37]" />
              {item.title}
            </h4>
          )}
          <ul className="space-y-2">
            {item.items.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14px] font-bold leading-8 text-[#22304a]">
                <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-[#b98a37]" />
                <span className="flex-1">
                  <RichText rich={p} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "checklist":
      return (
        <div className="rounded-xl border-2 border-[#22304a] bg-white/50 p-5">
          <h4 className="flex items-center gap-2 text-[15px] font-black text-[#152238]">
            <CheckSquare className="h-5 w-5 text-[#0f766e]" />
            قائمة التحقق الختامية — راجع دفترك
          </h4>
          <ul className="mt-3 space-y-2.5">
            {item.items.map((c, i) => (
              <li key={i} className="flex items-center gap-3 text-[13.5px] font-bold text-[#22304a]">
                <span className="grid h-5.5 w-5.5 shrink-0 place-items-center rounded-md border-2 border-[#0f766e] bg-white px-0.5" />
                {notation?.inline(c) ?? c}
              </li>
            ))}
          </ul>
        </div>
      );

    default:
      return null;
  }
}

export function Notebook({ items, lessonTitle, notation }: { items: NotebookItem[]; lessonTitle: string; notation?: NotebookNotation }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[rgba(230,192,122,0.35)] bg-[rgba(230,192,122,0.06)] px-5 py-4">
        <NotebookPen className="h-6 w-6 text-[var(--color-gold)]" />
        <div className="flex-1">
          <p className="text-[14.5px] font-black text-[#f4ddab]">
            افتح دفترك الورقي الآن، واكتب ما يلي بالترتيب من البداية إلى النهاية.
          </p>
          <p className="mt-1 text-[12.5px] font-bold leading-6 text-[var(--color-mist)]">
            كل ما تراه على هذه الصفحة الورقية واجب التدوين — العناوين والتعريفات والقوانين والرسوم
            والملاحظات. لن تحتاج إلى استنتاج أي شيء من الشرح بنفسك.
          </p>
        </div>
      </div>

      <div className="paper p-8 pr-[78px] md:p-10 md:pr-[84px]" dir="rtl">
        <div className="mb-8">
          <span className="text-[12px] font-black text-[#5a6f92]">عنوان الدرس الذي تكتبه في أعلى صفحتك:</span>
          <p className="mt-1 inline-block border-b-2 border-[#22304a] pb-1 text-[18px] font-black text-[#152238]">
            {lessonTitle}
          </p>
        </div>
        <div className="space-y-8">
          {items.map((item, i) => (
            <NotebookItemRenderer key={i} item={item} index={i} notation={notation} />
          ))}
        </div>
      </div>
    </div>
  );
}
