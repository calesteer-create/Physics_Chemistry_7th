import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, PlayCircle } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { getLessonMeta, units } from "@/content/registry";

export function generateStaticParams() {
  return units.map((u) => ({ slug: u.slug }));
}

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = units.find((u) => u.slug === slug);
  if (!unit) notFound();

  return (
    <div className="container-x py-16">
      <Reveal>
        <span className="eyebrow">الوحدة {unit.order}</span>
        <h1 className="mt-5 text-[32px] font-black text-white md:text-[40px]">{unit.title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-9 text-[var(--color-mist)]">{unit.description}</p>
      </Reveal>

      <div className="mt-10 grid gap-4">
        {unit.lessons.map((l, i) => {
          const meta = getLessonMeta(l.slug);
          const open = l.status === "published" && meta;
          return (
            <Reveal key={l.slug} delay={i * 60}>
              {open ? (
                <Link href={`/lessons/${l.slug}`} className="card card-hover flex items-center gap-5 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(60,224,244,0.1)] text-[#8ceeff]">
                    <PlayCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-black text-white">{l.title}</h3>
                    <p className="mt-1 text-[12.5px] font-bold text-[var(--color-mist)]">{meta.subtitle}</p>
                  </div>
                </Link>
              ) : (
                <div className="card flex items-center gap-5 border-dashed p-6 opacity-60">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[rgba(148,178,220,0.08)] text-[var(--color-dim)]">
                    <Lock className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-[17px] font-black text-[var(--color-mist)]">{l.title}</h3>
                    <p className="mt-1 text-[12.5px] font-bold text-[var(--color-dim)]">قيد الإعداد — بانتظار صور الكتاب</p>
                  </div>
                </div>
              )}
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
