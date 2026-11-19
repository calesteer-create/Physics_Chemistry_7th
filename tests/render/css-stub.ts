/**
 * يسمح باستيراد مكوّنات CSS Modules في اختبارات العرض: Node لا يقرأ `.css`،
 * ويُستدعى هذا الملف أولًا في ملف الاختبار (الوحدات CJS عبر tsx) قبل أي مكوّن.
 */
const exts = (require as unknown as { extensions: Record<string, unknown> }).extensions;
if (exts && !exts[".css"]) {
  exts[".css"] = () => undefined;
}
export {};
