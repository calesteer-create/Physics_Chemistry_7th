/**
 * Browser-level test for the pressure lesson (الوحدة الثانية — الدرس الأول):
 * - كل الرسوم التسع تُعرض بلا أخطاء KaTeX وبلا تجاوز أفقي (هاتف وكمبيوتر).
 * - مختبر الإسفنج: الإعدادات الجاهزة والمهمات الثلاث (توقّع/تطبيق/تفسير)
 *   وتنبيه المؤشر البصري النسبي.
 * - أسئلة الكتاب: فراغات الصفحة 69 وخريطة مفاهيم الصفحة 70 تتحقق فعليًا.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import "./css-stub";
import {
  PressureApplicationsFigure,
  PressureBlockWeightFigure,
  PressureCamelSkierFigure,
  PressureConceptMapFigure,
  PressureNailFigure,
  PressurePascalFigure,
  PressureSpongeFigure,
  PressureStatueFigure,
  PressureUnitAreaFigure,
} from "@/components/figures/pressure-figures";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const AL_LIB = "/tmp/al2023/lib";

function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023-pressure.tar");
    execFileSync("bash", ["-c", `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
  process.env.LD_LIBRARY_PATH = [AL_LIB, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
}

test("الرسوم التسع تُصيَّر بلا أخطاء KaTeX وبعناوين وصفية", () => {
  const figures: Array<[string, () => React.ReactElement]> = [
    ["camel-skier", PressureCamelSkierFigure],
    ["nail", PressureNailFigure],
    ["sponge", PressureSpongeFigure],
    ["unit-area", PressureUnitAreaFigure],
    ["pascal", PressurePascalFigure],
    ["statue", PressureStatueFigure],
    ["block-weight", PressureBlockWeightFigure],
    ["applications", PressureApplicationsFigure],
    ["concept-map", PressureConceptMapFigure],
  ];
  for (const [name, Fig] of figures) {
    const html = renderToStaticMarkup(h(Fig));
    assert.ok(!html.includes("katex-error"), `${name}: خطأ KaTeX`);
    // نسختان لكل رسم: واسعة وهاتف.
    assert.equal((html.match(/<svg/g) ?? []).length, 2, `${name}: رسم بلا نسختين`);
    assert.ok(html.includes("aria-label"), `${name}: بلا وصف وصول`);
  }
});

test("المختبر وأسئلة الكتاب يعملان في متصفح فعلي بلا تجاوز أفقي", { timeout: 180_000 }, async () => {
  ensureBrowserLibs();
  const outDir = join(tmpdir(), "pressure-browser-test");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const entry = join(outDir, "entry.tsx");
  writeFileSync(entry, [
    `import { createElement as h } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    `import { PressurePlayground } from "@/components/lab/PressurePlayground";`,
    `import { PressureBookQuestions } from "@/components/lesson/PressureBookQuestions";`,
    `import { PressureCamelSkierFigure, PressureSpongeFigure, PressureApplicationsFigure } from "@/components/figures/pressure-figures";`,
    `const root = document.getElementById("root");`,
    `if (root) createRoot(root).render(h("div", null, h(PressurePlayground), h(PressureCamelSkierFigure), h(PressureSpongeFigure), h(PressureApplicationsFigure), h(PressureBookQuestions)));`,
  ].join("\n"));
  const { build } = require("esbuild") as typeof import("esbuild");
  await build({
    entryPoints: [entry], bundle: true, outfile: join(outDir, "bundle.js"), format: "iife", platform: "browser", jsx: "automatic",
    alias: { "@": join(ROOT, "src") }, nodePaths: [join(ROOT, "node_modules")], define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent",
  });
  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);

  interface Chromium { executablePath(): Promise<string>; args: string[] }
  const mod = require("@sparticuz/chromium") as { default?: Chromium } & Chromium;
  const chromium: Chromium = mod.default ?? mod;
  const { chromium: pw } = require("playwright-core") as typeof import("playwright-core");
  const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(pathToFileURL(htmlPath).href);
    await page.getByText("مختبر الإسفنجة والضغط").waitFor();

    for (const viewport of [{ width: 1280, height: 900 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(viewport);
      // لا تجاوز أفقي في أي عرض.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 1, `تجاوز أفقي ${overflow}px عند عرض ${viewport.width}`);

      if (viewport.width === 1280) {
        // تنبيه المؤشر البصري حاضر دائمًا.
        await page.getByText("مؤشر بصري نسبي تقريبي للتوضيح فقط").waitFor();
        // إعداد جاهز: حصان على الرمل ← P = 1100 / 0.25 = 4400 Pa
        await page.getByRole("button", { name: "حصان على الرمل" }).click();
        await page.getByText("4400").first().waitFor();
        // المهمة ١: توقّع ثم طبّق ← P = 800 / 0.4 = 2000 Pa وتفسير صحيح
        await page.getByRole("button", { name: "يتضاعف الضغط" }).click();
        await page.getByRole("button", { name: "طبّق التغيير" }).click();
        await page.getByText("أحسنت، توقعك صحيح").waitFor();
        await page.getByText("2000").first().waitFor();
        // المهمة ٣: تغيير المادة لا يغيّر الضغط المحسوب
        await page.getByRole("button", { name: /المهمة ٣/ }).click();
        await page.getByRole("button", { name: "لا يتغيّر الضغط" }).click();
        await page.getByRole("button", { name: "طبّق التغيير" }).click();
        await page.getByText("الضغط المحسوب لم يتغيّر").waitFor();
        // الإعداد الرابع: مسمار حاد ← P = 120 / 0.04 = 3000 Pa
        await page.getByRole("button", { name: "مسمار حاد" }).click();
        await page.getByText("3000").first().waitFor();
        // المهمة ٥ (تحدٍّ عدديّ): من نقطة البداية عدّل المساحة وحدها إلى 0.4
        await page.getByRole("button", { name: /المهمة ٥/ }).click();
        await page.getByRole("button", { name: "ابدأ من نقطة البداية" }).click();
        const areaSlider = page.locator('input[aria-label^="مساحة سطح التماس"]');
        await areaSlider.fill("0.4");
        const checkBtn = page.getByRole("button", { name: "تحقّق من الهدف" });
        await checkBtn.waitFor();
        await checkBtn.click();
        await page.getByText("أحسنت! حقّقت الضغط المستهدف").waitFor();
        // فراغات الصفحة 69
        await page.getByLabel("الفراغ الأول في العبارة 1").fill("عمودياً");
        await page.getByLabel("الفراغ الثاني في العبارة 1").fill("السطح");
        await page.getByRole("button", { name: "تحقّق من إجابتي" }).first().click();
        await page.getByText("صحيحة بالكامل").waitFor();
        // خريطة مفاهيم الصفحة 70
        await page.getByLabel("وحدة قياس الضغط الدولية").selectOption("الباسكال");
        await page.getByLabel("العامل الأول للضغط").selectOption("شدة القوة الضاغطة");
        await page.getByLabel("العامل الثاني للضغط").selectOption("مساحة السطح");
        await page.getByRole("button", { name: "تحقّق من الخريطة" }).click();
        await page.getByText("خريطة مكتملة صحيحة").waitFor();
      }
    }
    await page.close();
  } finally {
    await browser.close();
  }
});
