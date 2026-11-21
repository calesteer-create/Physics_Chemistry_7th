/** Browser-level test for the work/power lab: prediction gating, all four work cases,
 * both power comparisons, the live SVG result and responsive viewport safety. */
import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
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
    const tar = join(tmpdir(), "al2023-work-power.tar");
    execFileSync("bash", ["-c", `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
  process.env.LD_LIBRARY_PATH = [AL_LIB, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
}

async function buildBundle(outDir: string): Promise<string> {
  const { build } = require("esbuild") as typeof import("esbuild");
  const entry = join(outDir, "entry.ts");
  writeFileSync(entry, [
    `import { createElement as h } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    `import { WorkPowerPlayground } from "@/components/lab/WorkPowerPlayground";`,
    `const root = document.getElementById("root");`,
    `if (root) createRoot(root).render(h(WorkPowerPlayground));`,
  ].join("\n"));
  const htmlPath = join(outDir, "index.html");
  await build({
    entryPoints: [entry], bundle: true, outfile: join(outDir, "bundle.js"), format: "iife", platform: "browser", jsx: "automatic",
    alias: { "@": join(ROOT, "src") }, nodePaths: [join(ROOT, "node_modules")], define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent",
  });
  writeFileSync(htmlPath, `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
  return htmlPath;
}

test("ألوان السؤال والتلميح والحل مع accent ترثها صيغ KaTeX ولا تتغير الافتراضيات", { timeout: 120_000 }, async () => {
  ensureBrowserLibs();
  const outDir = join(tmpdir(), "work-power-book-browser-test");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const entry = join(outDir, "entry.ts");
  writeFileSync(entry, [
    `import { createElement as h } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    `import { BookExercise } from "@/components/lesson/BookExercise";`,
    `const rich = [{ t: "نص " }, { tex: "5+1" }];`,
    `const props = { number: "1", title: "عنوان", question: rich, hint: rich, solution: rich };`,
    `createRoot(document.getElementById("root")!).render(h("div", null,`,
    `  h("div", { id: "accent" }, h(BookExercise, { ...props, accent: "#5b4781" })),`,
    `  h("div", { id: "default" }, h(BookExercise, props))));`,
  ].join("\n"));
  const { build } = require("esbuild") as typeof import("esbuild");
  await build({
    entryPoints: [entry], bundle: true, outfile: join(outDir, "bundle.js"), format: "iife", platform: "browser", jsx: "automatic",
    alias: { "@": join(ROOT, "src") }, nodePaths: [join(ROOT, "node_modules")], define: { "process.env.NODE_ENV": '"development"' }, logLevel: "silent",
  });
  const htmlPath = join(outDir, "index.html");
  writeFileSync(htmlPath, `<!doctype html><html dir="rtl"><head><meta charset="utf-8"></head><body><div id="root"></div><script src="bundle.js"></script></body></html>`);
  interface Chromium { executablePath(): Promise<string>; args: string[] }
  const mod = require("@sparticuz/chromium") as { default?: Chromium } & Chromium;
  const chromium: Chromium = mod.default ?? mod;
  const { chromium: pw } = require("playwright-core") as typeof import("playwright-core");
  const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(pathToFileURL(htmlPath).href);
    for (const id of ["accent", "default"]) {
      const exercise = page.locator(`#${id}`);
      await exercise.getByRole("button", { name: "تلميح", exact: true }).click();
      await exercise.getByRole("button", { name: "إظهار الحل التفصيلي" }).click();
      const wrappers = [
        exercise.locator('[class~="text-white"]'),
        exercise.locator('[class*="text-[#fff3c4]"]'),
        exercise.locator('[class*="text-[#c8ffd4]"]'),
      ];
      const expected = ["rgb(26, 36, 56)", "rgb(120, 86, 24)", "rgb(18, 100, 93)"];
      for (const [i, wrapper] of wrappers.entries()) {
        if (id === "default") {
          assert.equal(await wrapper.getAttribute("style"), null, "لا تتغير ألوان الدروس دون accent");
        } else {
          assert.equal(await wrapper.evaluate((el) => getComputedStyle(el).color), expected[i]);
          assert.equal(await wrapper.locator(".katex").first().evaluate((el) => getComputedStyle(el).color), expected[i], "ترث KaTeX لون النص");
        }
      }
    }
  } finally {
    await browser.close();
  }
});

test("مختبر العمل والاستطاعة يعمل تفاعلياً على شاشة هاتف", { timeout: 120_000 }, async () => {
  ensureBrowserLibs();
  const outDir = join(tmpdir(), "work-power-browser-test");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const htmlPath = await buildBundle(outDir);
  interface Chromium { executablePath(): Promise<string>; args: string[] }
  const mod = require("@sparticuz/chromium") as { default?: Chromium } & Chromium;
  const chromium: Chromium = mod.default ?? mod;
  const { chromium: pw } = require("playwright-core") as typeof import("playwright-core");
  const browser = await pw.launch({ executablePath: await chromium.executablePath(), args: chromium.args, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.getByRole("heading", { name: "متى تنجز القوة عملاً؟" }).waitFor();

    const runWork = page.getByRole("button", { name: "شغّل التجربة" });
    assert.equal(await runWork.isDisabled(), true, "يجب التنبؤ قبل كشف نتيجة التجربة");

    const cases: Array<{ label: string; prediction: string; feedback: string }> = [
      { label: "القوة موافقة للانتقال", prediction: "موجب", feedback: "العمل موجب" },
      { label: "القوة معاكسة للانتقال", prediction: "سالب", feedback: "العمل سالب" },
      { label: "القوة عمودية على الانتقال", prediction: "معدوم", feedback: "القوة عمودية على الانتقال" },
      { label: "لا يحدث انتقال", prediction: "معدوم", feedback: "المسافة تساوي صفراً" },
    ];
    for (const item of cases) {
      await page.getByRole("button", { name: item.label }).click();
      await page.getByRole("button", { name: item.prediction, exact: true }).click();
      await page.getByRole("button", { name: "شغّل التجربة" }).click();
      await page.getByRole("status").filter({ hasText: item.feedback }).waitFor({ timeout: 5000 });
    }

    await page.getByRole("button", { name: "العمل نفسه في زمنين مختلفين" }).click();
    await page.getByRole("button", { name: "المهمة A", exact: true }).click();
    await page.getByRole("button", { name: "شغّل المقارنة" }).click();
    await page.getByRole("status").filter({ hasText: "الاستطاعة الأكبر للمهمة A" }).waitFor({ timeout: 5000 });

    await page.getByRole("button", { name: "عملان مختلفان في الزمن نفسه" }).click();
    const workBars = page.locator('[role="img"][aria-label^="مقدار عمل المهمة"]');
    const initialWidths = await workBars.locator("div").evaluateAll((els) => els.map((el) => (el as HTMLElement).style.width));
    assert.deepEqual(initialWidths, ["20%", "40%"], "تظهر مقارنة مقدار العمل بصرياً عند الزمن نفسه");
    await page.getByRole("button", { name: "المهمة B", exact: true }).click();
    await page.getByRole("button", { name: "شغّل المقارنة" }).click();
    await page.getByRole("status").filter({ hasText: "الاستطاعة الأكبر للمهمة B" }).waitFor({ timeout: 5000 });

    const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scrollWidth <= dimensions.width + 2, `لا ينبغي أن يظهر تمرير أفقي على الهاتف: ${JSON.stringify(dimensions)}`);
    assert.deepEqual(pageErrors, [], "لا استثناءات JavaScript أثناء التفاعل");
  } finally {
    await browser.close();
  }
});
