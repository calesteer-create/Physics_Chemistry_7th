import type { Metadata } from "next";
import { FlaskConical, Hourglass, Orbit } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { UnitConverter } from "@/components/lab/UnitConverter";

export const metadata: Metadata = { title: "المختبر التفاعلي" };

export default function LabPage() {
  return (
    <div className="container-x py-16">
      <Reveal>
        <div className="max-w-2xl">
          <span className="eyebrow">
            <FlaskConical className="h-4 w-4" />
            جرّب بنفسك
          </span>
          <h1 className="mt-5 text-[34px] font-black text-white md:text-[44px]">المختبر التفاعلي</h1>
          <p className="mt-4 text-[15px] leading-9 text-[var(--color-mist)]">
            هنا تعيش التجارب: محاكاة للظواهر، تغيير للقيم وملاحظة النتائج، وتفسير علمي لكل نتيجة.
            كل مختبر يُبنى لخدمة هدف تعليمي محدد من درسه — لا مؤثرات شكلية.
          </p>
        </div>
      </Reveal>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Reveal delay={100}>
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[17px] font-black text-[#8ceeff]">
              <Orbit className="h-5 w-5" />
              أداة عاملة الآن
            </h2>
            <UnitConverter />
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-[17px] font-black text-[var(--color-chem)]">
              <Hourglass className="h-5 w-5" />
              قيد التجهيز
            </h2>
            <div className="space-y-4">
              {[
                { t: "مختبرات الدروس المنهجية", d: "محاكاة وتجارب افتراضية تُبنى مع كل درس وفق ما يرد في كتابك: بندول، دوائر كهربائية، تفاعلات… حسب المنهاج." },
                { t: "رسوم بيانية حيّة", d: "منحنيات تتغير مع مدخلاتك لتفهم العلاقات بدل حفظها." },
                { t: "أنشطة سحب وإفلات", d: "رتّب، صنّف، وطابق — تفاعل يصنع الفهم ولا يشتته." },
              ].map((c) => (
                <div key={c.t} className="card border-dashed p-5 opacity-80">
                  <h3 className="text-[14.5px] font-black text-[var(--color-fog)]">{c.t}</h3>
                  <p className="mt-1.5 text-[12.5px] font-bold leading-7 text-[var(--color-dim)]">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
