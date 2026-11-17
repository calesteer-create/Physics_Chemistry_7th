/**
 * قراءة متغيّرات بيئة الخادم في **زمن التشغيل** فقط.
 *
 * المرحلة الأولى (P0-1): تُقرأ القيم عبر وصول غير مباشر (مفتاح ديناميكي)
 * كي لا يُثبّت أي مُجمّع/حزم قيمة سرّ أثناء `next build` داخل مخرجات
 * الخادم. سرّ الجلسة يجب أن يبقى سرّ بيئة التشغيل، لا قيمة مخبوزة في
 * حزمة البناء، وإلا لاختلفت بيئة البناء عن بيئة النشر.
 */
export function readServerEnv(name: string): string | undefined {
  const holder = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  const value = holder.process?.env?.[name];
  return typeof value === "string" ? value : undefined;
}
