/**
 * اختبار المتصفح الفعلي لمحوّل الوحدات (وليس renderToStaticMarkup):
 * يبني حزمة لل componente، يفتحها في Chromium حقيقي (playwright-core +
 * @sparticuz/chromium من npm)، وتحقق في DOM الحيّ من أن:
 *  1) عناصر <option> نصّ صرف بلا أي عناصر HTML داخلها (قاعدة المتصفحات)،
 *  2) الوحدات تظهر بصيغة KaTeX في الواجهة (معاينة الوحدة المختارة + النتيجة + الأمثلة)،
 *  3) النتيجة رتبها قيمة ثم وحدة داخل صيغة KaTeX،
 *  4) التفاعل (تغيير الوحدة) يحدّث المعاينة والنتيجة، وتبقى الخيارات نصًّا.
 */
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

// ── مكتبات النظام لـ Chromium (تُستخرج من حزمة npm إن لزم) ──
const AL_LIB = "/tmp/al2023/lib";
function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023.tar");
    execFileSync("bash", [
      "-c",
      `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`,
    ], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
  process.env.LD_LIBRARY_PATH = [AL_LIB, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
}

// ── بناء حزمة المكوّن عبر esbuild ──
async function buildBundle(outDir: string): Promise<string> {
  const { build } = require("esbuild") as typeof import("esbuild");
  const entry = join(outDir, "entry.ts");
  writeFileSync(
    entry,
    [
      `import { createElement as h } from "react";`,
      `import { createRoot } from "react-dom/client";`,
      `import { UnitConverter } from "@/components/lab/UnitConverter";`,
      `const el = document.getElementById("root");`,
      `if (el) createRoot(el).render(h(UnitConverter));`,
      "",
    ].join("\n"),
  );
  const outfile = join(outDir, "bundle.js");
  await build({
    entryPoints: [entry],
    bundle: true,
    outfile,
    format: "iife",
    platform: "browser",
    jsx: "automatic",
    alias: { "@": join(ROOT, "src") },
    nodePaths: [join(ROOT, "node_modules")],
    define: { "process.env.NODE_ENV": '"development"' },
    logLevel: "silent",
  });
  const html = join(outDir, "index.html");
  writeFileSync(
    html,
    `<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>UnitConverter</title></head>` +
      `<body><div id="root"></div><script src="bundle.js"></script></body></html>`,
  );
  return html;
}

test("محوّل الوحدات في متصفح حقيقي: options نصّ فقط والوحدات بصيغة KaTeX والتفاعل يعمل", { timeout: 120_000 }, async () => {
  ensureBrowserLibs();
  const outDir = join(tmpdir(), "unitconverter-browser-test");
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const htmlPath = await buildBundle(outDir);

  interface SparticuzChromium {
    executablePath(): Promise<string>;
    args: string[];
  }
  const mod = require("@sparticuz/chromium") as { default?: SparticuzChromium } & SparticuzChromium;
  const chromium: SparticuzChromium = mod.default ?? mod;
  const { chromium: pw } = require("playwright-core") as typeof import("playwright-core");

  const executablePath = await chromium.executablePath();
  const browser = await pw.launch({ executablePath, args: chromium.args, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href);
    await page.waitForSelector(".katex", { timeout: 15000 });

    // (1) لا HTML داخل <option> إطلاقًا — نصّ صرف فقط
    const options = await page.$$eval("option", (els) =>
      els.map((el) => ({ childElements: el.children.length, text: el.textContent ?? "" })),
    );
    assert.ok(options.length >= 8, `عدد الخيارات: ${options.length}`);
    for (const o of options) {
      assert.equal(o.childElements, 0, `عنصر HTML داخل option: ${JSON.stringify(o)}`);
      assert.ok(o.text.trim().length > 0, `option فارغ: ${JSON.stringify(o)}`);
    }
    assert.ok(
      options.some((o) => o.text.includes("كيلومتر")),
      "نصّ عربي في الخيارات كما هو",
    );

    // (2) الوحدات بصيغة KaTeX في الواجهة: معاينتا الوحدتين + النتيجة + الأمثلة
    const katexCount = await page.$$eval(".katex", (els) => els.length);
    assert.ok(katexCount >= 6, `عدد صيغ KaTeX الظاهرة: ${katexCount} (متوقع ≥6)`);

    const previewText = async (label: string) => {
      const loc = page.locator(`label:has-text("${label}") .katex`).first();
      return (await loc.textContent())?.replace(/\s+/g, "") ?? "";
    };
    assert.equal(await previewText("من وحدة"), "km", "معاينة الوحدة المصدر بصيغة KaTeX");
    assert.equal(await previewText("إلى وحدة"), "m", "معاينة الوحدة الهدف بصيغة KaTeX");

    // (3) النتيجة: قيمة ثم وحدة داخل صيغة KaTeX (2.5 km = 2500 m)
    const katexTexts = await page.$$eval(".katex", (els) => els.map((e) => e.textContent ?? ""));
    const resultKatex = katexTexts.find((t) => t.replace(/\s+/g, "").includes("2500"));
    assert.ok(resultKatex, `لا توجد صيغة النتيجة 2500 في: ${JSON.stringify(katexTexts)}`);
    const flat = resultKatex.replace(/\s+/g, "");
    assert.ok(flat.indexOf("2500") < flat.indexOf("m"), `ترتيب قيمة قبل وحدة: ${flat}`);

    // (4) التفاعل: تغيير «من وحدة» إلى cm يحدّث المعاينة والنتيجة
    await page.selectOption(`label:has-text("من وحدة") select`, "cm");
    for (let i = 0; i < 50 && (await previewText("من وحدة")) !== "cm"; i++) {
      await page.waitForTimeout(100);
    }
    assert.equal(await previewText("من وحدة"), "cm", "المعاينة تتحدّث بعد التفاعل");

    const afterTexts = await page.$$eval(".katex", (els) => els.map((e) => e.textContent ?? ""));
    assert.ok(
      afterTexts.some((t) => t.replace(/\s+/g, "").includes("0.025")),
      `النتيجة بعد التفاعل (2.5 cm = 0.025 m) في: ${JSON.stringify(afterTexts)}`,
    );

    // الخيارات تبقى نصًّا بعد التفاعل أيضًا
    const optionsAfter = await page.$$eval("option", (els) => els.map((el) => el.children.length));
    assert.ok(optionsAfter.every((n) => n === 0), "HTML داخل option بعد التفاعل");
  } finally {
    await browser.close();
  }
});
