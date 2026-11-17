# النشر (DEPLOY) — GitHub Pages

المنصة **موقع ثابت** يُبنى بملفات HTML/CSS/JS فقط، ويُنشر على **GitHub Pages** عبر
**GitHub Actions**. لا Vercel، ولا قاعدة بيانات، ولا أسرار، ولا متغيّرات بيئة.

- **الرابط:** <https://calesteer-create.github.io/Physics_Chemistry_7th/>
- **المسار الفرعي:** `/Physics_Chemistry_7th/` (لأن GitHub Pages يخدم المشروع من
  مسار يحمل اسم المستودع). يُضبط عبر `basePath` في `next.config.ts`، فتُبنى كل
  الروابط والأصول والخطوط والرسومات تحت هذا المسار تلقائيًا.

## كيف يعمل النشر

`.github/workflows/deploy.yml`:

| المهمة | متى | ماذا تفعل |
|---|---|---|
| `verify` | كل push وPR إلى `main` | `npm ci` ← `lint` ← `typecheck` ← اختبارات الوحدة ← `npm run build` ← فحص مخرجات `out/` ← رفع المخرجات كـ artifact |
| `deploy` | push إلى `main` فقط (أو تشغيل يدوي) | `actions/deploy-pages` لنشر المخرجات على GitHub Pages |

فحص المخرجات (`التحقق من مخرجات التصدير`) يضمن قبل النشر:

- وجود `out/index.html` و`out/units/index.html` و`out/lab/index.html`
  و`out/quizzes/index.html` و`out/404.html`؛
- وجود صفحات الدروس الأربعة والاختبارات الأربعة والوحدات الأربع كـ `index.html`؛
- وجود `out/_next` (الأصول) و`out/.nojekyll` (وإلا حجب Jekyll مجلد `_next`)؛
- خلوّ كل صفحات HTML من أي رابط أو أصل مطلق لا يمرّ عبر `/Physics_Chemistry_7th/`.

أي فشل في هذه الخطوات يمنع النشر ويُبقي النسخة السابقة على الرابط.

## الإعداد في المستودع (مرة واحدة)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
   (المستودع مُهيّأ بهذا الوضع بالفعل.)
2. لا أسرار ولا متغيّرات بيئة مطلوبة إطلاقًا.

بعد دمج أي تعديل في `main` يُنفَّذ النشر تلقائيًا، ويظهر الرابط في ملخّص التشغيل
(Summary) وفي تبويب `Actions`.

## البناء والاختبار محليًا

```bash
npm ci
npm run lint && npm run typecheck && npm test
npm run build          # ينتج مجلد out/
```

لمعاينة الموقع بنفس سلوك GitHub Pages (تحت المسار الفرعي)، قدّم محتوى `out/`
داخل مجلد اسمه `Physics_Chemistry_7th`:

```bash
mkdir -p /tmp/ghpages && ln -s "$PWD/out" /tmp/ghpages/Physics_Chemistry_7th
cd /tmp/ghpages && python3 -m http.server 8123
# ثم افتح: http://127.0.0.1:8123/Physics_Chemistry_7th/
```

## ملاحظات

- `trailingSlash: true` يجعل كل صفحة مجلدًا فيه `index.html`، وهو ما يخدمه GitHub
  Pages مباشرةً عند طلب `/units/` دون إعادة كتابة على الخادم.
- لا توجد صفحات ديناميكية: كل المسارات (`/lessons/[slug]`، `/quizzes/[id]`،
  `/units/[slug]`) تُعدَّد وقت البناء عبر `generateStaticParams()`، وأي درس أو
  اختبار جديد يُضاف إلى المحتوى يظهر تلقائيًا في البناء التالي.
- صفحة `404.html` جاهزة، ويعرضها GitHub Pages لأي مسار غير موجود.

## استكشاف الأخطاء

| العَرَض | السبب المرجّح |
|---|---|
| مهمة `deploy` لم تُشغَّل | مقصود: النشر يشترط push إلى `main` أو تشغيل يدوي، وليس PR |
| زر *Run workflow* غير ظاهر | ملف الـ workflow ليس بعد على الفرع الافتراضي `main` (يظهر بعد الدمج) |
| فشل خطوة «التحقق من مخرجات التصدير» | صفحة مطلوبة لم تُولَّد، أو ظهر رابط مطلق لا يمرّ عبر `basePath` — راجع سجل الخطوة |
| الصفحة تعمل لكن التنسيق مفقود | `out/.nojekyll` غير موجود أو لم يُرفع، فحجب Jekyll مجلد `_next` |
| صفحة فرعية تُرجع 404 | طُلبت بلا شرطة أخيرة؛ استخدم `/units/` بدل `/units` |
