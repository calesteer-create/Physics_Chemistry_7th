import type { ReactNode } from "react";
import { pressureInLiquidsNotebookText } from "@/content/lessons/unit2/pressure-in-liquids-notebook";
import { TeX } from "@/components/math/TeX";
import styles from "./PressureInLiquidsNotebook.module.css";

/**
 * «دفتر الطالب» المعتمد — الدرس الثاني: الضغط في السوائل (ص 71–80).
 *
 * المصدر الوحيد هو `pressureInLiquidsNotebookText` (نسخة حرفية من الملف المقفل).
 * هذا المكوّن لا يلخّص ولا يعيد الصياغة ولا يضيف معلومة: كل سطر من المصدر
 * يُعرض مرةً واحدةً كما هو، مع عزل صيغ `$…$` في KaTeX باتجاه LTR مستقل. العناوين
 * والترقيم والجداول تحسينات بصرية فقط داخل الورقة نفسها.
 */

const SECTION = /^(?:أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|تاسعاً|عاشراً|حادي عشر):/u;
const ORDINAL = /^([١٢٣٤٥٦٧٨٩٠]+)\.\s*/u;

/** عرض سطر حرفيًا مع صيغ KaTeX معزولة LTR؛ لا يحوّل أي كلمة عربية. */
function LineContent({ text }: { text: string }): ReactNode {
  const segments = text.split(/(\$[^$]+\$)/g).filter(Boolean);
  return segments.map((segment, i) => {
    if (segment.startsWith("$") && segment.endsWith("$") && segment.length > 2) {
      return (
        <span key={i} className={styles.mathScroll}>
          <TeX>{segment.slice(1, -1)}</TeX>
        </span>
      );
    }
    return <span key={i}>{segment}</span>;
  });
}

function NumberedLine({ text }: { text: string }): ReactNode {
  const match = ORDINAL.exec(text);
  if (!match) return <LineContent text={text} />;
  return (
    <>
      <span className={styles.ordinal} aria-hidden="true">{match[1]}.</span>
      <span className={styles.listText}><LineContent text={text.slice(match[0].length)} /></span>
    </>
  );
}

function isSpecialLine(text: string): "law" | "note" | null {
  if (text.startsWith("القانون:") || text.startsWith("التمييز بين القانونين:") || text.startsWith("الحل —") ||
      text.startsWith("التعويض:") || text.startsWith("النتيجة:")) return "law";
  if (text.startsWith("شرط استعمال القانون:") || text.startsWith("ملاحظة تصحيح علمي") ||
      text.includes("ملاحظة تصحيح علمي من المنصة")) return "note";
  return null;
}

function TextLine({ text }: { text: string }): ReactNode {
  const special = isSpecialLine(text);
  const className = [
    styles.line,
    ORDINAL.test(text) ? styles.numbered : "",
    special === "law" ? styles.lawLine : "",
    special === "note" ? styles.noteLine : "",
  ].filter(Boolean).join(" ");
  if (ORDINAL.test(text)) {
    return <div className={className}><NumberedLine text={text} /></div>;
  }
  if (text.endsWith(":") && !text.includes("$")) {
    return (
      <p className={`${className} ${styles.plainLabel}`}>
        <LineContent text={text} />
      </p>
    );
  }
  return <p className={className}><LineContent text={text} /></p>;
}

/** جدول المقادير والوحدات: نفس الخلايا، مع تكديس محمول بلا تمرير للصفحة. */
function NotebookTable({ lines }: { lines: string[] }): ReactNode {
  const caption = lines.find((line) => !line.includes("|")) ?? "";
  const rows = lines.filter((line) => line.includes("|")).map((line) =>
    line.split("|").map((cell) => cell.trim()),
  );
  const header = rows[0] ?? [];
  return (
    <div className={styles.tableWrap}>
      {caption && <p className={`${styles.line} ${styles.tableCaption}`}><LineContent text={caption} /></p>}
      <div className={styles.table} role="table" aria-label="جدول المقادير والوحدات">
        {rows.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              role={r === 0 ? "columnheader" : "cell"}
              className={`${styles.cell} ${r === 0 ? styles.headCell : ""}`}
              data-label={r === 0 ? undefined : header[c]}
            >
              <LineContent text={cell} />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function Block({ text }: { text: string }): ReactNode {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.some((line) => line.includes("|"))) return <NotebookTable lines={lines} />;
  if (lines[0] && SECTION.test(lines[0])) {
    return (
      <>
        <h3 className={styles.sectionHeading}><LineContent text={lines[0]} /></h3>
        {lines.slice(1).map((line, i) => <TextLine key={i} text={line} />)}
      </>
    );
  }
  return <>{lines.map((line, i) => <TextLine key={i} text={line} />)}</>;
}

export function PressureInLiquidsNotebook() {
  const parts = pressureInLiquidsNotebookText.split(/\n\s*\n/u).filter(Boolean);
  const cover = (parts.shift() ?? "").split("\n").filter(Boolean);
  // تجميع الكتل بين العناوين حتى يبقى ترتيب المصدر كما هو حرفًا بحرف.
  const sections: string[][] = [];
  for (const part of parts) {
    const first = part.split("\n").find(Boolean) ?? "";
    if (SECTION.test(first) || sections.length === 0) sections.push([part]);
    else sections[sections.length - 1].push(part);
  }

  return (
    <article
      data-approved-notebook="pressure-in-liquids"
      data-notebook-sha256="6e9ade51249b120de94b40b2e022c7168e636f3f164dbcf6b0f54c0c24bd7540"
      className={`${styles.scope} ${styles.paper}`}
      lang="ar"
      dir="rtl"
    >
      <header className={styles.cover}>
        <h2 className={styles.title}><LineContent text={cover[0] ?? ""} /></h2>
        <p className={styles.unitLine}><LineContent text={cover[1] ?? ""} /></p>
        <p className={styles.source}><LineContent text={cover[2] ?? ""} /></p>
      </header>
      {sections.map((blocks, i) => (
        <section className={styles.section} key={i} aria-label={`قسم ${i + 1} من دفتر الطالب`}>
          {blocks.map((block, j) => <Block key={j} text={block} />)}
        </section>
      ))}
    </article>
  );
}
