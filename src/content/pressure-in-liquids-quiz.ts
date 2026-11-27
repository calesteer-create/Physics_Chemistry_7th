/**
 * اختبار مستقل لدرس «الضغط في السوائل» (الوحدة الثانية، ص 71–80).
 *
 * ١٠ أسئلة مستقلة: ٤ اختيار من متعدد (منها سؤال قراءة رسم)، ٢ صح/خطأ،
 * ٣ مسائل عددية، و١ ترتيب/مطابقة. ثلاثة مستويات: ٣ أساسية، ٤ متوسطة،
 * ٣ متقدمة. الأسئلة فقط تُرسل إلى المتصفح في الحمولة الأولى؛ مفاتيح
 * الإجابة والتفسيرات في وحدة عميل منفصلة ولا تُعرض قبل التسليم.
 *
 * لا خادم، ولا API، ولا قاعدة بيانات، ولا تعديل لبنك أسئلة الوحدة الأولى.
 */
import type { QuizPublic, QuizQuestion, Rich } from "@/content/types";
import { liquidFigure, rich } from "@/lib/liquid-pressure-rich";

export type LiquidQuizLevel = "أساسي" | "متوسط" | "متقدم";
export type LiquidQuizKind = "mcq" | "tf" | "fill" | "ordering";

export type LiquidQuizQuestion = QuizQuestion & {
  level: LiquidQuizLevel;
  kind: LiquidQuizKind;
  /** وحدة الإجابة العددية إن وُجدت — للعرض فقط، ليست مفتاح إجابة. */
  unit?: string;
};

export type LiquidQuizPublic = Omit<QuizPublic, "questions"> & {
  questions: LiquidQuizQuestion[];
};

const R = (s: string): Rich => rich(s);

const T = {
  law: "$P=\\rho g h$",
  total: "$P_t=P_0+\\rho g h$",
  atm: "$1\\,\\mathrm{atm}=101325\\,\\mathrm{Pa}=760\\,\\mathrm{mmHg}$",
} as const;

const GRAPH_FIG = liquidFigure(
  "pil-quiz-graph",
  "liquid-pressure-graph",
  "الخط البياني للضغط الكلي بدلالة العمق كما في صفحة 80",
  80,
);

export const pressureInLiquidsQuizMeta = {
  id: "quiz-pressure-in-liquids-7",
  lessonSlug: "pressure-in-liquids",
  title: "اختبار الدرس الثاني — الضغط في السوائل",
  description: "عشرة أسئلة مستقلة بثلاثة مستويات، بتصحيح محلي وتفسيرات بعد التسليم فقط.",
  durationMin: 20,
  curricular: true,
} as const;

/** الأسئلة العامة — بلا إجابات ولا تفسيرات. */
export const pressureInLiquidsQuizPublic: LiquidQuizPublic = {
  ...pressureInLiquidsQuizMeta,
  questions: [
    {
      id: "pil-1",
      type: "mcq",
      kind: "mcq",
      level: "أساسي",
      prompt: R(`أيّ علاقة تعبّر عن ضغط السائل المتوازن وحده في نقطة على عمق $h$؟`),
      options: [R(T.law), R(T.total), R(`$P=\dfrac{\rho g}{h}$`), R(`$P=P_0-\rho g h$`)],
    },
    {
      id: "pil-2",
      type: "tf",
      kind: "tf",
      level: "أساسي",
      prompt: R("ضغط السائل المتوازن متساوٍ في جميع النقاط التي تقع في مستوٍ أفقي واحد داخل السائل."),
    },
    {
      id: "pil-3",
      type: "mcq",
      kind: "mcq",
      level: "أساسي",
      prompt: R("نُقلت الحفّة الضغطية في السوية الأفقية ذاتها مع تدوير الغشاء المرن. ماذا يحدث لفرق سويتي السائل الملون؟"),
      options: [R("يزداد"), R("ينقص"), R("لا يتغيّر"), R("يصبح صفراً")],
    },
    {
      id: "pil-4",
      type: "fill",
      kind: "fill",
      level: "متوسط",
      unit: "Pa",
      prompt: R(`احسب ضغط السائل عندما $\rho=1000\,\mathrm{kg\cdot m^{-3}}$ و$h=0.7\,\mathrm{m}$ و$g=10\,\mathrm{m\cdot s^{-2}}$.`),
      placeholder: "أدخل العدد فقط",
    },
    {
      id: "pil-5",
      type: "mcq",
      kind: "mcq",
      level: "متوسط",
      figure: GRAPH_FIG,
      prompt: R("في الخط البياني المحفوظ من صفحة 80، ماذا يمثّل المحور الأفقي المكتوب عليه $\\mathrm{m}$؟"),
      options: [
        R("الكتلة الحجمية للسائل"),
        R("العمق $h$ بالمتر"),
        R("الضغط الجوي"),
        R("مساحة قاعدة الوعاء"),
      ],
    },
    {
      id: "pil-6",
      type: "tf",
      kind: "tf",
      level: "متوسط",
      prompt: R("مسائل الكتاب التي تطلب ضغط السائل تُحل بإضافة الضغط الجوي $P_0$ دائماً."),
    },
    {
      id: "pil-7",
      type: "fill",
      kind: "fill",
      level: "متوسط",
      unit: "m",
      prompt: R(`إذا كان $P=12000\,\mathrm{Pa}$ و$\rho=1000\,\mathrm{kg\cdot m^{-3}}$ و$g=10\,\mathrm{m\cdot s^{-2}}$، فما العمق $h$؟`),
      placeholder: "أدخل العدد فقط",
    },
    {
      id: "pil-8",
      type: "mcq",
      kind: "ordering",
      level: "متقدم",
      prompt: R("رتّب سلسلة الاستنتاج الصحيحة من تجربة الكأسين إلى قانون الضغط:"),
      options: [
        R("زيادة $P$ ← زيادة $\\rho$ ← ثبات $h$ ← القانون"),
        R("ثبات $h$ و$g$ ← $\\rho$ المحلول أكبر ← $P$ المحلول أكبر ← $P=\\rho g h$"),
        R("زيادة $h$ ← نقصان $\\rho$ ← ثبات $P$"),
        R("زيادة $P_0$ ← نقصان $P_t$ ← ثبات $h$"),
      ],
    },
    {
      id: "pil-9",
      type: "fill",
      kind: "fill",
      level: "متقدم",
      unit: "Pa",
      prompt: R(`في ماء $\rho=1000\,\mathrm{kg\cdot m^{-3}}$ و$g=10\,\mathrm{m\cdot s^{-2}}$، احسب فرق الضغط بين عمقين $3.5\,\mathrm{m}$ و$1.5\,\mathrm{m}$.`),
      placeholder: "أدخل العدد فقط",
    },
    {
      id: "pil-10",
      type: "mcq",
      kind: "mcq",
      level: "متقدم",
      prompt: R("أيّ مجموعة تجمع القانونين والقيمة المصحّحة للضغط الجوي كما اعتمدتها المنصة؟"),
      options: [
        R(`${T.law} لضغط السائل، و${T.total} للضغط الكلي، و${T.atm}`),
        R(`${T.total} لضغط السائل، و${T.law} للضغط الكلي، و$1\,\mathrm{atm}=10135\,\mathrm{Pa}$`),
        R(`$P=\rho g h$ للضغط الكلي، و$P_t=P_0-\rho g h$ للضغط الجوي`),
        R(`$P=\rho g h$ و$P_t=P_0+\rho g h$ مع إبقاء القيمة المطبوعة $10135$ دون تصحيح`),
      ],
    },
  ],
};

/** تعقيم صريح: يُستخدم في صفحة الخادم قبل تمرير البيانات للعميل. */
export function sanitizePressureInLiquidsQuiz(): LiquidQuizPublic {
  return {
    ...pressureInLiquidsQuizMeta,
    questions: pressureInLiquidsQuizPublic.questions.map((q) => {
      const base = { id: q.id, kind: q.kind, level: q.level, prompt: q.prompt };
      if (q.type === "mcq") {
        return { ...base, type: q.type, options: q.options, ...(q.figure ? { figure: q.figure } : {}) };
      }
      if (q.type === "fill") {
        return { ...base, type: q.type, placeholder: q.placeholder, unit: q.unit, ...(q.figure ? { figure: q.figure } : {}) };
      }
      return { ...base, type: q.type, ...(q.figure ? { figure: q.figure } : {}) };
    }) as LiquidQuizQuestion[],
  };
}
