/** ثوابت المنصة المركزية */

export const SITE = {
  name: "الفيزياء والكيمياء",
  grade: "الصف السابع",
  curriculum: "المنهاج السوري",
  tagline: "منصة تعليمية تفاعلية تبني الفهم خطوة بخطوة",
} as const;

export const ENGINEER = {
  title: "المهندس",
  name: "سومر شاهين",
  phoneDisplay: "0930215022",
  /** الرقم الدولي لسوريا: 963 + الرقم المحلي دون الصفر الأول */
  whatsappUrl: "https://wa.me/963930210222",
} as const;

export const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/units", label: "الوحدات الدراسية" },
  { href: "/lab", label: "المختبر" },
  { href: "/quizzes", label: "الاختبارات" },
] as const;
