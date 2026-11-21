import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import katex from "katex";
import { unit1Assessment } from "../../src/content/unit1-assessment";
import {
  selectUnit1,
  validPrevious,
  gradeAssessment,
} from "../../src/lib/unit1-assessment";
import {
  advantage,
  leverState,
  pulleyState,
  inclineState,
  screwAdvance,
  wheelState,
} from "../../src/lib/simple-machines-model";
import { simpleMachinesNotebookText } from "../../src/content/lessons/unit1/simple-machines-notebook";
import { simpleMachinesLesson } from "../../src/content/lessons/unit1/simple-machines";
import { parseMachineNotebook } from "../../src/content/simple-machines-text";
import { splitAutoTex } from "../../src/lib/auto-tex";
const base = "e443a051c1a0c6be0a91895087d06575c7439200";
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
function seeded(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
test("60 approved questions, exact frozen transcription and valid answer keys", () => {
  assert.deepEqual(
    unit1Assessment,
    JSON.parse(
      readFileSync(
        "docs/review/simple-machines/approved/unit1-bank.json",
        "utf8",
      ),
    ),
  );
  assert.equal(unit1Assessment.length, 60);
  assert.equal(new Set(unit1Assessment.map((q) => q.id)).size, 60);
  for (let slot = 1; slot <= 30; slot++) {
    const qs = unit1Assessment.filter((q) => q.slot === slot);
    assert.equal(qs.length, 2);
    assert.equal(qs[0].type, qs[1].type);
    assert.equal(qs[0].level, qs[1].level);
    for (const q of qs) {
      assert.ok(q.prompt && q.explain);
      if (q.type === "mcq") {
        assert.equal(q.options!.length, 4);
        assert.ok(
          Number.isInteger(q.answer) && +q.answer >= 0 && +q.answer < 4,
        );
      } else if (q.type === "tf") assert.equal(typeof q.answer, "boolean");
      else assert.ok(Number.isFinite(q.answer));
    }
  }
});
test("1000 consecutive forms: fixed balance, exactly 20 changes and no duplicates", () => {
  let previous: string[] | null = null;
  const random = seeded(42);
  for (let n = 0; n < 1000; n++) {
    const form = selectUnit1(previous, random);
    assert.equal(form.length, 30);
    assert.equal(new Set(form.map((q) => q.slot)).size, 30);
    assert.equal(form.filter((q) => q.type === "mcq").length, 20);
    assert.equal(form.filter((q) => q.type === "tf").length, 5);
    assert.equal(form.filter((q) => q.type === "number").length, 5);
    assert.equal(form.filter((q) => q.level === "basic").length, 10);
    assert.equal(form.filter((q) => q.level === "medium").length, 15);
    assert.equal(form.filter((q) => q.level === "advanced").length, 5);
    for (let l = 1; l <= 5; l++) {
      const qs = form.filter((q) => q.lesson === l);
      assert.equal(qs.length, 6);
      assert.equal(qs.filter((q) => q.id.endsWith("A")).length, 3);
      if (previous)
        assert.equal(qs.filter((q) => !previous!.includes(q.id)).length, 4);
    }
    if (previous)
      assert.equal(form.filter((q) => !previous!.includes(q.id)).length, 20);
    previous = form.map((q) => q.id);
    assert.ok(validPrevious(previous));
  }
});
test("missing, corrupt, stale and duplicate storage safely creates a valid initial form", () => {
  for (const bad of [
    null,
    {},
    true,
    ["u1-1-A"],
    Array(30).fill("u1-1-A"),
    unit1Assessment.slice(0, 30).map((q) => q.id),
  ]) {
    assert.equal(validPrevious(bad), false);
    assert.ok(validPrevious(selectUnit1(bad, seeded(7)).map((q) => q.id)));
  }
});
test("all keys grade correctly; numeric Arabic/Persian digits; no mutation or partial text acceptance", () => {
  const form = selectUnit1(null, seeded(8));
  const answers = Object.fromEntries(
    form.map((q) => [q.id, q.type === "number" ? String(q.answer) : q.answer]),
  );
  const before = JSON.stringify({ form, answers });
  assert.equal(gradeAssessment(form, answers).score, 30);
  assert.deepEqual(gradeAssessment(form, answers).lessons, [6, 6, 6, 6, 6]);
  assert.equal(gradeAssessment(form, {}).score, 0);
  assert.equal(JSON.stringify({ form, answers }), before);
  for (const q of unit1Assessment) {
    const a = q.type === "number" ? String(q.answer) : q.answer;
    assert.equal(gradeAssessment([q], { [q.id]: a }).score, 1);
    if (q.type === "number") {
      const ar = String(q.answer).replace(/\d/g, (c) => "٠١٢٣٤٥٦٧٨٩"[+c]);
      const fa = String(q.answer).replace(/\d/g, (c) => "۰۱۲۳۴۵۶۷۸۹"[+c]);
      assert.equal(gradeAssessment([q], { [q.id]: ar }).score, 1);
      assert.equal(gradeAssessment([q], { [q.id]: fa }).score, 1);
      assert.equal(
        gradeAssessment([q], { [q.id]: String(q.answer) + "N" }).score,
        0,
      );
    }
  }
});
test("notebook source equals approved transcription; parser does not summarize; all 16 sections", () => {
  assert.equal(
    simpleMachinesNotebookText + "\n",
    readFileSync("docs/review/simple-machines/approved/notebook.md", "utf8"),
  );
  assert.equal(
    sha(simpleMachinesNotebookText),
    "70f7e510474b1c34d3aa4e4092fc103599639ce21150bc4313934803f600c169",
  );
  assert.deepEqual(
    simpleMachinesLesson.notebook,
    parseMachineNotebook(simpleMachinesNotebookText),
  );
  assert.equal(
    (simpleMachinesNotebookText.match(/^## .*?:/gm) || []).filter(
      (h) => !h.includes("الوحدة الأولى"),
    ).length,
    16,
  );
  assert.ok(
    !simpleMachinesNotebookText.includes(
      "يساعد البرغي على أداء بعض الأعمال بقوة أقل",
    ),
  );
  assert.equal(simpleMachinesLesson.stages.length, 8);
});
test("legacy lesson sources, notebooks, quiz bank, runner, grading and publishing are byte-identical to base", () => {
  for (const path of [
    "src/content/lessons/unit1/motion-and-rest.ts",
    "src/content/lessons/unit1/force-and-motion.ts",
    "src/content/lessons/unit1/force-on-one-support.ts",
    "src/content/lessons/unit1/work-and-power.ts",
    "src/content/quiz-bank.ts",
    "src/components/quiz/QuizRunner.tsx",
    "src/lib/quiz-grading.ts",
    "src/app/quizzes/[id]/page.tsx",
    "next.config.ts",
    "src/components/math/TeX.tsx",
    "src/app/fonts.css",
    "src/app/globals.css",
  ]) {
    assert.equal(
      readFileSync(path, "utf8"),
      execFileSync("git", ["show", `${base}:${path}`], { encoding: "utf8" }),
      path,
    );
  }
});
test("all notebook expressions and new bank text segments compile as KaTeX", () => {
  const formulas = [
    ...simpleMachinesNotebookText.matchAll(
      /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g,
    ),
  ].map((m) => m[1] ?? m[2]);
  for (const q of unit1Assessment) {
    for (const text of [q.prompt, q.explain, ...(q.options ?? [])]) {
      if (
        /\\(?:frac|times|mathrm)/.test(text) &&
        !/[\u0600-\u06ff]/.test(text)
      ) {
        formulas.push(text);
        continue;
      }
      for (const m of text.matchAll(/\\\(([\s\S]*?)\\\)/g)) formulas.push(m[1]);
      for (const s of splitAutoTex(text.replace(/\\\([\s\S]*?\\\)/g, "")))
        if (s.type === "tex") formulas.push(s.value);
    }
  }
  for (const formula of formulas)
    assert.doesNotThrow(
      () =>
        katex.renderToString(formula, { throwOnError: true, strict: false }),
      formula,
    );
});
test("machine calculations and invalid domains", () => {
  assert.equal(advantage(500, 100), 5);
  assert.equal(leverState(10, 6, 20, 3).balanced, true);
  assert.ok(leverState(30, 6, 20, 3).angle < 0);
  assert.ok(leverState(10, 6, 40, 3).angle > 0);
  for (const mode of ["fixed", "moving", "combined"] as const) {
    const q = pulleyState(100, 2, mode);
    assert.equal(q.effort, mode === "fixed" ? 100 : 50);
    assert.equal(q.rise, mode === "fixed" ? 2 : 1);
    assert.equal(q.effort * 2, 100 * q.rise);
  }
  assert.equal(inclineState(400, 3, 6).effort, 200);
  assert.ok(inclineState(400, 3, 9).effort < 200);
  assert.equal(wheelState(12, 3, 10).output, 40);
  assert.equal(screwAdvance(6, 1), 6);
  assert.ok(screwAdvance(6, 1) < screwAdvance(12, 1));
  for (const fn of [
    () => advantage(2, 0),
    () => leverState(0, 2, 3, 4),
    () => pulleyState(10, -1, "moving"),
    () => inclineState(100, 6, 3),
    () => wheelState(3, 4, 10),
    () => screwAdvance(0, 2),
  ])
    assert.throws(fn, RangeError);
});
