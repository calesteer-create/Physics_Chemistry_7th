import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.grade} | ${SITE.curriculum}`,
    template: `%s | منصة ${SITE.name}`,
  },
  description:
    "منصة تعليمية تفاعلية لمادة الفيزياء والكيمياء للصف السابع وفق المنهاج السوري: شرح موسّع متدرّج، رسومات الكتاب معاد إنتاجها بدقة، مختبرات تفاعلية، اختبارات بتغذية راجعة، ودفتر طالب حقيقي تدوّنه بيدك.",
};

export const viewport: Viewport = {
  themeColor: "#060c1a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="noise min-h-screen bg-[var(--color-ink)] font-sans text-[var(--color-fog)] antialiased">
        <Header />
        <main className="pt-[74px]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
