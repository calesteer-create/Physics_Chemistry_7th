import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
const require = createRequire(import.meta.url);
const mod = require("@sparticuz/chromium"),
  c = mod.default ?? mod;
const { chromium } =
  require("playwright-core") as typeof import("playwright-core");
async function main() {
  mkdirSync(".cache/contrast", { recursive: true });
  const browser = await chromium.launch({
    executablePath: await c.executablePath(),
    args: c.args,
    env: { ...process.env, LD_LIBRARY_PATH: "/tmp/al2023/lib" },
  });
  const context = await browser.newContext();
  const results: unknown[] = [];
  try {
    for (const width of [390, 1440]) {
      const page = await context.newPage();
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(
        "http://localhost:3000/Physics_Chemistry_7th/lessons/simple-machines/",
      );
      async function stage(i: number) {
        if (width < 1024)
          await page
            .getByRole("button", { name: String(i), exact: true })
            .click();
        else
          await page
            .locator("aside nav")
            .getByRole("button")
            .nth(i - 1)
            .click();
      }
      for (const state of ["explain", "lab", "book"]) {
        await stage(state === "explain" ? 3 : state === "lab" ? 4 : 7);
        if (state === "lab") {
          await page
            .getByRole("button", { name: "البكرات", exact: true })
            .click();
          const lab = page.locator('section[aria-label="مختبر البكرات"]');
          await lab.locator("fieldset button").first().click();
          await lab
            .getByRole("button", { name: "شغّل التجربة", exact: true })
            .click();
          await page.waitForTimeout(3400);
        }
        if (state === "book") {
          await page
            .getByRole("button", { name: "تلميح", exact: true })
            .evaluateAll((bs) =>
              bs.forEach((b) => (b as HTMLButtonElement).click()),
            );
          await page
            .getByRole("button", { name: "إظهار الحل التفصيلي", exact: true })
            .evaluateAll((bs) =>
              bs.forEach((b) => (b as HTMLButtonElement).click()),
            );
        }
        await page.evaluate(() => {
          document.querySelector("header")!.style.display = "none";
          scrollTo({ top: 0, behavior: "instant" });
        });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        await page.evaluate(() =>
          document
            .querySelector(".scroll-mt-24")!
            .scrollIntoView({ behavior: "instant", block: "start" }),
        );
        const samples = await page.evaluate(() => {
          const out: {
            text: string;
            color: string;
            opacity: number;
            x: number;
            y: number;
          }[] = [];
          const root = document.querySelector(".scroll-mt-24")!;
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            const parent = node.parentElement!;
            if (
              !node.textContent?.trim() ||
              parent.closest("script,style,title,desc,button:disabled,aside")
            )
              continue;
            const style = getComputedStyle(parent);
            if (style.visibility !== "visible" || style.display === "none")
              continue;
            let opacity = 1;
            let e: Element | null = parent;
            while (e) {
              opacity *= parseFloat(getComputedStyle(e).opacity);
              e = e.parentElement;
            }
            if (opacity < 0.99) continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) {
              if (rect.width < 2 || rect.height < 2) continue;
              const x = rect.left + rect.width * 0.5,
                y = rect.top + rect.height * 0.5;
              if (x < 0 || x >= innerWidth || y < 0 || y >= innerHeight)
                continue;
              out.push({
                text: node.textContent.trim(),
                color: style.color,
                opacity,
                x,
                y,
              });
            }
          }
          return out;
        });
        const stem = `.cache/contrast/${state}-${width}`;
        writeFileSync(`${stem}.json`, JSON.stringify(samples));
        const hide = await page.addStyleTag({
          content:
            "html body *:not(#contrast-a):not(#contrast-b) {color:transparent!important;text-shadow:none!important;transition:none!important;animation:none!important}",
        });
        await page.screenshot({ path: `${stem}.png`, fullPage: false });
        await hide.evaluate((e) => e.parentNode?.removeChild(e));
        const measured = JSON.parse(
          execFileSync(
            "python3",
            [
              "-c",
              `import sys,json,math,re
sys.path.insert(0,'.cache/py')
from PIL import Image
stem=sys.argv[1]; im=Image.open(stem+'.png').convert('RGB'); samples=json.load(open(stem+'.json'))
def lum(c):
 v=[x/255 for x in c]; v=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in v]; return .2126*v[0]+.7152*v[1]+.0722*v[2]
r=[]
for s in samples:
 x,y=round(s['x']),round(s['y'])
 if not(0<=x<im.width and 0<=y<im.height): continue
 c=[float(v) for v in re.findall(r'[\\d.]+',s['color'])]
 if len(c)<3: continue
 bg=im.getpixel((x,y)); alpha=c[3] if len(c)>3 else 1; fg=[c[i]*alpha+bg[i]*(1-alpha) for i in range(3)]
 a,b=sorted([lum(fg),lum(bg)]); ratio=(b+.05)/(a+.05); r.append({'text':s['text'],'ratio':round(ratio,2),'foreground':s['color'],'background':bg})
print(json.dumps({'count':len(r),'minimum':min([s['ratio'] for s in r],default=None),'below45':[s for s in r if s['ratio']<4.5]},ensure_ascii=False))`,
              stem,
            ],
            { encoding: "utf8" },
          ),
        );
        results.push({ width, state, ...measured });
        await page.evaluate(() =>
          document.querySelector("header")!.style.removeProperty("display"),
        );
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
  writeFileSync(
    "docs/review/simple-machines/contrast-results.json",
    JSON.stringify(
      {
        method:
          "Sample background pixels under text-range centers after making text transparent. Disabled/translucent text excluded; gradients remain in background. Diagnostic sampling, not a proof of every pixel.",
        results,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(JSON.stringify(results, null, 2));
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
