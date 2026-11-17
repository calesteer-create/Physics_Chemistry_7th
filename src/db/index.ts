import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { readServerEnv } from "@/lib/env";

/**
 * اتصال قاعدة البيانات — تهيئة متأخرة (lazy initialization).
 *
 * P1-1: لم يعد البناء (`next build`) يتطلب قاعدة بيانات فعلية. تُحمَّل هذه
 * الوحدة دون قراءة `DATABASE_URL` ولا يُنشأ الاتصال إلا عند أول استخدام
 * فعلي في زمن التشغيل. أي محاولة للوصول إلى قاعدة البيانات من دون ضبط
 * `DATABASE_URL` تُرمي خطأً واضحًا في زمن التشغيل (fail fast)، ولا تُنتج
 * بيانات وهمية ولا تُخفي الخلل — أي أن فحوصات زمن التشغيل لا تتأثر.
 *
 * يُقرأ المتغيّر عبر `readServerEnv` (وليس الوصول المباشر إلى `process.env`)
 * كي لا يُثبّت أي مُجمّع قيمة السرّ في مخرجات البناء، وفق قاعدة P0-1.
 */

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool(): Pool {
  const databaseUrl = readServerEnv("DATABASE_URL");
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required at runtime");
  }
  return new Pool({
    connectionString: databaseUrl,
  });
}

let pool: Pool | undefined;

/** الحوض الفريد للعملية، يُنشأ عند أول طلب فعلي للاتصال. */
export function getPool(): Pool {
  if (!pool) {
    pool = globalForDb.__arenaNextJsPostgresqlPool ?? createPool();
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }
  }
  return pool;
}

let dbInstance: ReturnType<typeof drizzle> | undefined;

/** اتصال Drizzle الفريد للعملية، يُنشأ عند أول استخدام فعلي. */
export function getDb(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    dbInstance = drizzle(getPool());
  }
  return dbInstance;
}
