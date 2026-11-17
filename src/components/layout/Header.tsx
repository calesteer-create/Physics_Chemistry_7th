"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { ENGINEER, NAV, SITE } from "@/lib/site";
import { EngineerMark } from "@/components/brand/EngineerMark";
import { WhatsAppIcon } from "@/components/brand/WhatsAppLink";

function PlatformMark({ size = 42 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" role="img">
      <defs>
        <linearGradient id="pm-a" x1="0" y1="0" x2="64" y2="64"><stop stopColor="#3CE0F4"/><stop offset="1" stopColor="#1899B4"/></linearGradient>
        <linearGradient id="pm-b" x1="64" y1="0" x2="0" y2="64"><stop stopColor="#FFB03A"/><stop offset="1" stopColor="#D97F16"/></linearGradient>
      </defs>
      <ellipse cx="32" cy="32" rx="27" ry="10.5" stroke="url(#pm-a)" strokeWidth="2.4" transform="rotate(-28 32 32)"/>
      <ellipse cx="32" cy="32" rx="27" ry="10.5" stroke="url(#pm-b)" strokeWidth="2.4" transform="rotate(28 32 32)"/>
      <circle cx="32" cy="32" r="6" fill="url(#pm-a)"/><circle cx="32" cy="32" r="6" fill="url(#pm-b)" opacity="0.5"/>
      <circle cx="55.5" cy="20" r="3.4" fill="#3CE0F4"/><circle cx="8.5" cy="45" r="3.4" fill="#FFB03A"/>
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    fn(); window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`transition-all duration-400 ${scrolled ? "glass shadow-[0_4px_24px_rgba(0,0,0,0.5)]" : "bg-transparent border-b border-transparent"}`}>
        <div className="container-x flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <PlatformMark />
            <span className="leading-tight">
              <span className="block text-[17px] font-black text-[var(--color-fog)] group-hover:text-white transition-colors">{SITE.name}</span>
              <span className="block text-[11px] font-bold text-[var(--color-mist)]">{SITE.grade} • {SITE.curriculum}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map(item => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`rounded-xl px-3.5 py-2 text-[13px] font-bold transition-all ${active ? "bg-[rgba(60,224,244,0.1)] text-[#8ceeff]" : "text-[var(--color-mist)] hover:text-white hover:bg-[rgba(148,178,220,0.06)]"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex shrink-0 items-center gap-2.5">
            <Link href="/#engineer" className="hidden items-center gap-2 rounded-xl border border-[rgba(251,191,36,0.3)] bg-[rgba(251,191,36,0.06)] px-3 py-1.5 hover:bg-[rgba(251,191,36,0.12)] md:flex">
              <EngineerMark size={28} />
              <span className="leading-tight">
                <span className="block text-[9px] font-bold text-[var(--color-gold)]">تصميم وتطوير</span>
                <span className="block text-[12.5px] font-black text-[#fde68a]">م. سومر شاهين</span>
              </span>
            </Link>
            <a href={ENGINEER.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(37,211,102,0.1)] text-[#34d399] border border-[rgba(52,211,153,0.3)] hover:bg-[rgba(37,211,102,0.2)]">
              <WhatsAppIcon size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="lg:hidden bg-[rgba(6,12,26,0.9)] border-t border-[var(--color-line)]">
        <nav className="container-x flex items-center gap-1 overflow-x-auto py-2">
          <GraduationCap className="mr-1 h-4 w-4 shrink-0 text-[var(--color-phys)]" />
          {NAV.map(item => <Link key={item.href} href={item.href} className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold text-[var(--color-mist)] hover:text-white">{item.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
