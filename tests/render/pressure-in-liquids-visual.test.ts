/**
 * فحص بصري حقيقي لدرس «الضغط في السوائل» في Chromium:
 *  - الرسوم الـ12 تُصيَّر بنسختين (واسعة/هاتف) بلا أخطاء KaTeX.
 *  - لا تداخل بين التسميات ولا قصّ خارج اللوحة ولا تمرير أفقي على 1440/390/320.
 *  - المختبرات الأربعة، أنشطة الكتاب، التمارين الثمانية، والدفتر المعتمد
 *    تُحمَّل فعلياً في المتصفح؛ وتُحفظ لقطات حقيقية داخل مساحة العمل.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h, type ReactElement } from "react";
import "./css-stub";
import {
  LiquidPressureIntroFigure,
  ThreeHolesFigure,
  ManometerToolsFigure,
  ManometerExperimentFigure,
  DepthFigure,
  DensityFigure,
  LiquidLawFigure,
  AtmosphereFigure,
  DamVesselsFigure,
  LiquidApplicationsFigure,
  BookQuestionFigure,
  LiquidGraphFigure,
} from "@/components/figures/liquid-pressure-figures";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const AL_LIB = "/tmp/al2023/lib";
const SHOTS = join(ROOT, "docs/review/pressure-in-liquids/screenshots");

const FIGURES: Array<[string, () => ReactElement]> = [
  ["intro", LiquidPressureIntroFigure],
  ["three-holes", ThreeHolesFigure],
  ["manometer-tools", ManometerToolsFigure],
  ["manometer-experiment", ManometerExperimentFigure],
  ["depth", DepthFigure],
  ["density", DensityFigure],
  ["law", LiquidLawFigure],
  ["atmosphere", AtmosphereFigure],
  ["dam-vessels", DamVesselsFigure],
  ["applications", LiquidApplicationsFigure],
  ["book-question", BookQuestionFigure],
  ["graph", LiquidGraphFigure],
];

function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023-liquid-pressure.tar");
    execFileSync("bash", ["-c", `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
}

const entry = `
import { createElement as h } from "react";
import { createRoot } from "react-dom/client";
import {
  LiquidPressureIntroFigure, ThreeHolesFigure, ManometerToolsFigure,
  ManometerExperimentFigure, DepthFigure, DensityFigure, LiquidLawFigure,
  AtmosphereFigure, DamVesselsFigure, LiquidApplicationsFigure,
  BookQuestionFigure, LiquidGraphFigure,
} from "@/components/figures/liquid-pressure-figures";
import { LiquidPressureLabs } from "@/components/lab/LiquidPressureLabs";
import { PressureInLiquidsNotebook } from "@/components/lesson/PressureInLiquidsNotebook";
import { PressureInLiquidsBookQuestions, PressureInLiquidsExtraExercises } from "@/components/lesson/PressureInLiquidsExercises";
const figures = [
  LiquidPressureIntroFigure, ThreeHolesFigure, ManometerToolsFigure,
  ManometerExperimentFigure, DepthFigure, DensityFigure, LiquidLawFigure,
  AtmosphereFigure, DamVesselsFigure, LiquidApplicationsFigure,
  BookQuestionFigure, LiquidGraphFigure,
];
createRoot(document.getElementById("root")!).render(h("div", { dir: "rtl", lang: "ar", className: "demo" },
  h("h1", null, "الضغط في السوائل — فحص بصري"),
  h("div", { "data-figure-check": "true" }, figures.map((F, i) => h("section", { key: i, "data-figure": i + 1 }, h(F)))),
  h("section", { "data-labs": "true" }, h(LiquidPressureLabs)),
  h("section", { "data-book": "true" }, h(PressureInLiquidsBookQuestions)),
  h("section", { "data-extra": "true" }, h(PressureInLiquidsExtraExercises)),
  h("section", { "data-notebook": "true" }, h(PressureInLiquidsNotebook)),
));
`;

const cssProxy = {
  name: "css-module-proxy",
  setup(build: import("esbuild").PluginBuild) {
    build.onResolve({ filter: /\.css$/ }, (args) => ({ path: args.path, namespace: "css-proxy" }));
    build.onLoad({ filter: /.*/, namespace: "css-proxy" }, () => ({
      contents: "export default new Proxy({}, { get: (_, p) => String(p) });",
      loader: "js",
    }));
  },
};

test("الرسوم الـ12 تُصيَّر بنسختين وبلا أخطاء KaTeX", () => {
  for (const [name, Fig] of FIGURES) {
    const html = renderToStaticMarkup(h(Fig));
    assert.equal((html.match(/<svg/g) ?? []).length, 2, `${name}: يجب أن يحمل نسختين`);
    assert.ok(!html.includes("katex-error"), `${name}: خطأ KaTeX`);
    assert.ok(html.includes("aria-label"), `${name}: بلا وصف وصول`);
  }
});

test("لا تداخل ولا قصّ ولا تمرير أفقي على 1440 و390 و320", { timeout: 300_000 }, async () => {
  ensureBrowserLibs();
  mkdirSync(SHOTS, { recursive: true });
  const outDir = join(tmpdir(), "liquid-pressure-visual-test");
  mkdirSync(outDir, { recursive: true });
  const { build } = require("esbuild") as typeof import("esbuild");
  await build({
    stdin: { contents: entry, resolveDir: ROOT, sourcefile: "liquid-pressure-visual-entry.tsx", loader: "tsx" },
    bundle: true, outfile: join(outDir, "bundle.js"), format: "iife", platform: "browser", jsx: "automatic",
    alias: { "@": join(ROOT, "src") }, nodePaths: [join(ROOT, "node_modules")],
    plugins: [cssProxy], define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent",
  });
  const katexCss = readFileSync(join(ROOT, "node_modules/katex/dist/katex.min.css"), "utf8");
  const shellCss = `
    :root { color-scheme: dark; }
    body { margin: 0; background: #06101f; color: #eaf4ff; font-family: "IBM Plex Sans Arabic", system-ui, sans-serif; }
    .demo { max-width: 1120px; margin: 0 auto; padding: 22px 18px 80px; min-width: 0; }
    h1 { font-size: 26px; font-weight: 900; }
    section { min-width: 0; margin: 30px 0; }
    .card, .panel, .paper, .lab, .wrap, .question { min-width: 0; }
    .holder { width: 100%; min-width: 0; }
    .plate, .svg { display: block; width: 100%; height: auto; min-width: 0; margin-inline: auto; direction: ltr; }
    .onlyWide { display: block; }
    .onlyNarrow { display: none; }
    @media (max-width: 40rem) { .onlyWide { display: none; } .onlyNarrow { display: block; } }
    .mathScroll, .tex-inline, .tex-box { max-width: 100%; overflow-x: auto; overflow-y: hidden; direction: ltr; unicode-bidi: isolate; }
    .resultTable { width: 100%; table-layout: fixed; }
    input, select, button { max-width: 100%; }
  `;
  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${katexCss}\n${shellCss}</style></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);

  const mod = require("@sparticuz/chromium") as { default?: { executablePath(): Promise<string>; args: string[] } } & { executablePath(): Promise<string>; args: string[] };
  const chromiumMod = mod.default ?? mod;
  const { chromium } = require("playwright-core") as typeof import("playwright-core");

  for (const width of [1440, 390, 320]) {
    const browser = await chromium.launch({
      executablePath: await chromiumMod.executablePath(), args: chromiumMod.args, headless: true,
      env: { ...process.env, LD_LIBRARY_PATH: AL_LIB },
    });
    try {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const pageErrors: string[] = [];
      page.on("pageerror", (e) => pageErrors.push(e.message));
      await page.goto(pathToFileURL(htmlPath).href);
      await page.locator('[data-figure-check] svg[role="img"]').first().waitFor({ state: "attached" });
      await page.locator('[data-approved-notebook="pressure-in-liquids"]').waitFor({ state: "attached" });

      const plates = await page.evaluate(() => {
        const root = document.querySelector('[data-figure-check]');
        if (!root) return [] as Array<{ label: string; overlaps: string[]; outside: string[] }>;
        const result: Array<{ label: string; overlaps: string[]; outside: string[] }> = [];
        for (const svg of root.querySelectorAll('svg[role="img"]')) {
          const el = svg as SVGElement;
          const holder = el.parentElement;
          if (!holder || getComputedStyle(holder).display === "none") continue;
          const r = el.getBoundingClientRect();
          if (r.width < 150) continue;
          const texts: Array<{ text: string; x: number; y: number; w: number; h: number }> = [];
          for (const node of el.querySelectorAll("foreignObject, text")) {
            const b = node.getBoundingClientRect();
            if (b.width > 0 && b.height > 0) texts.push({ text: (node.textContent ?? "").trim().slice(0, 60), x: b.x, y: b.y, w: b.width, h: b.height });
          }
          const overlaps: string[] = [];
          for (let a = 0; a < texts.length; a++) for (let b = a + 1; b < texts.length; b++) {
            const ix = Math.min(texts[a].x + texts[a].w, texts[b].x + texts[b].w) - Math.max(texts[a].x, texts[b].x);
            const iy = Math.min(texts[a].y + texts[a].h, texts[b].y + texts[b].h) - Math.max(texts[a].y, texts[b].y);
            if (ix > 3 && iy > 3) overlaps.push(`${texts[a].text} ↔ ${texts[b].text}`);
          }
          const outside = texts.filter((t) => t.x < r.x - 2 || t.y < r.y - 2 || t.x + t.w > r.x + r.width + 2 || t.y + t.h > r.y + r.height + 2)
            .map((t) => t.text);
          result.push({ label: el.getAttribute("aria-label") ?? el.querySelector("title")?.textContent ?? "", overlaps, outside });
        }
        return result;
      });
      assert.equal(plates.length, 12, `عدد اللوحات المرئية ${plates.length} عند ${width}`);
      for (const plate of plates) {
        assert.deepEqual(plate.overlaps, [], `تداخل تسميات في ${plate.label} عند ${width}`);
        assert.deepEqual(plate.outside, [], `قصّ تسمية في ${plate.label} عند ${width}`);
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `تمرير أفقي ${overflow}px عند ${width}`);
      assert.deepEqual(await page.locator(".katex-error").allTextContents(), []);
      assert.deepEqual(pageErrors, []);

      if (width === 1440) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: join(SHOTS, "visual-1440.png") });
      } else if (width === 390) {
        await page.locator('[data-lab-count="4"]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(SHOTS, "visual-390.png") });
      } else {
        await page.locator('[data-approved-notebook="pressure-in-liquids"]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: join(SHOTS, "visual-320.png") });
      }
      await page.close();
    } finally {
      await browser.close();
    }
  }
});
