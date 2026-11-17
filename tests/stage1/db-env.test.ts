/**
 * اختبارات المرحلة الثانية — P1-1: البناء لا يتطلب قاعدة بيانات.
 *
 * تُثبت أن:
 * 1) تحميل وحدة `src/db` لا يتطلب `DATABASE_URL` (البناء ينجح بلا قاعدة بيانات).
 * 2) أي محاولة للوصول الفعلي إلى قاعدة البيانات من دون `DATABASE_URL`
 *    تُرمي خطأً واضحًا في زمن التشغيل (fail fast) — لا بيانات وهمية ولا إخفاء للخلل.
 * 3) عند وجود `DATABASE_URL`، يُنشأ الاتصال دون الاتصال فعليًا بأي قاعدة،
 *    ويُعاد استخدام الحوض المُنشأ (لا اتصالات متكررة).
 *
 * القيم المستخدمة هنا وهمية بحتة، ولا تُفتح أي اتصال حقيقي.
 */
import test from "node:test";
import assert from "node:assert/strict";

// هذا الاستيراد نفسه دليل على أن تحميل الوحدة لا يتطلب DATABASE_URL:
// لو كان هناك throws في مستوى الوحدة، لفشلت هذه السطور قبل تشغيل أي اختبار.
import { getDb, getPool } from "../../src/db";

const PLACEHOLDER_DB_URL =
  "postgresql://placeholder:placeholder@127.0.0.1:5432/not-a-real-db";

function restore(key: string, value: string | undefined): void {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

test("تحميل وحدة db لا يتطلب DATABASE_URL (البناء لا يحتاج قاعدة بيانات)", async () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    const mod = await import("../../src/db");
    assert.equal(typeof mod.getDb, "function");
    assert.equal(typeof mod.getPool, "function");
  } finally {
    restore("DATABASE_URL", previous);
  }
});

test("الوصول الفعلي إلى قاعدة البيانات دون DATABASE_URL يُرمي خطأً واضحًا في زمن التشغيل", () => {
  const previous = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    assert.throws(
      () => getDb(),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /DATABASE_URL/);
        return true;
      },
      "يجب أن يفشل الوصول الفعلي بخطأ واضح عند غياب DATABASE_URL",
    );
  } finally {
    restore("DATABASE_URL", previous);
  }
});

test("DATABASE_URL مع قيمة مبيّتة ينشئ اتصالاً دون الاتصال فعليًا، ويُعاد استخدام الحوض", async () => {
  const previous = process.env.DATABASE_URL;
  process.env.DATABASE_URL = PLACEHOLDER_DB_URL;
  try {
    const database = getDb();
    assert.equal(typeof database.execute, "function");
    assert.equal(typeof database.select, "function");

    const pool = getPool();
    assert.equal(pool, getPool(), "يجب أن يُعاد الحوض المُنشأ نفسه، لا واحدًا جديدًا في كل مرة");

    // تنظيف: إغلاق الحوض دون إجراء أي استعلام — لا اتصال حقيقي يُفتح.
    await pool.end();
  } finally {
    restore("DATABASE_URL", previous);
  }
});
