import type { Rich, NotebookItem } from "./types";
/** Only presentation markup is removed. Words, order and TeX are preserved. */
export function machineRich(text: string): Rich {
  const parts = text.replace(/\*\*/g, "").split(/(\\\([\s\S]*?\\\))/g);
  return parts
    .filter(Boolean)
    .map((p) => (p.startsWith("\\(") ? { tex: p.slice(2, -2) } : { t: p }));
}
export function parseMachineNotebook(source: string): NotebookItem[] {
  return source
    .replace(/\n(?=#{1,3} )/g, "\n\n")
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("# ")) return { kind: "h1", text: part.slice(2) };
      if (/^#{2,3} /.test(part))
        return { kind: "h2", text: part.replace(/^#+ /, "") };
      if (part.startsWith("\\["))
        return { kind: "law", name: "", formula: part.slice(2, -2).trim() };
      if (part.startsWith("|")) {
        const rows = part.split("\n").map((l) =>
          l
            .split("|")
            .slice(1, -1)
            .map((s) => s.trim().replace(/\\\(|\\\)/g, "")),
        );
        return { kind: "copy-table", head: rows[0], rows: rows.slice(2) };
      }
      if (part.startsWith("**رسم للتدوين:**")) {
        const src = part.includes("لكل مثال")
          ? "machine-body"
          : part.includes("منصة")
            ? "machine-incline"
            : part.includes("إسفيناً")
              ? "machine-wedge"
              : part.includes("برغيين")
                ? "machine-screw"
                : part.includes("مخططات منفصلة")
                  ? "machine-lever-types"
                  : part.includes("المتزنة")
                    ? "machine-lever1"
                    : part.includes("عجلة")
                      ? "machine-wheel"
                      : part.includes("بكرة") || part.endsWith("ارسم:")
                        ? "machine-pulley-pair"
                        : undefined;
        return {
          kind: "draw",
          instruction: machineRich(part),
          ...(src
            ? {
                figure: {
                  id: src,
                  kind: "svg" as const,
                  src,
                  alt: "رسم للتدوين",
                  reproduction: "redrawn" as const,
                  notebook: true,
                },
              }
            : {}),
        };
      }
      if (/^(?:- |\d+\. )/.test(part))
        return {
          kind: "points",
          items: part.split("\n").map((l) => machineRich(l)),
        };
      return { kind: "write", rich: machineRich(part) };
    });
}
