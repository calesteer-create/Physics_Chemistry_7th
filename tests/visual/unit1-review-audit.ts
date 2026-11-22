/**
 * مراجعة بصرية فعلية لقسم «أراجع وأختبر نفسي — الوحدة الأولى» على النسخة
 * الثابتة المبنيّة (`out/`):
 * - قياس التمرير الأفقي وقصّ النصوص وأخطاء KaTeX عند سبعة عروض.
 * - تفاعلات حقيقية: صح/خطأ، القراءة البيانية، تخطيط النقاط، الجدول، الربيعات،
 *   مخطط القوى، ولوحة المراجعة.
 * - حفظ لقطات الشاشة في docs/review/unit1-review/captures.
 *
 * التشغيل (بعد `npm run build` وخدمة out على مسار المستودع):
 *   AUDIT_URL=http://localhost:8083/Physics_Chemistry_7th npx tsx tests/visual/unit1-review-audit.ts
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const AL_LIB = "/tmp/al2023/lib";
const BASE = process.env.AUDIT_URL ?? "http://localhost:8083/Physics_Chemistry_7th";
const PAGE = `${BASE}/units/unit-1/review/`;
const CAPTURES = process.env.AUDIT_CAPTURES ?? join(ROOT, "docs/review/unit1-review/captures");
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

function ensureBrowserLibs() {
  if (!existsSync(join(AL_LIB, "libnss3.so"))) {
    const tarBr = join(ROOT, "node_modules/@sparticuz/chromium/bin/al2023.tar.br");
    const tar = join(tmpdir(), "al2023-unit1-review.tar");
    execFileSync("bash", [
      "-c",
      `node -e 'const{createBrotliDecompress}=require("node:zlib"),fs=require("fs");fs.createReadStream(process.argv[1]).pipe(createBrotliDecompress()).pipe(fs.createWriteStream(process.argv[2])).on("finish",()=>process.exit(0))' "${tarBr}" "${tar}"`,
    ]);
    mkdirSync("/tmp/al2023", { recursive: true });
    execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
    rmSync(tar, { force: true });
  }
  process.env.LD_LIBRARY_PATH = [AL_LIB, process.env.LD_LIBRARY_PATH].filter(Boolean).join(":");
}

type WidthReport = {
  width: number;
  horizontalOverflow: boolean;
  scrollWidth: number;
  innerWidth: number;
  katexErrors: number;
  clipped: string[];
  cards: number;
  screenshot: string;
};

async function main() {
  ensureBrowserLibs();
  mkdirSync(CAPTURES, { recursive: true });

  const cModule = require("@sparticuz/chromium");
  const c = cModule.default ?? cModule;
  const { chromium } = require("playwright-core") as typeof import("playwright-core");

  // `--single-process` غير مستقر في هذه البيئة؛ يُستبعد مع `--no-zygote`.
  const args: string[] = c.args.filter(
    (arg: string) => !arg.startsWith("--single-process") && !arg.startsWith("--no-zygote"),
  );
  const browser = await chromium.launch({
    executablePath: await c.executablePath(),
    args,
    env: { ...process.env, LD_LIBRARY_PATH: AL_LIB },
  });

  const reports: WidthReport[] = [];
  const failures: string[] = [];

  try {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: width < 500 ? 780 : 950 },
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const response = await page.goto(PAGE, { waitUntil: "networkidle" });
      if (!response || response.status() !== 200) {
        failures.push(`${width}px: الصفحة لم تُحمّل (${response?.status()})`);
      }
      await page.waitForTimeout(250);

      const measured = await page.evaluate(() => {
        const doc = document.documentElement;
        const clipped: string[] = [];
        const nodes = Array.from(
          document.querySelectorAll("main article, main table, main h1, main h2, main h3, main p, main button"),
        );
        for (const node of nodes) {
          const el = node as HTMLElement;
          if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
            clipped.push(`${el.tagName.toLowerCase()}: ${(el.textContent ?? "").trim().slice(0, 40)}`);
          }
        }
        return {
          scrollWidth: doc.scrollWidth,
          innerWidth: window.innerWidth,
          katexErrors: document.querySelectorAll(".katex-error").length,
          clipped: clipped.slice(0, 8),
          cards: document.querySelectorAll("main article").length,
        };
      });

      const horizontalOverflow = measured.scrollWidth > measured.innerWidth + 1;
      if (horizontalOverflow)
        failures.push(`${width}px: تمرير أفقي (${measured.scrollWidth} > ${measured.innerWidth})`);
      if (measured.katexErrors) failures.push(`${width}px: ${measured.katexErrors} خطأ KaTeX`);
      if (measured.clipped.length)
        failures.push(`${width}px: نص مقصوص — ${measured.clipped.join(" | ")}`);

      const shot = join(CAPTURES, `review-${width}.png`);
      await page.screenshot({ path: shot, fullPage: false });
      reports.push({
        width,
        horizontalOverflow,
        scrollWidth: measured.scrollWidth,
        innerWidth: measured.innerWidth,
        katexErrors: measured.katexErrors,
        clipped: measured.clipped,
        cards: measured.cards,
        screenshot: shot.replace(ROOT + "/", ""),
      });
      await context.close();
    }

    /* ═════════ تفاعلات فعلية على عرض الهاتف ═════════ */
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(PAGE, { waitUntil: "networkidle" });

    // 1) صح/خطأ + التصحيح + التحقق
    const firstCard = page.locator("article").first();
    await firstCard.getByRole("button", { name: "خطأ" }).click();
    await firstCard.locator("select, button").filter({ hasText: "" }).first().waitFor();
    const correction = firstCard.locator("button").filter({
      hasText: "تكون حركة جسم مستقيمة منتظمة إذا كانت سرعته ثابتة",
    });
    await correction.first().click();
    await firstCard.getByRole("button", { name: /تحقّق من الإجابة/ }).click();
    await firstCard.getByText("أحسنت — لماذا؟").waitFor({ timeout: 5000 });
    await page.screenshot({ path: join(CAPTURES, "interaction-tf-390.png"), fullPage: false });

    // 1ب) حكم خاطئ: تظهر التغذية الراجعة التفسيرية ثم الحل الكامل بالخطوات
    await page.locator('nav[aria-label="محطات المراجعة"] button').first().click();
    const wrongCard = page.locator("article").nth(1);
    await wrongCard.getByRole("button", { name: /^صح$/ }).click();
    await wrongCard.getByRole("button", { name: /تحقّق من الإجابة/ }).click();
    await wrongCard.getByText("ليست الإجابة الصحيحة بعد").waitFor({ timeout: 5000 });
    await page.screenshot({ path: join(CAPTURES, "interaction-wrong-390.png"), fullPage: false });
    await wrongCard.getByRole("button", { name: /أظهر الحل والخطوات/ }).click();
    await wrongCard.getByText("الحل الكامل").waitFor({ timeout: 5000 });
    await page.screenshot({ path: join(CAPTURES, "interaction-steps-390.png"), fullPage: false });

    // 1ج) لوحة المراجعة: البند الخاطئ مدرج و«أعد المحاولة» تُعيد ضبطه
    await page.locator('nav[aria-label="محطات المراجعة"] button').last().click();
    await page.getByText(/بنود تحتاج مراجعة \(1\)/).waitFor({ timeout: 5000 });
    await page.screenshot({ path: join(CAPTURES, "interaction-summary-390.png"), fullPage: false });
    await page.getByRole("button", { name: /أعد المحاولة/ }).first().click();
    await page.waitForTimeout(350);
    if (await page.locator("article").nth(1).getByText("الحل الكامل").count()) {
      failures.push("«أعد المحاولة» لم تُعِد ضبط البطاقة");
    }

    // 2) المحطة الثالثة: الضغط على نقطة بيانية
    await page.getByRole("button", { name: /اقرأ الخط البياني/ }).click();
    const point = page.getByRole("button", { name: /نقطة عند الزمن 3 ثانية والمسافة 40 مترًا/ }).first();
    await point.click();
    await page.getByText("النقطة المختارة:").first().waitFor({ timeout: 5000 });
    await page.screenshot({ path: join(CAPTURES, "interaction-graph-390.png"), fullPage: false });

    // 3) المحطة الرابعة: الجدول ثم التخطيط ثم مخطط القوى
    await page.getByRole("button", { name: /المسائل/ }).click();
    const select = page.locator("select").first();
    await select.selectOption("10");
    const interp = page.getByLabel("الزمن اللازم لقطع 5 cm");
    await interp.fill("5");
    const firstBlankTime = page.getByLabel("أدخل الزمن للعمود 1");
    await firstBlankTime.fill("10");
    await page.screenshot({ path: join(CAPTURES, "interaction-table-390.png"), fullPage: false });

    const plotPoint = page.getByRole("button", { name: /نقطة الزمن 10 ثانية والمسافة 10 سنتيمترًا/ });
    await plotPoint.click();
    await page.screenshot({ path: join(CAPTURES, "interaction-plot-390.png"), fullPage: false });

    const beforeCount = await page.evaluate(() => document.querySelectorAll(".katex-error").length);
    if (beforeCount) failures.push(`تفاعل: ${beforeCount} خطأ KaTeX`);

    await context.close();

    /* ═════════ لقطات لكل بطاقة على عرضين ═════════ */
    const cardDir = join(CAPTURES, "cards");
    mkdirSync(cardDir, { recursive: true });
    let cardCount = 0;
    for (const width of [390, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const p = await ctx.newPage();
      await p.goto(PAGE, { waitUntil: "networkidle" });
      const tabs = p.locator('nav[aria-label="محطات المراجعة"] button');
      const stationCount = await tabs.count();
      for (let index = 0; index < stationCount; index += 1) {
        await tabs.nth(index).click();
        await p.waitForTimeout(220);
        const panel = p.locator('main section[aria-labelledby^="station-"]');
        if (await panel.count()) {
          await panel.scrollIntoViewIfNeeded();
          await p.evaluate(() => window.scrollBy(0, -90));
          await p.waitForTimeout(150);
          await p.screenshot({ path: join(cardDir, `station-${index + 1}-w${width}.png`) });
        }
        const cards = p.locator("main section article");
        const total = await cards.count();
        for (let card = 0; card < total; card += 1) {
          const file = join(cardDir, `w${width}-s${index + 1}-${card + 1}.png`);
          await cards.nth(card).screenshot({ path: file });
          cardCount += 1;
        }
      }
      await tabs.nth(stationCount - 1).click();
      await p.waitForTimeout(300);
      const summaryPanel = p.locator('main section[aria-labelledby="review-summary"]');
      if (await summaryPanel.count()) {
        await summaryPanel.screenshot({ path: join(cardDir, `summary-w${width}.png`) });
      }
      await p.evaluate(() => window.scrollTo(0, 0));
      await p.screenshot({ path: join(cardDir, `top-w${width}.png`) });
      await ctx.close();
    }
    console.log(`لقطات البطاقات: ${cardCount}`);
    /* ═════════ صفحة الوحدة: بطاقتا المراجعة والاختبار ═════════ */
    for (const width of [390, 1440]) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const p = await ctx.newPage();
      await p.goto(`${BASE}/units/unit-1/`, { waitUntil: "networkidle" });
      await p.waitForTimeout(200);
      await p.screenshot({ path: join(CAPTURES, `unit-page-${width}.png`) });
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await p.waitForTimeout(250);
      await p.screenshot({ path: join(CAPTURES, `unit-page-bottom-${width}.png`) });
      const href = await p
        .locator('a[href*="/units/unit-1/review"]')
        .first()
        .getAttribute("href");
      if (!href) failures.push(`${width}px: رابط المراجعة غير موجود في صفحة الوحدة`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  writeFileSync(
    join(CAPTURES, "audit.json"),
    JSON.stringify({ url: PAGE, widths: reports, failures }, null, 2),
  );

  const lines = [
    "# مراجعة بصرية — أراجع وأختبر نفسي (الوحدة الأولى)",
    "",
    `الرابط المفحوص: ${PAGE}`,
    "",
    "| العرض | تمرير أفقي | أخطاء KaTeX | نصوص مقصودة | بطاقات |",
    "|---|---|---|---|---|",
    ...reports.map(
      (r) =>
        `| ${r.width}px | ${r.horizontalOverflow ? "نعم" : "لا"} | ${r.katexErrors} | ${r.clipped.length} | ${r.cards} |`,
    ),
    "",
    failures.length ? `## إخفاقات\n${failures.map((f) => `- ${f}`).join("\n")}` : "## النتيجة: لا إخفاقات",
    "",
  ];
  writeFileSync(join(CAPTURES, "audit.md"), lines.join("\n"));

  console.log(lines.join("\n"));
  if (failures.length) {
    console.error(`\n${failures.length} إخفاقًا`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
