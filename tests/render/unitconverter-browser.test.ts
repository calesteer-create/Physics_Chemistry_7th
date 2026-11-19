/**
 * اختبار المتصفح الفعلي لمحوّل الوحدات (وليس renderToStaticMarkup):
 * يبني حزمة للـ component، يفتحها في Chromium حقيقي (playwright-core +
 * @sparticuz/chromium)، وتحقق في DOM الحيّ من:
 *  1) استبدال القوائم الأصلية بمكوّن اختيار مخصص (combobox/listbox بـ ARIA).
 *  2) رمز كل وحدة يظهر بـ KaTeX داخل القائمة نفسها — لا نصًّا عاديًا —
 *     وكذلك في زر الاختيار والمعاينة أسفله.
 *  3) فتح القائمة واختيار الوحدات فعليًا بالفأرة وبلوحة المفاتيح في Chromium.
 *  4) تغيير الوحدة يحدّث النتيجة بشكل صحيح، ويبقى ترتيب «قيمة قبل وحدة».
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

const strip = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, "");

test("محوّل الوحدات في Chromium: اختيار مخصص برموز KaTeX داخل القائمة والتفاعل يعمل", { timeout: 120_000 }, async () => {
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
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => pageErrors.push(String(err)));
    await page.goto(pathToFileURL(htmlPath).href);
    await page.waitForSelector(".katex", { timeout: 15000 });

    // (1) لا قوائم أصلية — مكوّن مخصص بوسوم ARIA
    const nativeSelects = await page.$$eval("select", (els) => els.length);
    const nativeOptions = await page.$$eval("option", (els) => els.length);
    assert.equal(nativeSelects, 0, "ما زالت عناصر select أصلية موجودة");
    assert.equal(nativeOptions, 0, "ما زالت عناصر option أصلية موجودة");
    const combos = page.locator('button[aria-haspopup="listbox"]');
    assert.equal(await combos.count(), 2, "زرّا combobox (من/إلى وحدة)");
    assert.equal(await page.$$eval('[role="listbox"]', (e) => e.length), 0, "القائمة مغلقة أولًا");

    const fromBtn = page.locator('button[aria-label="من وحدة"]');
    const toBtn = page.locator('button[aria-label="إلى وحدة"]');

    // (2) KaTeX في زر الاختيار + المعاينة أسفله (رمز الوحدة لا يظهر نصًّا عاديًا)
    assert.equal(strip(await fromBtn.locator(".katex").first().textContent()), "km", "رمز km بـ KaTeX في الزر");
    assert.equal(strip(await toBtn.locator(".katex").first().textContent()), "m", "رمز m بـ KaTeX في الزر");
    const katexPerField = await fromBtn.evaluate(
      (b) => (b.parentElement?.parentElement?.querySelectorAll(".katex").length) ?? 0,
    );
    assert.ok(katexPerField >= 2, `الزر + المعاينة أسفله KaTeX، وُجد ${katexPerField}`);

    // (3) فتح القائمة: كل خيار يعرض رمزه بـ KaTeX داخل القائمة
    await fromBtn.click();
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "true", "القائمة مفتوحة");
    const options = page.locator('ul[role="listbox"] li[role="option"]');
    assert.equal(await options.count(), 4, "خيارات الطول الأربعة");
    const optInfo = await page.$$eval('ul[role="listbox"] li[role="option"]', (els) =>
      els.map((el) => ({
        hasKatex: !!el.querySelector(".katex"),
        symbol: (el.querySelector(".katex")?.textContent ?? "").replace(/\s+/g, ""),
        selected: el.getAttribute("aria-selected"),
      })),
    );
    for (const o of optInfo) {
      assert.ok(o.hasKatex, `خيار بلا KaTeX: ${JSON.stringify(o)}`);
      assert.ok(o.symbol.length > 0, `رمز فارغ: ${JSON.stringify(o)}`);
    }
    assert.deepEqual(optInfo.map((o) => o.symbol).sort(), ["cm", "km", "m", "mm"], "رموز الخيارات بـ KaTeX");
    assert.ok(optInfo.some((o) => o.selected === "true"), "الخيار الحالي معلَّم aria-selected");
    const listboxKatex = await page.$$eval('ul[role="listbox"] .katex', (els) => els.length);
    assert.equal(listboxKatex, 4, "أربع صيغ KaTeX داخل القائمة");

    // (4) اختيار بالفأرة: km → cm، النتيجة تتحدّث (2.5 cm = 0.025 m)
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: "cm" }).first().click();
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "false", "القائمة تُغلق بعد الاختيار");
    for (let i = 0; i < 50; i++) {
      const texts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
      if (texts.some((t) => t.includes("0.025"))) break;
      await page.waitForTimeout(100);
    }
    const afterMouse = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
    assert.ok(afterMouse.some((t) => t.includes("0.025")), `النتيجة بعد اختيار cm: ${JSON.stringify(afterMouse)}`);
    assert.equal(strip(await fromBtn.locator(".katex").first().textContent()), "cm", "الزر يعرض cm بعد الاختيار");

    // (5) لوحة المفاتيح: Escape يغلق، ثم Enter يفتح، الأسهم تتنقّل، Enter يختار
    await fromBtn.click(); // افتح بالفأرة
    await page.keyboard.press("Escape");
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "false", "Escape يغلق");
    await fromBtn.focus();
    await page.keyboard.press("Enter");
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "true", "Enter يفتح");
    // الفهرس الحالي cm (2): ArrowDown → mm (3) → ArrowDown → km (0) → ArrowDown → m (1)
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "false", "Enter يختار ويغلق");
    assert.equal(strip(await fromBtn.locator(".katex").first().textContent()), "m", "الاختيار بلوحة المفاتيح: m");
    for (let i = 0; i < 50; i++) {
      const texts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
      if (texts.some((t) => t.includes("2500"))) break;
      await page.waitForTimeout(100);
    }
    const afterKb = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
    // من=m وإلى=m ⇒ النتيجة 2.5 (تبدّل من cm إلى m في الخطوة 4)
    assert.ok(afterKb.some((t) => t.includes("2.5") && t.endsWith("m")), `النتيجة بعد اختيار m: ${JSON.stringify(afterKb)}`);

    // (6) القائمة الثانية (إلى وحدة): فتح واختيار بالفأرة → mm (2.5 m = 2500 mm)
    await toBtn.click();
    const toOptions = await page.$$eval('ul[role="listbox"] li[role="option"]', (els) =>
      els.map((el) => (el.querySelector(".katex")?.textContent ?? "").replace(/\s+/g, "")),
    );
    assert.deepEqual(toOptions.sort(), ["cm", "km", "m", "mm"], "خيارات الهدف بـ KaTeX");
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: "mm" }).first().click();
    for (let i = 0; i < 50; i++) {
      const texts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
      if (texts.some((t) => t.includes("2500mm") || (t.includes("2500") && t.includes("mm")))) break;
      await page.waitForTimeout(100);
    }
    const finalTexts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
    const result = finalTexts.find((t) => t.includes("2500") && t.includes("mm"));
    assert.ok(result, `النتيجة 2500 mm: ${JSON.stringify(finalTexts)}`);
    assert.ok(result.indexOf("2500") < result.indexOf("mm"), `ترتيب قيمة قبل وحدة: ${result}`);

    // (7) تفاعل الفئة محفوظ: «الكتلة» يبدّل الخيارات إلى kg/g
    await page.locator("button", { hasText: "الكتلة" }).first().click();
    await fromBtn.click();
    const massOptions = await page.$$eval('ul[role="listbox"] li[role="option"]', (els) =>
      els.map((el) => (el.querySelector(".katex")?.textContent ?? "").replace(/\s+/g, "")),
    );
    assert.deepEqual(massOptions.sort(), ["g", "kg"], "خيارات الكتلة بـ KaTeX بعد تبديل الفئة");
    await page.keyboard.press("Escape");

    // (8) فئة الزمن: افتحها، ثم قائمة «من وحدة» بخيارات h/min/s — كلها KaTeX فعلي داخل القائمة
    await page.locator("button", { hasText: "الزمن" }).first().click();
    // بعد التبديل: من=h وإلى=min ⇒ 2.5 h = 150 min
    assert.equal(strip(await fromBtn.locator(".katex").first().textContent()), "h", "الزمن: رمز h في الزر");
    for (let i = 0; i < 50; i++) {
      const texts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
      if (texts.some((t) => t.includes("150") && t.includes("min"))) break;
      await page.waitForTimeout(100);
    }
    const timeInitial = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
    assert.ok(
      timeInitial.some((t) => t.includes("150") && t.includes("min")),
      `النتيجة بعد فئة الزمن (2.5 h = 150 min): ${JSON.stringify(timeInitial)}`,
    );

    await fromBtn.click();
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "true", "قائمة الزمن تُفتح");
    const timeOptions = await page.$$eval('ul[role="listbox"] li[role="option"]', (els) =>
      els.map((el) => ({
        symbol: (el.querySelector(".katex")?.textContent ?? "").replace(/\s+/g, ""),
        hasKatexElement: !!el.querySelector(".katex"),
        insideListbox: !!el.closest('ul[role="listbox"]'),
      })),
    );
    assert.equal(timeOptions.length, 3, `خيارات الزمن الثلاثة، وُجد ${timeOptions.length}`);
    assert.deepEqual(
      timeOptions.map((o) => o.symbol).sort(),
      ["h", "min", "s"],
      "خيارات الزمن h/min/s بـ KaTeX داخل القائمة",
    );
    for (const o of timeOptions) {
      assert.ok(o.hasKatexElement && o.insideListbox, `الخيار لا يحمل عنصر KaTeX داخل القائمة: ${JSON.stringify(o)}`);
    }
    const timeListKatex = await page.$$eval('ul[role="listbox"] .katex', (els) => els.length);
    assert.equal(timeListKatex, 3, "ثلاثة عناصر KaTeX فعلية داخل قائمة الزمن");

    // اختيار s بالفأرة → 2.5 s = 0.041667 min
    await page.locator('ul[role="listbox"] li[role="option"]', { hasText: "ثانية" }).first().click();
    assert.equal(await fromBtn.getAttribute("aria-expanded"), "false", "القائمة تُغلق بعد اختيار s");
    assert.equal(strip(await fromBtn.locator(".katex").first().textContent()), "s", "الزر يعرض s بعد الاختيار");
    for (let i = 0; i < 50; i++) {
      const texts = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
      if (texts.some((t) => t.includes("0.041667"))) break;
      await page.waitForTimeout(100);
    }
    const timeFinal = await page.$$eval(".katex", (els) => els.map((e) => (e.textContent ?? "").replace(/\s+/g, "")));
    const timeResult = timeFinal.find((t) => t.includes("0.041667"));
    assert.ok(timeResult, `النتيجة بعد اختيار s (2.5 s = 0.041667 min): ${JSON.stringify(timeFinal)}`);
    assert.ok(timeResult.indexOf("0.041667") < timeResult.indexOf("min"), `ترتيب قيمة قبل وحدة: ${timeResult}`);

    // (9) لا أخطاء عرض على الإطلاق: لا katex-error ولا أخطاء console ولا استثناءات
    const katexErrors = await page.$$eval(".katex-error", (els) => els.length);
    assert.equal(katexErrors, 0, "عناصر katex-error في الصفحة");
    assert.deepEqual(pageErrors, [], "استثناءات JavaScript في الصفحة");
    assert.deepEqual(
      consoleErrors.filter((t) => !t.includes("favicon")),
      [],
      "أخطاء console أثناء العرض والتفاعل",
    );
  } finally {
    await browser.close();
  }
});
