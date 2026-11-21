import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { unit1Assessment } from "../../src/content/unit1-assessment";
import {
  PREVIOUS_FORM_KEY,
  validPrevious,
} from "../../src/lib/unit1-assessment";
const require = createRequire(import.meta.url);
const cModule = require("@sparticuz/chromium");
const c = cModule.default ?? cModule;
const { chromium } =
  require("playwright-core") as typeof import("playwright-core");
const root =
  process.env.AUDIT_URL ?? "http://localhost:3000/Physics_Chemistry_7th";
const out = "docs/review/simple-machines/captures";
mkdirSync(out, { recursive: true });
async function main() {
  const browser = await chromium.launch({
    executablePath: await c.executablePath(),
    args: c.args,
    env: { ...process.env, LD_LIBRARY_PATH: "/tmp/al2023/lib" },
  });
  const context = await browser.newContext();
  const widths = [320, 360, 390, 768, 1024, 1440, 1920];
  const report: unknown[] = [];
  const failures: string[] = [];
  const stages = [
    "التهيئة والاستكشاف",
    "اكتشف المفهوم",
    "الشرح التفصيلي",
    "المختبر التفاعلي",
    "افهم وتحقق",
    "طبّق ما تعلمته",
    "اختبر نفسك",
    "مراجعة الدرس",
    "دفتر الطالب",
  ];
  try {
    for (const width of widths) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("response", (r) => {
        if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
      });
      const calls: string[] = [];
      page.on("request", (r) => {
        if (
          ["fetch", "xhr"].includes(r.resourceType()) &&
          !r.url().startsWith(root + "/")
        )
          calls.push(r.url());
      });
      async function stage(i: number) {
        if (width < 1024)
          await page
            .getByRole("button", {
              name: i === 8 ? "📒" : String(i + 1),
              exact: true,
            })
            .click();
        else
          await page
            .locator("aside nav")
            .getByRole("button", { name: new RegExp(stages[i]) })
            .click();
        await page.waitForTimeout(350);
      }
      async function metrics(name: string) {
        const data = await page.evaluate(() => {
          const svgLabels = Array.from(
            document.querySelectorAll('svg[role="img"] foreignObject'),
          )
            .filter((el) => el.getBoundingClientRect().width > 0)
            .flatMap((el) => {
              const d = el.querySelector("div");
              if (!d) return [];
              const svg = el.closest("svg")!;
              const scale =
                svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
              return [parseFloat(getComputedStyle(d).fontSize) * scale];
            });
          return {
            overflow: Math.max(
              0,
              document.documentElement.scrollWidth - innerWidth,
            ),
            katexErrors: Array.from(
              document.querySelectorAll(".katex-error"),
            ).map((e) => e.textContent),
            minLabel: svgLabels.length ? Math.min(...svgLabels) : null,
          };
        });
        if (data.overflow > 0 || data.katexErrors.length)
          failures.push(`${width} ${name}: ${JSON.stringify(data)}`);
        report.push({ width, state: name, ...data });
      }
      await page.goto(`${root}/lessons/simple-machines/`);
      await page.evaluate(() => document.fonts.ready);
      for (let i = 0; i < 9; i++) {
        await stage(i);
        await metrics(`stage-${i + 1}`);
        if ((width === 390 || width === 1440) && [0, 1, 2, 8].includes(i)) {
          await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
          await page.screenshot({
            path: `${out}/stage-${i + 1}-${width}.${i === 8 ? "png" : "webp"}`,
            fullPage: i === 0,
          });
        }
        if (i === 0) {
          await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
          await page.screenshot({ path: `${out}/overview-${width}.webp` });
        }
        if (i === 2 || i === 3)
          await page.evaluate(() => {
            document.querySelector("header")!.style.display = "none";
          });
        if (i === 2 && (width === 320 || width === 390 || width === 1440)) {
          const svgs = page.locator('svg[role="img"]:visible');
          for (let n = 0; n < (await svgs.count()); n++)
            await svgs.nth(n).screenshot({
              path: `${out}/figure-${n + 1}-${width}.webp`,
              style: "header {visibility:hidden!important}",
            });
        }
        if (i === 3) {
          for (const name of [
            "الرافعة",
            "البكرات",
            "المستوى المائل",
            "البرغي",
            "العجلة والمحور",
          ]) {
            await page.getByRole("button", { name, exact: true }).click();
            const lab = page.locator(`section[aria-label="مختبر ${name}"]`);
            assert.ok(
              await lab
                .getByRole("button", { name: "شغّل التجربة", exact: true })
                .isDisabled(),
            );
            await lab.locator("fieldset button").first().click();
            await lab
              .getByRole("button", { name: "شغّل التجربة", exact: true })
              .click();
            await page.waitForTimeout(240);
            const before = await lab.locator("svg").first().innerHTML();
            await page.waitForTimeout(400);
            const during = await lab.locator("svg").first().innerHTML();
            if (name !== "الرافعة")
              assert.notEqual(before, during, `${name} must move`);
            await page.waitForTimeout(2700);
            await metrics(`lab-${name}-complete`);
            if (width === 390 || width === 1440)
              await lab.screenshot({
                path: `${out}/lab-${["الرافعة", "البكرات", "المستوى المائل", "البرغي", "العجلة والمحور"].indexOf(name)}-${width}.webp`,
                style: "header {visibility:hidden!important}",
              });
            await lab
              .getByRole("button", { name: "إعادة الضبط", exact: true })
              .click();
            assert.equal(
              await lab.locator("progress").getAttribute("value"),
              "0",
            );
            if (name === "البكرات") {
              for (const mode of ["fixed", "combined"]) {
                await lab.locator("select").selectOption(mode);
                await lab.locator("fieldset button").first().click();
                await lab
                  .getByRole("button", { name: "شغّل التجربة", exact: true })
                  .click();
                await page.waitForTimeout(3200);
                await metrics(`pulley-${mode}`);
                await lab
                  .getByRole("button", { name: "إعادة الضبط", exact: true })
                  .click();
              }
            }
          }
        }
        if (i === 2 || i === 3)
          await page.evaluate(() =>
            document.querySelector("header")!.style.removeProperty("display"),
          );
        if (i === 6) {
          await page
            .getByRole("button", { name: "تلميح", exact: true })
            .evaluateAll((buttons) =>
              buttons.forEach((b) => (b as HTMLButtonElement).click()),
            );
          await page
            .getByRole("button", { name: "إظهار الحل التفصيلي", exact: true })
            .evaluateAll((buttons) =>
              buttons.forEach((b) => (b as HTMLButtonElement).click()),
            );
          await metrics("book-all-open");
          if (width === 390 || width === 1440)
            await page.screenshot({
              path: `${out}/book-open-${width}.png`,
              fullPage: false,
            });
        }
      }
      await page.goto(`${root}/quizzes/quiz-unit-1/`);
      await page
        .getByRole("button", { name: "ابدأ الاختبار", exact: true })
        .click();
      const previous = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        PREVIOUS_FORM_KEY,
      );
      assert.ok(validPrevious(previous));
      assert.equal(await page.locator('section[id^="u1-"]').count(), 30);
      await page
        .getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" })
        .click();
      assert.ok(await page.locator('p[role="alert"]').isVisible());
      for (const id of previous) {
        const q = unit1Assessment.find((q) => q.id === id)!;
        const section = page.locator(`[id="${id}"]`);
        if (q.type === "number")
          await section.locator("input").fill(String(q.answer));
        else
          await section
            .getByRole("button")
            .nth(q.type === "tf" ? (q.answer ? 0 : 1) : (q.answer as number))
            .click();
      }
      await page
        .getByRole("button", { name: "تسليم الاختبار وإظهار النتيجة" })
        .click();
      await page.getByRole("heading", { name: /نتيجتك: 30 من 30/ }).waitFor();
      await metrics("unit-results");
      if (width === 390 || width === 1440) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({ path: `${out}/unit-results-${width}.webp` });
      }
      await page
        .getByRole("button", { name: "محاولة جديدة", exact: true })
        .click();
      const next = await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!),
        PREVIOUS_FORM_KEY,
      );
      assert.ok(validPrevious(next));
      assert.equal(
        next.filter((id: string) => !previous.includes(id)).length,
        20,
      );
      await metrics("unit-retry");
      await page.goto(`${root}/units/unit-1/`);
      await page
        .getByRole("link", { name: /اختبار الوحدة الأولى الشامل/ })
        .waitFor();
      await metrics("unit-page");
      await page.goto(`${root}/quizzes/quiz-simple-machines-5/`);
      await page
        .getByRole("button", { name: "ابدأ الاختبار", exact: true })
        .click();
      assert.equal(await page.locator('section[id^="smq"]').count(), 10);
      await metrics("lesson-quiz");
      report.push({ width, errors, unexpectedNetwork: calls });
      if (errors.length || calls.length)
        failures.push(`${width}: ${JSON.stringify({ errors, calls })}`);
      await page.close();
    }
    // Storage unavailable: still start, answer, and retry without persistence.
    const blocked = await context.newPage();
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("blocked");
      };
      Storage.prototype.setItem = () => {
        throw new Error("blocked");
      };
    });
    await blocked.goto(`${root}/quizzes/quiz-unit-1/`);
    await blocked
      .getByRole("button", { name: "ابدأ الاختبار", exact: true })
      .click();
    assert.equal(await blocked.locator('section[id^="u1-"]').count(), 30);
    await blocked.close();
  } finally {
    await browser.close();
    writeFileSync(
      "docs/review/simple-machines/visual-results.json",
      JSON.stringify(
        {
          date: new Date().toISOString(),
          root,
          widths,
          failures,
          measurements: report,
        },
        null,
        2,
      ) + "\n",
    );
  }
  assert.deepEqual(failures, []);
  console.log(
    `PASS: ${widths.join(", ")}; ${report.length} states; all labs, 30/30 grading, retry +20, blocked storage.`,
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
