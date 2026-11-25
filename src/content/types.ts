/**
 * نموذج بيانات المحتوى التعليمي — قابل لإعادة الاستخدام مع أي مادة أو صف.
 *
 * المبادئ:
 * - كل درس يتكوّن من مراحل (Stages) مرتبة، آخرها دائمًا «دفتر الطالب».
 * - المحتوى يُبنى من كتل (Blocks) غنية تدعم النصوص والمعادلات والجداول
 *   والتعريفات والقوانين والرسومات والأسئلة الفورية.
 * - الرسومات موثّقة بمصدرها (صفحة الكتاب) وطريقة إنتاجها.
 */

/** مقطع نصي غني: نص عادي، معادلة KaTeX (LTR)، أو كمية فيزيائية (قيمة + وحدة). */
export type RichSegment =
  | { t: string } // نص
  | { tex: string } // معادلة/رمز
  | { q: { v: string; u?: string } }; // كمية: قيمة + وحدة (LTR)

export type Rich = RichSegment[];

/** مرجع رسم/شكل — يوثّق مصدره من الكتاب وطريقة إنتاجه الرقمية. */
export interface FigureRef {
  id: string;
  kind: "svg" | "image" | "diagram";
  /** مفتاح الرسم داخل مكتبة الرسومات (components/figures) أو مسار الصورة */
  src: string;
  alt: string;
  /** صفحة الكتاب الأصلية */
  bookPage?: number;
  /** طريقة الإنتاج: إعادة رسم رقمية أم نسخة أصلية معالجة */
  reproduction: "redrawn" | "enhanced-scan" | "original" | "none";
  /** هل يجب أن يدوّنه الطالب في دفتره؟ */
  notebook: boolean;
}

export type LessonBlock =
  | { type: "paragraph"; rich: Rich; book?: boolean }
  | { type: "heading"; text: string; book?: boolean }
  | { type: "definition"; title: string; rich: Rich; book?: boolean }
  | { type: "law"; name: string; formula: string; symbols?: { sym: string; meaning: string; unit?: string }[]; rich?: Rich; book?: boolean }
  | { type: "example"; title: string; steps: Rich[]; result?: Rich; book?: boolean }
  | { type: "steps"; title?: string; items: Rich[]; book?: boolean }
  | { type: "list"; items: Rich[]; book?: boolean }
  | { type: "note"; rich: Rich; tone?: "info" | "warn" }
  | { type: "table"; head: string[]; rows: string[][]; book?: boolean }
  | { type: "figure"; figure: FigureRef; caption?: Rich }
  | { type: "check"; question: Rich; options: string[]; correct: number; explain: Rich }
  | { type: "tex"; formula: string };

/** المراحل الثماني الأولى للدرس (دفتر الطالب يُبنى من حقل notebook المستقل). */
export type StageId =
  | "warmup" // 1 التهيئة والاستكشاف
  | "concept" // 2 اكتشف المفهوم
  | "explain" // 3 الشرح التفصيلي
  | "lab" // 4 المختبر التفاعلي / النشاط
  | "check" // 5 افهم وتحقق
  | "apply" // 6 طبّق ما تعلمته
  | "quiz" // 7 اختبر نفسك
  | "review"; // 8 مراجعة الدرس

export interface LessonStage {
  id: StageId;
  blocks: LessonBlock[];
}

/** عناصر «دفتر الطالب» — محتوى جاهز للتدوين اليدوي في الدفتر الورقي. */
export type NotebookItem =
  | { kind: "h1"; text: string }
  | { kind: "h2"; text: string }
  | { kind: "write"; label?: string; rich: Rich }
  | { kind: "definition"; title: string; rich: Rich }
  | { kind: "law"; name: string; formula: string; symbols?: { sym: string; meaning: string; unit?: string }[] }
  | { kind: "draw"; instruction: Rich; figure?: FigureRef }
  | { kind: "copy-table"; title?: string; head: string[]; rows: string[][] }
  | { kind: "steps"; title?: string; items: Rich[] }
  | { kind: "important"; rich: Rich }
  | { kind: "points"; title?: string; items: Rich[] }
  | { kind: "checklist"; items: string[] };

export interface Lesson {
  slug: string;
  unitSlug: string | null;
  number: string; // «الدرس الأول»...
  title: string;
  subtitle: string;
  /** حالة الدرس: منشور أم بانتظار صور الكتاب */
  status: "published" | "pending";
  /** مصادر الكتاب المعتمدة (صفحات) */
  sources: { label: string; pages?: string }[];
  /** تصنيف المحتوى: منهجي (من الكتاب) أم تعريفي بالمنصة */
  curricular: boolean;
  duration: string;
  objectives: string[];
  /** أداة تفاعلية مدمجة في مرحلة المختبر (اختياري) */
  labWidget?: "unit-converter" | "motion-lab" | "force-lab" | "one-support-lab" | "pressure-lab";
  stages: LessonStage[];
  notebook: NotebookItem[];
  quizId: string | null;
}

export interface Unit {
  slug: string;
  title: string;
  description: string;
  order: number;
  status: "active" | "pending";
  lessons: { slug: string; title: string; status: "published" | "pending" }[];
}

/** أنواع أسئلة الاختبارات */
export type QuizQuestion =
  | { id: string; type: "mcq"; prompt: Rich; options: Rich[]; figure?: FigureRef }
  | { id: string; type: "tf"; prompt: Rich; figure?: FigureRef }
  | { id: string; type: "fill"; prompt: Rich; placeholder?: string; figure?: FigureRef };

export interface QuizPublic {
  id: string;
  lessonSlug: string | null;
  title: string;
  description: string;
  durationMin: number;
  curricular: boolean;
  questions: QuizQuestion[];
}
