/**
 * فحص متصفح حقيقي على التصدير الثابت المنشور للدرس الجديد.
 *
 * يُشغَّل بعد `npm run build` عبر `npm run test:export`: يبدأ خادماً ثابتاً
 * محلياً يخدم مجلد `out/` تحت `basePath`، ثم يزور صفحة الدرس وصفحة الاختبار
 * على 1440 و390 و320، ويتحقق من المراحل والتفاعل وعدم كشف الإجابات قبل
 * التسليم، ويحفظ لقطات فعلية داخل `docs/review/pressure-in-liquids/screenshots`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { extname, join, dirname, normalize } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const OUT = join(ROOT, "out");
const BASE = "/Physics_Chemistry_7th";
const SHOTS = join(ROOT, "docs/review/pressure-in-liquids/screenshots");
const AL_LIB = "/tmp/al2023/lib";

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
};

function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023-liquid-export.tar");
    execFileSync("bash", ["-c", `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`], { stdio: "inherit" });
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
  }
  process.env.LD_LIBRARY_PATH = [AL_LIB, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
}

async function serveOut(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url ?? "/", "http://127.0.0.1").pathname;
    let rel = decodeURIComponent(pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = normalize(join(OUT, rel));
    if (!file.startsWith(OUT) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as AddressInfo).port;
  return {
    url: `http://127.0.0.1:${port}${BASE}`,
    close: () => new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve()))),
  };
}

test("صفحتا الدرس والاختبار تعملان في التصدير الثابت على 1440/390/320", { timeout: 300_000 }, async () => {
  assert.ok(existsSync(join(OUT, "index.html")), "مجلد out/ غير موجود — شغّل npm run build أولاً");
  ensureBrowserLibs();
  mkdirSync(SHOTS, { recursive: true });
  const { url, close } = await serveOut();
  const mod = require("@sparticuz/chromium") as { default?: { executablePath(): Promise<string>; args: string[] } } & { executablePath(): Promise<string>; args: string[] };
  const chromiumMod = mod.default ?? mod;
  const { chromium } = require("playwright-core") as typeof import("playwright-core");

  try {
    // إعادة تشغيل المتصفح لكل مقاس تطابق اختبارات العرض المعتمدة، وهي أثبت
    // مع Chromium المُجمَّع في هذه البيئة.
    for (const width of [1440, 390, 320]) {
      const browser = await chromium.launch({
        executablePath: await chromiumMod.executablePath(), args: chromiumMod.args, headless: true,
      });
      try {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const pageErrors: string[] = [];
        page.on("pageerror", (e) => pageErrors.push(e.message));

        // صفحة الدرس: المرحلة ٤ والمختبر الأول يعملان فعلياً.
        await page.goto(`${url}/lessons/pressure-in-liquids/`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "الضغط في السوائل" }).waitFor();
        if (width === 1440) {
          await page.getByRole("button", { name: /المختبر التفاعلي/ }).first().click();
          await page.locator('[data-lab-count="4"]').waitFor();
          await page.getByRole("button", { name: "الثقب الأعمق" }).click();
          await page.locator('[data-run-button="three-holes"]').click();
          await page.getByText(/توقّعك صحيح/).waitFor();
          await page.getByRole("button", { name: /اختبر نفسك/ }).first().click();
          const quizLink = page.getByRole("link", { name: /ابدأ الاختبار الإلكتروني/ });
          await quizLink.waitFor();
          assert.ok((await quizLink.getAttribute("href"))?.includes("quiz-pressure-in-liquids-7"));
          await page.screenshot({ path: join(SHOTS, "site-1440.png") });
        } else if (width === 390) {
          // زر «دفتر الطالب» في شريط المراحل الصغير يحمل 📒؛ لا نعتمد على ترتيب
          // أزرار الترويسة لأن التنقّل المتجاوب يضيف أزراراً أخرى قبلها.
          await page.getByRole("button", { name: "📒" }).click();
          const notebook = page.locator('[data-approved-notebook="pressure-in-liquids"]');
          await notebook.waitFor();
          await notebook.scrollIntoViewIfNeeded();
          await page.screenshot({ path: join(SHOTS, "site-390.png") });
        } else {
          await page.screenshot({ path: join(SHOTS, "site-320.png") });
        }
        let overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `تمرير أفقي في صفحة الدرس ${overflow}px عند ${width}`);
        assert.deepEqual(await page.locator(".katex-error").allTextContents(), []);

        // صفحة الاختبار: لا إجابة ولا تفسير قبل التسليم، ثم تفسيرات بعد التسليم.
        await page.goto(`${url}/quizzes/quiz-pressure-in-liquids-7/`, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "ابدأ الاختبار" }).waitFor();
        assert.equal(await page.locator('[data-answer-revealed="true"]').count(), 0, "كُشفت إجابة قبل بدء الاختبار");
        await page.getByRole("button", { name: "ابدأ الاختبار" }).click();
        assert.equal(await page.locator('[data-answer-revealed="true"]').count(), 0, "كُشفت إجابة قبل التسليم");
        assert.equal(await page.getByText("الإجابة الصحيحة").count(), 0, "ظهرت إجابة صحيحة قبل التسليم");
        const sections = page.locator('section[id^="pil-"]');
        assert.equal(await sections.count(), 10, "عدد أسئلة الاختبار ليس 10");
        for (let i = 0; i < 10; i++) {
          const section = sections.nth(i);
          if (await section.locator("input").count()) await section.locator("input").fill("1");
          else await section.locator("button").first().click();
        }
        await page.getByRole("button", { name: "سلّم الاختبار" }).last().click();
        await page.locator('[data-answer-revealed="true"]').waitFor();
        assert.ok(await page.getByText("الإجابة الصحيحة").count() > 0, "لم تظهر التفسيرات بعد التسليم");

        overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        assert.ok(overflow <= 1, `تمرير أفقي في صفحة الاختبار ${overflow}px عند ${width}`);
        assert.deepEqual(await page.locator(".katex-error").allTextContents(), []);
        assert.deepEqual(pageErrors, []);
        await page.close();
      } finally {
        await browser.close();
      }
    }
  } finally {
    await close();
  }
});
