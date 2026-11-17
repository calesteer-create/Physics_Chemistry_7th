import type { NextConfig } from "next";

/**
 * تصدير ثابت بالكامل (Static Export) للنشر على GitHub Pages.
 *
 * - `output: "export"` ⇒ يُبنى الموقع إلى مجلد `out/` بملفات HTML/CSS/JS فقط،
 *   بلا خادم Node ولا مسارات API ولا قاعدة بيانات.
 * - `basePath` ⇒ كل الأصول والروابط تُبنى تحت مسار المستودع
 *   `/Physics_Chemistry_7th/` لأن GitHub Pages يخدم المشروع من مسار فرعي.
 * - `trailingSlash` ⇒ كل صفحة تصبح مجلدًا فيه `index.html`، وهذا ما يخدمه
 *   GitHub Pages مباشرةً عند طلب `/units/` دون إعادة كتابة على الخادم.
 * - `images.unoptimized` ⇒ لا يوجد مُحسِّن صور في موقع ثابت.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Physics_Chemistry_7th",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
