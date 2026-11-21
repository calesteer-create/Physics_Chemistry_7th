import { simpleMachinesNotebookText } from "@/content/lessons/unit1/simple-machines-notebook";
import { machineRich } from "@/content/simple-machines-text";
import { RichText } from "@/components/content/RichText";
import { TeX } from "@/components/math/TeX";
import { parseMachineNotebook } from "@/content/simple-machines-text";
import { NotebookFigure } from "@/components/figures";
import styles from "@/components/figures/simple-machines.module.css";
/** The approved source is the only text source. No generated summaries or extra notebook copy. */
export function SimpleMachinesNotebook() {
  const parts = simpleMachinesNotebookText
    .replace(/\n(?=#{1,3} )/g, "\n\n")
    .split(/\n\s*\n/)
    .filter(Boolean);
  return (
    <article
      data-approved-notebook="simple-machines"
      className={`${styles.scope} rounded-2xl border-2 border-[#c9b98c] bg-[#fffef7] p-4 md:p-8`}
      style={{ lineHeight: 2.2 }}
    >
      {parts.map((part, i) => {
        const key = i;
        if (part.startsWith("# "))
          return (
            <h3 key={key} className="mb-6 border-b-2 pb-4 text-2xl font-bold">
              {part.slice(2)}
            </h3>
          );
        if (part.startsWith("## "))
          return (
            <h4
              key={key}
              className="mb-4 mt-10 text-xl font-bold text-[#33568f]"
            >
              {part.slice(3)}
            </h4>
          );
        if (part.startsWith("### "))
          return (
            <h5 key={key} className="mb-3 mt-6 text-lg font-bold">
              {part.slice(4)}
            </h5>
          );
        if (part.startsWith("\\["))
          return (
            <div
              key={key}
              className="my-5 rounded-xl border border-[#c9d8cd] bg-white p-3"
            >
              <TeX block>{part.slice(2, -2).trim()}</TeX>
            </div>
          );
        if (part.startsWith("|")) {
          const rows = part.split("\n").map((l) =>
            l
              .split("|")
              .slice(1, -1)
              .map((s) => s.trim()),
          );
          return (
            <div className="my-5 overflow-x-auto" key={key}>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {rows[0].map((c, j) => (
                      <th
                        key={j}
                        className="border border-[#c9b98c] bg-[#f3f5f8] p-3"
                      >
                        <RichText rich={machineRich(c)} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(2).map((row, j) => (
                    <tr key={j}>
                      {row.map((c, k) => (
                        <td key={k} className="border border-[#c9b98c] p-3">
                          <RichText rich={machineRich(c)} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (/^(?:- |\d+\. )/.test(part)) {
          const ordered = /^\d/.test(part);
          const Tag = ordered ? "ol" : "ul";
          return (
            <Tag
              key={key}
              className={`my-4 space-y-2 pr-6 ${ordered ? "list-decimal" : "list-disc"}`}
            >
              {part.split("\n").map((line, j) => (
                <li key={j}>
                  <RichText
                    rich={machineRich(line.replace(/^(?:- |\d+\. )/, ""))}
                  />
                </li>
              ))}
            </Tag>
          );
        }
        const item = parseMachineNotebook(part)[0];
        return (
          <div key={key} className="my-4">
            <p>
              <RichText rich={machineRich(part)} />
            </p>
            {item.kind === "draw" && item.figure && (
              <div className={styles.notebookFigure}>
                <NotebookFigure figure={item.figure} />
              </div>
            )}
          </div>
        );
      })}
    </article>
  );
}
