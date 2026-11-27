/**
 * قفل دفتر الطالب المعتمد — الدرس الثاني من الوحدة الثانية «الضغط في السوائل».
 *
 * المصدر الوحيد للحقيقة:
 *   docs/review/pressure-in-liquids/approved/notebook.txt
 * وهو النص الكامل الذي اعتمده المستخدم حرفياً (أقسامه، معلوماته، مسائله،
 * رسوماته، ترتيبه) بتاريخ هذه الجلسة. بعد الاعتماد أصبح Untouchable:
 * لا إعادة صياغة، ولا حذف، ولا إضافة، ولا تغيير ترتيب، ولا تعديل أي بند؛
 * يُسمح فقط بتحسين العرض البصري مع التطابق الحرفي الكامل.
 *
 * القرارات المثبتة داخل النص المقفل: تصحيح `1 atm = 101325 Pa = 760 mmHg`
 * مع بيان أن `10135` هي القيمة المطبوعة وأن التصحيح من المنصة؛ التمييز بين
 * `P = ρgh` و`P_t = P_0 + ρgh`؛ `m = ρV` و`w = mg` بوصفهما من دروس سابقة؛
 * توضيح أن محور الرسم الأفقي هو العمق `h` بالمتر مع الإبقاء على شكل الرسم؛
 * معالجة مسألة السمكتين كفرق ضغط بين عمقين فقط.
 *
 * هذا اختبار جديد خاص بهذا الدرس فقط. لا يُعدّل ولا يُستبدل
 * `tests/stage2/notebook-invariance.test.ts` ولا أي بصمة أو اختبار محمي
 * للدروس السابقة؛ بل يتحقق من بقاء بصماتها كما هي (قراءة فقط).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const APPROVED = new URL(
  "../../docs/review/pressure-in-liquids/approved/notebook.txt",
  import.meta.url,
);
const PROTECTED_BASELINES = new URL("./notebook-invariance.test.ts", import.meta.url);

/** SHA-256 لبايتات UTF-8 للملف المعتمد، بما فيه سطر جديد ختامي واحد. */
const APPROVED_SHA256 = "6e9ade51249b120de94b40b2e022c7168e636f3f164dbcf6b0f54c0c24bd7540";
const APPROVED_BYTES = 17193;
const APPROVED_NEWLINES = 98;

/** عناوين الأقسام الأحد عشر بترتيبها المعتمد — تُقفل البنية أيضاً لا النص وحده. */
const SECTION_HEADINGS = [
  "أولاً: أهداف الدرس والكلمات المفتاحية",
  "ثانياً: ماذا تسبّب السوائل في أوعيتها؟",
  "ثالثاً: ضغط السائل المتوازن في نقطة منه (تجربة المانومتر)",
  "رابعاً: الكتلة الحجمية والكثافة النسبية",
  "خامساً: قانون الضغط في السوائل المتوازنة",
  "سادساً: الضغط الكلي والضغط الجوي",
  "سابعاً: تطبيقات ضغط السوائل",
  "ثامناً: رسومات أدوّنها في دفتري",
  "تاسعاً: مثال محلول من الكتاب (ص 76)",
  "عاشراً: مسائل الكتاب (ص 80) — المعطيات والنتائج",
  "حادي عشر: شروط ونتائج مهمة أحفظها",
];

/** البصمات السبع المحمية للدروس المنشورة سابقاً — يُمنع فقدان أي منها. */
const PREVIOUS_BASELINES = [
  "22b525b055dbcb43383b83911e8aa43cdcb7d994b9c479ee053b83dc79f7c402",
  "ced181969a16d872527d69cc3b2c90f8cdd34a20c07694280c5e0b2188111530",
  "3c6c15db863fcd452bfa693aea65cd8da8ba935ca496f04f3b2db2c2537608e4",
  "2e3afb768c31ac5a810cd8cd013928abd29244f929610c8701c34e42185dcc0f",
  "b0320f71ae611d10425dc0bf8fd7259849825d68582f7a6d57e4a2d942a44d08",
  "ed55fc49a39afa36e9e0e0a0c2cad956798c4e108f5ba0c1e04e2afeb7eae970",
  "768aa060284dac364475e3baccdb5110810db7c3fc4a0816cb505608726f7f3b",
];

test("دفتر الطالب المعتمد للضغط في السوائل: بصمة وبنية وقرارات مطابقة حرفياً", () => {
  const raw = readFileSync(APPROVED, "utf8");
  const hash = createHash("sha256").update(raw, "utf8").digest("hex");
  assert.equal(hash, APPROVED_SHA256, "تغيّر نص دفتر الطالب المعتمد — ممنوع دون موافقة صريحة");
  assert.equal(Buffer.byteLength(raw, "utf8"), APPROVED_BYTES, "تغيّر حجم النص المعتمد");
  assert.equal((raw.match(/\n/g) ?? []).length, APPROVED_NEWLINES, "تغيّر عدد أسطر النص المعتمد");
  assert.ok(raw.endsWith("\n"), "السطر الختامي المعتمد مفقود");
  assert.ok(!raw.includes("\r"), "تبدّلت نهايات الأسطر");

  const lines = raw.split("\n");
  assert.equal(lines[0], "الدرس الثاني: الضغط في السوائل");
  assert.equal(lines[1], "الوحدة الثانية: الضغط ودافعة أرخميدس");
  assert.equal(lines[2], "مصدر الدرس: كتاب الفيزياء والكيمياء — الصف السابع، الصفحات 71–80");

  let previous = -1;
  for (const heading of SECTION_HEADINGS) {
    const index = lines.indexOf(heading);
    assert.ok(index > previous, `عنوان مفقود أو ترتيبه تغيّر: ${heading}`);
    previous = index;
  }
  assert.equal(SECTION_HEADINGS.length, 11, "عدد الأقسام المعتمدة أحد عشر");

  // القرارات الثمانية المثبتة داخل النص المقفل.
  assert.ok(raw.includes("1\\,\\mathrm{atm} = 101325\\,\\mathrm{Pa} = 760\\,\\mathrm{mmHg}"));
  assert.ok(raw.includes("القيمة المطبوعة $10135$ غير صحيحة"));
  assert.ok(raw.includes("وهذا التصحيح من المنصة ولا يُنسب إلى نص الكتاب الأصلي"));
  assert.ok(raw.includes("$P = \\rho g h$"));
  assert.ok(raw.includes("$P_t = P_0 + \\rho g h$"));
  assert.ok(raw.includes("العلاقتين المستفادتين من دروس سابقة، لا قانونين جديدين في هذا الدرس"));
  assert.ok(raw.includes("تُعالَج المسألة بوصفها فرق ضغط بين عمقين فقط"));
  assert.ok(raw.includes("المحور الأفقي يمثّل العمق $h$ بالمتر"));
  assert.ok(raw.includes("وشكل الرسم محفوظ كما ورد في الكتاب"));

  // حدود الدرس: «دافعة أرخميدس» ترد مرة واحدة في عنوان الوحدة فقط، ولا شيء من موضوع الدرس الثالث.
  assert.equal((raw.match(/دافعة أرخميدس/g) ?? []).length, 1);
  for (const term of ["الطفو", "قوة الدفع", "غوص الأجسام", "قانون أرخميدس"]) {
    assert.ok(!raw.includes(term), `أُدخل موضوع الدرس الثالث في دفتر الدرس الثاني: ${term}`);
  }
});

test("بصمات الدروس والاختبارات المحمية السابقة باقية كما هي", () => {
  const source = readFileSync(PROTECTED_BASELINES, "utf8");
  assert.ok(source.includes("const baseline: Record<string, string>"), "ملف خط الأساس المحمي تعرّض لاستبدال");
  for (const hash of PREVIOUS_BASELINES) {
    assert.ok(source.includes(`"${hash}"`), `بصمة محمية مفقودة أو معدّلة: ${hash}`);
  }
  assert.equal(PREVIOUS_BASELINES.length, 7, "عدد البصمات المحمية سبعة");
});
