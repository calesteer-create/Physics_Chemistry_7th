import type { Metadata } from "next";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { TeacherLoginForm } from "@/components/teacher/LoginForm";
import { teacherPasswordConfigured } from "@/lib/passwords";

export const metadata: Metadata = { title: "دخول المعلم" };
export const dynamic = "force-dynamic";

export default function TeacherLoginPage() {
  const configured = teacherPasswordConfigured();

  return (
    <div className="container-x py-20">
      <Reveal>
        <div className="mx-auto max-w-xl text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl border border-[rgba(230,192,122,0.35)] bg-[rgba(230,192,122,0.07)]">
            <ShieldCheck className="h-8 w-8 text-[var(--color-gold)]" />
          </span>
          <h1 className="mt-6 text-[30px] font-black text-white md:text-[36px]">منطقة المعلم</h1>
          <p className="mt-4 text-[14px] leading-8 text-[var(--color-mist)]">
            منطقة محمية تحتوي الحلول التفصيلية ومفاتيح الإجابة وتصنيفات الأسئلة. التحقق يجري في
            الخادم، والجلسة موقّعة ومشفّرة — لا مجرد صفحة مخفية.
          </p>
        </div>
      </Reveal>

      {configured ? (
        <Reveal delay={100}>
          <TeacherLoginForm />
        </Reveal>
      ) : (
        <Reveal delay={100}>
          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-[rgba(255,176,58,0.35)] bg-[rgba(255,176,58,0.06)] p-6 text-center">
            <ShieldAlert className="mx-auto h-7 w-7 text-[var(--color-chem)]" />
            <h2 className="mt-3 text-[16px] font-black text-[#ffe4b8]">بيانات الدخول غير مضبوطة بعد</h2>
            <p className="mt-2 text-[12.5px] font-bold leading-7 text-[var(--color-mist)]">
              تُضبط كلمة المرور عبر سرّ النشر الآمن
              <code dir="ltr" className="mx-1.5 rounded bg-[rgba(6,14,30,0.8)] px-2 py-0.5 text-[11.5px] text-[#ffd9a0]">
                TEACHER_PASSWORD
              </code>
              في متغيّرات بيئة الخادم ثم إعادة التشغيل. لا توجد أي كلمة مرور داخل الشيفرة أو
              المستودع.
            </p>
          </div>
        </Reveal>
      )}
    </div>
  );
}
