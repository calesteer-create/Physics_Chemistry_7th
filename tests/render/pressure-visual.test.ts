/**
 * فحص بصري فعلي لدرس الضغط في متصفح Chromium (لا مراجعة كود فقط):
 *  - الرسوم التسع + مشهد المختبر: لا تداخل بين التسميات، ولا قصّ خارج اللوحة،
 *    على شاشة 1440 وهاتف 390 وأصغر 320.
 *  - وحدة `m²`: الرمز قبل الأسّ العلوي داخل تعبير KaTeX واحد معزول LTR
 *    في الجداول وتعليمات المختبر ووحدة الاختبار.
 *  - لا تمرير أفقي ولا أخطاء KaTeX.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const AL_LIB = "/tmp/al2023/lib";

function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023-pressure-visual.tar");
    execFileSync("bash", ["-c", `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
}

const entry = `
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import { BlockRenderer } from "@/components/lesson/Blocks";
import { PressurePlayground } from "@/components/lab/PressurePlayground";
import { TeX, unitTex } from "@/components/math/TeX";
import { pressureLesson } from "@/content/lessons/unit2/pressure";
import {
  PressureCamelSkierFigure, PressureNailFigure, PressureSpongeFigure,
  PressureUnitAreaFigure, PressurePascalFigure, PressureStatueFigure,
  PressureBlockWeightFigure, PressureApplicationsFigure, PressureConceptMapFigure,
} from "@/components/figures/pressure-figures";
const table = pressureLesson.stages.flatMap(s => s.blocks).find(b => b.type === "table");
createRoot(document.getElementById("root")!).render(h("div", { dir: "rtl" },
  h(BlockRenderer, { block: table }),
  h(PressureCamelSkierFigure), h(PressureNailFigure), h(PressureSpongeFigure),
  h(PressureUnitAreaFigure), h(PressurePascalFigure), h(PressureStatueFigure),
  h(PressureBlockWeightFigure), h(PressureApplicationsFigure), h(PressureConceptMapFigure),
  h(PressurePlayground),
  h("div", { "data-quiz-unit": "pq7" }, h(TeX, null, unitTex("m^2"))),
));
`;

test("الوحدات والرسوم سليمة بصريًا على 1440 و390 و320", { timeout: 240_000 }, async () => {
  ensureBrowserLibs();
  const outDir = join(tmpdir(), "pressure-visual-test");
  mkdirSync(outDir, { recursive: true });
  const { build } = require("esbuild") as typeof import("esbuild");
  await build({
    stdin: { contents: entry, resolveDir: ROOT, sourcefile: "pressure-visual-entry.tsx", loader: "tsx" },
    bundle: true, outfile: join(outDir, "bundle.js"), format: "iife", platform: "browser", jsx: "automatic",
    alias: { "@": join(ROOT, "src") }, nodePaths: [join(ROOT, "node_modules")],
    loader: { ".css": "empty" }, define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent",
  });
  const htmlPath = join(outDir, "index.html");
  // KaTeX CSS ضروري لقياس موضع الأسّ العلوي فعليًا (لا يكفي HTML الذي ينتجه KaTeX).
  const katexCss = readFileSync(join(ROOT, "node_modules/katex/dist/katex.min.css"), "utf8");
  writeFileSync(htmlPath, `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${katexCss}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);

  const mod = require("@sparticuz/chromium") as { default?: { executablePath(): Promise<string>; args: string[] } } & { executablePath(): Promise<string>; args: string[] };
  const chromiumMod = mod.default ?? mod;
  const { chromium } = require("playwright-core") as typeof import("playwright-core");

  for (const width of [1440, 390, 320]) {
    // Chromium المُجمَّع في البيئة يعمل بثبات عند إعادة تشغيله لكل مقاس.
    const browser = await chromium.launch({
      executablePath: await chromiumMod.executablePath(), args: chromiumMod.args, headless: true,
      env: { ...process.env, LD_LIBRARY_PATH: AL_LIB },
    });
    try {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      await page.goto(pathToFileURL(htmlPath).href);
      await page.locator("[data-quiz-unit] .katex").waitFor();
      await page.evaluate(() => {
        // لا يُحمَّل CSS Modules في حزمة الاختبار؛ نُظهر نسخة واحدة لكل رسم حسب العرض.
        for (const svg of document.querySelectorAll('svg[role="img"]')) {
          const vb = svg.getAttribute("viewBox") ?? "";
          const hidden = window.innerWidth < 700
            ? vb.startsWith("0 0 696") || vb.startsWith("0 0 560")
            : vb.startsWith("0 0 400") || vb.startsWith("0 0 360");
          (svg as SVGElement).style.display = hidden ? "none" : "";
        }
      });

      // 1) لا تداخل ولا قصّ في التسميات داخل أي لوحة مرئية.
      const plates = await page.evaluate(() => {
        const result: Array<{ label: string; overlaps: string[]; outside: string[] }> = [];
        for (const svg of document.querySelectorAll('svg[role="img"]')) {
          const el = svg as SVGElement;
          if (getComputedStyle(el).display === "none" || el.getBoundingClientRect().width < 150) continue;
          const r = el.getBoundingClientRect();
          const texts: Array<{ text: string; x: number; y: number; w: number; h: number }> = [];
          for (const node of el.querySelectorAll("foreignObject, text")) {
            const b = node.getBoundingClientRect();
            if (b.width > 0 && b.height > 0) texts.push({ text: (node.textContent ?? "").trim().slice(0, 60), x: b.x, y: b.y, w: b.width, h: b.height });
          }
          const overlaps: string[] = [];
          for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
            const ix = Math.min(texts[a].x + texts[a].w, texts[b].x + texts[b].w) - Math.max(texts[a].x, texts[b].x);
            const iy = Math.min(texts[a].y + texts[a].h, texts[b].y + texts[b].h) - Math.max(texts[a].y, texts[b].y);
            if (ix > 2 && iy > 2) overlaps.push(`${texts[a].text} ↔ ${texts[b].text}`);
          }
          const outside = texts.filter((t) => t.x < r.x - 1 || t.y < r.y - 1 || t.x + t.w > r.x + r.width + 1 || t.y + t.h > r.y + r.height + 1)
            .map((t) => t.text);
          result.push({ label: el.getAttribute("aria-label") ?? el.querySelector("title")?.textContent ?? "", overlaps, outside });
        }
        return result;
      });
      assert.ok(plates.length >= 10, `عدد الرسوم المرئية ${plates.length}`);
      for (const plate of plates) {
        assert.deepEqual(plate.overlaps, [], `تداخل تسميات في ${plate.label} عند ${width}`);
        assert.deepEqual(plate.outside, [], `قصّ تسمية في ${plate.label} عند ${width}`);
      }

      // 2) ترتيب `m` ثم الأسّ 2 في الجدول وتعليمات المختبر ووحدة الاختبار.
      const units = await page.evaluate(() => {
        const cell = [...document.querySelectorAll("td")].find((td) => td.textContent?.trim() === "m2") ?? null;
        const mission = [...document.querySelectorAll("p")].find((p) => (p.textContent ?? "").includes("سنثبّت القوة عند")) ?? null;
        const quizUnit = document.querySelector("[data-quiz-unit]");
        const roots: Array<["table" | "mission" | "quiz", Element | null]> = [
          ["table", cell], ["mission", mission], ["quiz", quizUnit],
        ];
        const result: Record<string, { baseRight: number; supLeft: number; baseTop: number; supTop: number } | null> = {};
        for (const [name, root] of roots) {
          let found: { baseRight: number; supLeft: number; baseTop: number; supTop: number } | null = null;
          if (root) {
            const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
            let node: Node | null = null;
            while ((node = walker.nextNode()) && !found) {
              if (node.textContent !== "m") continue;
              const range = document.createRange();
              range.setStart(node, 0); range.setEnd(node, 1);
              const base = range.getBoundingClientRect();
              const supEl = root.querySelector(".msupsub");
              if (supEl) {
                const digit = document.createTreeWalker(supEl, NodeFilter.SHOW_TEXT).nextNode();
                if (digit) {
                  const supRange = document.createRange();
                  supRange.selectNodeContents(digit);
                  const sup = supRange.getBoundingClientRect();
                  found = { baseRight: base.right, supLeft: sup.left, baseTop: base.top, supTop: sup.top };
                }
              }
            }
          }
          result[name] = found;
        }
        let orphanSuperscripts = 0;
        for (const el of document.querySelectorAll("td, p")) {
          for (const node of el.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && /[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(node.textContent ?? "")) {
              orphanSuperscripts += 1;
              break;
            }
          }
        }
        return {
          table: result.table, mission: result.mission, quiz: result.quiz,
          orphanSuperscripts,
          missionKatexCount: mission?.querySelectorAll(".katex").length ?? 0,
        };
      });
      for (const [name, rect] of Object.entries({ table: units.table, mission: units.mission, quiz: units.quiz })) {
        assert.ok(rect, `لا توجد وحدة m² مرئية في ${name} عند ${width}`);
        assert.ok(rect.baseRight <= rect.supLeft + 1, `انقلب ترتيب m والأسّ في ${name} عند ${width}`);
        assert.ok(rect.supTop < rect.baseTop, `الأسّ ليس علويًا في ${name} عند ${width}: ${JSON.stringify(rect)}`);
      }
      assert.equal(units.orphanSuperscripts, 0, `أس Unicode خارج KaTeX عند ${width}`);
      assert.ok(units.missionKatexCount >= 3, `تعليمات المختبر لم تُعزل عند ${width}`);

      // 3) لا تمرير أفقي ولا أخطاء صيغ.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `تمرير أفقي ${overflow}px عند ${width}`);
      assert.deepEqual(await page.locator(".katex-error").allTextContents(), []);
      assert.deepEqual(pageErrors, []);
      await page.close();
    } finally {
      await browser.close();
    }
  }
});
