import Link from "next/link";
import { BookOpen, FlaskConical, LayoutDashboard, ShieldCheck } from "lucide-react";
import { ENGINEER, NAV, SITE } from "@/lib/site";
import { EngineerMark } from "@/components/brand/EngineerMark";
import { WhatsAppButton, WhatsAppIcon } from "@/components/brand/WhatsAppLink";

export function Footer() {
  return (
    <footer className="relative mt-28 border-t border-[var(--color-line)] bg-[#050a16]">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-[1.3fr_1fr_1.2fr]">
        {/* عن المنصة */}
        <div>
          <div className="flex items-center gap-3">
            <FlaskConical className="h-6 w-6 text-[var(--color-chem)]" />
            <h3 className="text-lg font-black text-white">{SITE.name}</h3>
          </div>
          <p className="mt-4 max-w-sm text-[14px] leading-8 text-[var(--color-mist)]">
            منصة تعليمية تفاعلية لطلاب {SITE.grade} وفق {SITE.curriculum}، تجمع بين الشرح الموسّع
            المتدرّج، ومحتوى الكتاب بأمانة، والرسومات المعاد إنتاجها بدقة، والمختبرات التفاعلية،
            و«دفتر الطالب» الذي تكتبه بيدك.
          </p>
        </div>

        {/* روابط سريعة */}
        <div>
          <h4 className="flex items-center gap-2 text-[14px] font-black text-[#cfe1f7]">
            <BookOpen className="h-4.5 w-4.5 text-[var(--color-phys)]" />
            أقسام المنصة
          </h4>
          <ul className="mt-4 space-y-2.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-[13.5px] font-bold text-[var(--color-mist)] transition-colors hover:text-[#8ceeff]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* هوية المهندس */}
        <div className="card relative overflow-hidden p-6">
          <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-[rgba(230,192,122,0.1)] blur-2xl" />
          <div className="flex items-center gap-3">
            <EngineerMark size={46} />
            <div className="leading-tight">
              <span className="block text-[11px] font-bold text-[var(--color-gold)]">تصميم وتطوير</span>
              <span className="block text-[19px] font-black text-[#f4ddab]">{ENGINEER.title} سومر شاهين</span>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-7 text-[var(--color-mist)]">
            للتواصل والاستفسار حول المنصة أو المحتوى التعليمي:
          </p>
          <a
            href={ENGINEER.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl border border-[rgba(53,208,101,0.35)] bg-[rgba(53,208,101,0.06)] px-4 py-3 transition-colors hover:bg-[rgba(53,208,101,0.14)]"
          >
            <WhatsAppIcon size={22} className="text-[#4be07e]" />
            <span>
              <span className="block text-[11px] font-bold text-[var(--color-mist)]">WhatsApp</span>
              <span dir="ltr" className="block text-[17px] font-black tracking-wider text-[#d9ffe6]">
                {ENGINEER.phoneDisplay}
              </span>
            </span>
          </a>
          <div className="mt-4">
            <WhatsAppButton label="ابدأ المحادثة الآن" showNumber={false} className="w-full !py-2.5 text-[13.5px]" />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-line)]">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-[12px] font-bold text-[var(--color-dim)] md:flex-row">
          <span className="flex items-center gap-2">
            <LayoutDashboard className="h-3.5 w-3.5" />
            منصة {SITE.name} — {SITE.grade} • {SITE.curriculum}
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gold)]" />
            تصميم وتطوير {ENGINEER.title} سومر شاهين
          </span>
        </div>
      </div>
    </footer>
  );
}
