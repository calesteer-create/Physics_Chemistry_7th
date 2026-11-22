import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Unit1Review } from "@/components/review/Unit1Review";

export const metadata: Metadata = {
  title: "أراجع وأختبر نفسي — الوحدة الأولى",
  description:
    "مراجعة تفاعلية لأسئلة الوحدة الأولى من كتاب الفيزياء والكيمياء للصف السابع (ص 63–64): صح/خطأ مع التصحيح، جدول الكتلة والثقل، قراءة الخطوط البيانية، والمسائل الثلاث.",
};

export default function Unit1ReviewPage() {
  return (
    <main className="container-x py-12">
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Link href="/units/unit-1" className="btn btn-ghost !px-4 !py-2 !text-[12.5px]">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          العودة إلى الوحدة الأولى
        </Link>
      </div>
      <Unit1Review />
    </main>
  );
}
