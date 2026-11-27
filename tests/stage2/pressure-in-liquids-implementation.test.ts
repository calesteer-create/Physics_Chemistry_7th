/**
 * اختبارات تنفيذ الدرس الثاني «الضغط في السوائل».
 *
 * تقفل هذه الاختبارات: النشر والملاحة، المراحل، الدفتر المعتمد، الرسوم،
 * المختبرات، أنشطة الكتاب، تمارين المنصة الثمانية، الاختبار المستقل،
 * النموذج الفيزيائي، والقرارات العلمية المعتمدة — دون مساس بخطوط الأساس
 * السبعة أو بيانات الدروس السابقة.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { getLesson, listLessons, units } from "@/content/registry";
import { pressureInLiquidsNotebookText } from "@/content/lessons/unit2/pressure-in-liquids-notebook";
import { pressureInLiquidsQuizPublic, sanitizePressureInLiquidsQuiz, type LiquidQuizOrderingQuestion } from "@/content/pressure-in-liquids-quiz";
import { pressureInLiquidsAnswerKey } from "@/content/pressure-in-liquids-answers";
import {
  ATM_MMHG, ATM_PA, BOOK_DENSITIES, MODEL_ASSUMPTIONS,
  densityFromPressure, depthFromPressure, equalSurfaceHeights,
  hydrostaticPressure, massFromDensityVolume, pressureDifference,
  totalPressure, weightFromMass,
} from "@/lib/liquid-pressure-model";

const ROOT = join(dirname(new URL(import.meta.url).pathname), "../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const sha = (s: string) => createHash("sha256").update(s, "utf8").digest("hex");
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

const APPROVED = "docs/review/pressure-in-liquids/approved/notebook.txt";
const FINGERPRINT = "6e9ade51249b120de94b40b2e022c7168e636f3f164dbcf6b0f54c0c24bd7540";

test("الدرس منشور ومرئي في الوحدة الثانية، والدرس الثالث ما زال قيد الإعداد", () => {
  const lesson = getLesson("pressure-in-liquids");
  assert.ok(lesson, "الدرس غير منشور");
  assert.equal(lesson.status, "published");
  assert.equal(lesson.unitSlug, "unit-2");
  assert.equal(lesson.quizId, "quiz-pressure-in-liquids-7");
  assert.equal(lesson.sources[0]?.pages, "71–80");
  assert.equal(lesson.objectives.length, 5);
  assert.deepEqual(lesson.stages.map((s) => s.id), [
    "warmup", "concept", "explain", "lab", "check", "apply", "quiz", "review",
  ]);
  const unit2 = units.find((u) => u.slug === "unit-2");
  assert.equal(unit2?.lessons.find((l) => l.slug === "pressure-in-liquids")?.status, "published");
  assert.equal(unit2?.lessons.find((l) => l.slug === "archimedes-buoyancy")?.status, "pending");
  assert.equal(getLesson("archimedes-buoyancy"), undefined);
  assert.equal(listLessons().filter((l) => l.status === "published").length, 8);
  assert.ok(read("CONTENT_INDEX.md").includes("الضغط في السوائل (`pressure-in-liquids`)"));
  assert.ok(read("src/app/quizzes/page.tsx").includes('id:"quiz-pressure-in-liquids-7"'));
});

test("الدفتر المعتمد حرفي وبصمته وخط الأساس الجديد سليمة", () => {
  const approved = read(APPROVED);
  assert.equal(sha(approved), FINGERPRINT);
  assert.equal(Buffer.byteLength(approved, "utf8"), 17193);
  assert.equal(approved.split("\n").length, 99);
  assert.equal(pressureInLiquidsNotebookText, approved, "مصدر العرض لا يطابق الملف المعتمد حرفياً");
  const checksum = read("docs/review/pressure-in-liquids/approved/notebook.sha256");
  assert.ok(checksum.includes(FINGERPRINT));
  const baseline = read("tests/stage2/notebook-invariance.test.ts");
  assert.equal(count(baseline, /"[^"]+": "[a-f0-9]{64}"/g), 8, "يجب أن تكون خطوط الأساس 8: 7 قديمة + سطر واحد جديد");
  for (const old of [
    "22b525b055dbcb43383b83911e8aa43cdcb7d994b9c479ee053b83dc79f7c402",
    "768aa060284dac364475e3baccdb5110810db7c3fc4a0816cb505608726f7f3b",
  ]) assert.ok(baseline.includes(old), "خط أساس قديم تغيّر");
  const notebook = read("src/components/lesson/PressureInLiquidsNotebook.tsx");
  assert.ok(notebook.includes('data-approved-notebook="pressure-in-liquids"'));
  assert.ok(notebook.includes("pressureInLiquidsNotebookText.split"));
  const page = read("src/app/lessons/[slug]/page.tsx");
  assert.ok(page.includes('<PressureInLiquidsNotebook/>'));
});

test("اثنتا عشرة مجموعة رسوم وأربعة مختبرات مسجّلة ومستعملة", () => {
  const figures = read("src/components/figures/liquid-pressure-figures.tsx");
  const registry = read("src/components/figures/index.tsx");
  assert.equal(count(figures, /export function [A-Z]/g), 12);
  assert.equal(count(figures, /<Dual /g), 12);
  const keys = [
    "liquid-pressure-intro", "liquid-pressure-three-holes", "liquid-pressure-manometer-tools",
    "liquid-pressure-manometer-experiment", "liquid-pressure-depth", "liquid-pressure-density",
    "liquid-pressure-law", "liquid-pressure-atmosphere", "liquid-pressure-dam-vessels",
    "liquid-pressure-applications", "liquid-pressure-book-question", "liquid-pressure-graph",
  ];
  for (const key of keys) assert.ok(registry.includes(`"${key}"`), `مفتاح رسم غير مسجّل: ${key}`);
  const labs = read("src/components/lab/LiquidPressureLabs.tsx");
  assert.ok(labs.includes('data-lab-count="4"'));
  for (const id of ["three-holes", "manometer", "two-glasses", "dam-vessels"]) {
    assert.ok(labs.includes(`id="${id}"`), `مختبر ناقص: ${id}`);
  }
  const page = read("src/app/lessons/[slug]/page.tsx");
  assert.ok(page.includes("<LiquidPressureLabs />"));
  assert.ok(page.includes("<PressureInLiquidsBookQuestions />"));
  assert.ok(page.includes("<PressureInLiquidsExtraExercises />"));
});

test("أنشطة الكتاب ص 71–80 وتمارين المنصة الثمانية مثبتة", () => {
  const exercises = read("src/components/lesson/PressureInLiquidsExercises.tsx");
  assert.ok(exercises.includes('data-book-questions="pressure-in-liquids"'));
  assert.ok(exercises.includes('data-extra-count="8"'));
  const extraStart = exercises.indexOf("export function PressureInLiquidsExtraExercises");
  assert.ok(extraStart > 0);
  const extra = exercises.slice(extraStart);
  assert.equal(count(extra, /level="/g), 8, "عدد التمارين الإضافية ليس 8");
  assert.ok(extra.includes("من المنصة وليست من الكتاب"));
  for (const page of ["ص 71", "ص 72", "ص 73", "ص 74–75", "ص 76", "ص 77", "ص 78", "ص 79", "ص 80"]) {
    assert.ok(exercises.includes(page), `نشاط/سؤال صفحة ${page} غير موثّق`);
  }
  for (const value of ["24000", "1025", "2.34", "3075", "20000", "50000", "1100", "11000", "13000", "10135", "101325", "760", "60"]) {
    assert.ok(exercises.includes(value), `قيمة من الكتاب ناقصة: ${value}`);
  }
  assert.ok(exercises.includes("التروجين"), "الكلمة المطبوعة «التروجين» يجب أن تبقى كما هي");
});

test("الاختبار المستقل: 10 أسئلة، 3 مستويات، أنواع فعلية، بلا إجابات في الحمولة العامة", () => {
  const quiz = sanitizePressureInLiquidsQuiz();
  assert.equal(quiz.id, "quiz-pressure-in-liquids-7");
  assert.equal(quiz.questions.length, 10);
  assert.deepEqual(quiz.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.level] = (acc[q.level] ?? 0) + 1; return acc;
  }, {}), { "أساسي": 3, "متوسط": 4, "متقدم": 3 });
  assert.deepEqual(quiz.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.kind] = (acc[q.kind] ?? 0) + 1; return acc;
  }, {}), { mcq: 4, tf: 2, fill: 3, ordering: 1 });
  // `type` نفسه يجب أن يحمل ترتيبًا حقيقيًا، لا `mcq` موسومًا نصيًا فقط.
  assert.deepEqual(quiz.questions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] ?? 0) + 1; return acc;
  }, {}), { mcq: 4, tf: 2, fill: 3, ordering: 1 });
  assert.ok(quiz.questions.some((q) => q.figure?.src === "liquid-pressure-graph"));
  assert.equal(Object.keys(pressureInLiquidsAnswerKey).length, 10);
  const serialized = JSON.stringify(quiz);
  assert.ok(!serialized.includes('"answer"'));
  assert.ok(!serialized.includes('"explain"'));
  assert.ok(!serialized.includes('"steps"'));
  assert.ok(!serialized.includes("[1,3,0,2]"));
  assert.ok(!serialized.includes("الترتيب الصحيح"));
  assert.equal(pressureInLiquidsQuizPublic.questions.length, 10);
  const runner = read("src/components/quiz/PressureInLiquidsQuizRunner.tsx");
  assert.ok(runner.includes("data-answer-revealed"));
  assert.ok(runner.includes("submitted && key"));
  assert.ok(!runner.includes("fetch("));
  assert.ok(!runner.includes("XMLHttpRequest"));
  assert.ok(!runner.includes("/api/"));
  const quizPage = read("src/app/quizzes/quiz-pressure-in-liquids-7/page.tsx");
  assert.ok(quizPage.includes("sanitizePressureInLiquidsQuiz"));
  assert.ok(!quizPage.includes("pressureInLiquidsAnswerKey"), "صفحة الخادم لا تستورد مفاتيح الإجابة");
});

test("pil-8 ترتيب تفاعلي حقيقي: بنود مخلوطة، تصحيح بعد التسليم فقط، وتفسير وخطوات", () => {
  const quiz = sanitizePressureInLiquidsQuiz();
  const found = quiz.questions.find((q) => q.id === "pil-8");
  assert.ok(found && found.type === "ordering", "pil-8 ليس سؤال ترتيب فعلي");
  const q8 = found as LiquidQuizOrderingQuestion;
  assert.equal(q8.kind, "ordering");
  assert.equal(q8.level, "متقدم");
  assert.equal(q8.items.length, 4);
  assert.ok(!("options" in q8), "ما زال يحمل خيارات mcq");
  const key = pressureInLiquidsAnswerKey["pil-8"];
  assert.ok(key);
  assert.deepEqual(key.answer, [1, 3, 0, 2]);
  assert.equal(key.steps?.length, 4, "الخطوات الصحيحة غير موثّقة");
  assert.ok(read("src/content/pressure-in-liquids-answers.ts").includes("السلسلة الصحيحة"));
  const initial = q8.items.map((_, i) => i);
  assert.notDeepEqual(initial, key.answer, "الترتيب الابتدائي يكشف الحل");
  const runner = read("src/components/quiz/PressureInLiquidsQuizRunner.tsx");
  assert.ok(runner.includes('data-ordering-question="true"'));
  assert.ok(runner.includes("data-ordering-current"));
  assert.ok(runner.includes('data-ordering-move="up"'));
  assert.ok(runner.includes('data-ordering-move="down"'));
  assert.ok(runner.includes("moveOrderingItem"));
  assert.ok(runner.includes('data-ordering-correct="true"'));
  assert.ok(runner.includes('data-ordering-steps="true"'));
  assert.ok(runner.includes("Array.isArray(expected)"));
  assert.ok(runner.includes("!submitted"), "واجهة الترتيب يجب أن تُخفى بعد التسليم");
  const publicQuiz = read("src/content/pressure-in-liquids-quiz.ts");
  assert.ok(!publicQuiz.includes("[1,3,0,2]"), "تسرّب الترتيب الصحيح إلى الحمولة العامة");
  assert.ok(!publicQuiz.includes("الترتيب الصحيح"), "تسرّب نص الحل إلى الحمولة العامة");
});

test("القرارات العلمية والنموذج الفيزيائي محفوظة", () => {
  assert.equal(hydrostaticPressure(1000, 1.3), 13000);
  assert.equal(totalPressure(1000, 0, 10, ATM_PA), ATM_PA);
  assert.equal(ATM_PA, 101325);
  assert.equal(ATM_MMHG, 760);
  assert.equal(BOOK_DENSITIES.water, 1000);
  assert.equal(BOOK_DENSITIES.seawater, 1025);
  assert.equal(BOOK_DENSITIES.fishWater, 1100);
  assert.ok(Math.abs(depthFromPressure(24000, 1025) - 2.34) < 0.01);
  assert.equal(massFromDensityVolume(1025, 3), 3075);
  assert.equal(densityFromPressure(20000, 2), 1000);
  assert.equal(weightFromMass(5000), 50000);
  assert.equal(pressureDifference(1100, 6, 5), 11000);
  assert.equal(equalSurfaceHeights([{ h: 2 }, { h: 2 }, { h: 2 }]), true);
  assert.throws(() => hydrostaticPressure(-1, 1));
  assert.equal(MODEL_ASSUMPTIONS.length, 5);
  const lesson = read("src/content/lessons/unit2/pressure-in-liquids.ts");
  assert.ok(lesson.includes("P_t=P_0+\\rho g h"));
  assert.ok(lesson.includes("P=\\rho g h"));
  assert.ok(lesson.includes("101325"));
  assert.ok(lesson.includes("10135"));
  assert.ok(lesson.includes("kg") && lesson.includes("m^{-3}"), "وحدة الكتلة الحجمية غير موثّقة");
  assert.ok(lesson.includes(String.raw`m=\\rho V`) || lesson.includes("m=\\rho V"));
  assert.ok(lesson.includes("w=mg"));
  assert.ok(lesson.includes("المحور الأفقي يمثّل العمق"));
  const filesToCheck = [
    "src/content/lessons/unit2/pressure-in-liquids.ts",
    "src/components/lab/LiquidPressureLabs.tsx",
    "src/components/lesson/PressureInLiquidsExercises.tsx",
    "src/lib/liquid-pressure-model.ts",
    "src/content/pressure-in-liquids-quiz.ts",
    "src/components/quiz/PressureInLiquidsQuizRunner.tsx",
  ];
  for (const file of filesToCheck) {
    const s = read(file);
    assert.ok(!/دافعة أرخميدس|قانون أرخميدس|الطفو|قوانين الطفو|غوص الأجسام/.test(s), `تسرّب مصطلح محظور في ${file}`);
  }
});
