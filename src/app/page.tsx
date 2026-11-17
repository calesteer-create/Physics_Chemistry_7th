import Link from "next/link";
import {
  ArrowLeft,
  Atom,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FlaskConical,
  GitCompareArrows,
  Lightbulb,
  ListChecks,
  NotebookPen,
  PenLine,
  PencilRuler,
  PlayCircle,
  ScanLine,
  Shapes,
  Sparkles,
  Target,
} from "lucide-react";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { Reveal } from "@/components/ui/Reveal";
import { TeX } from "@/components/math/TeX";
import { EngineerMark } from "@/components/brand/EngineerMark";
import { WhatsAppButton, WhatsAppIcon } from "@/components/brand/WhatsAppLink";
import { ENGINEER, SITE } from "@/lib/site";
import { listPublishedLessons } from "@/content/registry";

export const dynamic = "force-static";

const PILLARS = [
  {
    icon: Lightbulb,
    title: "شرح موسّع ومتدرّج",
    desc: "كل مفهوم يُفكَّك إلى خطوات صغيرة تناسب عمرك، مع أمثلة يومية وأخطاء شائعة، حتى تفهم الدرس ولو لم يكن الكتاب أمامك.",
    accent: "phys" as const,
  },
  {
    icon: BookOpen,
    title: "محتوى الكتاب بأمانة",
    desc: "التعريفات والقوانين والأمثلة محفوظة بدقة وبتسلسل الكتاب، ومميّزة بشارة «من الكتاب» عن الشرح الإضافي.",
    accent: "chem" as const,
  },
  {
    icon: Shapes,
    title: "رسومات معاد إنتاجها",
    desc: "أشكال الكتاب تُستخرج وتُعاد رقمنيًا باحتراف، مع كل سهم وتسمية ورقم — لا رسم جميل يضحّي بالمعلومة.",
    accent: "violet" as const,
  },
  {
    icon: FlaskConical,
    title: "مختبرات تفاعلية",
    desc: "محاكاة وتجارب افتراضية تغيّر فيها القيم وتلاحظ النتائج بنفسك، فالفيزياء والكيمياء عِلمان يُجرَّبان.",
    accent: "phys" as const,
  },
  {
    icon: ClipboardCheck,
    title: "اختبارات وتغذية راجعة",
    desc: "اختبار لكل درس بأسئلة متدرجة ومتنوعة، تصحيح آمن في الخادم، وشرح لسبب كل إجابة بعد التسليم.",
    accent: "chem" as const,
  },
  {
    icon: NotebookPen,
    title: "دفتر طالب حقيقي",
    desc: "آخر مرحلة في كل درس: المحتوى الجاهز الذي تكتبه بيدك في دفترك الورقي — لا ملخص عابر ولا بطاقات مشتتة.",
    accent: "violet" as const,
  },
];

const JOURNEY = [
  { n: "01", t: "التهيئة والاستكشاف", d: "سؤال يوقظ فضولك ويربط الدرس بحياتك" },
  { n: "02", t: "اكتشف المفهوم", d: "الفكرة الجديدة وما ورد عنها في الكتاب" },
  { n: "03", t: "الشرح التفصيلي", d: "شرح موسّع وأمثلة محلولة خطوة بخطوة" },
  { n: "04", t: "المختبر التفاعلي", d: "جرّب وغيّر القيم ولاحظ النتائج" },
  { n: "05", t: "افهم وتحقق", d: "أسئلة سريعة بتغذية راجعة فورية" },
  { n: "06", t: "طبّق ما تعلمته", d: "تمارين من السهل إلى الأصعب" },
  { n: "07", t: "اختبر نفسك", d: "اختبار الدرس وتسجيل نتيجتك" },
  { n: "08", t: "مراجعة الدرس", d: "نظرة منظمة على كل ما تعلمته" },
  { n: "09", t: "دفتر الطالب", d: "ما تكتبه بيدك في دفترك الورقي" },
];

const FIDELITY = [
  { icon: ScanLine, t: "الاستخراج", d: "يُفصل الرسم عن صفحة الكتاب دون قصّ أي سهم أو تسمية أو رقم" },
  { icon: Sparkles, t: "المعالجة الآمنة", d: "تنظيف وتوضيح دون تغيير أي لون أو اتجاه أو علاقة علمية" },
  { icon: PencilRuler, t: "إعادة الرسم الرقمي", d: "رسم متجهي SVG واضح عند التكبير، أمين للأصل بالكامل" },
  { icon: GitCompareArrows, t: "المقارنة مع الأصل", d: "لا يُعتمد الرسم إلا بعد مطابقته بالأصل عنصرًا عنصرًا" },
];

const ACCENT = {
  phys: "text-[var(--color-phys)] bg-[rgba(60,224,244,0.09)] border-[rgba(60,224,244,0.26)]",
  chem: "text-[var(--color-chem)] bg-[rgba(255,176,58,0.09)] border-[rgba(255,176,58,0.26)]",
  violet: "text-[var(--color-vio)] bg-[rgba(143,131,255,0.09)] border-[rgba(143,131,255,0.26)]",
};

export default function HomePage() {
  const lessons = listPublishedLessons();

  return (
    <div className="relative">
      {/* ================= البطل ================= */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <HeroCanvas />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_110%,rgba(6,12,26,0.9),transparent)]" />

        <div className="container-x relative z-10 py-24">
          <div className="max-w-3xl">
            <Reveal>
              <span className="eyebrow">
                <Atom className="h-4 w-4" />
                {SITE.grade} • {SITE.curriculum} • للحاسوب المحمول والمكتبي
              </span>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-7 text-[52px] font-black leading-[1.15] tracking-tight md:text-[76px] md:leading-[1.08]">
                <span className="grad-text-phys">الفيزياء</span>
                <span className="mx-4 text-[#5a6f92]">و</span>
                <span className="grad-text-chem">الكيمياء</span>
                <span className="mt-3 block text-[26px] font-extrabold leading-snug text-[#c9dbf5] md:text-[34px]">
                  تُفهَمان خطوة بخطوة… وتُدوَّنان بيدك
                </span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-6 max-w-2xl text-[16.5px] leading-9 text-[var(--color-mist)]">
                ليست نسخة إلكترونية من كتابك، بل رحلة تعلّم كاملة: شرح موسّع يقودك من الفكرة إلى
                التطبيق، رسومات الكتاب معاد إنتاجها بأمانة، مختبرات تلمسها بيدك، اختبارات تكشف
                مواضع قوتك، وفي نهاية كل درس «دفتر الطالب» — المحتوى الذي تكتبه في دفترك الورقي.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/lessons/platform-orientation" className="btn btn-phys">
                  <PlayCircle className="h-5 w-5" />
                  ابدأ بالدرس التعريفي
                </Link>
                <a href="#notebook" className="btn btn-ghost">
                  <NotebookPen className="h-5 w-5" />
                  اكتشف دفتر الطالب
                </a>
              </div>
            </Reveal>
          </div>

          {/* بطاقات عائمة */}
          <Reveal delay={340}>
            <div className="mt-16 grid max-w-3xl grid-cols-3 gap-4">
              {[
                { v: "9", l: "مراحل في كل درس" },
                { v: "100٪", l: "أمانة رسومات الكتاب" },
                { v: "∞", l: "تغذية راجعة فورية" },
              ].map((s, i) => (
                <div key={i} className="glass card-hover rounded-2xl px-5 py-4 text-center">
                  <div className="text-[26px] font-black text-[#8ceeff]">{s.v}</div>
                  <div className="mt-1 text-[12px] font-bold text-[var(--color-mist)]">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
          <div className="flex h-11 w-7 items-start justify-center rounded-full border border-[var(--color-line2)] p-1.5">
            <span className="animate-floaty block h-2.5 w-1.5 rounded-full bg-[var(--color-phys)]" />
          </div>
        </div>
      </section>

      {/* ================= فلسفة المنصة ================= */}
      <section className="relative py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <span className="eyebrow eyebrow-amber">
                <Target className="h-4 w-4" />
                فلسفتنا
              </span>
              <h2 className="mt-6 text-[30px] font-black leading-snug text-white md:text-[40px]">
                جودة التعلّم ودقة المحتوى
                <span className="grad-text-chem"> قبل </span>
                المؤثرات البصرية
              </h2>
              <p className="mt-5 text-[15.5px] leading-9 text-[var(--color-mist)]">
                كل عنصر هنا يؤدي وظيفة تعليمية حقيقية: الشرح يعلّمك فعلًا، والرسومات تنقل معلومة
                الكتاب كما هي، والاختبار يقيس فهمك، ودفتر الطالب يخبرك بالضبط ماذا تكتب.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= الركائز ================= */}
      <section className="relative py-10">
        <div className="container-x">
          <Reveal>
            <div className="flex items-end justify-between gap-6">
              <div>
                <span className="eyebrow">أعمدة التجربة</span>
                <h2 className="mt-5 text-[28px] font-black text-white md:text-[36px]">
                  ستّ ركائز تبني علمًا راسخًا
                </h2>
              </div>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.title} delay={i * 70}>
                <div className="card card-hover group h-full p-7">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${ACCENT[p.accent]}`}>
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-[18px] font-black text-white">{p.title}</h3>
                  <p className="mt-3 text-[14px] leading-8 text-[var(--color-mist)]">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= رحلة الدرس ================= */}
      <section className="relative py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">
                <CompassIcon />
                قالب كل درس
              </span>
              <h2 className="mt-6 text-[28px] font-black text-white md:text-[36px]">
                رحلة من تسع مراحل… تنتهي في دفترك
              </h2>
            </div>
          </Reveal>
          <div className="relative mt-14">
            <div className="absolute inset-y-0 right-[26px] hidden w-px bg-gradient-to-b from-[rgba(60,224,244,0.4)] via-[rgba(148,178,220,0.15)] to-[rgba(230,192,122,0.5)] lg:block" />
            <ol className="grid gap-4 lg:grid-cols-3">
              {JOURNEY.map((s, i) => {
                const isNotebook = s.n === "09";
                return (
                  <Reveal key={s.n} delay={i * 60}>
                    <li
                      className={`card card-hover relative h-full p-6 ${
                        isNotebook ? "!border-[rgba(230,192,122,0.5)] shadow-[0_0_50px_-18px_rgba(230,192,122,0.35)]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-2xl text-[16px] font-black ${
                            isNotebook
                              ? "bg-gradient-to-br from-[#eecf95] to-[#d3a24a] text-[#251a05]"
                              : "bg-[rgba(60,224,244,0.1)] text-[#8ceeff] border border-[rgba(60,224,244,0.25)]"
                          }`}
                        >
                          {s.n}
                        </span>
                        <div>
                          <h3 className={`text-[16px] font-black ${isNotebook ? "text-[#f4ddab]" : "text-white"}`}>
                            {s.t}
                          </h3>
                          <p className="mt-1 text-[13px] leading-6 text-[var(--color-mist)]">{s.d}</p>
                        </div>
                      </div>
                      {isNotebook && (
                        <span className="absolute -top-2.5 left-5 rounded-full bg-gradient-to-l from-[#eecf95] to-[#d3a24a] px-3 py-1 text-[10.5px] font-black text-[#251a05]">
                          المرحلة الأخيرة
                        </span>
                      )}
                    </li>
                  </Reveal>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ================= دفتر الطالب ================= */}
      <section id="notebook" className="relative scroll-mt-24 py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <div>
              <span className="eyebrow eyebrow-gold">
                <NotebookPen className="h-4 w-4" />
                أهم ما في المنصة
              </span>
              <h2 className="mt-6 text-[30px] font-black leading-snug text-white md:text-[40px]">
                دفتر الطالب:
                <br />
                <span className="grad-text-gold">اكتب بيدك، تعلّم بعمق</span>
              </h2>
              <p className="mt-6 text-[15.5px] leading-9 text-[var(--color-mist)]">
                دفتر الطالب ليس ملخصًا ولا بطاقات مراجعة؛ هو المحتوى الدراسي المنظم الذي ستكتبه
                بيدك في دفترك المدرسي الورقي: عناوين الدرس، التعريفات كاملة، القوانين مع رموزها
                ووحداتها، الشروط والاستثناءات، الأمثلة الأساسية، الرسوم برسمها، والملاحظات قبل
                نسيانها.
              </p>
              <ul className="mt-7 space-y-4">
                {[
                  "إرشادات صريحة: «اكتب التعريف»، «انسخ القانون»، «ارسم الشكل»",
                  "المعادلات والكسور بصياغة صحيحة جاهزة للنسخ",
                  "الرسوم المطلوبة داخل الدفتر لا في صفحة أخرى",
                  "قائمة تحقق تُنهي بها الدفتر وتطمئن أنه مكتمل",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[14.5px] font-bold text-[#c9dbf5]">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-gold)]" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/lessons/platform-orientation" className="btn btn-gold">
                  <PenLine className="h-5 w-5" />
                  جرّب دفتر الطالب الآن
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            {/* نموذج مصغر لدفتر حقيقي */}
            <div className="paper p-8 pr-[74px]" dir="rtl">
              <div className="flex items-center justify-between">
                <h3 className="text-[19px] font-black text-[#152238]">دفتر الطالب — نموذج</h3>
                <span className="paper-tag paper-tag-write">
                  <PenLine className="h-3.5 w-3.5" />
                  دوّن في دفترك
                </span>
              </div>
              <div className="mt-6 space-y-5 text-[14px] font-bold leading-8 text-[#22304a]">
                <div>
                  <span className="text-[12px] font-black text-[#1d4ed8]">١) عنوان الدرس:</span>
                  <p className="mt-1 border-b-2 border-dotted border-[#8aa0c8] pb-1">يُكتب عنوان الدرس هنا بخط واضح…</p>
                </div>
                <div className="paper-def">
                  <span className="text-[12px] font-black text-[#1d4ed8]">٢) التعريف (داخل إطار):</span>
                  <p className="mt-1">يُنسخ التعريف كاملًا بدقته، دون اختصار يخلّ بالمعنى.</p>
                </div>
                <div className="paper-law">
                  <span className="text-[12px] font-black text-[#0f766e]">٣) القانون + الرموز:</span>
                  <div className="mt-2" dir="ltr">
                    <TeX>{"v=\\dfrac{d}{t}"}</TeX>
                  </div>
                  <p className="mt-2 text-[12.5px]">v السرعة (m/s) — d المسافة (m) — t الزمن (s)</p>
                </div>
                <div className="paper-important">
                  <span className="text-[12px] font-black text-[#b45309]">٤) ملاحظة مهمة:</span>
                  <p className="mt-1 text-[13px]">تُدوَّن التنبيهات والاستثناءات هنا حتى لا تُنسى ليلة الامتحان.</p>
                </div>
                <div className="flex items-center gap-2 text-[12.5px] text-[#5a6f92]">
                  <ListChecks className="h-4 w-4" />
                  قائمة تحقق في نهاية كل دفتر
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= أمانة الرسومات ================= */}
      <section className="relative py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow eyebrow-amber">
                <Shapes className="h-4 w-4" />
                أمانة الرسومات
              </span>
              <h2 className="mt-6 text-[28px] font-black leading-snug text-white md:text-[36px]">
                رسومات الكتاب… رقمية، واضحة،
                <span className="grad-text-chem"> وأمينة حتى آخر سهم</span>
              </h2>
              <p className="mt-5 text-[15px] leading-9 text-[var(--color-mist)]">
                كل شكل في كتابك يمر بخط إنتاج صارم قبل أن يصل إليك. أي رسم جميل لا يحفظ المعلومة
                الأصلية يُرفض فورًا — الدقة العلمية أولًا.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FIDELITY.map((f, i) => (
              <Reveal key={f.t} delay={i * 80}>
                <div className="card card-hover relative h-full p-6">
                  <span className="absolute left-5 top-5 text-[13px] font-black text-[var(--color-dim)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <f.icon className="h-7 w-7 text-[var(--color-chem)]" />
                  <h3 className="mt-4 text-[16px] font-black text-white">{f.t}</h3>
                  <p className="mt-2 text-[13px] leading-7 text-[var(--color-mist)]">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ابدأ الآن ================= */}
      <section className="relative py-16">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden p-10">
              <div className="grid-bg absolute inset-0 opacity-60" />
              <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div className="max-w-xl">
                  <span className="eyebrow">خطوتك الأولى</span>
                  <h2 className="mt-4 text-[26px] font-black text-white md:text-[32px]">
                    ابدأ بالدرس التعريفي — 15 دقيقة تعرّفك بكل شيء
                  </h2>
                  <p className="mt-3 text-[14.5px] leading-8 text-[var(--color-mist)]">
                    الدروس المنهجية تُضاف درسًا بعد درس وفق صفحات كتابك المدرسي. حتى يصل الدرس
                    الأول، خذ جولتك التعريفية وجهّز دفترك وملفك الشخصي.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/lessons/${lessons[0]?.slug ?? "platform-orientation"}`} className="btn btn-phys">
                      <PlayCircle className="h-5 w-5" />
                      فتح الدرس التعريفي
                    </Link>
                    <Link href="/units" className="btn btn-ghost">
                      <BookOpen className="h-5 w-5" />
                      تصفّح الوحدات الدراسية
                    </Link>
                  </div>
                </div>
                <div className="glass w-full max-w-sm rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 text-[15px] font-black text-white">
                    <Atom className="h-5 w-5 text-[var(--color-phys)]" />
                    حالة المحتوى المنهجي
                  </h3>
                  <div className="mt-4 space-y-3 text-[13px] font-bold text-[var(--color-mist)]">
                    <div className="flex items-center justify-between rounded-xl bg-[rgba(6,14,30,0.6)] px-4 py-3">
                      <span>الوحدات المنهجية</span>
                      <span className="rounded-full bg-[rgba(255,176,58,0.14)] px-3 py-1 text-[11px] text-[var(--color-chem)]">
                        بانتظار صور الكتاب
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-[rgba(6,14,30,0.6)] px-4 py-3">
                      <span>الدرس التعريفي</span>
                      <span className="flex items-center gap-1.5 rounded-full bg-[rgba(60,224,244,0.12)] px-3 py-1 text-[11px] text-[#8ceeff]">
                        <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--color-phys)]" />
                        متاح الآن
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= هوية المهندس ================= */}
      <section id="engineer" className="relative scroll-mt-24 py-24">
        <div className="container-x">
          <Reveal>
            <div className="card relative overflow-hidden p-10 lg:p-14">
              <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[rgba(230,192,122,0.09)] blur-3xl" />
              <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[rgba(53,208,101,0.06)] blur-3xl" />
              <div className="relative grid items-center gap-10 lg:grid-cols-[auto_1fr_auto]">
                <div className="flex items-center gap-5">
                  <div className="animate-floaty">
                    <EngineerMark size={92} />
                  </div>
                </div>
                <div>
                  <span className="eyebrow eyebrow-gold">الهوية والتواصل</span>
                  <h2 className="mt-5 text-[26px] font-black leading-snug text-white md:text-[34px]">
                    تصميم وتطوير
                    <span className="grad-text-gold"> المهندس سومر شاهين</span>
                  </h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-9 text-[var(--color-mist)]">
                    صُممت هذه المنصة وطُوّرت بعناية لتجمع بين الدقة العلمية والتجربة التفاعلية
                    الراقية. لأي استفسار حول المحتوى أو اقتراح لتطوير المنصة، يمكنك التواصل مباشرة
                    عبر WhatsApp:
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <WhatsAppIcon size={20} className="text-[#4be07e]" />
                    <span dir="ltr" className="text-[22px] font-black tracking-[0.08em] text-[#d9ffe6]">
                      {ENGINEER.phoneDisplay}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <WhatsAppButton label="محادثة عبر WhatsApp" className="whitespace-nowrap" />
                  <Link href="/units" className="btn btn-ghost whitespace-nowrap">
                    <ArrowLeft className="h-4.5 w-4.5" />
                    إلى الوحدات الدراسية
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

function CompassIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" stroke="none" />
    </svg>
  );
}
