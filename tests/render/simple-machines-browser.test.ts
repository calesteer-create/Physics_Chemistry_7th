import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { brotliDecompressSync } from "node:zlib";
import { simpleMachinesNotebookText } from "../../src/content/lessons/unit1/simple-machines-notebook";
const require = createRequire(import.meta.url);
test(
  "all 60 questions, diagrams and approved notebook render without KaTeX errors; heading order preserved",
  { timeout: 120000 },
  async () => {
    const root = process.cwd(),
      temp = join(tmpdir(), "simple-machines-render");
    mkdirSync(temp, { recursive: true });
    const entry = join(temp, "entry.tsx");
    writeFileSync(
      entry,
      `
 import React from 'react';import {createRoot} from 'react-dom/client';
 import {unit1Assessment} from '@/content/unit1-assessment';
 import {ScienceText} from '@/components/quiz/LocalGradedQuizRunner';
 import {AssessmentDiagram} from '@/components/figures/simple-machines-figures';
 import {SimpleMachinesNotebook} from '@/components/lesson/SimpleMachinesNotebook';
 createRoot(document.getElementById('root')!).render(<div>{unit1Assessment.map(q=><section id={q.id} key={q.id}><ScienceText text={q.prompt}/>{q.conditions&&<ScienceText text={q.conditions}/>}{q.diagram&&<AssessmentDiagram q={q}/>}<ScienceText text={q.explain}/>{q.options?.map((s,i)=><ScienceText key={i} text={s}/>)}</section>)}<SimpleMachinesNotebook/></div>);
 `,
    );
    await require("esbuild").build({
      entryPoints: [entry],
      bundle: true,
      outfile: join(temp, "bundle.js"),
      platform: "browser",
      format: "iife",
      jsx: "automatic",
      alias: { "@": join(root, "src") },
      nodePaths: [join(root, "node_modules")],
      loader: { ".css": "empty" },
      define: { "process.env": "{}", "process.env.NODE_ENV": '"production"' },
      logLevel: "silent",
    });
    writeFileSync(
      join(temp, "index.html"),
      '<!doctype html><html dir="rtl"><head><meta charset="utf-8"></head><body><div id="root"></div><script src="bundle.js"></script></body></html>',
    );
    if (!existsSync("/tmp/al2023/lib/libnss3.so")) {
      const tar = join(temp, "libs.tar");
      writeFileSync(
        tar,
        brotliDecompressSync(
          readFileSync(
            join(root, "node_modules/@sparticuz/chromium/bin/al2023.tar.br"),
          ),
        ),
      );
      mkdirSync("/tmp/al2023", { recursive: true });
      execFileSync("tar", ["-xf", tar, "-C", "/tmp/al2023"]);
    }
    const mod = require("@sparticuz/chromium"),
      c = mod.default ?? mod;
    const { chromium } =
      require("playwright-core") as typeof import("playwright-core");
    const browser = await chromium.launch({
      executablePath: await c.executablePath(),
      args: c.args,
      env: { ...process.env, LD_LIBRARY_PATH: "/tmp/al2023/lib" },
    });
    try {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(pathToFileURL(join(temp, "index.html")).href);
      await page.locator("[data-approved-notebook]").waitFor();
      assert.equal(await page.locator('section[id^="u1-"]').count(), 60);
      assert.deepEqual(
        await page.locator(".katex-error").allTextContents(),
        [],
      );
      assert.deepEqual(errors, []);
      const headings = await page
        .locator("[data-approved-notebook] :is(h3,h4,h5)")
        .allTextContents();
      assert.deepEqual(
        headings,
        [...simpleMachinesNotebookText.matchAll(/^#{1,3} (.+)$/gm)].map(
          (m) => m[1],
        ),
      );
      assert.equal(
        await page.locator("[data-approved-notebook] table").count(),
        3,
      );
      assert.equal(
        await page.locator("[data-approved-notebook] h4").count(),
        17,
      );
    } finally {
      await browser.close();
    }
  },
);
