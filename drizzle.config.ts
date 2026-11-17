import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * إعداد Drizzle Kit (توليد/فحص الـ migrations) — P1-2.
 *
 * لا يحتوي هذا الملف على أي عنوان قاعدة بيانات ثابت أو خاص ببيئة بعينها.
 * يُقرأ `DATABASE_URL` من بيئة التشغيل (أو من ملف `.env` عبر `dotenv/config`
 * عند التشغيل محليًا)، وهو نفس المتغيّر الذي يستخدمه التطبيق في
 * `src/db/index.ts` و`README.md`.
 *
 * أوامر `generate` و`check` لا تحتاجان اتصالاً فعليًا بقاعدة بيانات (تعملان
 * بالمقارنة بين ملفات الـ schema وملفات الـ migrations المحفوظة محليًا)،
 * لذا تعملان حتى بدون ضبط `DATABASE_URL`. أمّا أمر `migrate` (تطبيق
 * الـ migrations فعليًا) فيحتاج اتصالاً حقيقيًا، وعند غياب `DATABASE_URL`
 * يفشل بوضوح بدل الاتصال بعنوان محلي افتراضي خاطئ.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
