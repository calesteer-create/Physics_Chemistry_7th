/**
 * منع عودة خطأ عرض وحدة المتر المربع في درس الضغط.
 *
 * الخلل كان يحدث في النص العربي المختلط: `m²` تُجزَّأ إلى قطعة KaTeX `m`
 * ونصّ عادي `²`، فيقلب ترتيبهما الاتجاهُ RTL فيظهر `²m`. الإصلاح في طبقة
 * العرض الموحّدة (`auto-tex` / `tex-format`) لا في ملفات المحتوى، وهذا الاختبار
 * يثبت أنّ كل مواضع الوحدة تُعرض كقطعة KaTeX واحدة ذات أسّ حقيقي.
 */
import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import { readFileSync } from "node:fs";
import { splitAutoTex } from "../../src/lib/auto-tex";
import { normalizeTex, unitTex } from "../../src/lib/tex-format";
import { pressureLesson } from "../../src/content/lessons/unit2/pressure";

/** كل السلاسل النصية في بيانات الدرس (بما فيها جداول الدفتر). */
function strings(node: unknown, out: string[] = []): string[] {
  if (typeof node === "string") out.push(node);
  else if (Array.isArray(node)) node.forEach((x) => strings(x, out));
  else if (node && typeof node === "object") Object.values(node).forEach((x) => strings(x, out));
  return out;
}

test("unitTex/normalizeTex يبنيان `m²` كرمز ثم أسّ علوي", () => {
  for (const tex of [unitTex("m^2"), normalizeTex("m²"), normalizeTex("\\text{m}²")]) {
    assert.equal(tex.toLowerCase(), "\\text{m}^{2}");
    const html = katex.renderToString(tex, { throwOnError: true });
    assert.match(html, /msupsub/, `لا أسّ حقيقي في ${tex}`);
    assert.ok(html.indexOf(">m<") < html.indexOf("msupsub"), `الرمز قبل الأسّ في ${tex}`);
  }
  // لا تغيير على الوحدات الأخرى المستخدمة في بقية الدروس.
  assert.equal(unitTex("Pa"), "\\text{Pa}");
  assert.equal(unitTex("N"), "\\text{N}");
  assert.equal(unitTex("\\text{m}^{2}"), "\\text{m}^{2}");
});

test("كل `m²` الخام في درس الضغط يُعرض قطعةً واحدة معزولة LTR", () => {
  const content = strings(pressureLesson).filter((s) => s.includes("m²"));
  assert.equal(content.length, 3, "جدولان في مرحلتي الشرح والمراجعة + جدول دفتر الطالب");

  const labSource = readFileSync("src/components/lab/PressurePlayground.tsx", "utf8");
  const labStrings = [...labSource.matchAll(/"([^"\n]*m²[^"\n]*)"/g)].map((m) => JSON.parse(`"${m[1]}"`) as string);
  assert.equal(labStrings.length, 6, "خمس تعليمات مهمات + تفسير المهمة الأخيرة");

  for (const source of [...content, ...labStrings]) {
    const segs = splitAutoTex(source);
    // لا يبقى أي أسّ Unicode في قطعة نصّ عادي: كل الأسس داخل KaTeX.
    for (const seg of segs) {
      if (seg.type === "text") assert.ok(!/[⁰¹²³⁴⁵⁶⁷⁸⁹]/.test(seg.value), `أسّ نصّ عادي في: ${source}`);
      else assert.doesNotThrow(() => katex.renderToString(seg.value, { throwOnError: true }), `KaTeX: ${seg.value}`);
    }
    assert.ok(
      segs.some((seg) => seg.type === "tex" && /\\text\{m\}\^\{2\}/.test(seg.value)),
      `لم يُعزل m² في: ${source}`,
    );
  }
});
