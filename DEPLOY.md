# النشر (DEPLOY)

الهدف: رابط Live يعمل عليه Next.js 16 بوظائفه الحالية (App Router، `src/proxy.ts`،
مسارات `src/app/api/**`، والعرض على الخادم) مع قاعدة PostgreSQL.

## الوجهة المختارة: Vercel + PostgreSQL مُدار

- **Vercel** تشغّل هذا المشروع بلا أي تعديل على الشيفرة أو إعدادات Next.js:
  البناء (`next build`) يعمل كما هو، والمسارات الديناميكية والـ proxy تعمل كما هي.
- **GitHub Pages غير مناسب**: يخدم ملفات ثابتة فقط — لا مسارات API، ولا عرض على
  الخادم، ولا `src/proxy.ts`، ولا اتصال PostgreSQL. تحويل المشروع إلى تصدير ثابت
  يعني تعطيل وظائف قائمة، وهو خارج نطاق هذه الخطوة.
- **قاعدة البيانات**: أي PostgreSQL يُعطى رابط اتصال قياسي يكفي؛ التطبيق يستخدم
  `pg` + Drizzle عبر `DATABASE_URL` فقط. الأبسط: Neon (خطة مجانية) أو
  Vercel Marketplace. لا تغيير في المخطط أو الـ migrations.

البناء لا يحتاج قاعدة بيانات (التهيئة متأخرة في `src/db/index.ts`)، لذا يفشل النشر
فقط إذا فشلت الشيفرة نفسها — لا إذا كانت القاعدة غير مضبوطة.

تشغيل إنتاجي محلي (`npm run build` ثم `npm start`) بلا أي متغيّر بيئة: الصفحات
`/` و`/units` و`/lessons/*` و`/quizzes` و`/lab` و`/student` و`/teacher/login`
تعمل بحالة `200`، و`/teacher` يعيد التوجيه إلى الدخول. تعطّل وظائف الحفظ
(إنشاء ملف طالب، حفظ التقدّم) عندها هو سلوك مقصود (fail closed) لا خطأ نشر.

## متغيّرات البيئة — الأسماء وأماكن الضبط فقط

لا تُكتب أي قيمة سرّية في المستودع. الأسماء التالية تُضبط في مكانين مختلفين:

| المتغيّر | مكان الضبط | الاستخدام |
|---|---|---|
| `DATABASE_URL` | Vercel → Project → Settings → Environment Variables (Production + Preview) | رابط PostgreSQL (ملفات الطلاب، حفظ التقدّم، فحص الاتصال) |
| `TEACHER_PASSWORD` | المكان نفسه | كلمة مرور منطقة المعلم (6 أحرف على الأقل) |
| `TEACHER_SESSION_SECRET` | المكان نفسه | سرّ توقيع جلسات المعلم (32 حرفاً على الأقل) |
| `STUDENT_SESSION_SECRET` | المكان نفسه | سرّ توقيع جلسات الطالب (32 حرفاً على الأقل، مستقلّ عن غيره) |
| `VERCEL_TOKEN` | GitHub → Settings → Secrets and variables → Actions | رمز Vercel CLI لخطوة النشر |
| `VERCEL_ORG_ID` | المكان نفسه | معرّف الحساب/الفريق في Vercel |
| `VERCEL_PROJECT_ID` | المكان نفسه | معرّف المشروع في Vercel |

الأسرار الثلاثة الأولى (`TEACHER_*` و`STUDENT_*`) يجب أن تكون قيمًا عشوائية
مختلفة؛ يمكن توليدها محليًا بـ:

```bash
openssl rand -hex 32
```

عند غياب `TEACHER_PASSWORD` أو `TEACHER_SESSION_SECRET` تبقى منطقة المعلم مغلقة
(fail closed)، وعند غياب `STUDENT_SESSION_SECRET` لا تُنشأ ملفات طلاب — وهذا سلوك
مقصود في الشيفرة وليس خللاً في النشر.

## خطوات الحصول على الرابط (مرة واحدة)

هناك طريقتان، اختر **واحدة** فقط (تفعيل الاثنتين معًا يسبّب نشرًا مزدوجًا):

- **(أ) الأسرع — بلا أي أسرار في GitHub**: في Vercel اختر Add New → Project →
  استورد مستودع `calesteer-create/Physics_Chemistry_7th` (Framework: Next.js، بلا
  إعدادات إضافية). عندها يُنشر الموقع من Vercel عند كل push إلى `main`، ويكفي من
  تبويب Actions أنه يفحص البناء والاختبارات.
- **(ب) النشر من GitHub Actions**: أضف الأسرار الثلاثة `VERCEL_TOKEN` و
  `VERCEL_ORG_ID` و`VERCEL_PROJECT_ID` كما في الخطوات 2–4 أدناه.

في الحالتين لا بد من القاعدة والمتغيّرات السرّية (الخطوتان 3 و5–6).

1. **إنشاء مشروع Vercel**: Add New → Project → اختر مستودع
   `calesteer-create/Physics_Chemistry_7th` (Framework: Next.js، بلا إعدادات إضافية).
2. **أخذ المعرّفات** (للطريقة ب):
   - `VERCEL_PROJECT_ID`: Project → Settings → General → *Project ID*.
   - `VERCEL_ORG_ID`: Team/Account Settings → General → *Team ID* (في الحساب
     الشخصي يكون بنفس تنسيق `team_…`).
   - البديل الأسهل من الطرفية: `npx vercel link` داخل المشروع ثم
     `cat .vercel/project.json` — يحتوي `projectId` و`orgId` (مجلد `.vercel/`
     مستبعَد من Git، ولا يُرفع).
3. **إنشاء رمز CLI** (للطريقة ب): Vercel → Account Settings → Tokens → Create Token
   (اختر النطاق/الفريق الصحيح، واضبط مدة انتهاء معقولة؛ وهو سرّ لا يُشارك).
4. **إضافة الأسرار الثلاثة** (للطريقة ب) في GitHub → Settings → Secrets and variables → Actions.
5. **إنشاء قاعدة PostgreSQL** (Neon أو Marketplace) ونسخ رابط الاتصال
   (يحتوي `sslmode=require`) إلى `DATABASE_URL` في Vercel.
6. **تطبيق الـ migrations مرة واحدة على القاعدة الجديدة** — من جهازك، لا من داخل
   المستودع، وبلا أي تعديل على ملفات الـ migrations:

   ```bash
   npm ci
   DATABASE_URL="postgresql://…" npm run db:migrate
   ```

   (تنطبق تحذيرات `README.md` الخاصة بقاعدة تحتوي الجداول مسبقًا: استخدم قاعدة
   جديدة وفارغة.)
7. **التشغيل**: push إلى `main`، أو يدويًا: Actions → Build & Deploy → Run workflow
   **مع اختيار الفرع `main`**. يظهر الرابط في ملخّص التشغيل (Summary) وفي سجل الخطوة.
   ملاحظة: GitHub لا يعرض زر *Run workflow* إلا بعد وجود ملف الـ workflow على الفرع
   الافتراضي، أي **بعد دمج هذا الـ PR في `main`**. قبل الدمج يعمل الـ workflow
   تلقائيًا على الـ PR (فحص فقط).

## ضمانات عدم المساس بالبيانات

- لا يحتوي المستودع ولا هذه الخطوات أي أمر يحذف بيانات: لا `db:push`، ولا
  `drizzle-kit drop`، ولا SQL يدوي، ولا حذف/إعادة إنشاء قاعدة.
- ملف الـ migration الوحيد `drizzle/migrations/0000_init_schema.sql` إنشائي بالكامل:
  خمسة `CREATE` + إضافتا `ADD CONSTRAINT`، **بلا أي `DROP` أو `TRUNCATE` أو `DELETE`
  أو `ALTER … DROP`**.
- إعادة تشغيل `npm run db:migrate` آمنة: Drizzle يتتبّع الـ migrations المطبَّقة في
  جدول `drizzle.__drizzle_migrations` ولا يعيد تنفيذها.
- الخطر الوحيد (فشل لا حذف): تشغيل `db:migrate` على قاعدة **تحتوي الجداول مسبقًا**
  سيُفشل الـ `CREATE TABLE` بتعارض، دون أن يمسح شيئًا. لذلك استخدم قاعدة جديدة
  وفارغة، كما هو موضّح في `README.md`.
- الـ workflow نفسه لا يلمس القاعدة إطلاقًا: لا يشغّل أي migration، ولا يقرأ
  `DATABASE_URL`. تطبيق الـ migrations خطوة يدوية منفّذة مرة واحدة من جهازك.

## ما يفعله `.github/workflows/deploy.yml`

- `verify` (على كل push وPR إلى `main`): `npm ci` ثم lint ثم typecheck ثم
  اختبارات الوحدة ثم `npm run build` — بلا قاعدة بيانات.
- `gate` (على `main` فقط): يتأكد من وجود `VERCEL_TOKEN` و`VERCEL_ORG_ID`
  و`VERCEL_PROJECT_ID` معًا، ويُخرج `ready=true` أو `false`.
- `deploy` (على `main` فقط، وفقط إذا كان `ready=true`): `vercel pull` ثم
  `vercel deploy --prod`.
- غياب الأسرار ⇒ مهمة النشر تظهر **skipped** (لا خطوة نشر واحدة)، ويُكتب سبب
  التخطي وقائمة الأسماء المطلوبة في ملخّص التشغيل؛ ويبقى فحص البناء أخضر.
- وجود الأسرار ⇒ تنفيذ النشر فعليًا، وأي فشل فيه يُفشل التشغيل (لا يُحجب الفشل
  بسبب تمرير المخرجات عبر `tee`).

## استكشاف الأخطاء

| العَرَض | السبب المرجّح |
|---|---|
| مهمة «نشر الإنتاج على Vercel» ظهرت `skipped` | أحد الأسرار الثلاثة (`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID`) غير مضبوط أو فارغ — انظر الملخّص |
| مهمة النشر لم تُشغَّل أصلًا على PR | مقصود: النشر يشترط فرع `main` وليس PR |
| زر Run workflow غير ظاهر | ملف الـ workflow ليس بعد على الفرع الافتراضي `main` (يظهر بعد الدمج) |
| `403` أو `Invalid token` | الرمز منتهٍ/محذوف، أو أُنشئ لحساب لا يملك المشروع |
| `Project not found` | `VERCEL_ORG_ID` أو `VERCEL_PROJECT_ID` لا يطابقان المشروع |
| إنشاء ملف الطالب يُرجع `503` | `STUDENT_SESSION_SECRET` غير مضبوط في بيئة Vercel |
| إنشاء ملف الطالب أو حفظ التقدّم يفشل بخطأ قاعدة بيانات | `DATABASE_URL` غير مضبوط، أو الـ migrations لم تُطبَّق على القاعدة |
| `/api/health` يُرجع `{"ok":false}` بحالة `500` | لا اتصال بقاعدة البيانات (المتغيّر أو الشبكة) |
| منطقة المعلم تعيد التوجيه إلى الدخول دائماً | `TEACHER_PASSWORD` / `TEACHER_SESSION_SECRET` غير مضبوطين أو أقصر من الحد |
